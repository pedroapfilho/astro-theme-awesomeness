---
"astro-awesomeness": patch
---

Type-aware linting changed the shape of the published type declarations, with
no runtime behavior change.

- `notDraft` is no longer generic. It now takes
  `{ data: { draft?: boolean; status?: string } }` directly instead of inferring
  a type parameter, so callers passing a wider post object still typecheck but
  no longer get the argument type echoed back.
- Around 20 exported components moved from `declare function X(...)` to
  `declare const X: (...) => React.JSX.Element`, so they are no longer hoisted
  declarations in the `.d.ts`.

Consumer typechecks pass unchanged (`exactOptionalPropertyTypes` is off).
