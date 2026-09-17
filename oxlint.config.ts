import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  // Generated runtime is byte-verified and tested in the control plane.
  ignorePatterns: [".github/ci/*.mjs"],
  jsPlugins: ["@shadcn/lint"],
  overrides: [
    {
      files: ["**/*.astro"],
      rules: {
        // Astro frontmatter runs per render, not once when a server module loads.
        "react-doctor/no-impure-call-at-module-scope": "off",
        // This JS plugin cannot see imports referenced only by Astro template markup.
        "unused-imports/no-unused-imports": "off",
      },
    },
  ],
  rules: {
    "shadcn/no-arbitrary-values": "error",
    "shadcn/no-inline-styles": "error",
    "shadcn/no-raw-colors": "error",
    "shadcn/no-restyle": [
      "error",
      {
        allow: ["layout"],
        contracts: [
          {
            allow: ["layout", "gap-*"],
            pattern: "^PopoverTrigger$",
          },
        ],
      },
    ],
    "shadcn/no-unknown-classes": "error",
    "shadcn/require-static-classes": "error",
  },
  settings: {
    shadcn: { componentImports: ["^astro-awesomeness/(astro|layouts|components)(/|$)"] },
  },
});
