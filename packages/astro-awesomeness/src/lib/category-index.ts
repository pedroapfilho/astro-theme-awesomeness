import { byPubDateDesc } from "../content/index";
import { categoryLabel } from "./category-label";
import type { PostLike } from "./post-url";
import { createPostUrl } from "./post-url";
import { slugify } from "./slugify";

type CategoryPostLike = PostLike & { data: { categories: Array<string>; pubDate: Date } };

type CategoryBucket<P> = { name: string; posts: Array<P>; slug: string };

type PostCategory = { name: string; slug: string };

type GroupOptions = {
  includeSecondaryCategories?: boolean;
};

const createCategoryIndex = <P extends CategoryPostLike>(
  categorySlugMap: Record<string, string>,
  defaultCategory: string,
  posts: Array<P>,
) => {
  const { postParams } = createPostUrl(categorySlugMap, defaultCategory);
  const categorySlug = (name: string) => categorySlugMap[name] ?? slugify(name);

  const namesBySlug = new Map<string, Set<string>>();
  const register = (slug: string, name: string) => {
    namesBySlug.set(slug, (namesBySlug.get(slug) ?? new Set()).add(name));
  };
  for (const post of posts) {
    const { category } = postParams(post);
    const names = post.data.categories;
    for (const name of names) {
      register(categorySlug(name), name);
    }
    const first = names[0];
    if (first !== undefined && !names.some((name) => categorySlug(name) === category)) {
      register(category, first);
    }
  }

  const categoryName = (slug: string): string => {
    const names = [...(namesBySlug.get(slug) ?? [])];
    const native = names.find((name) => slugify(categoryLabel(name)) === slug);
    const mapped = names.find((name) => categorySlug(name) === slug);
    return categoryLabel(native ?? mapped ?? names[0] ?? slug);
  };

  const postCategory = (post: PostLike): PostCategory => {
    const { category } = postParams(post);
    return { name: categoryName(category), slug: category };
  };

  const groupByCategory = ({ includeSecondaryCategories = false }: GroupOptions = {}): Array<
    CategoryBucket<P>
  > => {
    const postsBySlug = new Map<string, Array<P>>();
    const add = (slug: string, post: P) => {
      const bucket = postsBySlug.get(slug);
      if (bucket) {
        bucket.push(post);
      } else {
        postsBySlug.set(slug, [post]);
      }
    };

    for (const post of posts) {
      const { category } = postParams(post);
      add(category, post);
      if (!includeSecondaryCategories) {
        continue;
      }
      for (const name of post.data.categories) {
        const slug = categorySlug(name);
        if (slug !== category) {
          add(slug, post);
        }
      }
    }

    return [...postsBySlug].map(([slug, bucketPosts]) => ({
      name: categoryName(slug),
      posts: bucketPosts.toSorted(byPubDateDesc),
      slug,
    }));
  };

  return { categoryName, groupByCategory, postCategory };
};

export type { CategoryBucket, CategoryPostLike, PostCategory };
export { createCategoryIndex };
