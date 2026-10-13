# Theme TODO

Remaining work in the published package after the content-index and static-layout redesign.
Consumer layouts own post cards, hero rendering, tables of contents and reading-progress UI.

## Open items

None.

## Decided

- **No `content-visibility` on `.prose`.** Measured on 2026-10-13 against the longest
  sampled production article (2,131 words, 390px viewport, 4x CPU throttle, median
  of 7): it saved about 8 ms of layout. That gain does not pay for the
  estimated-height scroll jumps on anchor links, find-in-page and print.

## Preserve

- BaseLayout's skip link and consumer-provided `<main id="main-content">` target.
- RSS autodiscovery when BaseLayout receives `rssHref`.
- Scheme-specific native controls and the `.dark` token overrides.
- Reduced-motion guards for cross-document view transitions and smooth anchor scrolling.
- `<meta name="theme-color">` following the computed page background in automatic mode only;
  fixed-scheme sites own a literal value in the `head` slot.
- ThemeToggle's `aria-pressed` state and a label that names dark mode.
- Consumer font/accent overrides and static Astro imports without React.
- One content index for published posts, links, archives, related posts and RSS.
