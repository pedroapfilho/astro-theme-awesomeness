# astro-awesomeness

## 3.0.0

### Major Changes

- 9d92535: Replace the separate content helpers and shared blog shell with one site content
  index, static Astro building blocks, and page/article metadata modes. This is a
  breaking release: removed exports and components have no compatibility shims.

  Bind `createContentIndex` once in your site's `src/lib/content.ts` and import that
  binding from every route, layout and RSS endpoint:

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

  The index filters both `draft: true` and `status: "DRAFT"`, sorts newest first with
  entry ID as a deterministic tie-breaker, and owns article URLs, route params,
  category/tag archives, related posts and feed items. Category and tag buckets
  include ready-to-use `name`, `slug`, `href` and `posts` fields. Related-post ranking
  counts distinct normalized tags and breaks ties using published order.

  ## Imports, helpers and types

  | Old API or consumer pattern                                                                           | New API or required migration                                                                                                                                                                                                                                                                                                                            |
  | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Root `astro-awesomeness` entry, including the `content` and `lib` namespaces and root type re-exports | The root entry is deleted. Import schemas and `Author`/`Post` from `astro-awesomeness/content`, utilities from `astro-awesomeness/lib`, and React components from `astro-awesomeness/components`.                                                                                                                                                        |
  | `notDraft`, `byPubDateDesc`, or consumer filter/sort pipelines                                        | Use `content.posts`. These helpers are no longer exported from `astro-awesomeness/content`.                                                                                                                                                                                                                                                              |
  | `tagSchema`, `Tag`, and a tag collection used to generate archives                                    | Removed from `astro-awesomeness/content`; derive archives from `content.tags()`. Keep editorial tag metadata in an app-owned collection only if your site needs it.                                                                                                                                                                                      |
  | `createPostUrl(categorySlugMap, defaultCategory)`                                                     | Use `content.postUrl(post)` and `content.postParams(post)` from the single `createContentIndex({ posts, categorySlugMap, defaultCategory })` binding.                                                                                                                                                                                                    |
  | `createCategoryIndex(categorySlugMap, defaultCategory, posts)` and `.groupByCategory()`               | Use `content.categories()`, or `content.categories({ includeSecondaryCategories: true })`.                                                                                                                                                                                                                                                               |
  | `.categoryName(slug)` and `.postCategory(post)` on the old category index                             | Use each category bucket's `name` or `content.postCategory(post)`, which also returns `href`.                                                                                                                                                                                                                                                            |
  | `getRelatedPosts(current, all, count)`                                                                | Use `content.relatedPosts(current, count)`; the index supplies the published candidate set.                                                                                                                                                                                                                                                              |
  | `categoryLabel`                                                                                       | Use `content.postCategory(post).name` or a category bucket's `name`. The formatting helper is no longer public.                                                                                                                                                                                                                                          |
  | `DEFAULT_TAG_BASE`, `tagUrl`, `tagLabel`, `uniqueTags`, and consumer tag-normalization loops          | Use `content.tags()` for archive `slug`, `href`, `name` and `posts`, and `TagList` for a post's tags. These helper exports are removed; tag routes use `/tag/{slug}/`. `content.tags()` emits one canonical normalized slug per tag; delete consumer alias routes (including WordPress-style `-2` slugs), their generators and redundant helper sorting. |
  | `slugify`                                                                                             | Removed from the public lib entry. Use index-provided route params, category slugs and tag slugs; unrelated slug generation belongs to the consumer.                                                                                                                                                                                                     |
  | `formatDate`                                                                                          | Removed from the public lib entry. Use `FormattedDate` with Astro i18n, or `Intl.DateTimeFormat` for app-owned formatting.                                                                                                                                                                                                                               |
  | `readingTime`                                                                                         | Removed from the public lib entry. Use `ReadingTime` for the shared display, or an app-owned calculation if a numeric result is required.                                                                                                                                                                                                                |
  | `requireEnv`                                                                                          | Removed. Validate application configuration in the consumer, for example with Astro's environment schema.                                                                                                                                                                                                                                                |
  | `CategoryBucket<P>`                                                                                   | Replace with `ContentBucket<P>`, which includes `href`.                                                                                                                                                                                                                                                                                                  |
  | `CategoryPostLike`, `PostLike`                                                                        | Replace with `ContentPost`, whose data requires `categories`, `description`, `pubDate`, `tags` and `title`; collection entries retain their inferred extra fields.                                                                                                                                                                                       |
  | `PostUrlBuilder`                                                                                      | Removed. Use the inferred content binding or `ContentIndex<P>`.                                                                                                                                                                                                                                                                                          |
  | `PostCategory`, `PostParams`                                                                          | Still exported from `astro-awesomeness/lib`; `PostCategory` now also includes `href`.                                                                                                                                                                                                                                                                    |
  | `cn`                                                                                                  | Still exported from `astro-awesomeness/lib`.                                                                                                                                                                                                                                                                                                             |

  The remaining lib exports are `cn`, `createContentIndex`, and the types
  `CategoryOptions`, `ContentBucket`, `ContentIndex`, `ContentIndexOptions`,
  `ContentPost`, `FeedItem`, `PostCategory` and `PostParams`. The content entry exports
  `postSchema`, `authorSchema`, `Post` and `Author`.

  ## Layouts, metadata and components

  | Old API or consumer pattern                                                                                  | New API or required migration                                                                                                                                                                                                                                                                                                                                                                                                                             |
  | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `BaseLayout` or `Seo` with optional `siteTitle` / separate `siteName`                                        | `siteTitle` is required in both modes and supplies the site identity. Remove `siteName`.                                                                                                                                                                                                                                                                                                                                                                  |
  | Homepage `title="Site · Tagline"` without `siteTitle`                                                        | Split the site name from the page title: with `const SITE = "Base Arquitetura"`, pass `siteTitle={SITE}` and `title="Arquitetura exuberante"`. This renders `<title>Arquitetura exuberante · Base Arquitetura</title>` with the bare `og:title` value `Arquitetura exuberante`. When `title === siteTitle`, both render the bare site name.                                                                                                               |
  | Page metadata passed as independent optional article fields                                                  | Page mode is `{ siteTitle, title, description, image?, noindex? }`; do not pass `post`.                                                                                                                                                                                                                                                                                                                                                                   |
  | `type="article"`, `title`, `description`, `authorName`, `publishedTime`, `modifiedTime`                      | Article mode is `{ siteTitle, post, image? }`. Pass the collection entry; title, description, author, dates and hero image come from `post.data`. Remove the individual props. Article mode emits `BlogPosting` JSON-LD and does not accept `noindex`.                                                                                                                                                                                                    |
  | `type="website"`                                                                                             | Remove `type`; page mode selects website metadata automatically.                                                                                                                                                                                                                                                                                                                                                                                          |
  | `canonical`, including `canonical={post.data.seo?.canonical_url}`                                            | Remove the prop. Canonical, `og:url` and JSON-LD `mainEntityOfPage.@id` derive from the current route pathname on `Astro.site`, without query strings or fragments. Configure the production `site` in Astro.                                                                                                                                                                                                                                             |
  | Treating `seo.canonical_url` as an SEO override                                                              | Keep it as content input only: the index uses the last two path segments of a parseable absolute URL for `{ category, slug }`. Its host is not an override for metadata URLs. Invalid or insufficient paths fall back to category mapping and entry ID.                                                                                                                                                                                                   |
  | `lang` on BaseLayout, `locale` on BaseLayout/Seo, or manually maintained `og:locale`                         | Configure Astro `i18n`; components read `Astro.currentLocale`. For example, `i18n: { defaultLocale: "en-US", locales: ["en-US"] }`. Document language and Intl date formatting keep the original tag. Open Graph uses the language and region from `new Intl.Locale(tag).maximize()` as `language_REGION`, filling a missing region with likely subtags (`pt` → `pt_BR`, `pt-Latn-BR` → `pt_BR`, `zh-Hant-TW` → `zh_TW`, `en-US-u-ca-gregory` → `en_US`). |
  | Separate article JSON-LD in a consumer head slot                                                             | BaseLayout/Seo article mode now generates it from the post, including author or site-organization fallback. Remove duplicate `BlogPosting` output. The optional `image` prop is also the publisher logo; a post's hero image takes priority for article social metadata.                                                                                                                                                                                  |
  | `Pagination` props `currentPage`, `lastPage`, `urlForPage`, `prevLabel`, `nextLabel`, `pageLabel`, `ofLabel` | Pass `<Pagination page={page} />` with Astro's `Page` from `paginate()`. It uses `page.url.prev/next`, reads labels from Astro i18n and omits single-page navigation. Optional `class` remains.                                                                                                                                                                                                                                                           |
  | `FormattedDate locale={...}`                                                                                 | Remove `locale`; keep `date` and optional `class`, and configure Astro i18n.                                                                                                                                                                                                                                                                                                                                                                              |
  | `ReadingTime label={...}`                                                                                    | Remove `label`; keep `text` and optional `class`. English and Portuguese labels follow Astro i18n.                                                                                                                                                                                                                                                                                                                                                        |
  | `TagList base={...}`                                                                                         | Remove `base`; shared tag links and content-index buckets both use `/tag/{slug}/`. Optional `class` remains.                                                                                                                                                                                                                                                                                                                                              |
  | Theme toggle supplied by the shared header                                                                   | Render `ThemeToggle` in your own header with `client:idle`. Supply localized `ariaLabel`, for example `ariaLabel="Alternar tema"`; the React island does not read Astro i18n.                                                                                                                                                                                                                                                                             |
  | `astro-awesomeness/layouts/list-layout` and `astro-awesomeness/layouts/post-layout`                          | Deleted. Compose local list/post layouts with BaseLayout and the remaining static building blocks. Pass your own header/footer slots and provide `<main id="main-content">`.                                                                                                                                                                                                                                                                              |
  | `astro-awesomeness/astro/header`                                                                             | Deleted. Own navigation and optional ThemeToggle in your consumer header. Only the `components` entry requires React and React DOM; every shared Astro component and BaseLayout remains static.                                                                                                                                                                                                                                                           |
  | `astro-awesomeness/astro/post-card`                                                                          | Deleted. Render local cards using `content.postUrl(post)`, `content.postCategory(post)` and normalized post data.                                                                                                                                                                                                                                                                                                                                         |
  | `astro-awesomeness/astro/table-of-contents`                                                                  | Deleted. Own any table of contents in the consumer using headings returned by Astro's `render(post)`.                                                                                                                                                                                                                                                                                                                                                     |
  | `astro-awesomeness/astro/code-block`                                                                         | Deleted. Use Astro's Markdown syntax highlighting or an app-owned component.                                                                                                                                                                                                                                                                                                                                                                              |

  BaseLayout retains the `head`, `header`, default and `footer` slots and optional
  `rssHref`. The remaining static components are `author-byline`, `author-card`,
  `footer`, `formatted-date`, `pagination`, `prose`, `reading-time`, `seo` and
  `tag-list`. Shared localized labels support Portuguese (`pt` locales) and English
  (other locales); page copy and locale-prefixed routes remain consumer concerns.

  For consumer-owned `list-layout.astro` wrappers, accept the full Astro `Page`
  instead of a `Pick` that omits `url`, and render pagination under `page &&`:

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

  ## Content, styles and feeds

  | Old API or consumer pattern                                                                                              | New API or required migration                                                                                                                                                                                                                                                                                                                                                       |
  | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `cover`, `series`, and direct reads of `heroImageUrl`, `heroImageWidth`, `heroImageHeight`, `coverAlt` from parsed posts | `cover` and `series` are removed from `postSchema`. The loader's URL/dimension fields and `coverAlt` are transformed into optional `post.data.heroImage: { src, width, height, alt }` and removed from the output. All three URL/dimension fields must exist; alt defaults to the title. Migrate cover sources to these loader inputs; model any continuing series feature locally. |
  | Importing `astro-awesomeness/tailwind` or adding `@plugin "astro-awesomeness/tailwind"`                                  | The Tailwind preset is deleted. Drop its imports and `@plugin` directive; import `astro-awesomeness/styles.css` after `@import "tailwindcss"`. The stylesheet now supplies the dark variant, source discovery and theme tokens. Keep consumer `@theme` brand overrides.                                                                                                             |
  | `post-grid` and `post-card` stylesheet utilities and selectors                                                           | Removed with the shared card/list presentation, including first-card layout and below-the-fold containment. Implement grid, card spacing and any measured rendering optimizations in your own components and stylesheet.                                                                                                                                                            |
  | `grid-cols-list-heading`                                                                                                 | Removed. Use standard grid utilities such as `grid-cols-1 md:grid-cols-2`, or define an app-owned named utility when your layout needs unequal columns.                                                                                                                                                                                                                             |
  | `tracking-eyebrow`, `tracking-list-title`, `leading-list-title` and their `--tracking-*` / `--leading-*` tokens          | Removed. Choose standard scale utilities such as `tracking-wide`, `tracking-tight` and `leading-tight`, or declare your own named values with `@theme`.                                                                                                                                                                                                                             |
  | `--measure-list-title`, `--measure-list-intro`                                                                           | Removed. Use standard `max-w-*` utilities or app-owned named width tokens in your local heading and intro styles.                                                                                                                                                                                                                                                                   |
  | `icon-inline-start`, `icon-inline-end` from the deleted preset                                                           | Replace with logical margin utilities: `me-1.5` for the former start icon and `ms-1.5` for the former end icon, or use a flex container with `gap-1.5`.                                                                                                                                                                                                                             |
  | A light-only counter-script that removes `.dark` after BaseLayout initializes the stored theme                           | Remove the counter-script and pass `colorScheme="light"`. Fixed light/dark schemes render their initial class and scheme metadata without a theme initialization script; omit ThemeToggle for fixed schemes. Default `colorScheme="auto"` uses stored/system preferences.                                                                                                           |
  | Manual RSS mapping, sorting, draft filtering and URL construction                                                        | Pass `items: content.feedItems()` to `@astrojs/rss` with the configured site URL. Feed items share the index's published ordering and article links.                                                                                                                                                                                                                                |
  | Consumer `xml.ts` helpers stripping invalid XML characters from `@easeia/astro-content` output                           | Delete the redundant stripping: that loader already strips invalid XML characters. `feedItems()` only projects indexed fields; other loaders must normalize their own input.                                                                                                                                                                                                        |
  | Independent article/category/tag route construction                                                                      | Use `content.postParams`, `content.postUrl`, `content.categories()` and `content.tags()` throughout. Configure `trailingSlash: "always"` to match the index's URLs and use a rest pagination route such as `/[category]/[...page]` for category-root first pages.                                                                                                                   |

  See the package README for complete installation, collection, layout, archive
  and RSS examples. The demo binds one index in `src/lib/content.ts`, keeps
  presentation local, and exercises `/posts/`, `/[category]/[slug]/`,
  `/[category]/[...page]`, `/tag/[tag]/`, RSS and 404.

