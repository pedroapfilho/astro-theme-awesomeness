# AGENTS.md

`astro-theme-awesomeness` is the Turborepo home of the published Astro 6/7
blog theme `astro-awesomeness` and the demo blog that exercises it. Library
profile in the orchestrator: no DB, no auth, no Playwright, no email infra.

## Stack

- **Astro 6/7** (peer dep `^6.0.0 || ^7.0.0`) for the demo app and consumer blogs
- **React 19** for the one interactive island (theme toggle)
- **Tailwind CSS v4** with a custom preset; per-blog font/accent overrides via `@theme`
- **shadcn-style wrappers over @base-ui/react** + **lucide-react**
- **zod 4** for content collection schemas (`postSchema`, `tagSchema`, `authorSchema`)
- **tsdown** for the package build; `.astro` files ship as source via `./astro/*` and `./layouts/*` exports
- **vitest 4** for unit tests (happy-dom)
- **changesets** for versioned releases (demo app is ignored)
- **oxlint + oxfmt** via `oxlint-config-awesomeness`
- **fallow** for dead-code / dupes / health audits
- **pnpm 11.13.1**, **turbo 2**, **node >=24**

## Layout

```
apps/
  demo/                       # Astro reference blog: dev loop + showcase
packages/
  astro-awesomeness/          # published npm package (the theme)
    src/astro/                # .astro components (header, footer, seo, …)
    src/components/           # React islands (theme-toggle, ui/)
    src/layouts/              # base / list / post layouts (.astro)
    src/content/              # zod schemas for posts + tags
    src/lib/                  # cn, format-date, get-related-posts, reading-time, slugify
    src/styles/               # globals.css (shipped as `astro-awesomeness/styles.css`)
    src/tailwind-preset.ts    # exported as `astro-awesomeness/tailwind`
  config-typescript/          # @repo/typescript-config (base, library, vite, astro)
  config-vitest/              # @repo/config-vitest (react, node, setup-react)
.changeset/                   # changeset config (ignores `demo`)
oxlint.config.ts              # extends oxlint-config-awesomeness
```

## Dev workflow

From the repo root (all turbo-fanned):

```sh
pnpm install
pnpm dev                      # demo app + package watch
pnpm build                    # tsdown package + astro build demo
pnpm lint                     # oxlint across workspaces
pnpm format                   # oxfmt write; `pnpm format:check` for CI
pnpm typecheck                # tsc / astro check
pnpm test                     # vitest run
pnpm test:coverage            # + v8 coverage
pnpm clean                    # rm node_modules + .turbo + dist
```

Fallow:

```sh
pnpm fallow                   # interactive
pnpm fallow:dead              # dead-code scan
pnpm fallow:dupes             # duplicate detection
pnpm fallow:health --score    # quick health score
pnpm fallow:audit             # diff vs main
```

Releases:

```sh
pnpm changeset                # author a changeset
pnpm version-packages         # changeset version (bumps + changelogs)
pnpm release                  # turbo build + changeset publish
```

## Package exports

`astro-awesomeness` exposes these subpath entries (see `packages/astro-awesomeness/package.json`):

- `astro-awesomeness`: `cn`, content schemas re-exports, lib utilities
- `astro-awesomeness/components`: React islands (`ThemeToggle`, `Button`, `buttonVariants`)
- `astro-awesomeness/astro/*`: raw `.astro` components (header, seo, post-card, …)
- `astro-awesomeness/layouts/*`: raw `.astro` layouts (base / list / post). `base-layout`
  renders chrome only through its `header` and `footer` slots, so importing it alone
  pulls in no React.
- `astro-awesomeness/content`: `postSchema`, `tagSchema`, `authorSchema`, `notDraft`, `byPubDateDesc`
- `astro-awesomeness/lib`: utility surface
- `astro-awesomeness/tailwind`: Tailwind v4 preset
- `astro-awesomeness/styles.css`: globals (bundled CSS)

The Astro / layouts entries ship as source on purpose; Astro needs the
component files at build time. Don't move them into the bundled output.

## Conventions

- All source files kebab-case; types/classes PascalCase; vars/fns camelCase.
- `types` over `interfaces`; arrow functions; exports at end of file.
- No `as any`, strict TS, no silent failures.
- `.astro` components live in `src/astro/`; React islands in `src/components/`.
- Content schemas in `src/content/`; consumer apps import via `astro-awesomeness/content`.
- Vite is told to `optimizeDeps.exclude: ["astro-awesomeness"]` in the demo so
  the workspace package isn't pre-bundled; keep that in any new consumer config.

## Library profile (orchestrator)

Validated by `orchestrator verify` against
its profile base, `acme-package`. Skipped checks: e2e (no Playwright),
auth-config, prisma-config, turbo-db-generate-ordering, i18n-\*, landing-urls,
e2e-auth-emails. Seven workflows gate PRs on actions @v6: `test`, `lint`,
`format` and `fallow` (the library-profile standard) plus `build`, `typecheck`
and a `react-doctor` scan. `release.yml` is the eighth, on pushes to main only.
There is no `e2e.yml`.

The repo has a recorded divergence: `astro-theme-awesomeness.gitignore` (per-app
gitignores allowed under the library profile). See `fleet.json` (`orchestrator divergences`).

## Notable decisions

- **`.astro` ships as source, not compiled.** tsdown only emits the JS/TS
  surface; the `./astro/*` and `./layouts/*` subpath exports point at `src/`.
  Consumers compile through Astro themselves.
- **Tailwind v4 preset over a config file.** Per-blog overrides happen via
  `@theme` in the consumer's globals.css, no runtime config object.
- **`peerDependencies` pin Astro `^6.0.0 || ^7.0.0` and React `^19.0.0`.** Demo app's
  direct deps match those peers; bump them together when upgrading.
- **React is an `optional` peer.** Only `layouts/list-layout`, `layouts/post-layout`,
  `astro/header` and the `./components` entry need React, because they render
  `<ThemeToggle client:idle />`. A consumer on `layouts/base-layout` alone needs
  none of it, which is what all 12 blogs do. Keep the peer range: the optionality
  lives in `peerDependenciesMeta`, and dropping either would misdescribe the
  bundled layouts.
- **Changesets ignores `demo`.** Only `astro-awesomeness` is published; demo
  is a dev playground.

## References

- Theme on npm: https://www.npmjs.com/package/astro-awesomeness
- Astro docs: https://docs.astro.build
- Tailwind v4: https://tailwindcss.com
- Orchestrator (verification + standards): `~/dev/orchestrator`
- Consumer blogs (12 repos, `blog` profile): see orchestrator's `CLAUDE.md` for the list
