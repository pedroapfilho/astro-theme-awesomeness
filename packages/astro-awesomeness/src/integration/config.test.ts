import { describe, expect, it } from "vitest";

import { resolveConfig, type AwesomenessUserConfig } from "./config";

const options: AwesomenessUserConfig = {
  components: { ListLayout: "./src/list.astro", PostLayout: "./src/post.astro" },
  defaultCategory: "sem-categoria",
  description: "A blog.",
  strings: {
    archive: { description: "Every post.", title: "Posts" },
    category: { description: "Posts in {name}." },
    tag: { description: "Posts about {name}.", eyebrow: "Tag", title: "Tagged {name}" },
  },
  title: "Blog",
};

describe("resolveConfig", () => {
  it("fills the defaults a site leaves out", () => {
    expect(resolveConfig(options)).toEqual({
      ...options,
      archivePath: "posts",
      categorySlugs: "./src/data/category-slugs.json",
      colorScheme: "auto",
      includeSecondaryCategories: false,
      pageSize: 24,
      strings: {
        ...options.strings,
        category: { description: "Posts in {name}.", title: "{name}" },
      },
    });
  });

  it("keeps every option a site sets", () => {
    const site: AwesomenessUserConfig = {
      ...options,
      archivePath: "postagens",
      categorySlugs: "./data/slugs.json",
      colorScheme: "dark",
      components: { ...options.components, ArchiveLayout: "./src/archive.astro" },
      includeSecondaryCategories: true,
      logo: "/logo.png",
      ogImage: "/og.png",
      pageSize: 12,
      tagAliases: "./src/lib/tag-aliases.ts",
    };

    expect(resolveConfig(site)).toEqual({
      ...site,
      strings: { ...site.strings, category: { description: "Posts in {name}.", title: "{name}" } },
    });
  });

  it("names the option that is wrong", () => {
    expect(() => resolveConfig({ ...options, archivePath: "posts/all" })).toThrow(
      "Invalid astro-awesomeness config:",
    );
    expect(() => resolveConfig({ ...options, archivePath: ".." })).toThrow("archivePath");
    expect(() => resolveConfig({ ...options, defaultCategory: "" })).toThrow("defaultCategory");
    expect(() => resolveConfig({ ...options, pageSize: 0 })).toThrow("pageSize");
    expect(() => resolveConfig({ ...options, title: "" })).toThrow("title");
    expect(() => resolveConfig({ ...options, colorScheme: "sepia" as "dark" })).toThrow(
      "colorScheme",
    );
    expect(() => resolveConfig({ ...options, siteTitle: "Blog" } as AwesomenessUserConfig)).toThrow(
      "siteTitle",
    );
  });
});