## 2.0.1

### Patch Changes

- 336ffa5: Bump runtime dependencies to their current releases: cn 0.4.0, lucide-react 1.48.0 and zod 4.6.5.

## 2.0.0

### Major Changes

- 4529e09: Align the React Button with shadcn Base Nova and move theme behavior into compositions. Keep Button, buttonVariants, and ThemeToggle exports unchanged. Button sizing, destructive and secondary treatments, and data attributes now follow the upstream contract; consumers relying on the previous appearance should use product compositions. Static Astro consumers retain their layouts, optional React peer, and brand overrides.

### Minor Changes

- 85ac1cd: Move category resolution into the theme and fix the chrome strings the blog audit flagged.

  - `createCategoryIndex(categorySlugMap, defaultCategory, posts)` is exported from `astro-awesomeness/lib`. It groups posts by their canonical category slug (`groupByCategory`, with the `includeSecondaryCategories` option), resolves a slug's display name (`categoryName`) and gives a post's eyebrow the same resolved name as its category page (`postCategory`). When a slug is shared by a mapped category and a native one (`Architecture` mapped to `arquitetura` next to `Arquitetura`), the native name wins; otherwise the first name registered for the slug is used, and a slug no post names (the default category) is humanized (`sem-categoria` reads "Sem categoria"). Blogs bind it once with their `category-slugs.json` and post collection instead of carrying their own copy.
  - `TagList` collapses tags that share a slug onto the first occurrence and strips a leading `#` from the chip text. Hrefs are unchanged. `uniqueTags` and `tagLabel` are exported from `astro-awesomeness/lib` for blogs that render chips inline.
  - `Seo` and `BaseLayout` accept `siteTitle` for the document title: `<title>` becomes `Title · Site` whenever the page title differs from the site title, while `og:title` stays the bare page title. Pass `siteTitle` from every page instead of concatenating it into `title`.
  - `Seo` and `BaseLayout` accept `noindex`, which emits `<meta name="robots" content="noindex,follow">` in place of the canonical link. Use it on the 404 page.
  - The skip link reads "Pular para o conteúdo" when `lang` starts with `pt`.

