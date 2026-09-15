---
"astro-awesomeness": patch
---

Expose the Tailwind plugin through the default export condition so design-system tooling can resolve the same preset as Astro and Vite.

Move post-card and list-layout styling into the shared stylesheet and expose named layout and typography tokens so Astro templates satisfy the strict design-system rules.
