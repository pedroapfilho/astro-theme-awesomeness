import { defineConfig, mergeConfig } from "vitest/config";

import nodeConfig from "@repo/config-vitest/node";

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