### Patch Changes

- 766e6ef: Expose the Tailwind plugin through the default export condition so design-system tooling can resolve the same preset as Astro and Vite.

  Move post-card and list-layout styling into the shared stylesheet and expose named layout and typography tokens so Astro templates satisfy the strict design-system rules.

## 1.2.2

### Patch Changes

- b910623: Build table-of-contents headings in one pass while preserving heading order, depth bounds, and custom slugs. Include Astro frontmatter in the lint checks.

## 1.2.1

### Patch Changes

- 32b7e90: Compose class names in the Astro components with `cn` instead of `class:list`, so consumer overrides resolve Tailwind conflicts.
- bbeb60c: Replace `cnfast` with the new `cn` Tailwind class-merging engine.

## 1.2.0

### Minor Changes

- 49a5816: Author entity support: `postSchema.author` is now a structured object (`{ name, bio?, photoUrl?, url? }`) matching `@easeia/astro-content` 0.5.0 frontmatter, replacing the old plain-string field. New `astro/author-byline.astro` and `astro/author-card.astro` components, and an `authorName` prop on `Seo`/`BaseLayout` that emits `<meta name="author">`.

## 1.1.2

### Patch Changes

- 8f17e8a: Reserve the scrollbar gutter on `html` so locking page scroll (opening a dialog or menu) no longer shifts the layout sideways.

