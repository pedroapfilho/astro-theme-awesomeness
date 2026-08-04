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

This release also carries the three unreleased minor additions on `main`
(`byPubDateDesc`, the `colorScheme` prop, the widened `postSchema` plus
`requireEnv`), so the next published version is a single major.
