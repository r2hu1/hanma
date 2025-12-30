import chalk from "chalk";
import { RegistryItem } from "../schema";
import { TemplateRegistry } from "../types";

/**
 * Display snippets in a table format
 */
export function displaySnippetsTable(snippets: RegistryItem[]): void {
  // Group by category
  const categories = new Map<string, RegistryItem[]>();
  for (const snippet of snippets) {
    const cat = snippet.category || "uncategorized";
    if (!categories.has(cat)) {
      categories.set(cat, []);
    }
    categories.get(cat)!.push(snippet);
  }

  // Calculate column widths
  const nameWidth = Math.max(
    ...snippets.map((s) => s.name.length),
    "Name".length,
  );
  const descWidth = Math.min(
    Math.max(
      ...snippets.map((s) => s.description.length),
      "Description".length,
    ),
    50,
  );
  const catWidth = Math.max(
    ...snippets.map((s) => (s.category || "uncategorized").length),
    "Category".length,
  );

  // Header
  console.log();
  console.log(
    chalk.dim("┌") +
      chalk.dim("─".repeat(nameWidth + 2)) +
      chalk.dim("┬") +
      chalk.dim("─".repeat(descWidth + 2)) +
      chalk.dim("┬") +
      chalk.dim("─".repeat(catWidth + 2)) +
      chalk.dim("┐"),
  );
  console.log(
    chalk.dim("│ ") +
      chalk.bold("Name".padEnd(nameWidth)) +
      chalk.dim(" │ ") +
      chalk.bold("Description".padEnd(descWidth)) +
      chalk.dim(" │ ") +
      chalk.bold("Category".padEnd(catWidth)) +
      chalk.dim(" │"),
  );
  console.log(
    chalk.dim("├") +
      chalk.dim("─".repeat(nameWidth + 2)) +
      chalk.dim("┼") +
      chalk.dim("─".repeat(descWidth + 2)) +
      chalk.dim("┼") +
      chalk.dim("─".repeat(catWidth + 2)) +
      chalk.dim("┤"),
  );

  // Rows
  for (const snippet of snippets) {
    const desc =
      snippet.description.length > descWidth
        ? snippet.description.slice(0, descWidth - 3) + "..."
        : snippet.description;
    const cat = snippet.category || "uncategorized";

    console.log(
      chalk.dim("│ ") +
        chalk.cyan(snippet.name.padEnd(nameWidth)) +
        chalk.dim(" │ ") +
        desc.padEnd(descWidth) +
        chalk.dim(" │ ") +
        chalk.yellow(cat.padEnd(catWidth)) +
        chalk.dim(" │"),
    );
  }

  // Footer
  console.log(
    chalk.dim("└") +
      chalk.dim("─".repeat(nameWidth + 2)) +
      chalk.dim("┴") +
      chalk.dim("─".repeat(descWidth + 2)) +
      chalk.dim("┴") +
      chalk.dim("─".repeat(catWidth + 2)) +
      chalk.dim("┘"),
  );
  console.log();
  console.log(chalk.dim(`  Total: ${snippets.length} snippets`));
  console.log();
}

/**
 * Display detailed info for a single snippet
 */