## 1.1.1

### Patch Changes

- d1d6bc9: Bump the two runtime dependencies: `lucide-react` 1.29.0 to 1.31.0 and `cnfast` 0.0.8 to 0.1.0.

  Both are additive. `cnfast` 0.1.0 keeps the same `cn` signature and adds `createCn`,
  `createTailwindMerge`, `getDefaultConfig` and `mergeConfigs` alongside it; the theme
  still re-exports only `cn` from `astro-awesomeness/lib`, and the generated `.d.ts` is
  byte-identical before and after. Consumers need no changes.

## 1.1.0

### Minor Changes

- 8ed7ba3: Export `categoryLabel` from `astro-awesomeness/lib`, next to `createPostUrl`.

  WordPress migrations stored category names HTML-encoded, and the content API hands
  them back the same way, so `post.data.categories` and the keys of a blog's
  `category-slugs.json` both carry raw entities like `Arte &amp; Design`. Every blog
  built on this theme had grown its own decoder for display, and the twelve copies had
  drifted into three incompatible variants (a one-line `&amp;` replace at one end, a
  hardened decoder at the other). This is that decoder, once, with unit tests.

  `categoryLabel(name)` decodes named entities (`&amp;`, `&hellip;`, `&ndash;`, the
  quote and space family) plus decimal and hexadecimal numeric escapes, and leaves
  anything it does not recognise as literal text. Three behaviours are deliberate:

  - `mdash` is absent from the entity table and U+2014 is refused in the numeric
    branch, so an encoded em-dash stays encoded instead of being decoded into a
    character these blogs ban. `&#8212;` and `&#x2014;` pass through unchanged.
  - Out-of-range code points pass through instead of reaching `String.fromCodePoint`,
    which throws past the Unicode range and would fail a whole static build over one
    malformed entity.
  - The named lookup is guarded by `Object.hasOwn`, so `&constructor;` cannot resolve
    up the prototype chain and render `Function.prototype.toString` into a page.

  Decoding is display-only. `createPostUrl` is untouched: it still resolves a slug by
  the raw, still-encoded category name the content API sends. Pass decoded names to
  your templates, never to the slug map, or the URLs of every affected post move.

