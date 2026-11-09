---
"astro-awesomeness": patch
---

An unmapped category with an HTML-encoded name now gets the slug of its decoded label, the same rule the index already used to pick display names: `Luz &amp; Sombra` routes to `/luz-sombra/` instead of `/luz-amp-sombra/`. Mapped categories don't move.

BaseLayout and Seo resolve a root-relative `image`, such as `/og-image.jpg`, against `Astro.site`, so `new URL(..., Astro.site)` at the call site is no longer needed. Footer's `class` now lands on its inner row, so a site can match the footer to its own container width.

`postSchema` no longer keeps the unused `slug` field in parsed data; routes still come from `seo.canonical_url` or the entry ID.

`astro-awesomeness/styles.css` is now served from `src/styles/globals.css` and scans the package's components relative to itself, so the redundant `@source "../../node_modules/astro-awesomeness/src/**/*..."` line in a site stylesheet can go. The stylesheet also drops a `:root` `color-scheme` rule that the `.dark` and `:root:not(.dark)` rules always overrode, the base rules Tailwind's preflight already sets, and the body `font-feature-settings` override, so font features a site sets on `html` now reach the page.
