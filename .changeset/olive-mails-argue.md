---
"astro-awesomeness": minor
---

Add an optional `colorScheme` prop to `base-layout.astro`, accepting `"auto"`,
`"light"` or `"dark"` and defaulting to `"auto"`. `"auto"` keeps the existing
stored-preference plus `prefers-color-scheme` detection. `"light"` and `"dark"`
emit a single deterministic line instead, so blogs pinned to one scheme no longer
need a counter-script that rewrites `localStorage` on every page.