## 1.0.0

### Major Changes

- 6c691ca: **BREAKING:** `base-layout.astro` no longer renders a header or a footer. It now
  exposes two named slots, `header` and `footer`, and renders whatever you put in
  them. Passing `siteTitle` still sets the SEO `og:site_name` fallback and the RSS
  autodiscovery link title, but it no longer conjures the theme's `Header` (with its
  `ThemeToggle` island) and `Footer` into the page.

  The theme's own `list-layout.astro` and `post-layout.astro` fill those slots, so
  if you use those layouts nothing changes: pass `siteTitle` and you still get the
  header and footer exactly as before, in the same DOM position.

  If you import `base-layout` directly and relied on `siteTitle` to render chrome,
  fill the slots yourself:

  ```astro
  <BaseLayout title={title} description={description} siteTitle={SITE}>
    <Header slot="header" siteTitle={SITE} />
    <main id="main-content">…</main>
    <Footer slot="footer" siteTitle={SITE} />
  </BaseLayout>
  ```

  Why this is worth a major: `base-layout` statically imported `header.astro`, which
  renders `<ThemeToggle client:idle />`, which pulls `Button`, `lucide-react` and
  `@base-ui/react`. That chain sat in every consumer's Vite graph whether or not the
  branch was ever taken, which is why blogs that hydrate nothing still had to install
  `react`, `react-dom` and `@astrojs/react`. Importing `base-layout` alone now pulls
  in no React at all.

  **BREAKING:** removed `CommandMenu` (plus `CommandMenuItem` / `CommandMenuProps`),
  the `Command*` primitives and the `Dialog*` primitives from
  `astro-awesomeness/components`, and dropped the `cmdk` dependency. Nothing in the
  theme or the demo rendered them. `Button`, `buttonVariants` and `ThemeToggle` are
  unchanged, and `@base-ui/react` plus `lucide-react` stay (`Button` and
  `ThemeToggle` use them). If you were rendering `CommandMenu`, vendor it into your
  own app: install `cmdk` and copy the component.

  The 12 consumer blogs need no changes for either break. They import
  `astro-awesomeness/layouts/base-layout` and pass only `title`, `description`,
  `lang` and `image`, they render their own local header, and none of them import
  `astro-awesomeness/components`.

  **React is now an optional peer.** `react` and `react-dom` keep their `^19.0.0`
  peer ranges but are marked `optional` in `peerDependenciesMeta`, because whether
  you need React now depends on which entry you import:

  - **Only `astro-awesomeness/layouts/base-layout`, `astro-awesomeness/astro/*`
    (except `header`), `/content`, `/lib`, `/tailwind` or `/styles.css`:** you may
    drop `react`, `react-dom` and `@astrojs/react` entirely, and remove `react()`
    from your `astro.config` integrations. Verified against a scratch consumer with
    none of them installed: `astro build` succeeds and emits zero `<astro-island>`
    markers.
  - **The bundled `layouts/list-layout` or `layouts/post-layout`, or
    `astro/header`, or anything from `astro-awesomeness/components`:** you still
    need React and the `@astrojs/react` renderer. Those render
    `<ThemeToggle client:idle />`. Without the renderer, `astro build` fails with
    `NoMatchingRenderer: Unable to render ThemeToggle` (exit 1) and points you at
    `@astrojs/react`.

  One honest limitation: the optional peer changes what the package _requires_ of
  you, not what ends up in `node_modules`. `@base-ui/react` and `lucide-react` are
  still hard dependencies of this package (`Button` and `ThemeToggle` need them) and
  both declare `react` as a required peer, so package managers will still place
  react, react-dom, scheduler and use-sync-external-store inside this package's own
  subtree. They are not hoisted to your project root, so your code cannot import
  them, and none of it reaches your built output.

  This release also carries the three unreleased minor additions on `main`
  (`byPubDateDesc`, the `colorScheme` prop, the widened `postSchema` plus
  `requireEnv`), so the next published version is a single major.

