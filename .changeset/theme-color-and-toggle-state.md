---
"astro-awesomeness": minor
---

BaseLayout keeps `<meta name="theme-color">` in sync with the computed page background, including after the color scheme changes, so browser chrome follows the consumer's `--color-background` token. Anchor links scroll smoothly unless the visitor prefers reduced motion.

ThemeToggle is now a toggle button: it exposes `aria-pressed` for dark mode, so screen readers announce the new state, and its default `ariaLabel` changes from "Toggle theme" to "Dark mode". Consumers passing a translated label should name dark mode (e.g. "Modo escuro") instead of an action.
