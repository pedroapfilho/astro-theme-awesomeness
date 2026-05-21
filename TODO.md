# Modern Web Guidance TODO

Findings from a 2026-05-21 read-only modern-web-guidance recon scoped to:

- `packages/astro-awesomeness/` (published Astro 5 blog theme)
- `apps/demo/` (reference blog)

Sorted by priority. Items marked **High** materially improve the published theme's default output — every consumer inherits the omissions.

---

## 0. CRITICAL — View Transitions / ClientRouter MISSING

**Priority: High / Easy**

`<ClientRouter />` is not present anywhere; there is no `@view-transition { navigation: auto }` CSS rule either. This is Astro 5's flagship "modern blog" feature and the largest single improvement available.

For an MPA blog, the cross-document CSS-only approach is the right path:

```css
/* in globals.css */
@media (prefers-reduced-motion: no-preference) {
  @view-transition {
    navigation: auto;
  }
}
```

Cross-document view transitions are progressive enhancement: Firefox falls back to a normal navigation; Safari 18.2+ and Chrome 126+ animate. No JS needed for a blog.

---

## 1. High Priority

### 1. Astro `<Image>` component — not used at all

The `post.data.cover` schema field exists but `post-layout.astro` never renders a hero image; `post-card.astro` has no image either. Raw `<img>` in user-authored markdown is the only path. Astro's `<Image>` gives WebP/AVIF, responsive `srcset`, explicit width/height (no CLS), and LCP hinting for free.

**Files:** `packages/astro-awesomeness/components/post-layout.astro`, `post-card.astro`
**Effort:** Medium

### 2. RSS not autodiscoverable

`rss.xml.ts` works, but the `<head>` never advertises it. Feed readers and browser extensions silently miss the feed.

```astro
<link rel="alternate" type="application/rss+xml" title={siteTitle} href="/rss.xml" />
```

**Files:** `packages/astro-awesomeness/components/seo.astro` or `base-layout.astro`
**Effort:** Easy

### 3. `color-scheme` CSS prop + `<meta name="theme-color">` absent

`globals.css` toggles `.dark` but never sets `color-scheme: light dark` on `<html>`. Browser chrome (scrollbars, form inputs, date pickers) stays light in dark mode. A flash-of-wrong-theme window can show white before the inline script runs.

```css
html {
  color-scheme: light dark;
}
html.dark {
  color-scheme: dark;
}
```

Also set `<meta name="theme-color">` (or update via JS on theme switch) to match `--color-background`.

**Files:** `packages/astro-awesomeness/styles/globals.css`, `base-layout.astro`
**Effort:** Easy

---

## 2. Medium Priority

### 4. `scroll-behavior: smooth` (with reduced-motion guard)

TOC anchors and `#heading` links hard-jump. `scroll-margin-top: 4rem` is already set on headings (good). Add the smooth-scroll behavior under a reduced-motion guard:

