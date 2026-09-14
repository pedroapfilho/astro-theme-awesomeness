import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  jsPlugins: ["@shadcn/lint"],
  overrides: [
    {
      files: ["packages/astro-awesomeness/src/lib/cn.test.ts"],
      rules: { "shadcn/no-unknown-classes": ["error", { allow: ["a", "b"] }] },
    },
    {
      files: ["packages/astro-awesomeness/src/components/ui/**"],
      rules: {
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
      },
    },
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
});