export function displaySnippetDetails(snippet: RegistryItem): void {
  console.log();
  console.log(
    chalk.hex("#ea580c")("╔") +
      chalk.hex("#ea580c")("═".repeat(68)) +
      chalk.hex("#ea580c")("╗"),
  );
  console.log(
    chalk.hex("#ea580c")("║  ") +
      chalk.bold.white(snippet.name) +
      chalk.dim(" - ") +
      snippet.description.slice(0, 50).padEnd(50) +
      chalk.hex("#ea580c")("  ║"),
  );
  console.log(
    chalk.hex("#ea580c")("╠") +
      chalk.hex("#ea580c")("═".repeat(68)) +
      chalk.hex("#ea580c")("╣"),
  );

  // Details
  const line = (label: string, value: string) => {
    const content = `  ${chalk.dim(label.padEnd(14))} ${value}`;
    const padding = 68 - label.length - value.length - 17;
    console.log(
      chalk.hex("#ea580c")("║") +
        content +
        " ".repeat(Math.max(0, padding)) +
        chalk.hex("#ea580c")("║"),
    );
  };

  line("Category:", snippet.category || "uncategorized");
  line("Framework:", snippet.framework || "unknown");
  line("Version:", snippet.version || "latest");

  if (snippet.dependencies && snippet.dependencies.length > 0) {
    console.log(
      chalk.hex("#ea580c")("║") + " ".repeat(68) + chalk.hex("#ea580c")("║"),
    );
    console.log(
      chalk.hex("#ea580c")("║  ") +
        chalk.dim("Dependencies:") +
        " ".repeat(53) +
        chalk.hex("#ea580c")("║"),
    );
    for (const dep of snippet.dependencies) {
      console.log(
        chalk.hex("#ea580c")("║    ") +
          chalk.green("• " + dep) +
          " ".repeat(Math.max(0, 62 - dep.length)) +
          chalk.hex("#ea580c")("║"),
      );
    }
  }

  if (snippet.devDependencies && snippet.devDependencies.length > 0) {
    console.log(
      chalk.hex("#ea580c")("║") + " ".repeat(68) + chalk.hex("#ea580c")("║"),
    );
    console.log(
      chalk.hex("#ea580c")("║  ") +
        chalk.dim("Dev Dependencies:") +
        " ".repeat(49) +
        chalk.hex("#ea580c")("║"),
    );
    for (const dep of snippet.devDependencies) {
      console.log(
        chalk.hex("#ea580c")("║    ") +
          chalk.blue("• " + dep) +
          " ".repeat(Math.max(0, 62 - dep.length)) +
          chalk.hex("#ea580c")("║"),
      );
    }
  }

  if (snippet.files && snippet.files.length > 0) {
    console.log(
      chalk.hex("#ea580c")("║") + " ".repeat(68) + chalk.hex("#ea580c")("║"),
    );
    console.log(
      chalk.hex("#ea580c")("║  ") +
        chalk.dim("Files:") +
        " ".repeat(60) +
        chalk.hex("#ea580c")("║"),
    );
    for (const file of snippet.files) {
      console.log(
        chalk.hex("#ea580c")("║    ") +
          chalk.cyan("• " + file.name) +
          " ".repeat(Math.max(0, 62 - file.name.length)) +
          chalk.hex("#ea580c")("║"),
      );
    }
  }

  console.log(
    chalk.hex("#ea580c")("╚") +
      chalk.hex("#ea580c")("═".repeat(68)) +
      chalk.hex("#ea580c")("╝"),
  );
  console.log();
}

/**
 * Display templates in a categorized list format
 */
export function displayTemplatesList(
  registry: TemplateRegistry,
  framework: string,
): void {
  console.log();
  console.log(
    chalk.bold.hex("#ea580c")(
      `Available Templates for ${framework.charAt(0).toUpperCase() + framework.slice(1)}`,
    ),
  );
  console.log(chalk.dim("─".repeat(40)));
  console.log();

  const displayCategory = (
    name: string,
    items: { name: string; description: string }[] | undefined,
  ) => {
    if (!items || items.length === 0) return;
    console.log(chalk.bold.yellow(`${name.toUpperCase()}:`));
    for (const item of items) {
      console.log(
        `  ${chalk.cyan("•")} ${chalk.white(item.name)} ${chalk.dim("-")} ${chalk.dim(item.description)}`,
      );
    }
    console.log();
  };

  displayCategory("Base", registry.base);
  displayCategory("Database", registry.database);
  displayCategory("Auth", registry.auth);
  displayCategory("Features", registry.features);
  displayCategory("Presets", registry.presets);
}

/**
 * Display detailed info for a single template block
 */
