import { describe, expect, expectTypeOf, it } from "vitest";

import { postSchema } from "../content/index";
import { createContentIndex } from "./content-index";
import { tagLabel, tagUrl, uniqueTags } from "./tag-url";

const categorySlugMap = {
  Architecture: "arquitetura",
  "Art &amp; Design": "arte-design",
  "Arte &amp; Design": "arte-design",
  "Construção &#8211; Obras": "construcao-obras",
};
const defaultCategory = "sem-categoria";

const cmsPost = (id: string, frontmatter: Record<string, unknown> = {}) => ({
  body: "## Fixture article\n\nRepresentative CMS content.",
  collection: "posts" as const,
  data: postSchema.parse({
    author: { bio: "Fixture author", name: "CI Author" },
    categories: ["Architecture", "Interiores", "Festival"],
    description: "A synthetic CMS article for validation.",
    draft: false,
    pubDate: "2026-01-01T12:00:00.000Z",
    seo: { canonical_url: `https://example.test/arquitetura/${id}/` },
    status: "PUBLISHED",
    tags: ["Validation"],
    title: `CI article ${id}`,
    ...frontmatter,
  }),
  id,
});

type FixturePost = ReturnType<typeof cmsPost>;

const indexFor = (posts: Array<FixturePost>) =>
  createContentIndex({ categorySlugMap, defaultCategory, posts });

const tagNames = (posts: Array<FixturePost>) =>
  indexFor(posts)
    .tags()
    .map(({ name, slug }) => [slug, name]);

const fixture = () => {
  const old = cmsPost("old", { tags: ["Astro", "#construção"] });
  const current = cmsPost("current", {
    categories: ["Construção &#8211; Obras", "Interiores"],
    pubDate: "2026-01-03T12:00:00.000Z",
    seo: { canonical_url: "https://example.test/archive/construcao-obras/casa/?ref=cms" },
    tags: ["#construção", "construção", "Astro", "astro"],
  });
  const newest = cmsPost("newest", {
    categories: ["Arquitetura", "Interiores"],
    pubDate: "2026-01-06T12:00:00.000Z",
    tags: ["astro", "#construção", "construção"],
  });
  const scheduled = cmsPost("scheduled", {
    pubDate: "2026-01-07T12:00:00.000Z",
    status: "SCHEDULED",
    tags: ["astro"],
  });
  const tie = cmsPost("tie", {
    categories: ["Área Externa"],
    pubDate: "2026-01-06T12:00:00.000Z",
    seo: undefined,
    tags: ["construção"],
  });
  const unrelated = cmsPost("unrelated", {
    categories: [],
    pubDate: "2026-01-08T12:00:00.000Z",
    seo: undefined,
    tags: ["c#"],
  });
  const statusDraft = cmsPost("status-draft", {
    categories: ["Draft category"],
    pubDate: "2026-02-01T12:00:00.000Z",
    seo: undefined,
    status: "DRAFT",
    tags: ["draft-only"],
  });
  const booleanDraft = cmsPost("boolean-draft", {
    draft: true,
    pubDate: "2026-02-02T12:00:00.000Z",
    tags: ["draft-only"],
  });
  const posts = [old, current, newest, statusDraft, scheduled, tie, unrelated, booleanDraft];
  return { current, newest, old, posts, scheduled, tie, unrelated };
};

