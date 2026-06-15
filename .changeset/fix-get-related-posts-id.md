---
"astro-awesomeness": minor
---

fix: key getRelatedPosts on id to match Astro 5/6 entry shape

`getRelatedPosts` deduped the current post on `post.slug`, which Astro 5/6
content-layer entries do not have (they are keyed by `id`). Against real
entries every comparison was `undefined === undefined`, so the function
returned an empty array. It now keys on `id`, matching the rest of the theme.
