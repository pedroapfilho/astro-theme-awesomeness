import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";

// Self-referenced through the package name rather than "./node": vitest loads
// this config through Node's native ESM, which will not resolve an
// extensionless relative TS path.
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
