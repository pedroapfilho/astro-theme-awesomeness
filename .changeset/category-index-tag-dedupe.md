---
"astro-awesomeness": minor
---

Move category resolution into the theme and fix the chrome strings the blog audit flagged.

- `createCategoryIndex(categorySlugMap, defaultCategory, posts)` is exported from `astro-awesomeness/lib`. It groups posts by their canonical category slug (`groupByCategory`, with the `includeSecondaryCategories` option), resolves a slug's display name (`categoryName`) and gives a post's eyebrow the same resolved name as its category page (`postCategory`). When a slug is shared by a mapped category and a native one (`Architecture` mapped to `arquitetura` next to `Arquitetura`), the native name wins; otherwise the first name registered for the slug is used. Blogs bind it once with their `category-slugs.json` and post collection instead of carrying their own copy.
- `TagList` collapses tags that share a slug onto the first occurrence and strips a leading `#` from the chip text. Hrefs are unchanged. `uniqueTags` and `tagLabel` are exported from `astro-awesomeness/lib` for blogs that render chips inline.
- `Seo` and `BaseLayout` accept `siteTitle` for the document title: `<title>` becomes `Title · Site` whenever the page title differs from the site title, while `og:title` stays the bare page title. Pass `siteTitle` from every page instead of concatenating it into `title`.
- `Seo` and `BaseLayout` accept `noindex`, which emits `<meta name="robots" content="noindex,follow">` in place of the canonical link. Use it on the 404 page.
- The skip link reads "Pular para o conteúdo" when `lang` starts with `pt`.
