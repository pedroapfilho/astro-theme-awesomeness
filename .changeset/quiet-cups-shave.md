---
"astro-awesomeness": minor
---

Export `byPubDateDesc` from `astro-awesomeness/content`, next to `notDraft`. Blogs
can now write `getCollection("posts", notDraft).toSorted(byPubDateDesc)` instead of
re-declaring the published/newest-first contract per route. The comparator is typed
structurally, so it needs no `astro:content` import.
