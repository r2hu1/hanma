import { Command } from "commander";
import { getConfig, HanmaConfig } from "../utils/config";
import { fetchFrameworks, fetchRegistry } from "../utils/registry";
import { installDependencies } from "../utils/install";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import { RegistryItem } from "../schema";

// ============================================================================
// User Prompts
// ============================================================================

/**
 * Prompt for framework selection
 */
async function promptFramework(frameworks: string[]): Promise<string | null> {
  const { framework } = await prompts({
    type: "autocomplete",
    name: "framework",
    message: "Select a framework",
    choices: frameworks.map((f) => ({ title: f, value: f })),
  });

  return framework || null;
}

/**
 * Prompt for version selection or default to latest
 */
async function promptVersion(registry: RegistryItem[]): Promise<string> {
  const versions = Array.from(
    new Set(
      registry.map((item) => item.version).filter((v): v is string => !!v),
    ),
  );

  if (versions.length > 1) {
    const { version } = await prompts({
      type: "select",
      name: "version",
      message: "Select a version",
      choices: versions.map((v) => ({ title: v, value: v })),
    });
    if (!version) {
      return "";
    }
    return version;
  }

  if (versions.length === 1) {
    return versions[0]!;
  }

  return "latest";
}

/**
 * Filter registry items by version (snippets only)
 */
function filterSnippets(
  registry: RegistryItem[],
  version: string,
): RegistryItem[] {
  return registry.filter((item) => {
    const versionMatch =
      !version || version === "latest" || item.version === version;
    const isSnippet = item.type === "snippet";
    return versionMatch && isSnippet;
  });
}

/**
 * Prompt for category selection and filter items
 */
async function promptCategory(
  items: RegistryItem[],
): Promise<RegistryItem[] | null> {
  const categories = Array.from(
    new Set(items.map((item) => item.category || "uncategorized")),
  ).sort();

  if (categories.length <= 1) {
    return items;
  }

  const { category } = await prompts({
    type: "select",
    name: "category",
    message: "Select a category",
    choices: [
      { title: "All categories", value: "all" },
      ...categories.map((c) => ({ title: c, value: c })),
    ],
  });

  if (!category) {
    return null;
  }

  if (category === "all") {
    return items;
  }

  return items.filter(
    (item) => (item.category || "uncategorized") === category,
  );
}

/**
 * Prompt for snippet selection from filtered list
 */
async function promptSnippet(
  items: RegistryItem[],
): Promise<RegistryItem | null> {
  const { snippet } = await prompts({
    type: "autocomplete",
    name: "snippet",
    message: "Select a snippet to add",
    choices: items.map((item) => ({
      title: item.name,
      value: item,
      description: item.description,
    })),
  });

  return snippet || null;
}

// ============================================================================
// Installation
// ============================================================================

/**
 * Install a snippet's dependencies and write its files
 */
async function installSnippet(
  item: RegistryItem,
  destinationPath: string | undefined,
  config: HanmaConfig,
): Promise<void> {
  console.log(chalk.blue(`\nInstalling snippet: ${item.name}...`));

  // Install dependencies
  if (item.dependencies?.length) {
    const installSpinner = ora(
      `Installing dependencies: ${item.dependencies.join(", ")}...`,
    ).start();
    await installDependencies(item.dependencies);
    installSpinner.succeed("Dependencies installed");
  }

  // Install dev dependencies
  if (item.devDependencies?.length) {
    const devInstallSpinner = ora(
      `Installing devDependencies: ${item.devDependencies.join(", ")}...`,
    ).start();
    await installDependencies(item.devDependencies, true);
    devInstallSpinner.succeed("Dev dependencies installed");
  }

  // Write files
  const targetDir = destinationPath || config.componentsPath;
  const writeSpinner = ora("Writing files...").start();

  for (const file of item.files) {
    const targetPath = path.join(process.cwd(), targetDir, file.name);
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, file.content);
  }

  writeSpinner.succeed(`Files written to ${targetDir}`);
  console.log(chalk.green(`\nSuccessfully added snippet: ${item.name}!`));
}

// ============================================================================
// Main Command
// ============================================================================

export const add = new Command()
  .name("add")
  .description("Add a snippet to your project")
  .argument(
    "[snippet]",
    "The snippet to add (optional, use interactive mode if omitted)",
  )
  .argument(
    "[path]",
    "The destination path (optional, defaults to config.componentsPath)",
  )
  .action(async (snippetName, destinationPath) => {
    // 1. Get config
    const config = await getConfig();
    if (!config) {
      console.log(
        chalk.red("Configuration not found. Please run 'hanma init' first."),
      );
      process.exit(1);
    }

    // 2. Fetch and select framework
    const frameworksSpinner = ora("Fetching frameworks...").start();
    let frameworks: string[] = [];
    try {
      frameworks = await fetchFrameworks();
      frameworksSpinner.succeed("Frameworks fetched");
    } catch (error) {
      frameworksSpinner.fail("Failed to fetch frameworks");
      console.error(error);
      process.exit(1);
    }

    const selectedFramework = await promptFramework(frameworks);
    if (!selectedFramework) {
      console.log("Operation cancelled.");
      process.exit(0);
    }

    // 3. Fetch registry
    const registrySpinner = ora(
      `Fetching registry for ${selectedFramework}...`,
    ).start();
    let registry: RegistryItem[] = [];
    try {
      registry = await fetchRegistry(selectedFramework);
      registrySpinner.succeed("Registry fetched");
    } catch (error) {
      registrySpinner.fail("Failed to fetch registry");
      console.error(error);
      process.exit(1);
    }

    // 4. Select version
    const selectedVersion = await promptVersion(registry);
    if (selectedVersion === "") {
      console.log("Operation cancelled.");
      process.exit(0);
    }

    // 5. Filter snippets only
    const snippets = filterSnippets(registry, selectedVersion);

    if (snippets.length === 0) {
      console.log(
        chalk.yellow(
          "No snippets found for the selected framework and version.",
        ),
      );
      process.exit(0);
    }

    // 6. Select category
    const categoryFiltered = await promptCategory(snippets);
    if (!categoryFiltered) {
      console.log("Operation cancelled.");
      process.exit(0);
    }

    // 7. Select snippet
    const selectedSnippet = await promptSnippet(categoryFiltered);
    if (!selectedSnippet) {
      console.log("Operation cancelled.");
      process.exit(0);
    }

    // 8. Install snippet
    await installSnippet(selectedSnippet, destinationPath, config);
  });
