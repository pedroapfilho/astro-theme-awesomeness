import type { Post } from "../content";
import { categoryLabel } from "./category-label";
import { slugify } from "./slugify";
import { tagLinks, type ArchiveLink } from "./tag-links";

type ContentPost = {
  data: Pick<
    Post,
    "categories" | "description" | "draft" | "pubDate" | "seo" | "status" | "tags" | "title"
  >;
  id: string;
};

type ContentIndexOptions<P extends ContentPost> = {
  categorySlugMap: Record<string, string>;
  defaultCategory: string;
  includeSecondaryCategories?: boolean;
  posts: Array<P>;
};

type PostParams = { category: string; slug: string };

type PostCategory = ArchiveLink;

type ContentBucket<P> = PostCategory & { posts: Array<P> };

type TagBucket<P> = ContentBucket<P> & { labels: Array<string> };

type FeedItem = { description: string; link: string; pubDate: Date; title: string };

type ContentIndex<P extends ContentPost> = {
  categories: () => Array<ContentBucket<P>>;
  feedItems: () => Array<FeedItem>;
  postCategory: (post: P) => PostCategory;
  postParams: (post: P) => PostParams;
  posts: Array<P>;
  postUrl: (post: P) => string;
  relatedPosts: (post: P, count: number) => Array<P>;
  tags: () => Array<TagBucket<P>>;
};

const notDraft = (post: ContentPost): boolean => post.data.status !== "DRAFT" && !post.data.draft;

const byPubDateDesc = (a: ContentPost, b: ContentPost): number => {
  const dateOrder = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

  if (dateOrder !== 0 || a.id === b.id) {
    return dateOrder;
  }

  return a.id < b.id ? -1 : 1;
};

const humanize = (slug: string): string => {
  const words = slug.replaceAll("-", " ");

  return words.charAt(0).toUpperCase() + words.slice(1);
};

const assertCategorySlug = (slug: string, option: string): void => {
  if (slug === "" || slug === "." || slug === ".." || /[\/\\?#\s]/v.test(slug)) {
    throw new Error(
      `${option} must be a nonempty URL path segment; received ${JSON.stringify(slug)}`,
    );
  }
};

const createContentIndex = <P extends ContentPost>({
  categorySlugMap,
  defaultCategory,
  includeSecondaryCategories = false,
  posts: collection,
}: ContentIndexOptions<P>): ContentIndex<P> => {
  assertCategorySlug(defaultCategory, "defaultCategory");

  for (const [name, slug] of Object.entries(categorySlugMap)) {
    assertCategorySlug(slug, `categorySlugMap[${JSON.stringify(name)}]`);
  }

  const posts = collection.filter(notDraft).toSorted(byPubDateDesc);

  const categorySlug = (name: string): string => {
    const mapped = Object.hasOwn(categorySlugMap, name) ? categorySlugMap[name] : undefined;

    return mapped ?? (slugify(name) || defaultCategory);
  };

  const postParams = (post: P): PostParams => {
    const canonical = URL.parse(post.data.seo?.canonical_url ?? "");
    const segments = canonical?.pathname.split("/").filter(Boolean) ?? [];
    const category = segments.at(-2);
    const slug = segments.at(-1);

    if (category !== undefined && slug !== undefined) {
      return { category, slug };
    }

    return {
      category: categorySlug(post.data.categories.at(0) ?? ""),
      slug: post.id,
    };
  };

  const postUrl = (post: P): string => {
    const { category, slug } = postParams(post);

    return `/${category}/${slug}/`;
  };

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

    const first = names.at(0);

    if (first !== undefined && !names.some((name) => categorySlug(name) === category)) {
      register(category, first);
    }
  }

  const categoryInfo = (slug: string): PostCategory => {
    const names = [...(namesBySlug.get(slug) ?? [])];
    const native = names.find((name) => slugify(categoryLabel(name)) === slug);
    const mapped = names.find((name) => categorySlug(name) === slug);
    const name = native ?? mapped ?? names.at(0);

    return {
      href: `/${slug}/`,
      name: name === undefined ? humanize(slug) : categoryLabel(name),
      slug,
    };
  };

  const postCategory = (post: P): PostCategory => categoryInfo(postParams(post).category);

  const group = (linksOf: (post: P) => Array<PostCategory>): Array<ContentBucket<P>> => {
    const buckets = new Map<string, ContentBucket<P>>();

    for (const post of posts) {
      for (const link of linksOf(post)) {
        const bucket = buckets.get(link.slug) ?? { ...link, posts: [] };
        bucket.posts.push(post);
        buckets.set(link.slug, bucket);
      }
    }

    return [...buckets.values()];
  };

  const categories = () =>
    group((post) => {
      const slugs = new Set([postParams(post).category]);

      if (includeSecondaryCategories) {
        for (const name of post.data.categories) {
          slugs.add(categorySlug(name));
        }
      }

      return [...slugs].map(categoryInfo);
    });

  const labelsOf = (tagged: Array<P>, slug: string): Array<string> => {
    const labels = tagged.flatMap((post) => post.data.tags.filter((tag) => slugify(tag) === slug));

    return [...new Set(labels)];
  };

  const tags = (): Array<TagBucket<P>> =>
    group((post) => tagLinks(post.data.tags)).map(({ href, name, posts: tagged, slug }) => ({
      href,
      labels: labelsOf(tagged, slug),
      name,
      posts: tagged,
      slug,
    }));

  const tagSlugs = (post: P): Array<string> => tagLinks(post.data.tags).map(({ slug }) => slug);

  const relatedPosts = (current: P, count: number): Array<P> => {
    const currentTags = new Set(tagSlugs(current));
    const scored: Array<{ post: P; score: number }> = [];

    for (const post of posts) {
      if (post.id !== current.id) {
        const score = tagSlugs(post).filter((slug) => currentTags.has(slug)).length;
        scored.push({ post, score });
      }
    }

    return scored
      .toSorted((a, b) => b.score - a.score)
      .slice(0, Math.max(0, count))
      .map(({ post }) => post);
  };

  const feedItems = (): Array<FeedItem> =>
    posts.map((post) => ({
      description: post.data.description,
      link: postUrl(post),
      pubDate: post.data.pubDate,
      title: post.data.title,
    }));

  return { categories, feedItems, postCategory, postParams, posts, postUrl, relatedPosts, tags };
};

export { createContentIndex };

export type {
  ContentBucket,
  ContentIndex,
  ContentIndexOptions,
  ContentPost,
  FeedItem,
  PostCategory,
  PostParams,
  TagBucket,
};
