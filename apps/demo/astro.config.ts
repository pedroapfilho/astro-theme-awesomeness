import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import awesomeness from "astro-awesomeness";
import { defineConfig } from "astro/config";
import zodCompiler from "zod-compiler/vite";

const config = defineConfig({
  i18n: { defaultLocale: "en-US", locales: ["en-US"] },
  integrations: [
    react(),
    mdx(),
    awesomeness({
      components: {
        ListLayout: "./src/components/list-layout.astro",
        PostLayout: "./src/components/post-layout.astro",
      },
      defaultCategory: "notes-field",
      description: "The reference blog for astro-awesomeness.",
      pageSize: 2,
      strings: {
        archive: { description: "Every story, starting with the latest.", title: "All posts" },
        category: { description: "Stories in {name}." },
        tag: { description: "Stories about {name}.", title: "Tagged “{name}”" },
      },
      title: "Awesomeness",
    }),
  ],
  site: "https://demo.astro-awesomeness.dev",
  vite: {
    plugins: [zodCompiler(), tailwindcss()],
    server: { allowedHosts: [".localhost"] },
  },
});

export default config;
