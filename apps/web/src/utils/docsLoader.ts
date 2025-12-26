/**
 * Static imports for all docs JSON files.
 * This replaces the runtime fetch() calls since docs are now in src/docs.
 */

// Snippets - Express
import expressIndex from "@/docs/snippets/express/index.json";
import expressDocs from "@/docs/snippets/express/docs.json";
import expressLibs from "@/docs/snippets/express/libs.json";
import expressMiddleware from "@/docs/snippets/express/middleware.json";
import expressRoutes from "@/docs/snippets/express/routes.json";
import expressUtils from "@/docs/snippets/express/utils.json";

// Snippets - Hono
import honoIndex from "@/docs/snippets/hono/index.json";
import honoLibs from "@/docs/snippets/hono/libs.json";
import honoMiddleware from "@/docs/snippets/hono/middleware.json";

// Snippets - Elysia
import elysiaIndex from "@/docs/snippets/elysia/index.json";
import elysiaLibs from "@/docs/snippets/elysia/libs.json";
import elysiaPlugins from "@/docs/snippets/elysia/plugins.json";

// Snippets - Shared
import sharedIndex from "@/docs/snippets/shared/index.json";
import sharedDb from "@/docs/snippets/shared/db.json";
import sharedLibs from "@/docs/snippets/shared/libs.json";
import sharedMailers from "@/docs/snippets/shared/mailers.json";
import sharedPasswords from "@/docs/snippets/shared/passwords.json";
import sharedQueries from "@/docs/snippets/shared/queries.json";
import sharedUploads from "@/docs/snippets/shared/uploads.json";
import sharedUtils from "@/docs/snippets/shared/utils.json";

// Templates
import templatesExpressIndex from "@/docs/templates/express/index.json";
import templatesExpressAuth from "@/docs/templates/express/auth.json";
import templatesExpressBase from "@/docs/templates/express/base.json";
import templatesExpressDatabase from "@/docs/templates/express/database.json";
import templatesExpressFeatures from "@/docs/templates/express/features.json";
import templatesExpressPresets from "@/docs/templates/express/presets.json";

// Modules
import modulesIndex from "@/docs/modules/index.json";

// Snippets Sources
import expressSourcesJson from "@/docs/snippets-source/express/sources.json";
import honoSourcesJson from "@/docs/snippets-source/hono/sources.json";
import elysiaSourcesJson from "@/docs/snippets-source/elysia/sources.json";
import sharedSourcesJson from "@/docs/snippets-source/shared/sources.json";

import type { FrameworkType } from "@/types/docs";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Snippet index loaders
export const snippetIndexes: Record<FrameworkType, any> = {
  express: expressIndex,
  hono: honoIndex,
  elysia: elysiaIndex,
  shared: sharedIndex,
};

// Snippet category loaders by framework
const expressCategories: Record<string, any> = {
  "docs.json": expressDocs,
  "libs.json": expressLibs,
  "middleware.json": expressMiddleware,
  "routes.json": expressRoutes,
  "utils.json": expressUtils,
};

const honoCategories: Record<string, any> = {
  "libs.json": honoLibs,
  "middleware.json": honoMiddleware,
};

const elysiaCategories: Record<string, any> = {
  "libs.json": elysiaLibs,
  "plugins.json": elysiaPlugins,
};

const sharedCategories: Record<string, any> = {
  "db.json": sharedDb,
  "libs.json": sharedLibs,
  "mailers.json": sharedMailers,
  "passwords.json": sharedPasswords,
  "queries.json": sharedQueries,
  "uploads.json": sharedUploads,
  "utils.json": sharedUtils,
};

const allCategories: Record<FrameworkType, Record<string, any>> = {
  express: expressCategories,
  hono: honoCategories,
  elysia: elysiaCategories,
  shared: sharedCategories,
};

// Dynamic category file loaders
export function loadSnippetCategory(
  framework: FrameworkType,
  fileName: string,
): any | null {
  const categories = allCategories[framework];
  return categories?.[fileName] || null;
}

// Template index loader
export const templatesIndex: any = templatesExpressIndex;

// Template category loaders
const templatesExpressCategories: Record<string, any> = {
  "auth.json": templatesExpressAuth,
  "base.json": templatesExpressBase,
  "database.json": templatesExpressDatabase,
  "features.json": templatesExpressFeatures,
  "presets.json": templatesExpressPresets,
};

export function loadTemplateCategory(fileName: string): any | null {
  return templatesExpressCategories[fileName] || null;
}

// Modules loader
export const modulesData: any = modulesIndex;

// Sources loaders
export const snippetSources: Record<FrameworkType, Record<string, string>> = {
  express: expressSourcesJson as Record<string, string>,
  hono: honoSourcesJson as Record<string, string>,
  elysia: elysiaSourcesJson as Record<string, string>,
  shared: sharedSourcesJson as Record<string, string>,
};

export function getSnippetSource(
  framework: FrameworkType,
  snippetId: string,
): string | null {
  const sources = snippetSources[framework];
  return sources?.[snippetId] || null;
}
