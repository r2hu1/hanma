import { Command } from "commander";
import { getConfig, HanmaConfig } from "../utils/config";
import { fetchFrameworks, fetchRegistry } from "../utils/registry";
import { batchInstallDependencies } from "../utils/install";
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
async function promptFramework(
  frameworks: string[],
  preselected?: string,
): Promise<string | null> {
  if (preselected && frameworks.includes(preselected)) {
    return preselected;
  }

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
async function promptVersion(
  registry: RegistryItem[],
  preselected?: string,
): Promise<string> {
  const versions = Array.from(
    new Set(
      registry.map((item) => item.version).filter((v): v is string => !!v),
    ),
  );

  if (preselected && versions.includes(preselected)) {
    return preselected;
  }

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
 * Filter registry items by version (modules only)
 */
function filterModules(
  registry: RegistryItem[],
  version: string,
): RegistryItem[] {
  return registry.filter((item) => {
    const versionMatch =
      !version || version === "latest" || item.version === version;
    const isModule = item.type === "module";
    return versionMatch && isModule;
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
 * Prompt for multi-module selection from filtered list
 */
async function promptModules(items: RegistryItem[]): Promise<RegistryItem[]> {
  const { modules } = await prompts({
    type: "multiselect",
    name: "modules",
    message: "Select modules to add (space to select, enter to confirm)",
    choices: items.map((item) => ({
      title: item.name,
      value: item,
      description: item.description,
    })),
    hint: "- Space to select. Return to submit",
  });

  return modules || [];
}

/**
 * Find modules by name from the registry
 */
function findModulesByName(
  names: string[],
  modules: RegistryItem[],
): { found: RegistryItem[]; notFound: string[] } {
  const found: RegistryItem[] = [];
  const notFound: string[] = [];

  for (const name of names) {
    const module = modules.find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    );
    if (module) {
      found.push(module);
    } else {
      notFound.push(name);
    }
  }

  return { found, notFound };
}

// ============================================================================
// Installation
// ============================================================================

/**
 * Install multiple modules with batched dependencies
 */
async function installModules(
  items: RegistryItem[],
  destinationPath: string | undefined,
  config: HanmaConfig,
): Promise<void> {
  console.log(chalk.blue(`\nInstalling ${items.length} module(s)...`));

  // Collect all dependencies
  const allDeps: string[] = [];
  const allDevDeps: string[] = [];
  let totalFiles = 0;

  for (const item of items) {
    if (item.dependencies?.length) {
      allDeps.push(...item.dependencies);
    }
    if (item.devDependencies?.length) {
      allDevDeps.push(...item.devDependencies);
    }
    totalFiles += item.files.length;
  }

  // Batch install dependencies
  if (allDeps.length > 0 || allDevDeps.length > 0) {
    const installSpinner = ora(
      `Installing dependencies: ${[...new Set([...allDeps, ...allDevDeps])].join(", ")}...`,
    ).start();
    await batchInstallDependencies(allDeps, allDevDeps);
    installSpinner.succeed("Dependencies installed");
  }

  // Write files
  const targetDir = destinationPath || config.componentsPath;
  const writeSpinner = ora("Writing files...").start();

  for (const item of items) {
    for (const file of item.files) {
      const targetPath = path.join(process.cwd(), targetDir, file.name);
      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, file.content);
    }
  }

  writeSpinner.succeed(`Files written to ${targetDir}`);

  const moduleNames = items.map((i) => i.name).join(", ");
  console.log(
    chalk.green(
      `\n✓ Successfully added ${items.length} module(s): ${moduleNames}`,
    ),
  );
  console.log(chalk.dim(`  ${totalFiles} file(s) installed`));
}

// ============================================================================
// Main Command
// ============================================================================

export const module = new Command()
  .name("module")
  .alias("mod")
  .description("Add multi-file module(s) to your project")
  .argument(
    "[modules...]",
    "Module name(s) to add (optional, use interactive mode if omitted)",
  )
  .option("-f, --framework <framework>", "Framework to use")
  .option("-v, --version <version>", "Version to use")
  .option(
    "-p, --path <path>",
    "Destination path (defaults to config.componentsPath)",
  )
  .action(async (moduleNames: string[], options) => {
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

    const selectedFramework = await promptFramework(
      frameworks,
      options.framework,
    );
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
    const selectedVersion = await promptVersion(registry, options.version);
    if (selectedVersion === "") {
      console.log("Operation cancelled.");
      process.exit(0);
    }

    // 5. Filter modules only
    const modules = filterModules(registry, selectedVersion);

    if (modules.length === 0) {
      console.log(
        chalk.yellow(
          "No modules found for the selected framework and version.",
        ),
      );
      process.exit(0);
    }

    let selectedModules: RegistryItem[] = [];

    // 6. Handle different modes
    if (moduleNames.length > 0) {
      // Variadic mode: add specific modules by name
      const { found, notFound } = findModulesByName(moduleNames, modules);

      if (notFound.length > 0) {
        console.log(chalk.yellow(`Modules not found: ${notFound.join(", ")}`));
      }

      if (found.length === 0) {
        console.log(chalk.red("No valid modules to install."));
        process.exit(1);
      }

      console.log(
        chalk.blue(
          `Found ${found.length} module(s): ${found.map((m) => m.name).join(", ")}`,
        ),
      );
      selectedModules = found;
    } else {
      // Interactive mode: multi-select
      const categoryFiltered = await promptCategory(modules);
      if (!categoryFiltered) {
        console.log("Operation cancelled.");
        process.exit(0);
      }

      selectedModules = await promptModules(categoryFiltered);
      if (selectedModules.length === 0) {
        console.log("No modules selected.");
        process.exit(0);
      }
    }

    // 7. Install modules
    await installModules(selectedModules, options.path, config);
  });
