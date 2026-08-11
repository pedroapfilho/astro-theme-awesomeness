---
"astro-awesomeness": patch
---

Bump the two runtime dependencies: `lucide-react` 1.29.0 to 1.31.0 and `cnfast` 0.0.8 to 0.1.0.

Both are additive. `cnfast` 0.1.0 keeps the same `cn` signature and adds `createCn`,
`createTailwindMerge`, `getDefaultConfig` and `mergeConfigs` alongside it; the theme
still re-exports only `cn` from `astro-awesomeness/lib`, and the generated `.d.ts` is
byte-identical before and after. Consumers need no changes.
