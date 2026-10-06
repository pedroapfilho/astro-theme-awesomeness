# AGENTS.md

`astro-theme-awesomeness` is the Turborepo home of the published Astro 6/7
blog theme `astro-awesomeness` and the demo blog that exercises it. Library
profile in the orchestrator: no DB, no auth, no email infra.

## Stack

- **Astro 6/7** (peer dep `^6.0.0 || ^7.0.0`) for the demo app and consumer blogs
- **React 19** for the optional theme-toggle island and Button
- **Tailwind CSS v4** with a shared stylesheet; per-blog font/accent overrides via `@theme`
- **shadcn-style wrappers over @base-ui/react** + **lucide-react**
- **zod 4** for content collection schemas (`postSchema`, `authorSchema`)
- **tsdown** for the package build; `.astro` files ship as source via `./astro/*` and `./layouts/*` exports
- **Vitest 5** for package unit tests in Node; the shared React preset uses jsdom
- **changesets** for versioned releases (demo app is ignored)
- **oxlint + oxfmt** via `oxlint-config-awesomeness`
- **fallow** for dead-code / dupes / health audits
- **pnpm 11.13.1**, **turbo 2**, **node >=24**

## Layout

```
apps/
  demo/                       # Astro reference blog: dev loop + showcase
    src/lib/content.ts        # one createContentIndex binding for all routes and layouts
    src/components/           # demo-owned header, cards and list/post layouts
    src/content/posts/        # local posts with CMS-shaped frontmatter
    src/pages/                # posts, category, article, tag, RSS and 404 routes
packages/
  astro-awesomeness/          # published npm package (the theme)
    src/astro/                # static building blocks (footer, seo, pagination, …)
    src/components/           # shadcn React primitives and public entry
    src/compositions/         # product React islands (theme-toggle)
    src/layouts/              # base-layout.astro: page/article metadata and slots
    src/content/              # post/author schemas and normalized heroImage
    src/lib/                  # content index, cn and internal component helpers
    src/styles/               # globals.css (shipped as `astro-awesomeness/styles.css`)
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

- `astro-awesomeness/components`: React islands (`ThemeToggle`, `Button`, `buttonVariants`)
- `astro-awesomeness/astro/*`: raw `.astro` components: `author-byline`, `author-card`,
  `footer`, `formatted-date`, `pagination`, `prose`, `reading-time`, `seo`, `tag-list`
- `astro-awesomeness/layouts/base-layout`: page/article document layout with `head`,
  `header`, default and `footer` slots; no React imports
- `astro-awesomeness/content`: `postSchema`, `authorSchema`, and `Post`/`Author` types
- `astro-awesomeness/lib`: `cn`, `createContentIndex`, and its types (`CategoryOptions`,
  `ContentBucket`, `ContentIndex`, `ContentIndexOptions`, `ContentPost`, `FeedItem`,
  `PostCategory`, `PostParams`)
- `astro-awesomeness/styles.css`: tokens, base styles, prose and the dark variant

There is no root entry or Tailwind preset export. Import each public subpath explicitly.

The Astro / layouts entries ship as source on purpose; Astro needs the
component files at build time. Don't move them into the bundled output.

## Conventions

- All source files kebab-case; types/classes PascalCase; vars/fns camelCase.
- `types` over `interfaces`; arrow functions; exports at end of file.
- No `as any`, strict TS, no silent failures.
- `.astro` components live in `src/astro/`; React primitives in `src/components/` and product islands in `src/compositions/`.
- Content schemas in `src/content/`; consumer apps import via `astro-awesomeness/content`.
- Vite is told to `optimizeDeps.exclude: ["astro-awesomeness"]` in the demo so
  the workspace package isn't pre-bundled; keep that in any new consumer config.

## Library profile (orchestrator)

Validated by `orchestrator verify` against
its profile base, `acme-package`. Skipped checks: e2e (saas-only),
auth-config, prisma-config, turbo-db-generate-ordering, i18n-\*, landing-urls,
e2e-auth-emails. Seven workflows gate PRs: `lint` (formatting, dead code and
oxlint as steps of one job), `test`, `typecheck`, `build`, `e2e` (the demo's
Playwright suite), `publish-checks` and a `react-doctor` scan. They run on pull requests, a weekly schedule and manual
dispatch, never on pushes to main. `release.yml` is the eighth, on pushes to
main only.

The repo has a recorded divergence: `astro-theme-awesomeness.gitignore` (per-app
gitignores allowed under the library profile). See `fleet.json` (`orchestrator divergences`).

## Notable decisions

- **`.astro` ships as source, not compiled.** tsdown only emits the JS/TS
  surface; the `./astro/*` and `./layouts/*` subpath exports point at `src/`.
  Consumers compile through Astro themselves.
- **Tailwind v4 stylesheet.** Import `astro-awesomeness/styles.css` after Tailwind.
  It registers the dark variant and scans the package's source components.
  Per-blog overrides happen via `@theme`; there is no `@plugin` preset.
- **`peerDependencies` pin Astro `^6.0.0 || ^7.0.0` and React `^19.0.0`.** Demo app's
  direct deps match those peers; bump them together when upgrading.
- **React and React DOM are optional peers.** Only the `./components` entry needs
  them. All shared Astro components and BaseLayout stay static; consumers own
  their header and opt into `<ThemeToggle client:idle />`. Keep the peer ranges
  and `peerDependenciesMeta` declarations together.
- **Astro i18n owns locale.** Components read `Astro.currentLocale` for document
  language, Open Graph locale, dates and built-in labels. The demo config uses
  `i18n: { defaultLocale: "en-US", locales: ["en-US"] }` and `trailingSlash: "always"`.
  Labels support English and Portuguese, defaulting to English for other locales.
- **One content index per site.** Bind `createContentIndex` in `src/lib/content.ts`.
  It filters drafts, orders posts by publication date with an ID tie-breaker, and
  owns post URLs, route params, category/tag buckets, related posts and feed items.
  Use its methods everywhere so archives, links and RSS agree.
- **Routes own SEO identity.** BaseLayout and Seo accept either `siteTitle`, `title`
  and `description` for a page, or `siteTitle` and `post` for an article. Canonical,
  `og:url` and JSON-LD `mainEntityOfPage.@id` derive from the route pathname on
  `Astro.site`. `seo.canonical_url` influences content route selection only.
- **Consumers own presentation.** The demo provides its own list/post layouts and
  header around BaseLayout. Shared components do not prescribe a blog shell.
  `colorScheme="light"` or `"dark"` fixes the scheme without a theme initialization
  script; `"auto"` follows a stored preference or the system preference.
- **Changesets ignores `demo`.** Only `astro-awesomeness` is published; demo
  is a dev playground.

## References

- Theme on npm: https://www.npmjs.com/package/astro-awesomeness
- Astro docs: https://docs.astro.build
- Tailwind v4: https://tailwindcss.com
- Orchestrator (verification + standards): `~/dev/orchestrator`
- Consumer blogs (12 repos, `blog` profile): see orchestrator's `CLAUDE.md` for the list

## Design-system linting

Run `pnpm lint` after changes and fix every error. `oxlint.config.ts` registers `@shadcn/lint` and enforces all six rules as errors: component contracts, known Tailwind classes, static component class names, semantic colors, theme or scale values, and class-based styling. Use CSS custom properties for runtime geometry and named theme tokens for custom values. Use component variants for appearance and layout classes at call sites. All six rules also apply inside primitive directories. Shared styles belong to component variants or the owning stylesheet. Keep theme discovery local to each app. Exact class-merging fixture allowances apply only to the named test files.

The shared package's `components.json` points to the demo's complete Tailwind entry, because the distributed stylesheet is a theme fragment that consumers load after Tailwind. Build the theme package before linting. The `a` and `b` allowances are limited to `cn.test.ts`, which tests opaque class merging. The root lint command also runs all six rules on tracked Astro templates through `astro-eslint-parser`, sharing `oxlint.config.ts`. Run `pnpm test:lint` to verify template coverage and keep `astro check` for template typing.

Keep the Base Nova Button and its colocated variant factory aligned with upstream. See `packages/astro-awesomeness/SHADCN.md` and run `pnpm check:shadcn` before committing. Preserve consumer brands and the static Astro/optional React boundary.