describe("createContentIndex", () => {
  it("filters both draft forms, keeps scheduled posts, and sorts once without mutating entries", () => {
    const { newest, posts, tie } = fixture();
    const input = [...posts];
    const index = indexFor(posts);
    expect(index.posts.map((post) => post.id)).toEqual([
      "unrelated",
      "scheduled",
      "newest",
      "tie",
      "current",
      "old",
    ]);
    expect(posts).toEqual(input);
    expect(index.posts[2]).toBe(newest);
    expect(index.posts[3]).toBe(tie);
    expect(index.categories().some(({ name }) => name === "Draft category")).toBe(false);
    expect(index.tags().some(({ slug }) => slug === "draft-only")).toBe(false);
    expect(index.feedItems().some(({ link }) => link.includes("draft"))).toBe(false);
  });

  it("keeps non-draft statuses and an omitted status publishable", () => {
    const posts = [
      cmsPost("unknown", { status: "OTHER" }),
      cmsPost("absent", { status: undefined }),
    ];
    expect(indexFor(posts).posts).toEqual(posts);
  });

  it("preserves collection entry types and object identity through every post result", () => {
    const post = cmsPost("typed");
    const index = indexFor([post]);
    expectTypeOf(index.posts).toEqualTypeOf<Array<FixturePost>>();
    expectTypeOf(index.categories()[0]?.posts).toEqualTypeOf<Array<FixturePost> | undefined>();
    expectTypeOf(index.tags()[0]?.posts).toEqualTypeOf<Array<FixturePost> | undefined>();
    expectTypeOf(index.relatedPosts(post, 1)).toEqualTypeOf<Array<FixturePost>>();
    expect(index.categories()[0]?.posts[0]).toBe(post);
    expect(index.tags()[0]?.posts[0]).toBe(post);
    expect(index.relatedPosts(cmsPost("other"), 1)[0]).toBe(post);
  });

  it("uses the last two canonical path segments for params and URLs", () => {
    const { current, posts } = fixture();
    const index = indexFor(posts);
    expect(index.postParams(current)).toEqual({ category: "construcao-obras", slug: "casa" });
    expect(index.postUrl(current)).toBe("/construcao-obras/casa/");
  });

  it.each([undefined, "", "not-a-url", "https://example.test/one", "/relative/path/"])(
    "falls back to the raw category map and entry id for canonical %s",
    (canonical) => {
      const post = cmsPost("entry-id", {
        categories: ["Architecture"],
        seo: { canonical_url: canonical },
        slug: "ignored-data-slug",
      });
      expect(indexFor([post]).postParams(post)).toEqual({
        category: "arquitetura",
        slug: "entry-id",
      });
    },
  );

  it("slugifies unmapped categories and uses the default for missing or empty categories", () => {
    const unmapped = cmsPost("unmapped", { categories: ["Área Externa"], seo: undefined });
    const absent = cmsPost("absent", { categories: undefined, seo: undefined });
    const empty = cmsPost("empty", { categories: [""], seo: undefined });
    const index = indexFor([unmapped, absent, empty]);
    expect(index.postUrl(unmapped)).toBe("/area-externa/unmapped/");
    expect(index.postUrl(absent)).toBe("/sem-categoria/absent/");
    expect(index.postUrl(empty)).toBe("/sem-categoria/empty/");
  });

  it("uses decoded native names ahead of mapped names for both posts and categories", () => {
    const english = cmsPost("english", { categories: ["Art &amp; Design"], seo: undefined });
    const native = cmsPost("native", { categories: ["Arte &amp; Design"], seo: undefined });
    const index = indexFor([english, native]);
    expect(index.postCategory(english)).toEqual({
      href: "/arte-design/",
      name: "Arte & Design",
      slug: "arte-design",
    });
    expect(index.categories()).toEqual([
      {
        href: "/arte-design/",
        name: "Arte & Design",
        posts: [english, native],
        slug: "arte-design",
      },
    ]);
  });

  it("prefers a mapped category over the first canonical-only name", () => {
    const first = cmsPost("first", { categories: ["Business"] });
    const mapped = cmsPost("mapped", { categories: ["Architecture"] });
    const index = indexFor([first, mapped]);
    expect(index.postCategory(first).name).toBe("Architecture");
  });

  it("uses the first registered name for a canonical-only slug and humanizes unnamed slugs", () => {
    const first = cmsPost("first", {
      categories: ["Locação de Espaços"],
      seo: { canonical_url: "https://example.test/aluguel-de-espacos/first/" },
    });
    const unnamed = cmsPost("unnamed", { categories: [], seo: undefined });
    const index = indexFor([first, unnamed]);
    expect(index.postCategory(first).name).toBe("Locação de Espaços");
    expect(index.postCategory(unnamed)).toEqual({
      href: "/sem-categoria/",
      name: "Sem categoria",
      slug: defaultCategory,
    });
  });

  it("decodes category labels for display while map lookups retain raw names", () => {
    const { current, posts } = fixture();
    const index = indexFor(posts);
    expect(index.postCategory(current)).toEqual({
      href: "/construcao-obras/",
      name: "Construção – Obras",
      slug: "construcao-obras",
    });
    expect(Object.hasOwn(categorySlugMap, "Construção – Obras")).toBe(false);
    const encoded = cmsPost("encoded", { categories: ["Arte &amp; Design"], seo: undefined });
    const encodedIndex = createContentIndex({
      categorySlugMap: { "Arte &amp; Design": "arte-e-design" },
      defaultCategory,
      posts: [encoded],
    });
    expect(encodedIndex.postUrl(encoded)).toBe("/arte-e-design/encoded/");
    expect(encodedIndex.postCategory(encoded).name).toBe("Arte & Design");
  });

  it("groups canonical categories by default and includes every named category when requested", () => {
    const older = cmsPost("older", { categories: ["Architecture", "Interiores"] });
    const newer = cmsPost("newer", {
      categories: ["Architecture", "Interiores"],
      pubDate: "2026-01-09T12:00:00.000Z",
      seo: { canonical_url: "https://example.test/featured/newer/" },
    });
    const index = indexFor([older, newer]);
    expect(index.categories().map(({ posts, slug }) => [slug, posts.map(({ id }) => id)])).toEqual([
      ["featured", ["newer"]],
      ["arquitetura", ["older"]],
    ]);
    expect(
      index
        .categories({ includeSecondaryCategories: true })
        .map(({ posts, slug }) => [slug, posts.map(({ id }) => id)]),
    ).toEqual([
      ["featured", ["newer"]],
      ["arquitetura", ["newer", "older"]],
      ["interiores", ["newer", "older"]],
    ]);
  });

  it("deduplicates tag variants by slug within each post and keeps newest-first buckets", () => {
    const { current, newest, old, posts, scheduled, tie } = fixture();
    const tags = indexFor(posts).tags();
    expect(tags.find(({ slug }) => slug === "astro")).toEqual({
      href: "/tag/astro/",
      name: "astro",
      posts: [scheduled, newest, current, old],
      slug: "astro",
    });
    expect(tags.find(({ slug }) => slug === "construcao")).toEqual({
      href: "/tag/construcao/",
      name: "construção",
      posts: [newest, tie, current, old],
      slug: "construcao",
    });
    expect(tags.find(({ slug }) => slug === "c")?.name).toBe("c#");
  });

  it("uses the same tag hrefs and per-post deduplication as tag-list", () => {
    const post = cmsPost("tags", {
      tags: [
        "#construção",
        "construção",
        "#LocaçõesDeEspaços",
        "#locaçõesdeespaços",
        "Tendências2025",
        "#tendências2025",
        "Área Externa",
        "arquitetura",
        "arquitetura de luxo",
      ],
    });
    const tags = indexFor([post]).tags();
    expect(tags.map(({ href }) => href)).toEqual(uniqueTags(post.data.tags).map(tagUrl));
    expect(tags.map(({ name }) => name)).toEqual(uniqueTags(post.data.tags).map(tagLabel));
    expect(tags.map(({ href }) => href)).toEqual([
      "/tag/construcao/",
      "/tag/locacoesdeespacos/",
      "/tag/tendencias2025/",
      "/tag/area-externa/",
      "/tag/arquitetura/",
      "/tag/arquitetura-de-luxo/",
    ]);
  });

  it("selects tag names from the newest post regardless of loader order", () => {
    const { posts } = fixture();
    expect(tagNames(posts.toReversed())).toEqual(tagNames(posts));
  });

  it("breaks equal-date tag label ties by entry id without changing post order", () => {
    const first = cmsPost("a", { tags: ["Astro", "astro"] });
    const second = cmsPost("b", { tags: ["astro"] });
    expect(indexFor([second, first]).tags()[0]).toEqual({
      href: "/tag/astro/",
      name: "Astro",
      posts: [second, first],
      slug: "astro",
    });
    expect(indexFor([first, second]).tags()[0]?.name).toBe("Astro");
  });

  it("ranks related posts by unique shared slugs, breaks ties newest first, and pads with newest", () => {
    const { current, newest, old, posts, scheduled, tie, unrelated } = fixture();
    const index = indexFor(posts);
    expect(index.relatedPosts(current, 9)).toEqual([newest, old, scheduled, tie, unrelated]);
    expect(index.relatedPosts(current, 2)).toEqual([newest, old]);
    expect(index.relatedPosts(current, 0)).toEqual([]);
  });

  it("preserves date ties among equally related posts and excludes by entry id", () => {
    const current = cmsPost("current", { tags: ["ASTRO"] });
    const first = cmsPost("first", { tags: ["#Astro", "astro"] });
    const second = cmsPost("second", { tags: ["astro"] });
    expect(indexFor([second, current, first]).relatedPosts({ ...current }, 9)).toEqual([
      second,
      first,
    ]);
  });

  it("returns newest remaining posts when no shared tags exist", () => {
    const { newest, posts, scheduled, tie, unrelated } = fixture();
    expect(indexFor(posts).relatedPosts(unrelated, 3)).toEqual([scheduled, newest, tie]);
  });

  it("produces RSS items in published order using the same canonical URLs", () => {
    const { posts } = fixture();
    const index = indexFor(posts);
    expect(index.feedItems()).toEqual(
      index.posts.map((post) => ({
        description: post.data.description,
        link: index.postUrl(post),
        pubDate: post.data.pubDate,
        title: post.data.title,
      })),
    );
    expect(index.feedItems()[4]?.link).toBe("/construcao-obras/casa/");
    const minimal = cmsPost("minimal", { description: undefined });
    expect(indexFor([minimal]).feedItems()[0]?.description).toBe("");
  });

  it("handles an empty collection", () => {
    const index = indexFor([]);
    expect(index.posts).toEqual([]);
    expect(index.categories()).toEqual([]);
    expect(index.tags()).toEqual([]);
    expect(index.feedItems()).toEqual([]);
    expect(index.relatedPosts(cmsPost("outside"), 3)).toEqual([]);
  });
});
