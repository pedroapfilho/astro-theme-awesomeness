# Theme TODO

Remaining work in the published package after the content-index and static-layout redesign.
Consumer layouts own post cards, hero rendering, tables of contents and reading-progress UI.

## Open items

- **Browser chrome color:** consider `<meta name="theme-color">` in
  `packages/astro-awesomeness/src/layouts/base-layout.astro`. Any value must follow
  consumer background tokens and the selected color scheme.
- **Anchor scrolling:** evaluate `scroll-behavior: smooth` under
  `prefers-reduced-motion: no-preference` in
  `packages/astro-awesomeness/src/styles/globals.css`. Keep the existing prose
  heading scroll margins.
- **Long-post rendering:** measure `.prose` paint costs before introducing
  `content-visibility` and intrinsic-size rules in
  `packages/astro-awesomeness/src/styles/globals.css`; verify anchor navigation,
  find-in-page and print behavior.
- **Theme-toggle announcements:** evaluate an accessible announcement of the
  selected scheme in
  `packages/astro-awesomeness/src/compositions/theme-toggle.tsx`, including how
  consumers supply translated text.

## Preserve

- BaseLayout's skip link and consumer-provided `<main id="main-content">` target.
- RSS autodiscovery when BaseLayout receives `rssHref`.
- Scheme-specific native controls and the `.dark` token overrides.
- Reduced-motion guards for cross-document view transitions.
- Consumer font/accent overrides and static Astro imports without React.
- One content index for published posts, links, archives, related posts and RSS.
