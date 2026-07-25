import { defineConfig } from "oxlint";
import awesomeness from "oxlint-config-awesomeness";

export default defineConfig({
  extends: [awesomeness],
  ignorePatterns: ["**/*.astro"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
