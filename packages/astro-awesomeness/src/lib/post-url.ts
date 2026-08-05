import { slugify } from "./slugify";

type PostLike = {
  data: {
    categories?: Array<string>;
    seo?: { canonical_url?: string };
  };
  id: string;
};

type PostParams = { category: string; slug: string };

type PostUrlBuilder = {
  postParams: (post: PostLike) => PostParams;
  postUrl: (post: PostLike) => string;
};

// Per-blog URL builder. Each blog supplies its own pt-BR -> slug map
// (`category-slugs.json`) and the catch-all category used when the post has
// no categories. The canonical_url short-circuit lets WordPress migrations
// keep their original URL pair while everything else falls back to a slugified
// derived category + Astro entry id.
const createPostUrl = (
  categorySlugMap: Record<string, string>,
  defaultCategory: string,
): PostUrlBuilder => {
  const postParams = (post: PostLike): PostParams => {
    const canonical = post.data.seo?.canonical_url;
    if (canonical !== undefined && canonical !== "") {
      try {
        const segments = new URL(canonical).pathname.split("/").filter(Boolean);
        const category = segments.at(-2);
        const slug = segments.at(-1);
        if (category !== undefined && slug !== undefined) {
          return { category, slug };
        }
      } catch {
        // Malformed canonical_url; fall through to category-derived logic.
      }
    }
    const first = post.data.categories?.at(0);
    const category =
      first !== undefined && first !== ""
        ? (categorySlugMap[first] ?? slugify(first))
        : defaultCategory;
    return { category, slug: post.id };
  };

  const postUrl = (post: PostLike): string => {
    const { category, slug } = postParams(post);
    return `/${category}/${slug}/`;
  };

  return { postParams, postUrl };
};

// Escapes rather than literal glyphs so nothing invisible or ambiguous sits in
// source. `mdash` is deliberately absent: U+2014 is banned across these blogs, so
// an encoded em-dash stays encoded rather than being decoded into a banned
// character.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "\u2026",
  ldquo: "\u201c",
  lsquo: "\u2018",
  lt: "<",
  nbsp: "\u00a0",
  ndash: "\u2013",
  quot: '"',
  rdquo: "\u201d",
  rsquo: "\u2019",
};

const MAX_CODE_POINT = 1_114_111;
const EM_DASH = 8212;
const HEX_RADIX = 16;
const ENTITY_PATTERN = /&(?:#(?<decimal>\d+)|#x(?<hex>[\dA-F]+)|(?<named>[A-Z]+));/giv;

// `String.fromCodePoint` throws on anything past the Unicode range, which would
// take a whole static build down over one malformed entity. U+2014 is refused for
// the same reason `mdash` is absent above: a numeric escape must not become the
// way the banned glyph reaches a page.
const fromCodePoint = (codePoint: number, entity: string): string =>
  Number.isInteger(codePoint) && codePoint <= MAX_CODE_POINT && codePoint !== EM_DASH
    ? String.fromCodePoint(codePoint)
    : entity;

const decodeEntity = (entity: string, decimal?: string, hex?: string, named?: string): string => {
  if (decimal !== undefined) {
    return fromCodePoint(Number(decimal), entity);
  }
  if (hex !== undefined) {
    return fromCodePoint(Number.parseInt(hex, HEX_RADIX), entity);
  }
  if (named === undefined) {
    return entity;
  }
  // Bare indexing would resolve `&constructor;` up the prototype chain and
  // render `Function.prototype.toString` output into the page.
  const key = named.toLowerCase();
  return Object.hasOwn(NAMED_ENTITIES, key) ? (NAMED_ENTITIES[key] ?? entity) : entity;
};

// WordPress migrations stored category names HTML-encoded and the content API
// returns `post.data.categories` the same way, so both `category-slugs.json` keys
// and post frontmatter carry raw entities. Display-only on purpose: `createPostUrl`
// resolves a slug by the raw, still-encoded name, so a decoded name must never
// reach that lookup or every affected post URL moves.
const categoryLabel = (name: string): string => name.replaceAll(ENTITY_PATTERN, decodeEntity);

export type { PostLike, PostParams, PostUrlBuilder };
export { categoryLabel, createPostUrl };
