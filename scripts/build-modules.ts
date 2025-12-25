import fs from "fs-extra";
import path from "path";
import yaml from "js-yaml";

import {
  MODULES_DIR,
  SNIPPETS_DIR,
  DOCS_REGISTRY_DIR,
  parseSnippetFile,
} from "./utils";

const MODULES_OUTPUT_DIR = path.join(
  path.dirname(DOCS_REGISTRY_DIR),
  "modules",
);

interface ModuleBlock {
  name: string;
  description: string;
  framework: string;
  version: string;
  category?: string;
  dependencies: string[];
  devDependencies: string[];
  snippets: string[];
  files: Array<{ path: string; content: string }>;
}

async function main() {
  console.log("Building modules registry...");

  await fs.ensureDir(MODULES_OUTPUT_DIR);

  if (!(await fs.pathExists(MODULES_DIR))) {
    console.log("No modules directory found.");
    await fs.writeJSON(path.join(MODULES_OUTPUT_DIR, "index.json"), [], {
      spaces: 2,
    });
    return;
  }

  const frameworks: string[] = [];
  const registry: Record<string, ModuleBlock[]> = {};

  const frameworkDirs = await fs.readdir(MODULES_DIR);

  for (const frameworkName of frameworkDirs) {
    const frameworkPath = path.join(MODULES_DIR, frameworkName);
    if (!(await fs.stat(frameworkPath)).isDirectory()) continue;

    frameworks.push(frameworkName);
    registry[frameworkName] = [];
    console.log(`Processing framework: ${frameworkName}`);

    async function findMetaFiles(dir: string): Promise<string[]> {
      const results: string[] = [];
      const entries = await fs.readdir(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          const metaPath = path.join(fullPath, "_meta.yaml");
          if (await fs.pathExists(metaPath)) {
            results.push(fullPath);
          } else {
            results.push(...(await findMetaFiles(fullPath)));
          }
        }
      }
      return results;
    }

    const modulePaths = await findMetaFiles(frameworkPath);

    for (const modulePath of modulePaths) {
      const metaPath = path.join(modulePath, "_meta.yaml");
      const metaContent = await fs.readFile(metaPath, "utf-8");
      const meta = yaml.load(metaContent) as any;

      const relativePath = path.relative(frameworkPath, modulePath);
      const version = relativePath.split(path.sep)[0] || "v1";

      const moduleBlock: ModuleBlock = {
        name: meta.name || path.basename(modulePath),
        description: meta.description || "",
        framework: frameworkName,
        version: meta.version || version,
        category: meta.category,
        dependencies: [...(meta.dependencies || [])],
        devDependencies: [...(meta.devDependencies || [])],
        snippets: [],
        files: [],
      };

      if (meta.snippets && Array.isArray(meta.snippets)) {
        for (const snippetPath of meta.snippets) {
          moduleBlock.snippets.push(snippetPath);
          const parsed = await parseSnippetFile(
            path.join(SNIPPETS_DIR, snippetPath),
          );
          if (!parsed) continue;

          if (parsed.meta.dependencies) {
            for (const dep of parsed.meta.dependencies) {
              if (!moduleBlock.dependencies.includes(dep))
                moduleBlock.dependencies.push(dep);
            }
          }
          if (parsed.meta.devDependencies) {
            for (const dep of parsed.meta.devDependencies) {
              if (!moduleBlock.devDependencies.includes(dep))
                moduleBlock.devDependencies.push(dep);
            }
          }

          let outputPath: string;
          if (parsed.meta.files && parsed.meta.files[0]) {
            outputPath = parsed.meta.files[0].name;
          } else {
            outputPath = path.basename(snippetPath, ".hbs") + ".ts";
          }

          moduleBlock.files.push({ path: outputPath, content: parsed.body });
          console.log(`    ↳ Included snippet: ${snippetPath} → ${outputPath}`);
        }
      }

      const collectFiles = async (dir: string, base: string = "") => {
        const entries = await fs.readdir(dir);
        for (const entry of entries) {
          if (entry === "_meta.yaml") continue;
          const full = path.join(dir, entry);
          const rel = path.join(base, entry);
          const stat = await fs.stat(full);
          if (stat.isDirectory()) {
            await collectFiles(full, rel);
          } else {
            moduleBlock.files.push({
              path: rel,
              content: await fs.readFile(full, "utf-8"),
            });
          }
        }
      };
      await collectFiles(modulePath);

      registry[frameworkName].push(moduleBlock);
      console.log(
        `  ✓ ${frameworkName}/${moduleBlock.name} (${moduleBlock.files.length} files)`,
      );
    }

    await fs.writeJSON(
      path.join(MODULES_OUTPUT_DIR, `${frameworkName}.json`),
      registry[frameworkName],
      { spaces: 2 },
    );
  }

  await fs.writeJSON(path.join(MODULES_OUTPUT_DIR, "index.json"), frameworks, {
    spaces: 2,
  });
  console.log(`\nModules registry built successfully!`);
}

main().catch(console.error);
