---
"astro-awesomeness": patch
---

Fix a React 19 recoverable hydration error in `ThemeToggle` for visitors with a stored theme: the localStorage override is now read after mount instead of during the hydration render, so the server HTML and the client render always match. Also hydrate the toggle with `client:idle` instead of `client:load` — it is not immediately-interactive UI, and the page theme itself is still applied pre-paint by the inline script in `BaseLayout`.
