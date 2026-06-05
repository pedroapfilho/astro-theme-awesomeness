---
"astro-awesomeness": minor
---

Add `createPostUrl(categorySlugMap, defaultCategory)` factory and `notDraft` predicate to absorb ~50 LOC of duplication per downstream blog. Extend `postSchema` with the fields every Unlockers WordPress migration blog already adds locally (`status`, `categories`, `heroImageUrl`, `heroImageWidth`, `heroImageHeight`, `slug`, `seo.canonical_url`). New exports from `astro-awesomeness/lib` (`createPostUrl`, `PostLike`, `PostParams`, `PostUrlBuilder`) and `astro-awesomeness/content` (`notDraft`).
