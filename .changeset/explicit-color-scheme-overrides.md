---
"astro-awesomeness": patch
---

Force `color-scheme` to match the toggled theme in both directions. `:root` declares `light dark`, so the browser followed the OS preference for native UI (scrollbars, form controls) regardless of the `.dark` class. Now `.dark` forces `color-scheme: dark` and `:root:not(.dark)` forces `color-scheme: light`, so a light-OS visitor toggled to dark and a dark-OS visitor toggled to light both get native surfaces that match the page theme.