### Minor Changes

- 74bab0c: Add an optional `colorScheme` prop to `base-layout.astro`, accepting `"auto"`,
  `"light"` or `"dark"` and defaulting to `"auto"`. `"auto"` keeps the existing
  stored-preference plus `prefers-color-scheme` detection. `"light"` and `"dark"`
  emit a single deterministic line instead, so blogs pinned to one scheme no longer
  need a counter-script that rewrites `localStorage` on every page.
- 74bab0c: Export `byPubDateDesc` from `astro-awesomeness/content`, next to `notDraft`. Blogs
  can now write `getCollection("posts", notDraft).toSorted(byPubDateDesc)` instead of
  re-declaring the published/newest-first contract per route. The comparator is typed
  structurally, so it needs no `astro:content` import.
- 74bab0c: Make `postSchema` usable by the blogs that currently hand-maintain a clone of it:
  `description` is now `z.string().default("")` instead of `z.string().min(1)`, so a
  post with no description parses to `""` rather than failing. Every input that
  parsed before still parses, and the inferred `Post` type is unchanged.

  Also export `requireEnv` from `astro-awesomeness/lib`. It throws naming the missing
  variable, and treats an empty string as missing.

## 0.8.0

### Minor Changes

- 4b02ab7: `TagList` now links to `/tag/<slug>/` instead of `/tags/<slug>`.

  The missing trailing slash pointed chips at URLs that no sitemap entry covered, and the `/tags` default did not match the `/tag/[tag]` route every consuming blog ships. The href is now built by a new exported `tagUrl(tag, base)` helper (with `DEFAULT_TAG_BASE`) so the shape is unit-tested rather than inlined in the component.

  Breaking for consumers routing on `/tags`: pass `base="/tags"` to keep the old prefix. The trailing slash is not opt-out.

## 0.7.3

### Patch Changes

- a509db3: Type-aware linting changed the shape of the published type declarations, with
  no runtime behavior change.

  - `notDraft` is no longer generic. It now takes
    `{ data: { draft?: boolean; status?: string } }` directly instead of inferring
    a type parameter, so callers passing a wider post object still typecheck but
    no longer get the argument type echoed back.
  - Around 20 exported components moved from `declare function X(...)` to
    `declare const X: (...) => React.JSX.Element`, so they are no longer hoisted
    declarations in the `.d.ts`.

  Consumer typechecks pass unchanged (`exactOptionalPropertyTypes` is off).

## 0.7.2

### Patch Changes

