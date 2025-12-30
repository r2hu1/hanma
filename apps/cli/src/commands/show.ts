import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { RegistryItem } from "../types";
import {
  getConfig,
  fetchFrameworks,
  promptFramework,
  fetchRegistry,
  fetchTemplatesRegistry,
} from "../utils";
import {
  displaySnippetDetails,
  displaySnippetsTable,
  displayTemplateDetails,
  displayTemplatesList,
} from "../helpers";

// ============================================================================
// Subcommands
// ============================================================================

const showSnippets = new Command()
  .name("snippets")
  .description("Show available snippets for a framework")
  .argument("[name]", "Snippet name to show details for")
  .option("-f, --framework <framework>", "Framework to use")
  .option("--json", "Output in JSON format")
  .action(async (snippetName: string | undefined, options) => {
    const config = await getConfig();
    let selectedFramework = options.framework || config?.framework;

    // Prompt for framework if not provided
    if (!selectedFramework) {
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

      selectedFramework = await promptFramework(frameworks);
      if (!selectedFramework) {
        console.log("Operation cancelled.");
        process.exit(0);
      }
    }

    // Fetch registry
    const registrySpinner = ora(
      `Fetching snippets for ${selectedFramework}...`,
    ).start();
    let registry: RegistryItem[] = [];
    try {
      registry = await fetchRegistry(selectedFramework);
      registrySpinner.succeed("Snippets fetched");
    } catch (error) {
      registrySpinner.fail("Failed to fetch snippets");
      console.error(error);
      process.exit(1);
    }

    // Filter to snippets only
    const snippets = registry.filter((item) => item.type === "snippet");

    if (snippets.length === 0) {
      console.log(
        chalk.yellow(`No snippets found for framework: ${selectedFramework}`),
      );
      process.exit(0);
    }

    // If specific snippet requested
    if (snippetName) {
      const snippet = snippets.find(
        (s) => s.name.toLowerCase() === snippetName.toLowerCase(),
      );

      if (!snippet) {
        console.log(
          chalk.red(
            `Snippet '${snippetName}' not found for ${selectedFramework}`,
          ),
        );
        console.log(chalk.dim("Available snippets:"));
        snippets
          .slice(0, 10)
          .forEach((s) => console.log(chalk.dim(`  • ${s.name}`)));
        if (snippets.length > 10) {
          console.log(chalk.dim(`  ... and ${snippets.length - 10} more`));
        }
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(snippet, null, 2));
      } else {
        displaySnippetDetails(snippet);
      }
    } else {
      // List all snippets
      if (options.json) {
        console.log(JSON.stringify(snippets, null, 2));
      } else {
        console.log();
        console.log(
          chalk.bold.hex("#ea580c")(
            `Snippets for ${selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)}`,
          ),
        );
        displaySnippetsTable(snippets);
      }
    }
  });

const showTemplates = new Command()
  .name("templates")
  .description("Show available templates for a framework")
  .argument("[name]", "Template name to show details for")
  .option("-f, --framework <framework>", "Framework to use")
  .option("--json", "Output in JSON format")
  .action(async (templateName: string | undefined, options) => {
    const config = await getConfig();
    let selectedFramework = options.framework || config?.framework;

    // Prompt for framework if not provided
    if (!selectedFramework) {
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

      selectedFramework = await promptFramework(frameworks);
      if (!selectedFramework) {
        console.log("Operation cancelled.");
        process.exit(0);
      }
    }

    // Fetch template registry
    const registrySpinner = ora(
      `Fetching templates for ${selectedFramework}...`,
    ).start();
    const registry = await fetchTemplatesRegistry(selectedFramework);

    if (!registry) {
      registrySpinner.fail(`No templates found for ${selectedFramework}`);
      process.exit(1);
    }
    registrySpinner.succeed("Templates fetched");

    // If specific template requested
    if (templateName) {
      // Search in all categories
      const allTemplates = [
        ...(registry.base || []),
        ...(registry.database || []),
        ...(registry.auth || []),
        ...(registry.features || []),
        ...(registry.presets || []),
      ];

      const template = allTemplates.find(
        (t) => t.name.toLowerCase() === templateName.toLowerCase(),
      );

      if (!template) {
        console.log(
          chalk.red(
            `Template '${templateName}' not found for ${selectedFramework}`,
          ),
        );
        console.log(chalk.dim("Available templates:"));
        allTemplates
          .slice(0, 10)
          .forEach((t) => console.log(chalk.dim(`  • ${t.name}`)));
        if (allTemplates.length > 10) {
          console.log(chalk.dim(`  ... and ${allTemplates.length - 10} more`));
        }
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(template, null, 2));
      } else {
        displayTemplateDetails(template as any);
      }
    } else {
      // List all templates
      if (options.json) {
        console.log(JSON.stringify(registry, null, 2));
      } else {
        displayTemplatesList(registry, selectedFramework);
      }
    }
  });

// ============================================================================
// Main Command
// ============================================================================

export const show = new Command()
  .name("show")
  .description("Show details about snippets or templates")
  .addCommand(showSnippets)
  .addCommand(showTemplates);
