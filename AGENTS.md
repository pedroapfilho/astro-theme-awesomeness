# astro-awesomeness-monorepo

Published Astro blog theme (`astro-awesomeness`) consumed by Pedro's 12 blogs.

## Stack

- **Astro 5** for the demo app + consumer blogs
- **React 19** for interactive islands (theme toggle, command menu)
- **Tailwind CSS v4** with a custom preset; per-blog font/accent overrides via `@theme`
- **shadcn + base-ui + lucide** for UI primitives
- **zod** for content collection schemas
- **tsdown** for the package build; `.astro` files ship as source
- **vitest** for unit tests (no Playwright — library profile)
- **changesets** for versioned releases
- **oxlint + oxfmt** via `oxlint-config-awesomeness`
- **pnpm 11.1.3**, **turbo**, **node 24**

## Layout

```
apps/
  demo/                   # Astro 5 blog — dev loop + showcase
packages/
  astro-awesomeness/      # published npm package
  config-typescript/      # @repo/typescript-config (base, library, vite, astro)
```

## Conventions

- All source files kebab-case; types/classes PascalCase; vars/fns camelCase.
- `types` over `interfaces`; arrow functions; exports at end of file.
- No silent failures, no `as any`, strict TS.
- `.astro` components live in `src/astro/`; React islands in `src/components/`.
- Content schemas (zod) in `src/content/`; consumer apps import these.

## Library profile

Validated by `~/dev/orchestrator/scripts/verify-*.sh` against
`LIBRARY_SOURCE_OF_TRUTH=usebutr`. The repo has no Playwright, no DB, no auth,
no email infra — these checks skip via the orchestrator's profile model.

## Releases

```sh
pnpm changeset                # add a changeset
pnpm version-packages         # bump versions
pnpm release                  # build + publish
```
