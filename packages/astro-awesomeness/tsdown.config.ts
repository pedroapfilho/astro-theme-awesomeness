import { defineConfig } from "tsdown";

const config = defineConfig({
  clean: true,
  copy: [{ from: "src/styles/globals.css", to: "dist/styles/" }],
  deps: { neverBundle: ["astro", "react", "react-dom", "tailwindcss"] },
  dts: true,
  entry: [
    "src/index.ts",
    "src/components/index.ts",
    "src/content/index.ts",
    "src/lib/index.ts",
    "src/tailwind-preset.ts",
  ],
  format: "esm",
  minify: false,
  platform: "neutral",
  sourcemap: true,
  target: "es2022",
  treeshake: true,
});

export default config;
