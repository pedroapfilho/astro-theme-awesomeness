import { defineConfig } from "vitest/config";

const config = defineConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});

export default config;
