---
"astro-awesomeness": major
---

**BREAKING:** `base-layout.astro` no longer renders a header or a footer. It now
exposes two named slots, `header` and `footer`, and renders whatever you put in
them. Passing `siteTitle` still sets the SEO `og:site_name` fallback and the RSS
autodiscovery link title, but it no longer conjures the theme's `Header` (with its
`ThemeToggle` island) and `Footer` into the page.

The theme's own `list-layout.astro` and `post-layout.astro` fill those slots, so
if you use those layouts nothing changes: pass `siteTitle` and you still get the
header and footer exactly as before, in the same DOM position.

If you import `base-layout` directly and relied on `siteTitle` to render chrome,
fill the slots yourself:

```astro
<BaseLayout title={title} description={description} siteTitle={SITE}>
  <Header slot="header" siteTitle={SITE} />
  <main id="main-content">…</main>
  <Footer slot="footer" siteTitle={SITE} />
</BaseLayout>
```

Why this is worth a major: `base-layout` statically imported `header.astro`, which
renders `<ThemeToggle client:idle />`, which pulls `Button`, `lucide-react` and
`@base-ui/react`. That chain sat in every consumer's Vite graph whether or not the
branch was ever taken, which is why blogs that hydrate nothing still had to install
`react`, `react-dom` and `@astrojs/react`. Importing `base-layout` alone now pulls
in no React at all.

**BREAKING:** removed `CommandMenu` (plus `CommandMenuItem` / `CommandMenuProps`),
the `Command*` primitives and the `Dialog*` primitives from
`astro-awesomeness/components`, and dropped the `cmdk` dependency. Nothing in the
theme or the demo rendered them. `Button`, `buttonVariants` and `ThemeToggle` are
unchanged, and `@base-ui/react` plus `lucide-react` stay (`Button` and
`ThemeToggle` use them). If you were rendering `CommandMenu`, vendor it into your
own app: install `cmdk` and copy the component.

The 12 consumer blogs need no changes for either break. They import
`astro-awesomeness/layouts/base-layout` and pass only `title`, `description`,
`lang` and `image`, they render their own local header, and none of them import
`astro-awesomeness/components`.

**React is now an optional peer.** `react` and `react-dom` keep their `^19.0.0`
peer ranges but are marked `optional` in `peerDependenciesMeta`, because whether
you need React now depends on which entry you import:

- **Only `astro-awesomeness/layouts/base-layout`, `astro-awesomeness/astro/*`
  (except `header`), `/content`, `/lib`, `/tailwind` or `/styles.css`:** you may
  drop `react`, `react-dom` and `@astrojs/react` entirely, and remove `react()`
  from your `astro.config` integrations. Verified against a scratch consumer with
  none of them installed: `astro build` succeeds and emits zero `<astro-island>`
  markers.
- **The bundled `layouts/list-layout` or `layouts/post-layout`, or
  `astro/header`, or anything from `astro-awesomeness/components`:** you still
  need React and the `@astrojs/react` renderer. Those render
  `<ThemeToggle client:idle />`. Without the renderer, `astro build` fails with
  `NoMatchingRenderer: Unable to render ThemeToggle` (exit 1) and points you at
  `@astrojs/react`.

One honest limitation: the optional peer changes what the package _requires_ of
you, not what ends up in `node_modules`. `@base-ui/react` and `lucide-react` are
still hard dependencies of this package (`Button` and `ThemeToggle` need them) and
both declare `react` as a required peer, so package managers will still place
react, react-dom, scheduler and use-sync-external-store inside this package's own
subtree. They are not hoisted to your project root, so your code cannot import
them, and none of it reaches your built output.

This release also carries the three unreleased minor additions on `main`
(`byPubDateDesc`, the `colorScheme` prop, the widened `postSchema` plus
`requireEnv`), so the next published version is a single major.
