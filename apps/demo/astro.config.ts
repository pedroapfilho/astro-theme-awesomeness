import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const config = defineConfig({
  integrations: [react(), mdx(), sitemap()],
  site: "https://demo.astro-awesomeness.dev",
  vite: {
    optimizeDeps: { exclude: ["astro-awesomeness"] },
    plugins: [tailwindcss()],
  },
});

export default config;
