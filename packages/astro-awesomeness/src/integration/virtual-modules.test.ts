import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { resolveConfig } from "./config";
import { virtualModules } from "./virtual-modules";

const site = resolveConfig({
  categorySlugs: "./slugs.json",
  components: { ListLayout: "./src/list.astro", PostLayout: "theme-pkg/post.astro" },
  defaultCategory: "sem-categoria",
  description: "A blog.",
  includeSecondaryCategories: true,
  strings: {
    archive: { description: "Every post.", title: "Posts" },
    category: { description: "Posts in {name}." },
    tag: { description: "Posts about {name}." },
  },
  title: "Blog",
});

const root = mkdtempSync(join(tmpdir(), "astro-awesomeness-"));

writeFileSync(join(root, "slugs.json"), JSON.stringify({ "Luz &amp; Sombra": "luz-sombra" }));

const modules = async (config = site) => {
  const plugin = await virtualModules(config, pathToFileURL(`${root}/`));

  return plugin as unknown as {
    load: (id: string) => string | undefined;
    resolveId: (id: string) => string | undefined;
  };
};

const load = async (name: string, config = site) => {
  const { load: loadModule, resolveId } = await modules(config);
  const id = resolveId(`virtual:astro-awesomeness/${name}`);

  return id === undefined ? undefined : loadModule(id);
};

describe("virtualModules", () => {
  it("serves the resolved config", async () => {
    expect(await load("config")).toBe(`export default ${JSON.stringify(site)};`);
  });

  it("binds the content index to the site's slug map and category options", async () => {
    const content = await load("content");

    expect(content).toContain('categorySlugMap: {"Luz &amp; Sombra":"luz-sombra"},');
    expect(content).toContain('defaultCategory: "sem-categoria",');
    expect(content).toContain("includeSecondaryCategories: true,");
    expect(content).toContain('posts: await getCollection("posts"),');
  });

  it("resolves a relative layout from the project root and leaves a package specifier alone", async () => {
    expect(await load("components/ListLayout")).toBe(
      `export { default } from ${JSON.stringify(join(root, "src/list.astro"))};`,
    );
    expect(await load("components/PostLayout")).toBe(
      'export { default } from "theme-pkg/post.astro";',
    );
  });

  it("renders the archive with the list layout unless the site names an archive layout", async () => {
    expect(await load("components/ArchiveLayout")).toBe(await load("components/ListLayout"));

    const bespoke = {
      ...site,
      components: { ...site.components, ArchiveLayout: "./src/archive.astro" },
    };

    expect(await load("components/ArchiveLayout", bespoke)).toBe(
      `export { default } from ${JSON.stringify(join(root, "src/archive.astro"))};`,
    );
  });

  it("gives no aliases unless the site names a module", async () => {
    expect(await load("tag-aliases")).toBe("export default () => [];");
    expect(await load("tag-aliases", { ...site, tagAliases: "./src/aliases.ts" })).toBe(
      `export { default } from ${JSON.stringify(join(root, "src/aliases.ts"))};`,
    );
  });

  it("claims only its own modules", async () => {
    const { load: loadModule, resolveId } = await modules();

    expect(resolveId("virtual:astro-awesomeness/missing")).toBeUndefined();
    expect(resolveId("astro:content")).toBeUndefined();
    expect(loadModule("/src/pages/index.astro")).toBeUndefined();
  });

  it("rejects a slug map that is not a record of strings", async () => {
    writeFileSync(join(root, "broken.json"), JSON.stringify({ Moda: 1 }));

    await expect(modules({ ...site, categorySlugs: "./broken.json" })).rejects.toThrow("Moda");
  });
});
