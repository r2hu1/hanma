import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { RegistryItem } from "../types";
import { displaySnippetDetails, displaySnippetsTable } from "../helpers";
import { displayNotFound } from "../utils";

interface ShowCommandConfig {
  name: string;
  description: string;
  itemType: string; // For display messages like "Tooling config" or "Addon"
  fetchRegistry: () => Promise<RegistryItem[]>;
  headerTitle: string;
}

/**
 * Factory to create show subcommands with shared logic.
 * Eliminates duplicate code for show tooling, show addons, etc.
 */
export function createShowSubcommand(config: ShowCommandConfig): Command {
  return new Command()
    .name(config.name)
    .description(config.description)
    .argument("[name]", `${config.itemType} name to show details for`)
    .option("--json", "Output in JSON format")
    .action(async (itemName: string | undefined, options) => {
      const spinner = ora(`Fetching ${config.name}...`).start();
      let registry: RegistryItem[] = [];

      try {
        registry = await config.fetchRegistry();
        spinner.succeed(`${config.itemType}s fetched`);
      } catch (error) {
        spinner.fail(`Failed to fetch ${config.name} registry`);
        console.error(error);
        process.exit(1);
      }

      if (registry.length === 0) {
        console.log(chalk.yellow(`No ${config.name} available.`));
        process.exit(0);
      }

      if (itemName) {
        const item = registry.find(
          (i) => i.name.toLowerCase() === itemName.toLowerCase(),
        );

        if (!item) {
          displayNotFound(config.itemType, itemName, registry);
          process.exit(1);
        }

        if (options.json) {
          console.log(JSON.stringify(item, null, 2));
        } else {
          displaySnippetDetails(item);
        }
      } else {
        if (options.json) {
          console.log(JSON.stringify(registry, null, 2));
        } else {
          console.log();
          console.log(chalk.bold.hex("#ea580c")(config.headerTitle));
          displaySnippetsTable(registry);
        }
      }
    });
}
