import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4322";

const config = defineConfig({
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 5"] } },
  ],
  retries: 0,
  testDir: "./e2e",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "pnpm build && ASTRO_PREVIEW_BACKGROUND=0 pnpm exec astro preview --host 127.0.0.1 --port 4322",
    reuseExistingServer: false,
    timeout: 120_000,
    url: BASE_URL,
  },
  workers: 1,
});

export default config;
