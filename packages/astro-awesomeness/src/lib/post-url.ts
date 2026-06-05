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
    if (canonical) {
      try {
        const segments = new URL(canonical).pathname.split("/").filter(Boolean);
        const category = segments.at(-2);
        const slug = segments.at(-1);
        if (category && slug) {
          return { category, slug };
        }
      } catch {
        // Malformed canonical_url — fall through to category-derived logic.
      }
    }
    const first = post.data.categories?.at(0);
    const category = first ? (categorySlugMap[first] ?? slugify(first)) : defaultCategory;
    return { category, slug: post.id };
  };

  const postUrl = (post: PostLike): string => {
    const { category, slug } = postParams(post);
    return `/${category}/${slug}/`;
  };

  return { postParams, postUrl };
};

export type { PostLike, PostParams, PostUrlBuilder };
export { createPostUrl };
