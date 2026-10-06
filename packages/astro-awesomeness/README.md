# astro-awesomeness

Astro 6/7 blog building blocks: a static document layout, content schemas, a site
content index, and Tailwind v4 styles. Add the optional React theme toggle when
your site supports switching schemes. The [demo](https://github.com/pedroapfilho/astro-theme-awesomeness/tree/main/apps/demo) shows a complete
blog with its own header, cards and list/post layouts.

## Install and configure

In an Astro project using Node 24 or newer:

```sh
pnpm add astro-awesomeness tailwindcss @tailwindcss/vite
```

Set your production URL, locale and trailing-slash policy in `astro.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const config = defineConfig({
  i18n: { defaultLocale: "en-US", locales: ["en-US"] },
  site: "https://example.com",
  trailingSlash: "always",
  vite: {
    optimizeDeps: { exclude: ["astro-awesomeness"] },
    plugins: [tailwindcss()],
  },
});

export default config;
```

Create `src/styles/global.css` and import it from your pages or a local layout:

```css
@import "tailwindcss";
@import "astro-awesomeness/styles.css";

@theme {
  --color-primary: oklch(0.5 0.16 250);
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

Load any custom font yourself. The package stylesheet supplies tokens, prose
styles, source discovery for its components, and the class-based dark variant.
There is no Tailwind preset or `@plugin` directive to add.

React and React DOM are optional peers. Install them and Astro's React integration
only if you import `astro-awesomeness/components`:

```sh
pnpm add react@^19 react-dom@^19 @astrojs/react
```

Then add `react()` from `@astrojs/react` to your Astro `integrations`. Markdown
works with Astro itself; add `@astrojs/mdx` and `mdx()` if you also want MDX.

## Define posts

Use `postSchema` in `src/content.config.ts`:

```ts
import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { postSchema } from "astro-awesomeness/content";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: postSchema,
});

const collections = { posts };

export { collections };
```

A local post such as `src/content/posts/first-post.md` can use the same fields as
a CMS loader:

```md
---
title: First post
description: A small beginning.
pubDate: 2026-10-01
categories:
  - Notes
tags:
  - Astro
author:
  name: Alex
  url: https://example.com/about/
heroImageUrl: https://example.com/images/first-post.jpg
heroImageWidth: 1200
heroImageHeight: 800
coverAlt: A desk beside a window
---

The post body goes here.
```

`title` and `pubDate` are required. Description, categories, tags and draft default
to `""`, `[]`, `[]` and `false`. Optional fields include `author`, `updatedDate`,
`status`, `slug` and `seo.canonical_url`. The `authorSchema` and the inferred `Post`
and `Author` types are also exported from `astro-awesomeness/content`.

The schema transforms `heroImageUrl`, `heroImageWidth`, `heroImageHeight` and
`coverAlt` into `post.data.heroImage`, with `{ src, width, height, alt }`. It emits
an image only when all three URL/dimension fields are supplied; alt text defaults
to the post title. The loader fields disappear from the parsed result. `cover`
and `series` are no longer schema fields. Render the normalized image in your
local article layout; BaseLayout uses it for metadata but does not render it.

## Bind one content index

Create `src/lib/content.ts`:

```ts
import { getCollection } from "astro:content";
import { createContentIndex } from "astro-awesomeness/lib";

const content = createContentIndex({
  categorySlugMap: { Notes: "notes" },
  defaultCategory: "notes",
  posts: await getCollection("posts"),
});

