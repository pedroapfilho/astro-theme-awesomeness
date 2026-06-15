---
"astro-awesomeness": minor
---

feat(layouts): render TOC + related posts; postHref to compose with createPostUrl

Wires three shipped-but-unused capabilities into the theme:

- `PostLayout` now renders a table of contents (from `render(post).headings`)
  via the optional `headings` prop, and a related-posts section via the optional
  `relatedPosts` / `relatedHeading` props. The page computes related posts with
  `getRelatedPosts`, keeping the layout pure.
- New optional `postHref?: (post) => string` callback on `PostCard`, `ListLayout`,
  and `PostLayout` lets consumers compose `createPostUrl`'s `/<category>/<slug>/`
  scheme with the cards the layouts render internally. Defaults to `/blog/${post.id}`,
  preserving existing behaviour.

All new props are optional with defaults, so existing consumers are unaffected.
