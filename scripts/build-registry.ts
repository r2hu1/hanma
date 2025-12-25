import fs from "fs-extra";
import path from "path";
import yaml from "js-yaml";
import {
  SNIPPETS_DIR,
  DOCS_REGISTRY_DIR,
  ensureDir,
  parseSnippetFile,
  findFiles,
} from "./utils";

async function main() {
  console.log("Building registry...");

  await ensureDir(DOCS_REGISTRY_DIR);

  const frameworks: string[] = [];

  // Find all framework folders
  const frameworkDirs = await fs.readdir(SNIPPETS_DIR);

  for (const frameworkName of frameworkDirs) {
    const frameworkPath = path.join(SNIPPETS_DIR, frameworkName);
    if (!(await fs.stat(frameworkPath)).isDirectory()) continue;

    frameworks.push(frameworkName);
    const frameworkRegistry: any[] = [];
    console.log(`Processing framework: ${frameworkName}`);

    const hbsFiles = await findFiles(frameworkPath, ".hbs");

    for (const hbsFile of hbsFiles) {
      const parsed = await parseSnippetFile(hbsFile);
      if (!parsed) continue;

      const { meta, body: bodyContent } = parsed;

      // Identify version and category from path
      const relativePath = path.relative(SNIPPETS_DIR, hbsFile);
      const parts = relativePath.split(path.sep);
      // parts[0] is framework, parts[1] is version, parts[2+] are category/subcategory
      const version = parts.length > 1 ? parts[1] : "unknown";

      // Infer category from directory structure (everything after version)
      const categoryParts = parts.slice(2, -1); // Exclude filename
      const category =
        categoryParts.length > 0 ? categoryParts.join("/") : undefined;

      // Injected inferred metadata if missing
      if (!meta.version) meta.version = version;
      if (!meta.framework) meta.framework = frameworkName;
      if (!meta.category && category) meta.category = category;

      // Infer type based on number of files
      const isModule =
        meta.files && Array.isArray(meta.files) && meta.files.length > 1;
      if (!meta.type) meta.type = isModule ? "module" : "snippet";

      const registryItem = { ...meta, files: [] };
      const configDir = path.dirname(hbsFile);

      if (meta.files && Array.isArray(meta.files)) {
        for (const f of meta.files) {
          let fileContent = "";

          if (f.source) {
            const sourcePath = path.join(configDir, f.source);
            const sourceParsed = await parseSnippetFile(sourcePath);
            fileContent = sourceParsed ? sourceParsed.body : "";
          } else {
            fileContent = bodyContent;
          }

          registryItem.files.push({
            name: f.name,
            path: f.path || f.name,
            content: fileContent,
          });
        }
      }

      frameworkRegistry.push(registryItem);
    }

    // Write framework registry
    await fs.writeJSON(
      path.join(DOCS_REGISTRY_DIR, `${frameworkName}.json`),
      frameworkRegistry,
      { spaces: 2 },
    );
  }

  // Write index.json
  await fs.writeJSON(path.join(DOCS_REGISTRY_DIR, "index.json"), frameworks, {
    spaces: 2,
  });

  console.log(`Registry built. Frameworks: ${frameworks.join(", ")}`);
}

main().catch(console.error);
