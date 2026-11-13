---
"astro-awesomeness": major
---

The theme is now an Astro integration. It injects the article, category, tag,
archive and RSS routes, binds the content index, and takes site identity as
config. A site keeps its layouts, tokens, pages and `src/data/category-slugs.json`.
This is a breaking release with no compatibility shims.

Register it in `astro.config.ts`:

```ts
import awesomeness from "astro-awesomeness";

integrations: [
  awesomeness({
    archivePath: "postagens",
    colorScheme: "light",
    components: {
      ListLayout: "./src/components/list-layout.astro",
      PostLayout: "./src/components/post-layout.astro",
    },
    defaultCategory: "sem-categoria",
    description: "Tudo sobre arquitetura exuberante",
    ogImage: "/og-image.jpg",
    strings: {
      archive: { description: "Arquivo completo.", title: "Publicações" },
      category: { description: "Posts em {name}.", eyebrow: "Seção" },
      tag: { description: 'Posts marcados com "{name}".', eyebrow: "Tag" },
    },
    title: "Base Arquitetura",
  }),
],
```

## What moves into the integration

| In your site today                                                           | After                                                                                                                                                                |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/content.ts`                                                         | Delete. Import `content` from `virtual:astro-awesomeness/content`.                                                                                                   |
| `src/pages/[category]/[slug].astro`                                          | Delete. The route renders `components.PostLayout` with `post`.                                                                                                       |
| `src/pages/[category]/[...page].astro`, `src/pages/tag/[tag].astro`          | Delete. The routes render `components.ListLayout`; their copy comes from `strings.category` and `strings.tag`.                                                       |
| The archive page, such as `src/pages/postagens/[...page].astro`              | Delete. Set `archivePath` and `strings.archive`. A bespoke archive body becomes `components.ArchiveLayout`.                                                          |
| `src/pages/rss.xml.ts`, `@astrojs/rss`, `@astrojs/sitemap`                   | Delete. The feed uses `title` and `description`; the theme depends on both packages and registers the sitemap.                                                       |
| A page-size constant                                                         | `pageSize`, default 24.                                                                                                                                              |
| `content.categories({ includeSecondaryCategories })`                         | `includeSecondaryCategories` in the config, once. `content.categories()` takes no argument.                                                                          |
| `siteTitle`, `image`, `colorScheme` and `rssHref` on BaseLayout              | `title`, `ogImage`, `colorScheme` in the config. BaseLayout takes only the page or article props and always links `/rss.xml`. `logo` sets a separate publisher logo. |
| `siteTitle` on Footer and Seo                                                | Removed; both read the config.                                                                                                                                       |
| `trailingSlash: "always"`, `prerenderConflictBehavior: "error"`, `sitemap()` | Set by the integration.                                                                                                                                              |
| A local tag-alias loop with its own `slugify`                                | `tagAliases: "./src/lib/tag-aliases.ts"`, a module whose default export maps a tag bucket to extra route slugs. Tag buckets now carry `labels`, every raw spelling.  |
| A hand-written `vercel.json`                                                 | `astro-awesomeness vercel-json`, from `src/data/category-slugs.json` and a required `src/data/redirects.json`. Commit the output.                                    |

`ListLayout` receives `title`, `description`, an optional `eyebrow`, `posts`, and
`page` on paginated listings. `PostLayout` receives `post` and the rendered body
in its default slot; compute related posts inside it. Type both with
`ListLayoutProps` and `PostLayoutProps` from `astro-awesomeness`.

## Routing

Every URL, canonical, feed entry and listing is what 3.0.0 produced for the same
content. One 3.1.3 change is reverted: an unmapped category with an HTML-encoded
name slugs from the name as the CMS sent it again, so `Luz &amp; Sombra` routes
to `/luz-amp-sombra/`, not `/luz-sombra/`. Its display name stays decoded. Add the
category to the slug map to choose another slug.

A build now fails when two routes produce the same URL.

## Types

`CategoryOptions` is gone from `astro-awesomeness/lib`; `TagBucket` is new.
BaseLayout's article prop no longer depends on the schema's types, which a
consumer's `astro check` could not resolve under pnpm since 3.1.3.
