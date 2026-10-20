---
title: 'Fallow audit cannot resolve workspace TypeScript presets in baseline analysis'
severity: 'minor'
---

### Expected Behavior

After the frozen dependency install, `pnpm fallow:audit` resolves the workspace TypeScript presets for both sides of its comparison.

### Current Behavior

The command succeeds and reports no issues, but its comparison emits `Tsconfig not found @repo/typescript-config/astro.json` and `Tsconfig not found @repo/typescript-config/vite.json`, then falls back to resolver-less resolution. The current checkout has the presets and `pnpm typecheck` passes. The warnings appear during the origin/main baseline analysis.

### Possible Solution

Make the audit comparison resolve workspace presets from the baseline tree, or document which baseline checks lose type-aware resolution.

### Minimal Reproducible Example

1. Run `pnpm install --frozen-lockfile` in this workspace.
2. Run `pnpm build` and `pnpm typecheck`.
3. Change `packages/astro-awesomeness/src/lib/content-index.ts` on a branch from main.
4. Run `pnpm fallow:audit` and inspect the inherited-tsconfig warnings.

### Context

Encountered while validating content-index routing fixes. No violations were reported, but the warnings limit confidence in the baseline's type-aware analysis. No workaround or audit configuration change was applied.
