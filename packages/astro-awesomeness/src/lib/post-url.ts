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

export type { PostLike, PostParams, PostUrlBuilder };
export { createPostUrl };
