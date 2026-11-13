import { createContentIndex } from "astro-awesomeness/lib";

import type { PageFacts } from "./read-page.ts";
import { articlePaths } from "./snapshot.ts";

type ContentOptions = {
  archivePath: string;
  categorySlugMap: Record<string, string>;
  defaultCategory: string;
  staticPages: Array<string>;
};

type Pages = Map<string, PageFacts>;

const SENTINEL_CATEGORY = "Snapshot secondary category";

const segments = (path: string): Array<string> => path.split("/").filter(Boolean);

const humanize = (slug: string): string => {
  const words = slug.replaceAll("-", " ");

  return words.charAt(0).toUpperCase() + words.slice(1);
};

const categorySlugOf = (name: string, categorySlugMap: Record<string, string>): string => {
  const post = {
    data: {
      categories: [name],
      description: "",
      draft: false,
      pubDate: new Date(0),
      tags: [],
      title: name,
    },
    id: "probe",
  };

  const index = createContentIndex({
    categorySlugMap,
    defaultCategory: "snapshot-probe-default",
    posts: [post],
  });

  return index.postParams(post).category;
};

const categoryNameOf = (
  slug: string,
  pages: Pages,
  categorySlugMap: Record<string, string>,
): string => {
  const display = pages.get(`/${slug}/`)?.title;

  if (display === undefined) {
    throw new Error(`Production has no category page at /${slug}/`);
  }

  const name = [
    display,
    ...Object.keys(categorySlugMap).filter((key) => categorySlugMap[key] === slug),
    display.replaceAll("&", "&amp;"),
    slug,
  ].find((candidate) => categorySlugOf(candidate, categorySlugMap) === slug);

  if (name === undefined) {
    throw new Error(`No category name routes to /${slug}/ (page title ${JSON.stringify(display)})`);
  }

  return name;
};

const categoryListings = (pages: Pages, articles: Set<string>, reserved: Set<string>) => {
  const listedIn = new Map<string, Set<string>>();

  for (const [path, page] of pages) {
    const [owner = "", pageNumber = "1", ...rest] = segments(path);
    const isListing = rest.length === 0 && /^\d+$/v.test(pageNumber) && !articles.has(path);

    if (owner !== "" && isListing && !reserved.has(owner)) {
      for (const link of page.links.filter(({ path: target }) => articles.has(target))) {
        listedIn.set(link.path, (listedIn.get(link.path) ?? new Set()).add(owner));
      }
    }
  }

  return listedIn;
};

const tagLabels = (page: PageFacts): Array<string> => {
  const tags = new Map<string, string>();

  for (const link of page.links) {
    if (link.path.startsWith("/tag/") && !tags.has(link.path)) {
      tags.set(link.path, link.text);
    }
  }

  return [...tags.values()];
};

const frontmatter = (page: PageFacts, categories: Array<string>) => {
  if (page.published === undefined) {
    throw new Error(`${page.canonical} has no article:published_time`);
  }

  return {
    author: page.author
      ? {
          bio: page.author.bio ?? null,
          name: page.author.name,
          photoUrl: page.author.photoUrl ?? null,
          url: page.author.url ?? null,
        }
      : null,
    categories,
    description: page.description,
    draft: false,
    heroImage: null,
    heroImageHeight: null,
    heroImageUrl: null,
    heroImageWidth: null,
    pubDate: page.published,
    seo: { canonical_url: null, focus_keyword: null },
    status: "PUBLISHED",
    tags: tagLabels(page),
    title: page.title,
    updatedDate: page.modified ?? null,
  };
};

const contentFromPages = (
  pages: Pages,
  { archivePath, categorySlugMap, defaultCategory, staticPages }: ContentOptions,
) => {
  const articles = articlePaths(pages);
  const reserved = new Set([archivePath, "tag", ...staticPages]);
  const listedIn = categoryListings(pages, articles, reserved);
  const usesSecondary = listedIn.values().some((owners) => owners.size > 1);
  const isUncategorised = pages.get(`/${defaultCategory}/`)?.title === humanize(defaultCategory);

  const categoriesOf = (path: string, primary: string): Array<string> => {
    if (primary === defaultCategory && isUncategorised) {
      return [];
    }

    const secondary = [...(listedIn.get(path) ?? [])].filter((owner) => owner !== primary);

    const names = [primary, ...secondary].map((slug) =>
      categoryNameOf(slug, pages, categorySlugMap),
    );

    return usesSecondary ? names : [...names, SENTINEL_CATEGORY];
  };

  const data = pages.entries().flatMap(([path, page]) => {
    const [primary = "", slug = ""] = segments(path);

    return articles.has(path)
      ? [
          {
            body: "Saved copy for routing snapshots. The article body is not part of it.",
            frontmatter: frontmatter(page, categoriesOf(path, primary)),
            images: [],
            slug,
          },
        ]
      : [];
  });

  return { data: [...data] };
};

export { contentFromPages };
