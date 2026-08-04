---
"astro-awesomeness": minor
---

Make `postSchema` usable by the blogs that currently hand-maintain a clone of it:
`description` is now `z.string().default("")` instead of `z.string().min(1)`, so a
post with no description parses to `""` rather than failing. Every input that
parsed before still parses, and the inferred `Post` type is unchanged.

Also export `requireEnv` from `astro-awesomeness/lib`. It throws naming the missing
variable, and treats an empty string as missing.
