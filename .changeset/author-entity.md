---
"astro-awesomeness": minor
---

Author entity support: `postSchema.author` is now a structured object (`{ name, bio?, photoUrl?, url? }`) matching `@easeia/astro-content` 0.5.0 frontmatter, replacing the old plain-string field. New `astro/author-byline.astro` and `astro/author-card.astro` components, and an `authorName` prop on `Seo`/`BaseLayout` that emits `<meta name="author">`.
