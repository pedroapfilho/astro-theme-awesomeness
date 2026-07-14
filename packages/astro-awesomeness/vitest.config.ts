import { defineConfig, mergeConfig } from "vitest/config";

import nodeConfig from "@repo/config-vitest/node";

// Below the preset floor: the theme's `.astro` components/layouts are invisible
// to vitest, and the React islands + tailwind preset are exercised by the demo
// Astro build, not unit tests. Set just under current actuals (44/29/22/44);
// ratchet up only.
export default mergeConfig(
  nodeConfig,
  defineConfig({
    test: {
      coverage: {
        thresholds: {
          branches: 29,
          functions: 22,
          lines: 44,
          statements: 44,
        },
      },
    },
  }),
);
