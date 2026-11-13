import { defineConfig, mergeConfig } from "vitest/config";

import libraryConfig from "@repo/config-vitest/library";

export default mergeConfig(
  libraryConfig,
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
