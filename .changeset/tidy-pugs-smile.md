---
"astro-awesomeness": minor
---

Export `categoryLabel` from `astro-awesomeness/lib`, next to `createPostUrl`.

WordPress migrations stored category names HTML-encoded, and the content API hands
them back the same way, so `post.data.categories` and the keys of a blog's
`category-slugs.json` both carry raw entities like `Arte &amp; Design`. Every blog
built on this theme had grown its own decoder for display, and the twelve copies had
drifted into three incompatible variants (a one-line `&amp;` replace at one end, a
hardened decoder at the other). This is that decoder, once, with unit tests.

`categoryLabel(name)` decodes named entities (`&amp;`, `&hellip;`, `&ndash;`, the
quote and space family) plus decimal and hexadecimal numeric escapes, and leaves
anything it does not recognise as literal text. Three behaviours are deliberate:

- `mdash` is absent from the entity table and U+2014 is refused in the numeric
  branch, so an encoded em-dash stays encoded instead of being decoded into a
  character these blogs ban. `&#8212;` and `&#x2014;` pass through unchanged.
- Out-of-range code points pass through instead of reaching `String.fromCodePoint`,
  which throws past the Unicode range and would fail a whole static build over one
  malformed entity.
- The named lookup is guarded by `Object.hasOwn`, so `&constructor;` cannot resolve
  up the prototype chain and render `Function.prototype.toString` into a page.

Decoding is display-only. `createPostUrl` is untouched: it still resolves a slug by
the raw, still-encoded category name the content API sends. Pass decoded names to
your templates, never to the slug map, or the URLs of every affected post move.