export { content };
```

Import this binding from all routes and local layouts. It excludes `draft: true`
and `status: "DRAFT"`, then orders posts newest first with entry ID as the tie
breaker. Future publication dates are not filtered. Your collection entries keep
their full inferred types throughout the index.

| Member                                                     | Use                                                                                                                               |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `content.posts`                                            | Published, sorted collection entries for lists and static paths.                                                                  |
| `content.postParams(post)`                                 | `{ category, slug }` for `/[category]/[slug]/`.                                                                                   |
| `content.postUrl(post)`                                    | Trailing-slash URL for every article link.                                                                                        |
| `content.postCategory(post)`                               | `{ name, slug, href }` for an article's category link.                                                                            |
| `content.categories()`                                     | Category buckets with `{ name, slug, href, posts }`, grouped by each post's route category.                                       |
| `content.categories({ includeSecondaryCategories: true })` | Also include posts in each of their named categories.                                                                             |
| `content.tags()`                                           | Tag buckets with `{ name, slug, href, posts }`; tags sharing a normalized slug are merged, and each post appears once per bucket. |
| `content.relatedPosts(post, 3)`                            | Up to three other published posts ranked by shared normalized tags, then published order.                                         |
| `content.feedItems()`                                      | RSS items with `{ title, description, pubDate, link }`, using the same post URLs and order.                                       |

A parseable absolute `seo.canonical_url` with at least two path segments supplies
the final two segments as category and slug. Otherwise the first category uses
`categorySlugMap` or a generated slug, an absent/empty first category uses
`defaultCategory`, and the post's collection `id` supplies the article slug. The
`slug` data field is not a route override. Returned post URLs are always local
`/category/slug/` paths, regardless of the CMS URL's host.

Tag URLs are `/tag/{slug}/`; use the bucket's `href` and `slug` for links and route
params. Category and tag display names are already normalized by the index.

## Compose pages and articles

Import Astro components without the `.astro` suffix. BaseLayout has two mutually
exclusive metadata modes:

| Mode    | Props                                                                                     |
| ------- | ----------------------------------------------------------------------------------------- |
| Page    | Required `siteTitle`, `title`, `description`; optional `image` and `noindex`.             |
| Article | Required `siteTitle` and `post`; optional `image` as a fallback for a missing hero image. |

Both modes also accept `colorScheme` and `rssHref`. The `head`, `header`, default
and `footer` slots let your site supply its own chrome. Put `id="main-content"` on
your main element so the built-in skip link has a target.

For homepages that previously passed a precomposed `Site · Tagline` title without
`siteTitle`, split the site name from the page title:

```astro
---
import BaseLayout from "astro-awesomeness/layouts/base-layout";

const SITE = "Base Arquitetura";
---

<BaseLayout siteTitle={SITE} title="Arquitetura exuberante" description="Ideias para seus espaços.">
  <main id="main-content"><h1>Arquitetura exuberante</h1></main>
</BaseLayout>
```

This renders `<title>Arquitetura exuberante · Base Arquitetura</title>` and the
bare `og:title` value `Arquitetura exuberante`. Passing `title={SITE}` instead
makes `title === siteTitle`, so both render the bare site name `Base Arquitetura`.

For example, `src/pages/posts/index.astro`:

```astro
---
import BaseLayout from "astro-awesomeness/layouts/base-layout";
import { content } from "../../lib/content";
import "../../styles/global.css";
---

<BaseLayout siteTitle="Example" title="Posts" description="All posts." rssHref="/rss.xml">
  <header slot="header"><a href="/">Example</a></header>
  <main id="main-content">
    <h1>Posts</h1>
    <ul>
      {content.posts.map((post) => (
        <li><a href={content.postUrl(post)}>{post.data.title}</a></li>
      ))}
    </ul>
  </main>
</BaseLayout>
```

An article route at `src/pages/[category]/[slug].astro`:

```astro
---
import type { GetStaticPaths, InferGetStaticPropsType } from "astro";
import { render } from "astro:content";
import BaseLayout from "astro-awesomeness/layouts/base-layout";
import Prose from "astro-awesomeness/astro/prose";
import TagList from "astro-awesomeness/astro/tag-list";
import { content } from "../../lib/content";
import "../../styles/global.css";