```css
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

**Files:** `packages/astro-awesomeness/styles/globals.css`
**Effort:** Easy

### 5. Reading progress indicator (scroll-driven, zero JS)

A blog theme should ship this as a flagship visual:

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

**Files:** `packages/astro-awesomeness/components/post-layout.astro`, `styles/globals.css`
**Effort:** Medium

### 6. Inter Variable declared but never loaded

`globals.css` sets `--font-sans: "Inter Variable"` but no `@font-face`, no `<link rel="preload">`, no `@fontsource-variable/inter` import. The stack silently falls back to `ui-sans-serif`.

Options:

- `pnpm add @fontsource-variable/inter` and import it once, or
- Add `<link rel="preconnect">` + `<link rel="preload">` for the woff2 subset in `base-layout.astro`.

If a custom font is intentional, ensure `font-display: swap` in any `@font-face` rule.

**Files:** `packages/astro-awesomeness/package.json`, `base-layout.astro`, `styles/globals.css`
**Effort:** Medium

### 7. `content-visibility: auto` on `.prose`

Long posts (see `long-post.md`) render the entire prose section up-front. Adding `content-visibility: auto; contain-intrinsic-size: auto 1000px` to `.prose` gives measurable paint improvements on long posts.

**Files:** `packages/astro-awesomeness/styles/globals.css`
**Effort:** Easy

### 8. Skip-to-content link absent (WCAG 2.4.1)

`base-layout.astro` has no skip link. The header is `sticky top-0`, so keyboard and screen-reader users hit the full nav on every page. This is a published theme — consumers inherit the omission.

```astro
<a href="#main-content" class="sr-only focus:not-sr-only fixed left-2 top-2 z-50 ...">Skip to content</a>
```

Add `id="main-content"` on `<main>` in `list-layout.astro` and `<article>` in `post-layout.astro`.

**Files:** `packages/astro-awesomeness/components/base-layout.astro`, `list-layout.astro`, `post-layout.astro`
**Effort:** Easy

---

## 3. Low Priority

### 9. `aria-live` for theme-toggle feedback

Switching theme has no accessible announcement. A visually-hidden `aria-live="polite"` region announcing "Dark mode" / "Light mode" is ~4 lines.

**Effort:** Easy

### 10. `view-transition-name` on post cards → hero (shared-element morph)

Once item 0 (cross-document transitions) is wired, add matching `view-transition-name` to the post-card title and the `<h1>` in `post-layout.astro`. This creates the signature shared-element morph effect of a modern Astro blog.

**Files:** `post-card.astro`, `post-layout.astro`
**Effort:** Medium — depends on item 0

### 11. `CommandMenu` navigates via `window.location.href`

`command-menu.tsx` uses `window.location.href = item.url` on select. Once `<ClientRouter />` is active, this bypasses transitions. Astro's `navigate()` from `astro:transitions/client` should be used, or the anchor-based pattern for cross-document transitions.

**Files:** `apps/demo/src/components/command-menu.tsx` (or theme equivalent)
**Effort:** Easy — depends on item 0

### 12. Default OG image fallback

`seo.astro` emits `og:image` only when the consumer passes `image`. The published theme should document or ship a default OG image (static fallback or dynamic generation with `@vercel/og` / an Astro endpoint).

**Files:** `packages/astro-awesomeness/components/seo.astro`
**Effort:** Hard

---

## Summary table

| #   | Issue                                                      | Priority | Effort |
| --- | ---------------------------------------------------------- | -------- | ------ |
| 0   | `<ClientRouter />` / `@view-transition` entirely absent    | High     | Easy   |
| 1   | Astro `<Image>` never used; cover schema field dead        | High     | Medium |
| 2   | RSS feed not autodiscoverable                              | High     | Easy   |
| 3   | `color-scheme` CSS prop + `theme-color` meta absent        | High     | Easy   |
| 4   | No smooth scroll (with reduced-motion guard)               | Medium   | Easy   |
| 5   | No scroll-driven reading progress bar                      | Medium   | Medium |
| 6   | Inter Variable declared but never loaded / preloaded       | Medium   | Medium |
| 7   | No `content-visibility: auto` on `.prose`                  | Medium   | Easy   |
| 8   | No skip-to-content link (WCAG 2.4.1)                       | Medium   | Easy   |
| 9   | No `aria-live` announcement on theme toggle                | Low      | Easy   |
| 10  | No `view-transition-name` on cards→post hero morphing      | Low      | Medium |
| 11  | `window.location.href` in CommandMenu bypasses transitions | Low      | Easy   |
| 12  | No default OG image fallback                               | Low      | Hard   |

---

## Strengths already in place

(Verified by recon — do not regress)

- `@astrojs/sitemap` integration present
- `scroll-margin-top` on headings (anchor scroll positioning correct)
- `prefers-reduced-motion` baseline respected in existing animations
- Dark-mode token system via `.dark` class
