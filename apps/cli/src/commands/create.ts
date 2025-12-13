import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import path from "path";
import fs from "fs-extra";
import { installDependencies } from "../utils/install";

const TEMPLATES_BASE_URL = "http://localhost:5173/templates";

interface TemplateBlock {
  name: string;
  category: string;
  description: string;
  dependencies?: string[];
  devDependencies?: string[];
  scripts?: Record<string, string>;
  envVars?: string[];
  files: Array<{ path: string; content: string }>;
}

async function fetchTemplateRegistry(): Promise<{
  base: TemplateBlock[];
  database: TemplateBlock[];
  auth: TemplateBlock[];
}> {
  const res = await fetch(`${TEMPLATES_BASE_URL}/index.json`);
  if (!res.ok) {
    throw new Error(`Failed to fetch template registry: ${res.statusText}`);
  }
  return res.json() as Promise<{
    base: TemplateBlock[];
    database: TemplateBlock[];
    auth: TemplateBlock[];
  }>;
}

function mergePackageJson(
  base: Record<string, any>,
  overlay: Record<string, any>
): Record<string, any> {
  const result = { ...base };

  // Merge dependencies
  if (overlay.dependencies) {
    result.dependencies = { ...result.dependencies, ...overlay.dependencies };
  }
  if (overlay.devDependencies) {
    result.devDependencies = {
      ...result.devDependencies,
      ...overlay.devDependencies,
    };
  }

  // Merge scripts
  if (overlay.scripts) {
    result.scripts = { ...result.scripts, ...overlay.scripts };
  }

  return result;
}

