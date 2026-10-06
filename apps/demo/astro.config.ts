import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import zodCompiler from "zod-compiler/vite";

const config = defineConfig({
  i18n: { defaultLocale: "en-US", locales: ["en-US"] },
  integrations: [react(), mdx(), sitemap()],
  site: "https://demo.astro-awesomeness.dev",
  trailingSlash: "always",
  vite: {
    optimizeDeps: { exclude: ["astro-awesomeness"] },
    plugins: [zodCompiler(), tailwindcss()],
    server: { allowedHosts: [".localhost"] },
  },
});

export default config;
