import { categoryLabel } from "./category-label";
import { slugify } from "./slugify";
import { tagLabel, tagUrl, uniqueTags } from "./tag-url";

type ContentPost = {
  data: {
    categories: Array<string>;
    description: string;
    draft?: boolean;
    pubDate: Date;
    seo?: { canonical_url?: string };
    status?: string;
    tags: Array<string>;
    title: string;
  };
  id: string;
};

type ContentIndexOptions<P extends ContentPost> = {
  categorySlugMap: Record<string, string>;
  defaultCategory: string;
  posts: Array<P>;
};

type PostParams = { category: string; slug: string };
type PostCategory = { href: string; name: string; slug: string };
type ContentBucket<P> = PostCategory & { posts: Array<P> };
type CategoryOptions = { includeSecondaryCategories?: boolean };
type FeedItem = { description: string; link: string; pubDate: Date; title: string };

type ContentIndex<P extends ContentPost> = {
  categories: (options?: CategoryOptions) => Array<ContentBucket<P>>;
  feedItems: () => Array<FeedItem>;
  postCategory: (post: P) => PostCategory;
  postParams: (post: P) => PostParams;
  posts: Array<P>;
  postUrl: (post: P) => string;
  relatedPosts: (post: P, count: number) => Array<P>;
  tags: () => Array<ContentBucket<P>>;
};

const notDraft = (post: ContentPost): boolean =>
  post.data.status !== "DRAFT" && post.data.draft !== true;

const byPubDateDesc = (a: ContentPost, b: ContentPost): number =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

const humanize = (slug: string): string => {
  const words = slug.replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const createContentIndex = <P extends ContentPost>({
  categorySlugMap,
  defaultCategory,
  posts: collection,
}: ContentIndexOptions<P>): ContentIndex<P> => {
  const posts = collection.filter(notDraft).toSorted(byPubDateDesc);
  const categorySlug = (name: string): string => categorySlugMap[name] ?? slugify(name);

  const postParams = (post: P): PostParams => {
    const canonical = URL.parse(post.data.seo?.canonical_url ?? "");
    const segments = canonical?.pathname.split("/").filter(Boolean) ?? [];
    const category = segments.at(-2);
    const slug = segments.at(-1);
    if (category !== undefined && slug !== undefined) {
      return { category, slug };
    }
    const first = post.data.categories.at(0);
    return {
      category: first !== undefined && first !== "" ? categorySlug(first) : defaultCategory,
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

  const categories = ({ includeSecondaryCategories = false }: CategoryOptions = {}): Array<
    ContentBucket<P>
  > => {
    const buckets = new Map<string, ContentBucket<P>>();
    for (const post of posts) {
      const slugs = new Set([postParams(post).category]);
      if (includeSecondaryCategories) {
        for (const name of post.data.categories) {
          slugs.add(categorySlug(name));
        }
      }
      for (const slug of slugs) {
        const bucket = buckets.get(slug) ?? { ...categoryInfo(slug), posts: [] };
        bucket.posts.push(post);
        buckets.set(slug, bucket);
      }
    }
    return [...buckets.values()];
  };

  const tags = (): Array<ContentBucket<P>> => {
    const buckets = new Map<string, { bucket: ContentBucket<P>; labelPost: P }>();
    for (const post of posts) {
      for (const tag of uniqueTags(post.data.tags)) {
        const slug = slugify(tag);
        const group = buckets.get(slug) ?? {
          bucket: { href: tagUrl(tag), name: tagLabel(tag), posts: [], slug },
          labelPost: post,
        };
        if (byPubDateDesc(post, group.labelPost) === 0 && post.id < group.labelPost.id) {
          group.bucket.name = tagLabel(tag);
          group.labelPost = post;
        }
        group.bucket.posts.push(post);
        buckets.set(slug, group);
      }
    }
    return [...buckets.values()].map(({ bucket }) => bucket);
  };

  const relatedPosts = (current: P, count: number): Array<P> => {
    const currentTags = new Set(current.data.tags.map(slugify));
    const scored: Array<{ post: P; score: number }> = [];
    for (const post of posts) {
      if (post.id !== current.id) {
        const score = [...new Set(post.data.tags.map(slugify))].filter((tag) =>
          currentTags.has(tag),
        ).length;
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
  CategoryOptions,
  ContentBucket,
  ContentIndex,
  ContentIndexOptions,
  ContentPost,
  FeedItem,
  PostCategory,
  PostParams,
};
