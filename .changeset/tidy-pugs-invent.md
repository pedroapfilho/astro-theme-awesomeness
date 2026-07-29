---
"astro-awesomeness": minor
---

`TagList` now links to `/tag/<slug>/` instead of `/tags/<slug>`.

The missing trailing slash pointed chips at URLs that no sitemap entry covered, and the `/tags` default did not match the `/tag/[tag]` route every consuming blog ships. The href is now built by a new exported `tagUrl(tag, base)` helper (with `DEFAULT_TAG_BASE`) so the shape is unit-tested rather than inlined in the component.

Breaking for consumers routing on `/tags`: pass `base="/tags"` to keep the old prefix. The trailing slash is not opt-out.