export const getStaticPaths = (() =>
  content.posts.map((post) => ({
    params: content.postParams(post),
    props: { post },
  }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { post }: Props = Astro.props;
const { Content } = await render(post);
const category = content.postCategory(post);
---

<BaseLayout siteTitle="Example" post={post} rssHref="/rss.xml">
  <main id="main-content">
    <article>
      <a href={category.href}>{category.name}</a>
      <h1>{post.data.title}</h1>
      <Prose><Content /></Prose>
      <TagList tags={post.data.tags} />
    </article>
    <ul>
      {content.relatedPosts(post, 3).map((related) => (
        <li><a href={content.postUrl(related)}>{related.data.title}</a></li>
      ))}
    </ul>
  </main>
</BaseLayout>
```

Article metadata comes from `post.data`: title, description, author, publication
and update dates, and hero image. It includes `BlogPosting` JSON-LD. Missing
authors fall back to the site organization in JSON-LD. The shared `image` prop is
also the publisher logo there, so supply an absolute URL appropriate for your
site. Pages emit website metadata; `noindex` emits `noindex,follow` and suppresses
the canonical link.

Canonical links, `og:url` and JSON-LD `mainEntityOfPage.@id` use the current route
pathname on `Astro.site`, excluding query strings and fragments. Configure `site`
for your production origin. `seo.canonical_url` selects content route segments;
do not pass it as a `canonical` prop to BaseLayout or Seo. Seo accepts the same
page/article metadata modes when you own the entire document shell.

## Archives and pagination

For `src/pages/[category]/[...page].astro`, pass Astro's `Page` object directly to
Pagination:

```astro
---
import type { GetStaticPaths, InferGetStaticPropsType } from "astro";
import BaseLayout from "astro-awesomeness/layouts/base-layout";
import Pagination from "astro-awesomeness/astro/pagination";
import { content } from "../../lib/content";
import "../../styles/global.css";

export const getStaticPaths = (({ paginate }) =>
  content.categories().flatMap((category) =>
    paginate(category.posts, {
      pageSize: 10,
      params: { category: category.slug },
      props: { category },
    }),
  )) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { category, page }: Props = Astro.props;
---

<BaseLayout siteTitle="Example" title={category.name} description={`Posts in ${category.name}.`}>
  <main id="main-content">
    <h1>{category.name}</h1>
    <ul>
      {page.data.map((post) => (
        <li><a href={content.postUrl(post)}>{post.data.title}</a></li>
      ))}
    </ul>
    <Pagination page={page} />
  </main>
</BaseLayout>
```

Pagination uses `page.url.prev` and `page.url.next`, and renders nothing for a
single page. Use a rest parameter (`[...page]`) to put the first page at the
category root.

When migrating a consumer-owned `list-layout.astro` wrapper, accept the full
Astro `Page`, including `url`, and guard pagination with `page &&`:

```astro
---
import type { Page } from "astro";
import type { CollectionEntry } from "astro:content";
import Pagination from "astro-awesomeness/astro/pagination";

type Props = {
  page?: Page<CollectionEntry<"posts">>;
};

const { page }: Props = Astro.props;
---

<slot />
{page && <Pagination page={page} />}
```

Remove `urlForPage` from wrapper props, destructuring, render guards and route
call sites throughout the call chain. Delete the obsolete `pageUrl` helper;
keep `PAGE_SIZE` if it is still used by `paginate()`.

Build `src/pages/tag/[tag].astro` static paths with
`content.tags().map((tag) => ({ params: { tag: tag.slug }, props: { tag } }))`, then
render `tag.posts` using `content.postUrl`. A separate tag collection is unnecessary.

`content.tags()` emits one canonical normalized slug per tag. During migration,
delete consumer alias routes, including WordPress-style `-2` slugs, their alias
generators and redundant helper sorting. The index already supplies sorted posts
for each canonical tag route.

## RSS

Install `@astrojs/rss` and create `src/pages/rss.xml.ts`:

```ts
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { content } from "../lib/content";

const GET: APIRoute = (context) => {
  if (!context.site) {
    throw new Error("Configure site in astro.config.ts before generating RSS.");
  }
  return rss({
    description: "All posts from Example.",
    items: content.feedItems(),
    site: context.site,
    title: "Example",
  });
};

export { GET };
```

CMS consumers using `@easeia/astro-content` can remove their duplicate `xml.ts`
invalid-character stripping: the loader already strips invalid XML characters.
`feedItems()` projects the indexed fields; it is not an XML sanitizer for other
loaders.

## Locale and color scheme

Set the site's language through Astro's `i18n` configuration. Static components
read `Astro.currentLocale`, falling back to `en-US` when it is absent. Document
language and Intl date formatting keep the original locale tag. Open Graph uses
only the language and region from `new Intl.Locale(tag).maximize()` as
`language_REGION`; likely subtags fill a missing region. For example, `pt` and
`pt-Latn-BR` become `pt_BR`, `zh-Hant-TW` becomes `zh_TW`, and
`en-US-u-ca-gregory` becomes `en_US`.
Built-in skip-link, pagination and reading-time labels support Portuguese for
`pt` locales and English otherwise. Consumers own page copy and route localization;
content-index URLs do not add locale prefixes.

`FormattedDate` has no `locale` prop, and `ReadingTime` has no `label` prop.
BaseLayout and Seo have no `lang` or `locale` props.

| `colorScheme`      | Behavior                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `"auto"` (default) | An inline initialization script applies the stored `theme` preference, then falls back to the system preference. |
| `"light"`          | Renders light mode without a theme initialization script.                                                        |
| `"dark"`           | Renders the `.dark` class without a theme initialization script.                                                 |

Fixed schemes also set the corresponding `color-scheme` metadata. For a light-only
site use `<BaseLayout colorScheme="light" ...>` and omit ThemeToggle; no script is
needed to undo a stored dark preference. For automatic mode, add the island in
your own header:

```astro
---
import { ThemeToggle } from "astro-awesomeness/components";
---

<ThemeToggle ariaLabel="Toggle theme" client:idle />
```

Supply a translated `ariaLabel`, such as `"Alternar tema"`, on a Portuguese site.
The React island does not read Astro's locale. The button stays disabled until
hydration, then follows the system preference until the visitor chooses a scheme.

## Remaining building blocks

| Import                                   | Props and purpose                                                     |
| ---------------------------------------- | --------------------------------------------------------------------- |
| `astro-awesomeness/astro/author-byline`  | `author`, optional `class`; compact author name, photo and link.      |
| `astro-awesomeness/astro/author-card`    | `author`, optional `class`; author profile with optional biography.   |
| `astro-awesomeness/astro/footer`         | `siteTitle`, optional `class`; copyright and a `links` slot.          |
| `astro-awesomeness/astro/formatted-date` | `date: Date`, optional `class`; localized `<time>`.                   |
| `astro-awesomeness/astro/pagination`     | `page`, optional `class`; Astro pagination links.                     |
| `astro-awesomeness/astro/prose`          | Optional `class` and a default slot; styled article content.          |
| `astro-awesomeness/astro/reading-time`   | `text`, optional `class`; reading minutes with a localized label.     |
| `astro-awesomeness/astro/seo`            | The page/article metadata props described above.                      |
| `astro-awesomeness/astro/tag-list`       | `tags: string[]`, optional `class`; deduplicated links under `/tag/`. |
| `astro-awesomeness/components`           | `ThemeToggle`, `Button` and `buttonVariants`; requires React.         |
| `astro-awesomeness/lib`                  | `cn`, `createContentIndex` and its types.                             |
| `astro-awesomeness/content`              | `postSchema`, `authorSchema`, `Post` and `Author`.                    |

The lib types are `CategoryOptions`, `ContentBucket`, `ContentIndex`,
`ContentIndexOptions`, `ContentPost`, `FeedItem`, `PostCategory` and `PostParams`.
There is no root package entry. The Astro components ship as source for Astro to
compile; consumers own headers, cards, list/post layouts, tables of contents and
code-block presentation.
