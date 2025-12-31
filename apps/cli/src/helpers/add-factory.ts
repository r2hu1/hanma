import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { getConfig, initHanmaConfig } from "../utils";
import {
  findItemsByName,
  installRegistryItems,
  promptMultiSelectRegistry,
  promptCategoryFilter,
} from "../helpers";
import { RegistryItem } from "../types";

interface AddCommandConfig {
  name: string;
  description: string;
  itemType: "addon" | "tooling";
  itemTypePlural: string;
  fetchRegistry: () => Promise<RegistryItem[]>;
  defaultPath?: string;
  categoryHint?: string;
}

/**
 * Factory to create add-type commands with shared logic.
 * Eliminates duplicate code between addons.ts and tooling.ts.
 */
export function createAddCommand(config: AddCommandConfig): Command {
  const cmd = new Command()
    .name(config.name)
    .description(config.description)
    .argument(
      `[${config.itemTypePlural}...]`,
      `${config.itemType} name(s) to add (optional, use interactive mode if omitted)`,
    )
    .option("-a, --all", `Add all ${config.itemTypePlural}`)
    .option(
      "-p, --path <path>",
      `Destination path (defaults to ${config.defaultPath || "config.componentsPath"})`,
      config.defaultPath,
    );

  if (config.categoryHint) {
    cmd.option(
      "-c, --category <category>",
      `Filter by category (${config.categoryHint})`,
    );
  }

  cmd.action(async (itemNames: string[], options) => {
    let hanmaConfig = await getConfig();
    if (!hanmaConfig) {
      hanmaConfig = await initHanmaConfig();
      if (!hanmaConfig) {
        console.log(
          chalk.red(`Initialization required to add ${config.itemTypePlural}.`),
        );
        process.exit(1);
      }
    }

    // Fetch registry
    const registrySpinner = ora(`Fetching ${config.itemTypePlural}...`).start();
    let registry: RegistryItem[] = [];
    try {
      registry = await config.fetchRegistry();
      registrySpinner.succeed(
        `${config.itemTypePlural.charAt(0).toUpperCase() + config.itemTypePlural.slice(1)} fetched`,
      );
    } catch (error) {
      registrySpinner.fail(`Failed to fetch ${config.itemType} registry`);
      console.error(error);
      process.exit(1);
    }

    if (registry.length === 0) {
      console.log(chalk.yellow(`No ${config.itemTypePlural} available.`));
      process.exit(0);
    }

    let selectedItems: RegistryItem[] = [];

    // Handle different modes
    if (options.all) {
      if (options.category) {
        selectedItems = registry.filter(
          (item) => item.category === options.category,
        );
        if (selectedItems.length === 0) {
          console.log(
            chalk.yellow(
              `No ${config.itemTypePlural} found in category: ${options.category}`,
            ),
          );
          process.exit(0);
        }
      } else {
        selectedItems = registry;
      }
    } else if (itemNames.length > 0) {
      const { found, notFound } = findItemsByName(itemNames, registry);
      if (notFound.length > 0) {
        console.log(
          chalk.yellow(
            `${config.itemTypePlural.charAt(0).toUpperCase() + config.itemTypePlural.slice(1)} not found: ${notFound.join(", ")}`,
          ),
        );
      }
      if (found.length === 0) {
        console.log(chalk.red(`No valid ${config.itemTypePlural} to install.`));
        console.log(chalk.dim(`Available ${config.itemTypePlural}:`));
        registry.forEach((item) => console.log(chalk.dim(`  • ${item.name}`)));
        process.exit(1);
      }
      selectedItems = found;
    } else {
      // Interactive mode
      let filteredRegistry = registry;

      if (options.category) {
        filteredRegistry = registry.filter(
          (item) => item.category === options.category,
        );
      } else if (config.categoryHint) {
        // Use category filter for addons
        const categoryFiltered = await promptCategoryFilter(registry);
        if (!categoryFiltered) {
          console.log("Operation cancelled.");
          process.exit(0);
        }
        filteredRegistry = categoryFiltered;
      }

      selectedItems = await promptMultiSelectRegistry(
        filteredRegistry,
        `Select ${config.itemTypePlural} to add (space to select, enter to confirm)`,
      );
      if (selectedItems.length === 0) {
        console.log(`No ${config.itemTypePlural} selected.`);
        process.exit(0);
      }
    }

    // Install items
    await installRegistryItems(
      selectedItems,
      options.path || hanmaConfig.componentsPath,
      config.itemType,
    );
  });

  return cmd;
}
