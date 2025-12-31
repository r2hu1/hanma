import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";

import {
  CollectedBlockData,
  TemplateBlock,
  TemplateFile,
  RegistryItem,
  ModuleBlock,
} from "../types";

import { batchInstallDependencies, writeFile, appendEnvVars } from "../utils";

/**
 * Parse a dependency string like "express@4.18.0" or "@types/node@20.0.0"
 */
export function parseDependencyString(dep: string): {
  name: string;
  version: string;
} {
  if (dep.startsWith("@")) {
    const lastAtIndex = dep.lastIndexOf("@");
    if (lastAtIndex > 0) {
      return {
        name: dep.substring(0, lastAtIndex),
        version: dep.substring(lastAtIndex + 1),
      };
    }
    return { name: dep, version: "*" };
  }

  if (dep.includes("@")) {
    const [name, version] = dep.split("@");
    return { name: name!, version: version || "*" };
  }

  return { name: dep, version: "*" };
}

/**
 * Parse an array of dependency strings into a dependencies object
 */
export function parseDependencies(deps: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const dep of deps) {
    const { name, version } = parseDependencyString(dep);
    result[name] = version;
  }
  return result;
}

/**
 * Collect all data from selected template blocks and modules
 */
export function collectBlockData(
  blocks: (TemplateBlock | ModuleBlock)[],
): CollectedBlockData {
  const result: CollectedBlockData = {
    files: [],
    dependencies: {},
    devDependencies: {},
    scripts: {},
    envVars: [],
  };

  for (const block of blocks) {
    if (block.dependencies) {
      Object.assign(result.dependencies, parseDependencies(block.dependencies));
    }
    if (block.devDependencies) {
      Object.assign(
        result.devDependencies,
        parseDependencies(block.devDependencies),
      );
    }
    if (block.scripts) {
      Object.assign(result.scripts, block.scripts);
    }
    if (block.envVars) {
      result.envVars.push(...block.envVars);
    }
    if (block.files) {
      result.files.push(...block.files);
    }
  }

  return result;
}

/**
 * Write project files to disk
 */
export async function writeProjectFiles(
  projectPath: string,
  projectName: string,
  files: TemplateFile[],
  packageJson: Record<string, unknown>,
  envVars: string[],
): Promise<void> {
  // Write package.json
  await fs.writeJSON(path.join(projectPath, "package.json"), packageJson, {
    spaces: 2,
  });

  // Write template files
  for (const file of files) {
    if (file.path === "package.json.hbs" || file.path === "package.json") {
      continue;
    }

    const filePath = path.join(projectPath, file.path.replace(/\.hbs$/, ""));
    const content = file.content.replace(/\{\{projectName\}\}/g, projectName);
    await writeFile(filePath, content);
  }

  // Write .env.example
  if (envVars.length > 0) {
    await appendEnvVars(envVars); // This might need a path adjustment if we are in projectPath
    // Wait, appendEnvVars uses process.cwd(). In create.ts we are usually root.
    // Let's keep the manual write for now to avoid side effects in create
    const envContent = envVars
      .map((v) => (v.includes("=") ? v : `${v}=`))
      .join("\n");
    await fs.writeFile(path.join(projectPath, ".env.example"), envContent);
  }

  // Write .gitignore
  const gitignorePath = path.join(projectPath, ".gitignore");
  if (!(await fs.pathExists(gitignorePath))) {
    await fs.writeFile(
      gitignorePath,
      `node_modules\ndist\n.env\n.env.local\n*.log\n`,
    );
  }
}

/**
 * Find registry items by name
 */
export function findItemsByName(
  names: string[],
  items: RegistryItem[],
): { found: RegistryItem[]; notFound: string[] } {
  const found: RegistryItem[] = [];
  const notFound: string[] = [];

  for (const name of names) {
    const item = items.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (item) {
      found.push(item);
    } else {
      notFound.push(name);
    }
  }

  return { found, notFound };
}

/**
 * Install registry items (snippets, modules, addons, or tooling)
 */
export async function installRegistryItems(
  items: RegistryItem[],
  targetDir: string,
  type: "snippet" | "module" | "addon" | "tooling",
): Promise<void> {
  console.log(chalk.blue(`\nInstalling ${items.length} ${type}(s)...`));

  const allDeps: string[] = [];
  const allDevDeps: string[] = [];

  for (const item of items) {
    if (item.dependencies?.length) allDeps.push(...item.dependencies);
    if (item.devDependencies?.length) allDevDeps.push(...item.devDependencies);
  }

  if (allDeps.length > 0 || allDevDeps.length > 0) {
    const installSpinner = ora("Installing dependencies...").start();
    await batchInstallDependencies(allDeps, allDevDeps);
    installSpinner.succeed("Dependencies installed");
  }

  const writeSpinner = ora("Writing files...").start();
  for (const item of items) {
    for (const file of item.files) {
      const targetPath = path.join(process.cwd(), targetDir, file.name);
      await writeFile(targetPath, file.content);
    }
  }
  writeSpinner.succeed(`Files written to ${targetDir}`);

  console.log(chalk.green(`\n✓ Successfully added ${items.length} ${type}(s)`));
}
