import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
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
});
