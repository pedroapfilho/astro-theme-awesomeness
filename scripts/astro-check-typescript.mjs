import { registerHooks } from "node:module";

const legacyTypeScriptUrl = import.meta.resolve("@typescript/typescript6");

registerHooks({
  resolve: (specifier, context, nextResolve) =>
    specifier === "typescript"
      ? { shortCircuit: true, url: legacyTypeScriptUrl }
      : nextResolve(specifier, context),
});
