---
"astro-awesomeness": patch
---

fix(a11y): label CommandMenu dialog for screen readers

`CommandMenu` rendered a dialog with no accessible name, so screen readers
announced only "dialog" (WCAG 4.1.2). It now renders a visually-hidden
`DialogTitle` as the first child of the dialog. Adds an optional `title` prop
(default `"Search posts"`) to override the accessible name.
