# AGENTS.md

`astro-theme-awesomeness` is the Turborepo home of the published Astro 6/7
blog theme `astro-awesomeness`, an Astro integration, and the demo blog that
exercises it. Library
profile in standy: no DB, no auth, no email infra.

## Friction Log

- Log papercuts and friction (tooling, docs, APIs, tests, conventions) as you hit them with `npx frog log`.
- Do not add global, system, or internal friction.
- Run `npx frog list` first to see what is already known.

Entries live in `.agents/friction-log/`, one directory each. A GitHub Action reports them as issues and deletes the entry once the issue closes, so anything still in that directory is still outstanding.

## Standards

This repo follows the fleet's shared standards, checked by `standy` (`~/dev/standy`).

- Before editing, run `standy standards --for <paths>` for the rules that apply to the files you will touch.
- Before finishing, run `standy check --changed --fix-hints` and fix what fails. It only sees tracked files, so run `git add -N` on new files first.
- When a failure is unclear, `standy explain <rule>` prints what the rule asserts, why, and how to fix it.

## Stack

- **Astro 6/7** (peer dep `^6.0.0 || ^7.0.0`) for consumer blogs; the demo runs Astro 7
- **React 19** for the optional theme-toggle island and Button
- **Tailwind CSS v4** with a shared stylesheet; per-blog font/accent overrides via `@theme`
- **shadcn-style wrappers over @base-ui/react** + **lucide-react**
- **zod 4** for content collection schemas (`postSchema`, `authorSchema`)
- **tsdown** for the package build; `.astro` files ship as source via `./astro/*` and `./layouts/*` exports
- **Vitest 5** for package unit tests in Node
- **changesets** for versioned releases (demo app is ignored)
- **oxlint + oxfmt** via `oxlint-config-awesomeness`
- **fallow** for dead-code / dupes / health audits
- **pnpm 11.13.1**, **turbo 2**, **node >=24**

## Layout

```
apps/
  demo/                       # Astro reference blog: dev loop + showcase
    astro.config.ts           # registers the integration: identity, layouts, route copy
    src/components/           # demo-owned site layout (header, footer), cards and list/post layouts
    src/content/posts/        # local posts with CMS-shaped frontmatter
    src/data/                 # category-slugs.json
    src/pages/                # the homepage and 404; every content route is injected
packages/
  astro-awesomeness/          # published npm package (the theme)
    src/index.ts              # the integration: injects routes, registers virtual modules
    src/integration/          # config schema and the virtual-modules Vite plugin
    src/routes/               # injected article, category, tag, archive and RSS routes
    src/astro/                # static building blocks (footer, seo, pagination, …)
    src/components/           # shadcn React primitives and public entry
    src/compositions/         # product React islands (theme-toggle)
    src/layouts/              # base-layout.astro: page/article metadata and slots
    src/content/              # post/author schemas and normalized heroImage
    src/lib/                  # content index, cn and internal component helpers
    src/styles/               # globals.css (shipped as `astro-awesomeness/styles.css`)
    src/vercel/               # vercel.json generator and the `astro-awesomeness` bin
    virtual.d.ts              # types of the public virtual modules
  blog-snapshot/              # private: routing snapshots of a blog checkout or production site
  config-typescript/          # @repo/typescript-config (base, vite, astro)
  config-vitest/              # @repo/config-vitest (node)
.changeset/                   # changeset config (ignores `demo`)
oxlint.config.ts              # extends oxlint-config-awesomeness
```

## Dev workflow

From the repo root (all turbo-fanned):