- 2048003: Reject unsafe URL schemes in command-menu navigation.
- caee5e2: Force `color-scheme` to match the toggled theme in both directions. `:root` declares `light dark`, so the browser followed the OS preference for native UI (scrollbars, form controls) regardless of the `.dark` class. Now `.dark` forces `color-scheme: dark` and `:root:not(.dark)` forces `color-scheme: light`, so a light-OS visitor toggled to dark and a dark-OS visitor toggled to light both get native surfaces that match the page theme.

## 0.7.1

### Patch Changes

- 6cee510: Bump lucide-react to ^1.24.0

## 0.7.0

### Minor Changes

- f790923: Astro 7 support: widen the `astro` peer dependency to `^6.0.0 || ^7.0.0`.

  The theme's components, layouts, and content schemas work unchanged on Astro 7
  (verified against the demo app on `astro@7.0.6` with `@astrojs/mdx@7` and
  `@astrojs/react@6`). Consumers on Astro 6 are unaffected.

  Notes for consumers upgrading their site to Astro 7:

  - Astro 7 renders `.md`/`.mdx` with Sätteri (its native Markdown pipeline)
    instead of remark/rehype. If your site configures `remarkPlugins`/
    `rehypePlugins`, install `@astrojs/markdown-remark` and set
    `markdown: { processor: unified() }`, or port the plugins.
  - The default `compressHTML` changed from `true` to `"jsx"` (JSX whitespace
    rules between inline elements).
  - Upgrade integrations together: `@astrojs/mdx@^7`, `@astrojs/react@^6`.

  Runtime dependency bumps: `@base-ui/react` ^1.6.0, `lucide-react` ^1.23.0.

### Patch Changes

- db1ee29: Fix a React 19 recoverable hydration error in `ThemeToggle` for visitors with a stored theme: the localStorage override is now read after mount instead of during the hydration render, so the server HTML and the client render always match. Also hydrate the toggle with `client:idle` instead of `client:load` — it is not immediately-interactive UI, and the page theme itself is still applied pre-paint by the inline script in `BaseLayout`.

## 0.6.0

### Minor Changes

- f3e8719: feat(a11y,seo): skip link + main landmark, RSS autodiscovery, OG metadata
  - Adds a skip-to-content link in `BaseLayout` and a real `<main id="main-content">`
    landmark on `ListLayout` and `PostLayout` (post pages previously had no `<main>`).
  - New optional `rssHref` prop threads `<link rel="alternate" type="application/rss+xml">`
    autodiscovery through the exported layouts.
  - `seo.astro` now emits `og:site_name`, `og:locale`, and `article:published_time` /
    `article:modified_time` for article pages, via new optional `siteName`, `locale`,
    `publishedTime`, and `modifiedTime` props (forwarded automatically by `PostLayout`).

  All new props are optional with defaults, so existing consumers are unaffected.

- f3e8719: fix: key getRelatedPosts on id to match Astro 5/6 entry shape

  `getRelatedPosts` deduped the current post on `post.slug`, which Astro 5/6
  content-layer entries do not have (they are keyed by `id`). Against real
  entries every comparison was `undefined === undefined`, so the function
  returned an empty array. It now keys on `id`, matching the rest of the theme.

- f3e8719: feat(layouts): render TOC + related posts; postHref to compose with createPostUrl

  Wires three shipped-but-unused capabilities into the theme:
  - `PostLayout` now renders a table of contents (from `render(post).headings`)
    via the optional `headings` prop, and a related-posts section via the optional
    `relatedPosts` / `relatedHeading` props. The page computes related posts with
    `getRelatedPosts`, keeping the layout pure.
  - New optional `postHref?: (post) => string` callback on `PostCard`, `ListLayout`,
    and `PostLayout` lets consumers compose `createPostUrl`'s `/<category>/<slug>/`
    scheme with the cards the layouts render internally. Defaults to `/blog/${post.id}`,
    preserving existing behaviour.

  All new props are optional with defaults, so existing consumers are unaffected.

### Patch Changes

- a4da19b: Swap cn() to cnfast (drop-in, byte-identical, faster)
- f3e8719: fix(a11y): label CommandMenu dialog for screen readers

  `CommandMenu` rendered a dialog with no accessible name, so screen readers
  announced only "dialog" (WCAG 4.1.2). It now renders a visually-hidden
  `DialogTitle` as the first child of the dialog. Adds an optional `title` prop
  (default `"Search posts"`) to override the accessible name.

## 0.5.0

### Minor Changes

- 72d22ec: Add `createPostUrl(categorySlugMap, defaultCategory)` factory and `notDraft` predicate to absorb ~50 LOC of duplication per downstream blog. Extend `postSchema` with the fields every Unlockers WordPress migration blog already adds locally (`status`, `categories`, `heroImageUrl`, `heroImageWidth`, `heroImageHeight`, `slug`, `seo.canonical_url`). New exports from `astro-awesomeness/lib` (`createPostUrl`, `PostLike`, `PostParams`, `PostUrlBuilder`) and `astro-awesomeness/content` (`notDraft`).

