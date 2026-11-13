# astro-awesomeness

An Astro 6/7 blog theme shipped as an integration. It injects the article,
category, tag, archive and RSS routes, binds one content index for the site, and
supplies a static document layout, content schemas and Tailwind v4 styles. Your
site keeps its own layouts, tokens and pages. The [demo](https://github.com/pedroapfilho/astro-theme-awesomeness/tree/main/apps/demo) is a complete
blog.

## Install and configure

In an Astro project using Node 24 or newer:

```sh
pnpm add astro-awesomeness tailwindcss @tailwindcss/vite
```

Register the integration in `astro.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";
import awesomeness from "astro-awesomeness";
import { defineConfig } from "astro/config";

const config = defineConfig({
  i18n: { defaultLocale: "en-US", locales: ["en-US"] },
  integrations: [
    awesomeness({
      components: {
        ListLayout: "./src/components/list-layout.astro",
        PostLayout: "./src/components/post-layout.astro",
      },
      defaultCategory: "notes",
      description: "All posts from Example.",
      strings: {
        archive: { description: "Every post, newest first.", title: "All posts" },
        category: { description: "Posts in {name}." },
        tag: { description: 'Posts tagged "{name}".' },
      },
      title: "Example",
    }),
  ],
  site: "https://example.com",
  vite: { plugins: [tailwindcss()] },
});

export default config;
```

| Option                       | Default                          | Purpose                                                                                              |
| ---------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `title`, `description`       | required                         | Site identity for the document title, Open Graph, the footer and the feed.                           |
| `ogImage`, `logo`            | none                             | Default social image and JSON-LD publisher logo. `logo` falls back to `ogImage`.                     |
| `colorScheme`                | `"auto"`                         | `"auto"`, `"light"` or `"dark"`. See [Locale and color scheme](#locale-and-color-scheme).            |
| `components`                 | required                         | Paths to your `PostLayout` and `ListLayout`, and optionally an `ArchiveLayout` for the post archive. |
| `defaultCategory`            | required                         | Category slug for a post with no usable category.                                                    |
| `categorySlugs`              | `./src/data/category-slugs.json` | A JSON object mapping category names to slugs. The file must exist; `{}` is valid.                   |
| `includeSecondaryCategories` | `false`                          | List a post under each of its categories instead of only its route category.                         |
| `archivePath`                | `"posts"`                        | Path segment of the paginated post archive.                                                          |
| `pageSize`                   | `24`                             | Posts per archive and category page.                                                                 |
| `strings`                    | required                         | Title, description and optional eyebrow for the archive, category and tag listings.                  |
| `tagAliases`                 | none                             | Path to a module that adds alias routes to tag archives.                                             |

The integration sets `trailingSlash: "always"` and
`prerenderConflictBehavior: "error"`, and adds `@astrojs/sitemap` unless you
already registered it. A build fails when two routes produce the same URL, such
as a category that slugs to your archive path.

Create `src/styles/global.css` and import it from the layout your pages and your
`ListLayout` and `PostLayout` share. The injected routes load only what those
layouts import, so a stylesheet imported from page files leaves them unstyled:

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
`status` and `seo.canonical_url`. The `authorSchema` and the inferred `Post` and
`Author` types are also exported from `astro-awesomeness/content`.

The schema transforms `heroImageUrl`, `heroImageWidth`, `heroImageHeight` and
`coverAlt` into `post.data.heroImage`, with `{ src, width, height, alt }`. It emits
an image only when all three URL/dimension fields are supplied; alt text defaults
to the post title. The loader fields disappear from the parsed result. Render the
normalized image in your local article layout; BaseLayout uses it for metadata but
does not render it.

## Routes and the content index

| Route                                     | Renders                                                             |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `/[category]/[slug]/`                     | `PostLayout` with `post` and the rendered body in the default slot. |
| `/[category]/` and `/[category]/2/`       | `ListLayout` for one category, `pageSize` posts per page.           |
| `/tag/[tag]/`                             | `ListLayout` with every post of one tag.                            |
| `/{archivePath}/` and `/{archivePath}/2/` | `ArchiveLayout`, or `ListLayout` when you set none.                 |
| `/rss.xml`                                | The feed, from `title`, `description` and `content.feedItems()`.    |

Do not add pages at these paths. Your layouts and pages read the same index the
routes use:

```ts
import { content } from "virtual:astro-awesomeness/content";
import config from "virtual:astro-awesomeness/config";
```

`virtual:astro-awesomeness/components/ListLayout`, `.../PostLayout` and
`.../ArchiveLayout` resolve to the components you configured, and
`virtual:astro-awesomeness/tag-aliases` to your tag-alias function, for a page
that renders one of them itself.

`config` is the resolved integration config. `content` is bound to the `posts`
collection. It excludes `draft: true` and `status: "DRAFT"`, then orders posts
newest first with entry ID as the tie breaker. Future publication dates are not
filtered. Your collection entries keep their full inferred types throughout the
index.

| Member                          | Use                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `content.posts`                 | Published, sorted collection entries for lists and static paths.                                                                     |
| `content.postParams(post)`      | `{ category, slug }` for `/[category]/[slug]/`.                                                                                      |
| `content.postUrl(post)`         | Trailing-slash URL for every article link.                                                                                           |
| `content.postCategory(post)`    | `{ name, slug, href }` for an article's category link.                                                                               |
| `content.categories()`          | Category buckets with `{ name, slug, href, posts }`, following `includeSecondaryCategories`.                                         |
| `content.tags()`                | Tag buckets with `{ name, slug, href, posts, labels }`; tags sharing a normalized slug are merged, and `labels` holds each spelling. |
| `content.relatedPosts(post, 3)` | Up to three other published posts ranked by shared normalized tags, then published order.                                            |
| `content.feedItems()`           | RSS items with `{ title, description, pubDate, link }`, using the same post URLs and order.                                          |

A parseable absolute `seo.canonical_url` with at least two path segments supplies
the final two segments as category and slug. Otherwise the first category uses
its own entry in the category slug map or the slug of its name as the CMS sent
it, so `Luz &amp; Sombra` routes to `/luz-amp-sombra/`. A missing first category or
one whose generated slug is empty (such as whitespace or an emoji-only label) uses
`defaultCategory`, and the post's collection `id` supplies the article slug.
Returned post URLs are always local `/category/slug/` paths, regardless of the CMS
URL's host.

`defaultCategory`, `archivePath` and every category slug map value must be nonempty
URL path segments, without whitespace, `/`, `\`, `?`, `#`, or a `.`/`..` segment.
Invalid configuration fails the build. Map unsupported category labels to explicit
slugs when they need their own archives.

Tag URLs are `/tag/{slug}/`; use the bucket's `href` and `slug` for links and route
params. Category and tag display names are already normalized by the index.
Tags must normalize to a nonempty slug. Whitespace, punctuation-only, emoji-only,
and unsupported non-Latin tags throw an error naming the tag when used by tag
archives, related posts, or `TagList`; give these tags a label containing letters
or digits supported by the slug normalizer.

## Layouts

`PostLayout` and `ListLayout` are your components. Type their props with the
contracts the routes fulfil:

```astro
---
import type { CollectionEntry } from "astro:content";
import type { ListLayoutProps } from "astro-awesomeness";
import BaseLayout from "astro-awesomeness/layouts/base-layout";
import Pagination from "astro-awesomeness/astro/pagination";
import { content } from "virtual:astro-awesomeness/content";
import "../styles/global.css";

type Props = ListLayoutProps<CollectionEntry<"posts">>;

const { description, page, posts, title } = Astro.props;
---

<BaseLayout title={title} description={description}>
  <main id="main-content">
    <h1>{title}</h1>
    <ul>
      {posts.map((post) => (
        <li><a href={content.postUrl(post)}>{post.data.title}</a></li>
      ))}
    </ul>
    {page && <Pagination page={page} />}
  </main>
</BaseLayout>
```

| Contract             | Props                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `ListLayoutProps<P>` | `title`, `description`, optional `eyebrow`, `posts`, and Astro's `page` on paginated listings. |
| `PostLayoutProps<P>` | `post`. The rendered article body arrives in the default slot.                                 |

`strings` fills `title`, `description` and `eyebrow`. Category and tag strings
may use `{name}`, and every string may use `{total}` for the number of posts in
the listing. Category and tag titles default to `{name}`.

BaseLayout has two mutually exclusive metadata modes:

| Mode    | Props                                                   |
| ------- | ------------------------------------------------------- |
| Page    | Required `title` and `description`; optional `noindex`. |
| Article | Required `post`.                                        |

Site title, images, color scheme and the feed link come from the integration
config. The `head`, `header`, default and `footer` slots let your site supply its
own chrome. Put `id="main-content"` on your main element so the built-in skip link
has a target.

The document title joins `title` and the site title with a middle dot, as in
`<title>Posts · Example</title>`, while `og:title` stays the bare `title`. Pass
the site title as `title` on a homepage to render the bare site name in both.

Article metadata comes from `post.data`: title, description, author, publication
and update dates, and hero image. It includes `BlogPosting` JSON-LD. Missing
authors fall back to the site organization in JSON-LD. `ogImage` is the fallback
social image and `logo` the publisher logo; a root-relative path such as
`/og-image.jpg` resolves against `Astro.site`. Pages emit website metadata;
`noindex` emits `noindex,follow` and suppresses the canonical link.

Canonical links, `og:url` and JSON-LD `mainEntityOfPage.@id` use the current route
pathname on `Astro.site`, excluding query strings and fragments. Configure `site`
for your production origin. `seo.canonical_url` selects content route segments;
do not pass it as a `canonical` prop to BaseLayout or Seo. Seo accepts the same
page/article metadata modes when you own the entire document shell.

Pagination uses `page.url.prev` and `page.url.next`, and renders nothing for a
single page.

## Tag aliases

A site that must keep older tag URLs points `tagAliases` at a module whose default
export returns extra route slugs for a tag bucket:

```ts
import type { CollectionEntry } from "astro:content";
import type { TagAliases } from "astro-awesomeness";

const tagAliases: TagAliases<CollectionEntry<"posts">> = ({ labels, slug }) =>
  labels.length > 1 ? [`${slug}-2`] : [];

export default tagAliases;
```

Each alias renders the same listing as the tag. A tag's own slug always wins over
another tag's alias, and the first tag to claim an alias keeps it. Links from
`TagList` and `content.tags()` keep pointing at the tag's own slug.

The feed projects the indexed fields; it does not strip invalid XML characters.

## vercel.json

`astro-awesomeness vercel-json` writes `vercel.json` for a blog migrated from
WordPress. Commit the file: Vercel reads it before the build. `--check` exits
non-zero when the committed file is stale.

The file holds, in order:

1. 28 redirects for WordPress sitemap, feed and admin URLs.
2. Four redirects per renamed category, from `src/data/category-slugs.json`: an
   entry whose name slugs to something other than its mapped slug redirects
   `/natural`, `/natural/`, `/natural/:path*` and `/natural/:path*/` to the mapped
   slug. A natural slug the map still routes to is never redirected.
3. The per-site list in `src/data/redirects.json`.
4. Three security headers on every path.

`src/data/redirects.json` is required and may be `{}`:

```json
{
  "renames": { "marketingdigital": "marketing-digital" },
  "skip": ["Entrevistas com Arquitetos"],
  "redirects": [{ "source": "/a/post-2/", "destination": "/a/post/", "permanent": true }]
}
```

`renames` adds category redirects the map cannot derive, `skip` names map
entries whose natural slug never was a URL, and `redirects` are appended as
written. A rename of a slug the map still routes to fails, since it would redirect
a category the site serves.

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

| `colorScheme`      | Behavior                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `"auto"` (default) | An inline initialization script applies the stored `theme` preference, then falls back to the system preference. |
| `"light"`          | Renders light mode without a theme initialization script.                                                        |
| `"dark"`           | Renders the `.dark` class without a theme initialization script.                                                 |

Fixed schemes also set the corresponding `color-scheme` metadata. For a light-only
site set `colorScheme: "light"` in the integration config and omit ThemeToggle; no script is
needed to undo a stored dark preference. For automatic mode, add the island in
your own header:

```astro
---
import { ThemeToggle } from "astro-awesomeness/components";
---

<ThemeToggle ariaLabel="Dark mode" client:idle />
```

The button is a toggle: `aria-pressed` reports whether dark mode is on, so its
label names dark mode rather than an action. Supply a translated `ariaLabel`, such
as `"Modo escuro"`, on a Portuguese site. The React island does not read Astro's
locale. The button stays disabled until hydration, then follows the system
preference until the visitor chooses a scheme.

In automatic mode BaseLayout also keeps `<meta name="theme-color">` equal to the
computed `body` background, including after the scheme changes, so browser chrome
follows your `--color-background` token. That needs a solid background color, and
under a Content Security Policy its inline script needs `'unsafe-inline'` or a
hash. Fixed-scheme sites run no script; set a literal
`<meta name="theme-color" content="…">` in the `head` slot if you want one.

## Remaining building blocks

| Import                                   | Props and purpose                                                     |
| ---------------------------------------- | --------------------------------------------------------------------- |
| `astro-awesomeness/astro/author-byline`  | `author`, optional `class`; compact author name, photo and link.      |
| `astro-awesomeness/astro/author-card`    | `author`, optional `class`; author profile with optional biography.   |
| `astro-awesomeness/astro/footer`         | Optional `class` for the inner row; copyright and a `links` slot.     |
| `astro-awesomeness/astro/formatted-date` | `date: Date`, optional `class`; localized `<time>`.                   |
| `astro-awesomeness/astro/pagination`     | `page`, optional `class`; Astro pagination links.                     |
| `astro-awesomeness/astro/prose`          | Optional `class` and a default slot; styled article content.          |
| `astro-awesomeness/astro/reading-time`   | `text`, optional `class`; reading minutes with a localized label.     |
| `astro-awesomeness/astro/seo`            | The page/article metadata props described above.                      |
| `astro-awesomeness/astro/tag-list`       | `tags: string[]`, optional `class`; deduplicated links under `/tag/`. |
| `astro-awesomeness/components`           | `ThemeToggle`, `Button` and `buttonVariants`; requires React.         |
| `astro-awesomeness/lib`                  | `cn`, `createContentIndex` and its types.                             |
| `astro-awesomeness/content`              | `postSchema`, `authorSchema`, `Post` and `Author`.                    |

The lib types are `ContentBucket`, `ContentIndex`, `ContentIndexOptions`,
`ContentPost`, `FeedItem`, `PostCategory`, `PostParams` and `TagBucket`. The root
entry exports the integration and the `AwesomenessUserConfig`, `ListLayoutProps`,
`PostLayoutProps` and `TagAliases` types. The Astro components and routes ship as
source for Astro to compile; consumers own headers, cards, list/post layouts,
tables of contents and code-block presentation.