export const create = new Command()
  .name("create")
  .description("Create a new project from composable templates")
  .argument("[name]", "Project name")
  .option("--framework <framework>", "Base framework (express, hono)")
  .option(
    "--database <database>",
    "Database setup (drizzle-postgres, prisma-postgres)"
  )
  .option("--auth <auth>", "Authentication (better-auth, clerk)")
  .option("--pm <pm>", "Package manager (npm, pnpm, yarn, bun)")
  .option("--skip-install", "Skip package installation")
  .action(async (projectName, options) => {
    console.log(chalk.blue("\nHanma Project Creator\n"));

    // 1. Get project name
    if (!projectName) {
      const { name } = await prompts({
        type: "text",
        name: "name",
        message: "Project name:",
        initial: "my-api",
      });
      if (!name) {
        console.log("Operation cancelled.");
        process.exit(0);
      }
      projectName = name;
    }

    // Check if directory exists
    const projectPath = path.join(process.cwd(), projectName);
    if (await fs.pathExists(projectPath)) {
      console.log(chalk.red(`Directory ${projectName} already exists.`));
      process.exit(1);
    }

    // 2. Fetch template registry
    const spinner = ora("Fetching templates...").start();
    let registry: {
      base: TemplateBlock[];
      database: TemplateBlock[];
      auth: TemplateBlock[];
    };
    try {
      registry = await fetchTemplateRegistry();
      spinner.succeed("Templates loaded");
    } catch (error) {
      spinner.fail("Failed to fetch templates");
      console.error(error);
      process.exit(1);
    }

    // 3. Select framework (base)
    let selectedBase: TemplateBlock | undefined;
    if (options.framework) {
      selectedBase = registry.base.find((b) => b.name === options.framework);
    } else {
      const { base } = await prompts({
        type: "select",
        name: "base",
        message: "Select framework:",
        choices: registry.base.map((b) => ({
          title: b.name,
          value: b,
          description: b.description,
        })),
      });
      selectedBase = base;
    }

    if (!selectedBase) {
      console.log("Operation cancelled.");
      process.exit(0);
    }

    // 4. Select database
    let selectedDatabase: TemplateBlock | undefined;
    if (options.database) {
      selectedDatabase = registry.database.find(
        (d) => d.name === options.database
      );
    } else {
      const { database } = await prompts({
        type: "select",
        name: "database",
        message: "Select database:",
        choices: [
          { title: "None", value: null },
          ...registry.database.map((d) => ({
            title: d.name,
            value: d,
            description: d.description,
          })),
        ],
      });
      selectedDatabase = database;
    }

    // 5. Select auth
    let selectedAuth: TemplateBlock | undefined;
    if (options.auth) {
      selectedAuth = registry.auth.find((a) => a.name === options.auth);
    } else {
      const { auth } = await prompts({
        type: "select",
        name: "auth",
        message: "Select authentication:",
        choices: [
          { title: "None", value: null },
          ...registry.auth.map((a) => ({
            title: a.name,
            value: a,
            description: a.description,
          })),
        ],
      });
      selectedAuth = auth;
    }

    // 6. Select package manager
    let packageManager = options.pm || "npm";
    if (!options.pm) {
      const { pm } = await prompts({
        type: "select",
        name: "pm",
        message: "Select package manager:",
        choices: [
          { title: "npm", value: "npm" },
          { title: "pnpm", value: "pnpm" },
          { title: "yarn", value: "yarn" },
          { title: "bun", value: "bun" },
        ],
        initial: 0,
      });
      if (!pm) {
        console.log("Operation cancelled.");
        process.exit(0);
      }
      packageManager = pm;
    }

    console.log(chalk.blue("\nCreating project...\n"));

    // 6. Create project directory
    await fs.ensureDir(projectPath);

    // 7. Collect all files from selected blocks
    const allFiles: Array<{ path: string; content: string }> = [];
    let packageJson: Record<string, any> = {};
    const allEnvVars: string[] = [];
    const allScripts: Record<string, string> = {};

    const blocks = [selectedBase, selectedDatabase, selectedAuth].filter(
      Boolean
    ) as TemplateBlock[];

    for (const block of blocks) {
      // Merge package.json data
      if (block.dependencies) {
        packageJson.dependencies = { ...packageJson.dependencies };
        for (const dep of block.dependencies) {
          // Handle scoped packages like @types/node
          let name: string;
          let version: string;

          if (dep.startsWith("@")) {
            // Scoped package: @scope/name or @scope/name@version
            const lastAtIndex = dep.lastIndexOf("@");
            if (lastAtIndex > 0) {
              name = dep.substring(0, lastAtIndex);
              version = dep.substring(lastAtIndex + 1);
            } else {
              name = dep;
              version = "*";
            }
          } else if (dep.includes("@")) {
            // Regular package with version: name@version
            const [n, v] = dep.split("@");
            name = n!;
            version = v || "*";
          } else {
            // Package without version
            name = dep;
            version = "*";
          }

          packageJson.dependencies[name] = version;
        }
      }
      if (block.devDependencies) {
        packageJson.devDependencies = { ...packageJson.devDependencies };
        for (const dep of block.devDependencies) {
          let name: string;
          let version: string;

          if (dep.startsWith("@")) {
            const lastAtIndex = dep.lastIndexOf("@");
            if (lastAtIndex > 0) {
              name = dep.substring(0, lastAtIndex);
              version = dep.substring(lastAtIndex + 1);
            } else {
              name = dep;
              version = "*";
            }
          } else if (dep.includes("@")) {
            const [n, v] = dep.split("@");
            name = n!;
            version = v || "*";
          } else {
            name = dep;
            version = "*";
          }

          packageJson.devDependencies[name] = version;
        }
      }
      if (block.scripts) {
        Object.assign(allScripts, block.scripts);
      }
      if (block.envVars) {
        allEnvVars.push(...block.envVars);
      }

      // Collect files
      if (block.files) {
        allFiles.push(...block.files);
      }
    }

    // Build final package.json
    packageJson = {
      name: projectName,
      version: "1.0.0",
      type: "module",
      scripts: allScripts,
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
    };

    // 8. Write files
    const writeSpinner = ora("Writing files...").start();

    // Write package.json
    await fs.writeJSON(path.join(projectPath, "package.json"), packageJson, {
      spaces: 2,
    });

    // Write template files (skip package.json - we generate it ourselves)
    for (const file of allFiles) {
      // Skip package.json files - we generate package.json from merged dependencies
      if (file.path === "package.json.hbs" || file.path === "package.json") {
        continue;
      }

      const filePath = path.join(projectPath, file.path.replace(/\.hbs$/, ""));
      await fs.ensureDir(path.dirname(filePath));

      // Replace template variables
      let content = file.content;
      content = content.replace(/\{\{projectName\}\}/g, projectName);

      await fs.writeFile(filePath, content);
    }

    // Write .env.example
    if (allEnvVars.length > 0) {
      const envContent = allEnvVars.map((v) => `${v}=`).join("\n");
      await fs.writeFile(path.join(projectPath, ".env.example"), envContent);
    }

    // Write .gitignore
    await fs.writeFile(
      path.join(projectPath, ".gitignore"),
      `node_modules\ndist\n.env\n.env.local\n*.log\n`
    );

    writeSpinner.succeed("Files written");

    // 9. Install dependencies
    if (!options.skipInstall) {
      const installSpinner = ora(
        `Installing dependencies with ${packageManager}...`
      ).start();
      try {
        const { execSync } = await import("child_process");
        process.chdir(projectPath);
        execSync(`${packageManager} install`, { stdio: "pipe" });
        installSpinner.succeed("Dependencies installed");
      } catch (error) {
        installSpinner.fail("Failed to install dependencies");
        console.log(
          chalk.yellow(
            `Run '${packageManager} install' manually in the project directory.`
          )
        );
      }
    }

    // 10. Success message
    console.log(
      chalk.green(`\nProject ${projectName} created successfully!\n`)
    );
    console.log(chalk.blue("Next steps:"));
    console.log(`cd ${projectName}`);
    if (options.skipInstall) {
      console.log(`${packageManager} install`);
    }
    if (allEnvVars.length > 0) {
      console.log("cp .env.example .env");
    }
    console.log(`${packageManager} run dev\n`);
  });