## 0.4.0

### Minor Changes

- Modern web platform audit pass:
  - Declare `<meta name="color-scheme" content="light dark">` and set `:root { color-scheme: light dark }` so native scrollbars and form controls match the active theme before paint (no more dark-mode FOUC on chrome UI).
  - Opt-in to cross-document view transitions (`@view-transition { navigation: auto }`) guarded by `prefers-reduced-motion: no-preference`. Same-origin link clicks now cross-fade in supporting browsers; everyone else gets the standard instant nav.
  - Add `<script type="speculationrules">` to `base-layout` prefetching same-origin links with `moderate` eagerness — first hover/click intent now warms the next page.
  - `text-wrap: balance` on `h1`–`h6` and `text-wrap: pretty` on `.prose p / li / blockquote` for sharper headings and no-orphan body copy.
  - `font-variant-numeric: tabular-nums` on `<time>` so list dates align vertically.
  - `content-visibility: auto` + `contain-intrinsic-size: auto 200px` on `<PostCard>` instances past the first three — skips layout/paint cost for off-screen cards on long post lists without delaying above-the-fold paint.

  All additions are progressive enhancements — older browsers ignore them and the theme renders identically.

## 0.3.0

### Minor Changes

- - `<Header>` accepts `showThemeToggle` prop (default `true`); pass `false` to render in light-only mode without the toggle island.
  - Drop `--color-primary` override from `.dark` block so consumer `@theme { --color-primary: <brand> }` overrides survive dark mode.

## 0.2.0

### Minor Changes

- - Upgrade peer dependency `astro` to `^6.0.0` (latest Astro 6.x).
  - Bump `zod` dependency to `^4.4.3` to match Astro 6's internal Zod 4 schema requirements (`BaseSchema = zod/v4/core $ZodType`). Content collection schemas now use Zod 4 idioms (`z.url()` instead of the deprecated `z.string().url()`).
  - Make brand colors visible by default:
    - `<Header>` site title now uses `text-primary`
    - `<PostCard>` title hover uses `text-primary`
    - `.prose a` links use `--color-primary`
    - `<PostLayout>` and `<ListLayout>` page H1 use `text-primary`
  - Bump transitive dependencies (`lucide-react`, `@types/react`, `@types/react-dom`, `happy-dom`, `vitest`, `@vitest/coverage-v8`) to latest within compatible majors.

  Backwards compatible at the visual layer: shadcn's default `--color-primary` is near-foreground, so existing consumers see no change. Consumers who set `--color-primary` to a brand color now get visible brand tinting on H1s, header wordmark, post-card hover, and prose links.

  Consumer action required: ensure your project has `astro@^6.0.0` and `zod@^4.0.0`. Astro 6 itself requires Node 22.12.0+.

## 0.1.3

### Patch Changes

- i18n-ready text props on theme primitives:
  - `<ReadingTime>` accepts `label`
  - `<Pagination>` accepts `prevLabel`, `nextLabel`, `pageLabel`, `ofLabel`
  - `<TableOfContents>` accepts `heading`
  - `<Header>` accepts a `<slot name="brand">` for custom logos, plus `themeToggleLabel`
  - `<ThemeToggle>` accepts `ariaLabel`
  - `<CommandMenu>` accepts `groupHeading`
  - `<PostLayout>` accepts `updatedLabel`

  All defaults stay English-only — existing consumers unaffected.

## 0.1.2

### Patch Changes

- Ship `@source` directives in `globals.css` so consumer Tailwind v4 automatically scans the theme's `.astro`/`.tsx` files. Removes the need for consumers to add `@source "../../node_modules/astro-awesomeness/src/**/*.{astro,tsx,ts}"` themselves.

## 0.1.1

### Patch Changes

- Ship the full `src/` directory so `.astro` files' relative imports to `lib`, `components`, and `content` resolve. Previously only `src/astro` and `src/layouts` were shipped, which broke consumer builds.

## 0.1.0

### Minor Changes

- Initial release — Astro 5 blog theme with shadcn primitives, content schemas (zod 3), Tailwind v4 preset with oklch tokens, prose styles baked in, theme-toggle + command-menu React islands, 11 Astro components (header, footer, post-card, prose, code-block, seo, etc.), 3 layouts (base, post, list) accepting Astro 5 CollectionEntry shape.
