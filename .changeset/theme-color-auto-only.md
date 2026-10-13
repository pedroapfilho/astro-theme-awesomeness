---
"astro-awesomeness": patch
---

Emit the managed `<meta name="theme-color">` and its sync script only for `colorScheme="auto"`, and sync it as soon as the DOM is ready. Fixed-scheme sites no longer get an inline script, and a literal `theme-color` they set in the `head` slot is no longer overridden. Test files are no longer published in the tarball.