```sh
pnpm install
pnpm dev                      # demo app + package watch
pnpm build                    # tsdown package + astro build demo
pnpm lint                     # oxlint across workspaces + design-system rules on .astro
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
pnpm fallow:health            # quick health score
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

- `astro-awesomeness`: the integration (`src/index.ts`) and the `ListLayoutProps`,
  `PostLayoutProps`, `TagAliases` and config types
- `astro-awesomeness/routes/*`: the injected route sources in `src/routes/`
- `astro-awesomeness/components`: React islands (`src/components/index.ts`)
- `astro-awesomeness/astro/*`: raw `.astro` components in `src/astro/`
- `astro-awesomeness/layouts/base-layout`: page/article document layout with `head`,
  `header`, default and `footer` slots; no React imports
- `astro-awesomeness/content`: post/author schemas and types (`src/content/index.ts`)
- `astro-awesomeness/lib`: `cn`, `createContentIndex` and its types (`src/lib/index.ts`)
- `astro-awesomeness/styles.css`: `src/styles/globals.css`, with tokens, base styles,
  prose and the dark variant

The package README documents every component and member.

There is no Tailwind preset export. The `astro-awesomeness` bin writes a blog's
`vercel.json` (`astro-awesomeness vercel-json [--check]`).

The Astro, layouts and routes entries ship as source on purpose; Astro needs the
component files at build time. Don't move them into the bundled output. Source
that an `.astro` file reaches by relative import must not import a dependency's
types: under pnpm a consumer's `astro check` resolves those files by their
symlinked path and cannot see the theme's dependencies.

## Blog snapshots

`pnpm snapshot` (`packages/blog-snapshot`) records what a blog serves, so a theme
or blog change can be checked against a fixed copy of its content:

```sh
pnpm snapshot capture --site https://www.example.com --blog ../blog --archive postagens --default-category sem-categoria --out snapshots/blog
pnpm snapshot record --blog ../blog --content snapshots/blog/content.json --out after.json
pnpm snapshot diff snapshots/blog/baseline.json after.json
```

`capture` crawls the production sitemap and writes `content.json`, a copy of the
posts in the Easeia build API shape with everything routing reads (slugs, dates,
categories, tags, authors) and no bodies or images, and `production.json`.
`record` serves that copy to the blog's own `pnpm build` and snapshots `dist`.
Per page: the document title, description, canonical, robots, colour scheme, feed
link, social images, article times, JSON-LD author and publisher logo, every
same-origin link, the `h1`, a fingerprint of the visible text and the number of
stylesheets. Then the feed, and `vercel.json` as its sorted rules plus one probe
per redirect. Build the theme first.

## Conventions

- All source files kebab-case; types/classes PascalCase; vars/fns camelCase.
- `types` over `interfaces`; arrow functions; exports at end of file.
- No `as any`, strict TS, no silent failures.
- `.astro` components live in `src/astro/`; React primitives in `src/components/` and product islands in `src/compositions/`.
- Content schemas in `src/content/`; consumer apps import via `astro-awesomeness/content`.
- The integration sets `optimizeDeps.exclude: ["astro-awesomeness"]`, so Vite never
  pre-bundles the package's source entries.

## Library profile (standy)

Validated by `standy verify` against
its profile base, `acme-package`. Skipped checks: e2e (saas-only),
auth-config, prisma-config, turbo-db-generate-ordering, i18n-\*, landing-urls,
e2e-auth-emails. Seven workflows gate PRs: `lint` (formatting, dead code and
oxlint as steps of one job), `test`, `typecheck`, `build`, `e2e` (the demo's
Playwright suite), `publish-checks` and a `react-doctor` scan. The first six also
run on a weekly schedule and manual dispatch; `react-doctor` runs on pull requests
only. None run on pushes to main. `release.yml` runs on pushes to main, and
`friction-log.yml` reports the Frog friction log.

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
  `i18n: { defaultLocale: "en-US", locales: ["en-US"] }`.
  Labels support English and Portuguese, defaulting to English for other locales.
- **The integration owns routing.** `awesomeness()` injects the article, category,
  tag, archive and RSS routes, sets `trailingSlash: "always"` and
  `prerenderConflictBehavior: "error"`, and adds the sitemap. A site never adds
  pages at those paths.
- **One content index per site.** The integration binds `createContentIndex` to the
  `posts` collection in `virtual:astro-awesomeness/content`. It filters drafts,
  orders posts by publication date with an ID tie-breaker, and owns post URLs,
  route params, category/tag buckets, related posts and feed items. Use its
  methods everywhere so archives, links and RSS agree.
- **Unmapped categories slug from the name as the CMS sent it.** `Luz &amp; Sombra`
  routes to `/luz-amp-sombra/`, as in 3.0.0. Display names are decoded.
- **Site identity is config.** Title, description, images and color scheme are
  integration options, read from `virtual:astro-awesomeness/config`. BaseLayout
  and Seo accept either `title` and `description` for a page, or `post` for an
  article. Canonical,
  `og:url` and JSON-LD `mainEntityOfPage.@id` derive from the route pathname on
  `Astro.site`. `seo.canonical_url` influences content route selection only.
- **Consumers own presentation.** The demo wraps BaseLayout in its own site layout
  (header, footer, stylesheet) and names its list/post layouts in the integration's
  `components` option; the injected routes render them. The theme ships no default
  layouts. `colorScheme: "light"` or `"dark"` fixes the scheme without a theme
  initialization script; `"auto"` follows a stored preference or the system
  preference.
- **Changesets ignores `demo`.** Only `astro-awesomeness` is published; demo
  is a dev playground.

## References

- Theme on npm: https://www.npmjs.com/package/astro-awesomeness
- Astro docs: https://docs.astro.build
- Tailwind v4: https://tailwindcss.com
- standy (verification + standards): `~/dev/standy`
- Consumer blogs (12 repos, `blog` profile): see standy's `CLAUDE.md` for the list

## Design-system linting

Run `pnpm lint` after changes and fix every error. `oxlint.config.ts` registers `@shadcn/lint` and enforces all six rules as errors: component contracts, known Tailwind classes, static component class names, semantic colors, theme or scale values, and class-based styling. Use CSS custom properties for runtime geometry and named theme tokens for custom values. Use component variants for appearance and layout classes at call sites. All six rules also apply inside primitive directories. Shared styles belong to component variants or the owning stylesheet. Keep theme discovery local to each app.

The shared package's `components.json` points to the demo's complete Tailwind entry, because the distributed stylesheet is a theme fragment that consumers load after Tailwind. Build the theme package before linting. The root lint command also runs all six rules on tracked Astro templates through `astro-eslint-parser`, sharing `oxlint.config.ts`. Run `pnpm test:lint` to verify template coverage and keep `astro check` for template typing.

Keep the Base Nova Button and its colocated variant factory aligned with upstream. See `packages/astro-awesomeness/SHADCN.md` and run `pnpm check:shadcn` before committing. Preserve consumer brands and the static Astro/optional React boundary.
