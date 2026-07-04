---
"astro-awesomeness": minor
---

Astro 7 support: widen the `astro` peer dependency to `^6.0.0 || ^7.0.0`.

The theme's components, layouts, and content schemas work unchanged on Astro 7
(verified against the demo app on `astro@7.0.6` with `@astrojs/mdx@7` and
`@astrojs/react@6`). Consumers on Astro 6 are unaffected.

Notes for consumers upgrading their site to Astro 7:

- Astro 7 renders `.md`/`.mdx` with Sätteri (its native Markdown pipeline)
  instead of remark/rehype. If your site configures `remarkPlugins`/
  `rehypePlugins`, install `@astrojs/markdown-remark` and set
  `markdown: { processor: unified() }`, or port the plugins.
- The default `compressHTML` changed from `true` to `"jsx"` (JSX whitespace
  rules between inline elements).
- Upgrade integrations together: `@astrojs/mdx@^7`, `@astrojs/react@^6`.

Runtime dependency bumps: `@base-ui/react` ^1.6.0, `lucide-react` ^1.23.0.
