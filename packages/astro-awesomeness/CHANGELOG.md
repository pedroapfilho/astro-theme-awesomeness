# astro-awesomeness

## 0.1.1

### Patch Changes

- Ship the full `src/` directory so `.astro` files' relative imports to `lib`, `components`, and `content` resolve. Previously only `src/astro` and `src/layouts` were shipped, which broke consumer builds.

## 0.1.0

### Minor Changes

- Initial release — Astro 5 blog theme with shadcn primitives, content schemas (zod 3), Tailwind v4 preset with oklch tokens, prose styles baked in, theme-toggle + command-menu React islands, 11 Astro components (header, footer, post-card, prose, code-block, seo, etc.), 3 layouts (base, post, list) accepting Astro 5 CollectionEntry shape.
