# astro-awesomeness

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
