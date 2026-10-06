# astro-theme-awesomeness

Monorepo for `astro-awesomeness`, an Astro 6/7 blog theme with static components,
a shared Tailwind v4 stylesheet, content schemas and a site content index.
React is optional and used only by the `astro-awesomeness/components` entry.

- [Package documentation](./packages/astro-awesomeness/README.md): installation,
  content collections, routing, layouts and customization.
- [Demo source](./apps/demo): a complete blog with local CMS-shaped posts, category
  and tag archives, RSS, and an optional React theme toggle.
- [Live demo](https://demo.astro-awesomeness.dev).

## Develop

Use Node 24 or newer and pnpm 11.13.1.

```sh
pnpm install
pnpm dev
```

The demo binds `createContentIndex` once in `apps/demo/src/lib/content.ts`.
Its local header and list/post layouts compose the package's static building
blocks. Routes include `/posts/`, `/[category]/[slug]/`, `/[category]/[...page]`,
`/tag/[tag]/`, `/rss.xml` and a 404 page.

```sh
pnpm build
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:lint
pnpm check:shadcn
```

Build the package before linting so Tailwind theme discovery has its generated
stylesheet. Package unit tests use Vitest 5 in Node; the shared React test preset
uses jsdom.

Only `packages/astro-awesomeness` is published. Use `pnpm changeset` for release
notes; the demo is excluded from versioning.
