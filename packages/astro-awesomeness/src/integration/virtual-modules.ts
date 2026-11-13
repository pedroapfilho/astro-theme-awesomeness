import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { ViteUserConfig } from "astro";
import { z } from "zod";

import type { AwesomenessConfig } from "./config";

type VitePlugin = NonNullable<ViteUserConfig["plugins"]>[number];

const PREFIX = "virtual:astro-awesomeness/";

const virtualModules = async (site: AwesomenessConfig, root: URL): Promise<VitePlugin> => {
  const fromRoot = (path: string): string => resolve(fileURLToPath(root), path);

  const reexport = (id: string): string =>
    `export { default } from ${JSON.stringify(id.startsWith(".") ? fromRoot(id) : id)};`;

  const categorySlugs = await readFile(fromRoot(site.categorySlugs), "utf8");
  const categorySlugMap = z.record(z.string(), z.string()).parse(JSON.parse(categorySlugs));
  const { ArchiveLayout, ListLayout, PostLayout } = site.components;

  const modules = new Map([
    ["components/ArchiveLayout", reexport(ArchiveLayout ?? ListLayout)],
    ["components/ListLayout", reexport(ListLayout)],
    ["components/PostLayout", reexport(PostLayout)],
    ["config", `export default ${JSON.stringify(site)};`],
    [
      "content",
      `import { getCollection } from "astro:content";
import { createContentIndex } from "astro-awesomeness/lib";

export const content = createContentIndex({
  categorySlugMap: ${JSON.stringify(categorySlugMap)},
  defaultCategory: ${JSON.stringify(site.defaultCategory)},
  includeSecondaryCategories: ${JSON.stringify(site.includeSecondaryCategories)},
  posts: await getCollection("posts"),
});`,
    ],
    [
      "tag-aliases",
      site.tagAliases === undefined ? "export default () => [];" : reexport(site.tagAliases),
    ],
  ]);

  return {
    load: (id: string) =>
      id.startsWith(`\0${PREFIX}`) ? modules.get(id.slice(PREFIX.length + 1)) : undefined,
    name: "astro-awesomeness:virtual-modules",
    resolveId: (id: string) =>
      id.startsWith(PREFIX) && modules.has(id.slice(PREFIX.length)) ? `\0${id}` : undefined,
  };
};

export { virtualModules };
