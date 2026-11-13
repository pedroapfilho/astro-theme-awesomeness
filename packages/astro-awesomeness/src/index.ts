import { fileURLToPath } from "node:url";

import sitemap from "@astrojs/sitemap";
import type { AstroIntegration } from "astro";

import { resolveConfig, type AwesomenessUserConfig } from "./integration/config";
import { virtualModules } from "./integration/virtual-modules";

const awesomeness = (options: AwesomenessUserConfig): AstroIntegration => {
  const site = resolveConfig(options);

  return {
    hooks: {
      "astro:config:done": ({ injectTypes }) => {
        const types = fileURLToPath(new URL("../virtual.d.ts", import.meta.url));

        injectTypes({
          content: `/// <reference path=${JSON.stringify(types)} />`,
          filename: "virtual.d.ts",
        });
      },
      "astro:config:setup": async ({ addWatchFile, config, injectRoute, updateConfig }) => {
        addWatchFile(new URL(site.categorySlugs, config.root));

        for (const [pattern, route] of [
          ["/[category]/[slug]", "post.astro"],
          ["/[category]/[...page]", "category.astro"],
          ["/tag/[tag]", "tag.astro"],
          [`/${site.archivePath}/[...page]`, "archive.astro"],
          ["/rss.xml", "rss.xml.ts"],
        ] as const) {
          injectRoute({ entrypoint: `astro-awesomeness/routes/${route}`, pattern });
        }

        updateConfig({
          integrations: config.integrations.some(({ name }) => name === "@astrojs/sitemap")
            ? []
            : [sitemap()],
          prerenderConflictBehavior: "error",
          trailingSlash: "always",
          vite: {
            optimizeDeps: { exclude: ["astro-awesomeness"] },
            plugins: [await virtualModules(site, config.root)],
          },
        });
      },
    },
    name: "astro-awesomeness",
  };
};

export default awesomeness;

export type { AwesomenessConfig, AwesomenessUserConfig } from "./integration/config";

export type { ListLayoutProps, PostLayoutProps } from "./lib/listing-copy";

export type { TagAliases } from "./lib/tag-routes";
