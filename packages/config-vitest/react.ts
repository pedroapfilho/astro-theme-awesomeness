import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";

import nodeConfig from "@repo/config-vitest/node";

const reactConfig = mergeConfig(
  nodeConfig,
  defineConfig({
    plugins: [react()],
    test: {
      css: false,
      environment: "jsdom",
      setupFiles: ["@repo/config-vitest/setup-react"],
    },
  }),
);

export default reactConfig;
