import { defineConfig, mergeConfig } from "vitest/config";

import nodeConfig from "@repo/config-vitest/node";

export default mergeConfig(
  nodeConfig,
  defineConfig({
    test: {
      coverage: {
        thresholds: {
          branches: 79,
          functions: 68,
          lines: 77,
          statements: 77,
        },
      },
    },
  }),
);
