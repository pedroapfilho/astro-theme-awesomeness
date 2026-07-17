# astro-awesomeness

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
