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
  const key = named.toLowerCase();
  return Object.hasOwn(NAMED_ENTITIES, key) ? (NAMED_ENTITIES[key] ?? entity) : entity;
};

const categoryLabel = (name: string): string => name.replaceAll(ENTITY_PATTERN, decodeEntity);

export type { PostLike, PostParams, PostUrlBuilder };
export { categoryLabel, createPostUrl };
