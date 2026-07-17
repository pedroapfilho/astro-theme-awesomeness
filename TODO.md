# Modern Web Guidance TODO

Findings from a 2026-05-21 read-only modern-web-guidance recon scoped to
`packages/astro-awesomeness/` (the published theme) and `apps/demo/` (the
reference blog). Statuses re-verified against the code on 2026-07-14.

## Shipped since the recon

- **View transitions (was item 0):** `globals.css` opts into cross-document
  `@view-transition { navigation: auto }` under a `prefers-reduced-motion`
  guard. This also settles the old item 11: cross-document transitions apply
  to script navigations, so `CommandMenu`'s `window.location.href` (now gated
  by `resolveNavigationUrl`) gets transitions without `astro:transitions`.
- **RSS autodiscovery (was item 2):** `base-layout.astro` emits
  `<link rel="alternate" type="application/rss+xml">` when `rssHref` is passed.
- **`color-scheme` (was item 3, CSS half):** `:root { color-scheme: light dark }`
  in `globals.css` plus `<meta name="color-scheme">` in `base-layout.astro`,
  and `.dark` forces `color-scheme: dark` so native UI follows the toggle.
- **Skip-to-content link (was item 8):** `base-layout.astro` ships the link;
  `list-layout.astro` and `post-layout.astro` carry `id="main-content"`.
- **Font stack honesty (was item 6):** the demo no longer declares a webfont
  it never loads; the system-font stack from the theme applies.
- **`content-visibility` (was item 7, card half):** `post-card.astro` applies
  `content-visibility: auto` to cards after the third.

## Open items

### 1. Astro `<Image>` component not used (High / Medium)

The `post.data.cover` schema field exists but `post-layout.astro` never
renders a hero image and `post-card.astro` has no image either. Raw `<img>`
in user-authored markdown is the only path. Astro's `<Image>` gives
WebP/AVIF, responsive `srcset`, explicit width/height (no CLS), and LCP
hinting for free.

Files: `src/layouts/post-layout.astro`, `src/astro/post-card.astro`

### 2. `<meta name="theme-color">` absent (Medium / Easy)

Browser chrome color does not match the page background. Needs a value per
theme (and an update on toggle), so it depends on how consumers override
`--color-background`.

Files: `src/layouts/base-layout.astro`

### 3. `scroll-behavior: smooth` with reduced-motion guard (Medium / Easy)

TOC anchors and `#heading` links hard-jump. `scroll-margin-top: 4rem` is
already set on prose headings.

```css
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

Files: `src/styles/globals.css`

### 4. Reading progress indicator, scroll-driven, zero JS (Medium / Medium)

```css
@media (prefers-reduced-motion: no-preference) {
  @keyframes progress {
    from {
      width: 0%;
    }
  }
  .progress-bar {
    animation: progress linear both;
    animation-timeline: scroll(root block);
  }
}
```

Add a `<div class="progress-bar">` at the top of `post-layout.astro`.

Files: `src/layouts/post-layout.astro`, `src/styles/globals.css`

### 5. `content-visibility: auto` on `.prose` (Medium / Easy)

Long posts (see `long-post.md`) render the entire prose section up-front.
`content-visibility: auto; contain-intrinsic-size: auto 1000px` on `.prose`
gives measurable paint improvements on long posts.

Files: `src/styles/globals.css`

### 6. `aria-live` for theme-toggle feedback (Low / Easy)

Switching theme has no accessible announcement. A visually-hidden
`aria-live="polite"` region announcing "Dark mode" / "Light mode" is ~4 lines.

Files: `src/components/theme-toggle.tsx`

### 7. `view-transition-name` on post cards to hero morph (Low / Medium)

Cross-document transitions are wired, so matching `view-transition-name`
values on the post-card title and the `<h1>` in `post-layout.astro` would
enable the shared-element morph.

Files: `src/astro/post-card.astro`, `src/layouts/post-layout.astro`

### 8. Default OG image fallback (Low / Hard)

`seo.astro` emits `og:image` only when the consumer passes `image`. The
theme should document or ship a default OG image (static fallback or dynamic
generation via an Astro endpoint).

Files: `src/astro/seo.astro`

## Strengths already in place (verified, do not regress)

- `@astrojs/sitemap` integration present
- `scroll-margin-top` on prose headings (anchor scroll positioning correct)
- `prefers-reduced-motion` respected in existing animation and view-transition rules
- Dark-mode token system via the `.dark` class
