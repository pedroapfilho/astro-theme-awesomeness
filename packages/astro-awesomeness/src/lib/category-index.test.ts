import { describe, expect, it } from "vitest";

import { createCategoryIndex } from "./category-index";

const map = {
  Architecture: "arquitetura",
  "Art &amp; Design": "arte-design",
  "Arte &amp; Design": "arte-design",
};
const DEFAULT = "sem-categoria";

const post = (id: string, categories: Array<string>, canonical?: string, day = 1) => ({
  data: {
    categories,
    pubDate: new Date(Date.UTC(2026, 0, day)),
    seo: { canonical_url: canonical },
  },
  id,
});

describe("createCategoryIndex", () => {
  it("names a slug shared by a mapped and a native category after the native one", () => {
    const { categoryName, groupByCategory } = createCategoryIndex(map, DEFAULT, [
      post("a", ["Architecture"]),
      post("b", ["Architecture"]),
      post("c", ["Arquitetura"]),
    ]);
    expect(categoryName("arquitetura")).toBe("Arquitetura");
    expect(groupByCategory()).toEqual([
      { name: "Arquitetura", posts: expect.any(Array), slug: "arquitetura" },
    ]);
  });

  it("treats a name that slugifies to the slug once decoded as native", () => {
    const { categoryName } = createCategoryIndex(map, DEFAULT, [
      post("a", ["Art &amp; Design"]),
      post("b", ["Arte &amp; Design"]),
    ]);
    expect(categoryName("arte-design")).toBe("Arte & Design");
  });

  it("falls back to the first name when no native name reaches the slug", () => {
    const { categoryName } = createCategoryIndex(map, DEFAULT, [
      post("a", ["Architecture"]),
      post("b", ["Architecture"]),
    ]);
    expect(categoryName("arquitetura")).toBe("Architecture");
  });

  it("resolves a post's eyebrow through the same name as its category page", () => {
    const { postCategory } = createCategoryIndex(map, DEFAULT, [
      post("a", ["Business"], "https://x.com/arquitetura/a/"),
      post("b", ["Architecture"], "https://x.com/arquitetura/b/"),
      post("c", ["Arquitetura"]),
    ]);
    expect(postCategory(post("a", ["Business"], "https://x.com/arquitetura/a/"))).toEqual({
      name: "Arquitetura",
      slug: "arquitetura",
    });
  });

  it("uses a post's first category for a slug only its canonical url names", () => {
    const { categoryName } = createCategoryIndex(map, DEFAULT, [
      post("a", ["Locação de Espaços"], "https://x.com/aluguel-de-espacos/a/"),
    ]);
    expect(categoryName("aluguel-de-espacos")).toBe("Locação de Espaços");
    expect(categoryName("locacao-de-espacos")).toBe("Locação de Espaços");
  });

  it("labels an unknown slug with the slug itself", () => {
    const { categoryName } = createCategoryIndex(map, DEFAULT, []);
    expect(categoryName("nada")).toBe("nada");
  });

  it("groups by the canonical category and sorts each bucket newest first", () => {
    const { groupByCategory } = createCategoryIndex(map, DEFAULT, [
      post("old", ["Arquitetura"], undefined, 1),
      post("new", ["Arquitetura"], undefined, 9),
      post("orphan", []),
    ]);
    const buckets = groupByCategory();
    expect(buckets.map((b) => b.slug)).toEqual(["arquitetura", "sem-categoria"]);
    expect(buckets[0]?.posts.map((p) => p.id)).toEqual(["new", "old"]);
    expect(buckets[1]?.name).toBe("sem-categoria");
  });

  it("adds a post to each secondary category bucket only when asked", () => {
    const posts = [post("a", ["Arquitetura", "Interiores"])];
    const { groupByCategory } = createCategoryIndex(map, DEFAULT, posts);
    expect(groupByCategory().map((b) => b.slug)).toEqual(["arquitetura"]);
    expect(
      groupByCategory({ includeSecondaryCategories: true }).map((b) => [b.slug, b.name]),
    ).toEqual([
      ["arquitetura", "Arquitetura"],
      ["interiores", "Interiores"],
    ]);
  });
});
