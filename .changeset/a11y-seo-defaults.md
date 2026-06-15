---
"astro-awesomeness": minor
---

feat(a11y,seo): skip link + main landmark, RSS autodiscovery, OG metadata

- Adds a skip-to-content link in `BaseLayout` and a real `<main id="main-content">`
  landmark on `ListLayout` and `PostLayout` (post pages previously had no `<main>`).
- New optional `rssHref` prop threads `<link rel="alternate" type="application/rss+xml">`
  autodiscovery through the exported layouts.
- `seo.astro` now emits `og:site_name`, `og:locale`, and `article:published_time` /
  `article:modified_time` for article pages, via new optional `siteName`, `locale`,
  `publishedTime`, and `modifiedTime` props (forwarded automatically by `PostLayout`).

All new props are optional with defaults, so existing consumers are unaffected.