export function displayTemplateDetails(template: {
  name: string;
  description: string;
  category: string;
  dependencies?: string[];
  devDependencies?: string[];
  scripts?: Record<string, string>;
  envVars?: string[];
  files: { path: string }[];
}): void {
  console.log();
  console.log(
    chalk.hex("#ea580c")("╔") +
      chalk.hex("#ea580c")("═".repeat(68)) +
      chalk.hex("#ea580c")("╗"),
  );
  console.log(
    chalk.hex("#ea580c")("║  ") +
      chalk.bold.white(template.name) +
      chalk.dim(" - ") +
      template.description.slice(0, 45).padEnd(45) +
      chalk.hex("#ea580c")("  ║"),
  );
  console.log(
    chalk.hex("#ea580c")("╠") +
      chalk.hex("#ea580c")("═".repeat(68)) +
      chalk.hex("#ea580c")("╣"),
  );

  // Category
  console.log(
    chalk.hex("#ea580c")("║  ") +
      chalk.dim("Category:".padEnd(14)) +
      template.category.padEnd(52) +
      chalk.hex("#ea580c")("║"),
  );

  // Files structure
  if (template.files && template.files.length > 0) {
    console.log(
      chalk.hex("#ea580c")("║") + " ".repeat(68) + chalk.hex("#ea580c")("║"),
    );
    console.log(
      chalk.hex("#ea580c")("║  ") +
        chalk.dim("Structure:") +
        " ".repeat(56) +
        chalk.hex("#ea580c")("║"),
    );

    // Build simple tree
    const sortedFiles = template.files.map((f) => f.path).sort();

    for (const filePath of sortedFiles) {
      const indent = filePath.split("/").length - 1;
      const fileName = filePath.split("/").pop() || filePath;
      const isDir = filePath.endsWith("/");
      const icon = isDir ? "📁" : "📄";
      const prefix = "    " + "  ".repeat(indent);
      const display = `${prefix}${icon} ${fileName}`;
      console.log(
        chalk.hex("#ea580c")("║") +
          display.padEnd(68) +
          chalk.hex("#ea580c")("║"),
      );
    }
  }

  // Dependencies
  if (template.dependencies && template.dependencies.length > 0) {
    console.log(
      chalk.hex("#ea580c")("║") + " ".repeat(68) + chalk.hex("#ea580c")("║"),
    );
    console.log(
      chalk.hex("#ea580c")("║  ") +
        chalk.dim("Dependencies:") +
        " ".repeat(53) +
        chalk.hex("#ea580c")("║"),
    );
    for (const dep of template.dependencies) {
      console.log(
        chalk.hex("#ea580c")("║    ") +
          chalk.green("• " + dep) +
          " ".repeat(Math.max(0, 62 - dep.length)) +
          chalk.hex("#ea580c")("║"),
      );
    }
  }

  // Dev Dependencies
  if (template.devDependencies && template.devDependencies.length > 0) {
    console.log(
      chalk.hex("#ea580c")("║") + " ".repeat(68) + chalk.hex("#ea580c")("║"),
    );
    console.log(
      chalk.hex("#ea580c")("║  ") +
        chalk.dim("Dev Dependencies:") +
        " ".repeat(49) +
        chalk.hex("#ea580c")("║"),
    );
    for (const dep of template.devDependencies) {
      console.log(
        chalk.hex("#ea580c")("║    ") +
          chalk.blue("• " + dep) +
          " ".repeat(Math.max(0, 62 - dep.length)) +
          chalk.hex("#ea580c")("║"),
      );
    }
  }

  // Scripts
  if (template.scripts && Object.keys(template.scripts).length > 0) {
    console.log(
      chalk.hex("#ea580c")("║") + " ".repeat(68) + chalk.hex("#ea580c")("║"),
    );
    console.log(
      chalk.hex("#ea580c")("║  ") +
        chalk.dim("Scripts:") +
        " ".repeat(58) +
        chalk.hex("#ea580c")("║"),
    );
    for (const [name, cmd] of Object.entries(template.scripts)) {
      const display = `• ${name}: ${cmd}`;
      console.log(
        chalk.hex("#ea580c")("║    ") +
          chalk.magenta(display.slice(0, 62)) +
          " ".repeat(Math.max(0, 62 - display.length)) +
          chalk.hex("#ea580c")("║"),
      );
    }
  }

  console.log(
    chalk.hex("#ea580c")("╚") +
      chalk.hex("#ea580c")("═".repeat(68)) +
      chalk.hex("#ea580c")("╝"),
  );
  console.log();
}
