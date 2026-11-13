import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { AstroIntegration } from "astro";
import { describe, expect, it, vi } from "vitest";

import awesomeness from "./index";

type Hooks = AstroIntegration["hooks"];

type SetupOptions = Parameters<NonNullable<Hooks["astro:config:setup"]>>[0];

type DoneOptions = Parameters<NonNullable<Hooks["astro:config:done"]>>[0];

const root = mkdtempSync(join(tmpdir(), "astro-awesomeness-"));

mkdirSync(join(root, "src/data"), { recursive: true });

writeFileSync(join(root, "src/data/category-slugs.json"), "{}");

const integration = awesomeness({
  archivePath: "postagens",
  components: { ListLayout: "./src/list.astro", PostLayout: "./src/post.astro" },
  defaultCategory: "sem-categoria",
  description: "A blog.",
  strings: {
    archive: { description: "Every post.", title: "Posts" },
    category: { description: "Posts in {name}." },
    tag: { description: "Posts about {name}." },
  },
  title: "Blog",
});

const setup = async (integrations: Array<{ name: string }>) => {
  const addWatchFile = vi.fn<SetupOptions["addWatchFile"]>();
  const injectRoute = vi.fn<SetupOptions["injectRoute"]>();
  const updateConfig = vi.fn<SetupOptions["updateConfig"]>();

  await integration.hooks["astro:config:setup"]?.({
    addWatchFile,
    config: { integrations, root: pathToFileURL(`${root}/`) },
    injectRoute,
    updateConfig,
  } as unknown as SetupOptions);

  return { addWatchFile, config: updateConfig.mock.lastCall?.[0], injectRoute };
};

describe("awesomeness", () => {
  it("injects the five content routes, with the archive at the site's path", async () => {
    const { injectRoute } = await setup([]);

    expect(injectRoute.mock.calls.map(([route]) => route)).toEqual([
      { entrypoint: "astro-awesomeness/routes/post.astro", pattern: "/[category]/[slug]" },
      { entrypoint: "astro-awesomeness/routes/category.astro", pattern: "/[category]/[...page]" },
      { entrypoint: "astro-awesomeness/routes/tag.astro", pattern: "/tag/[tag]" },
      { entrypoint: "astro-awesomeness/routes/archive.astro", pattern: "/postagens/[...page]" },
      { entrypoint: "astro-awesomeness/routes/rss.xml.ts", pattern: "/rss.xml" },
    ]);
  });

  it("owns the routing settings and watches the slug map", async () => {
    const { addWatchFile, config } = await setup([]);

    expect(addWatchFile).toHaveBeenCalledWith(
      pathToFileURL(join(root, "src/data/category-slugs.json")),
    );
    expect(config).toMatchObject({
      prerenderConflictBehavior: "error",
      trailingSlash: "always",
      vite: {
        optimizeDeps: { exclude: ["astro-awesomeness"] },
        plugins: [{ name: "astro-awesomeness:virtual-modules" }],
      },
    });
  });

  it("adds the sitemap unless the site already has one", async () => {
    const added = await setup([]);
    const kept = await setup([{ name: "@astrojs/sitemap" }]);

    expect(added.config?.integrations).toMatchObject([{ name: "@astrojs/sitemap" }]);
    expect(kept.config?.integrations).toEqual([]);
  });

  it("references the virtual module types that ship with the package", async () => {
    const injectTypes = vi.fn<DoneOptions["injectTypes"]>();
    const types = fileURLToPath(new URL("../virtual.d.ts", import.meta.url));

    await integration.hooks["astro:config:done"]?.({ injectTypes } as unknown as DoneOptions);

    expect(existsSync(types)).toBe(true);
    expect(injectTypes).toHaveBeenCalledWith({
      content: `/// <reference path=${JSON.stringify(types)} />`,
      filename: "virtual.d.ts",
    });
  });
});
