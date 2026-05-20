import { defineConfig } from "tsdown";

const config = defineConfig({
  clean: true,
  copy: [{ from: "src/styles/globals.css", to: "dist/styles/" }],
  dts: true,
  entry: [
    "src/index.ts",
    "src/components/index.ts",
    "src/content/index.ts",
    "src/lib/index.ts",
    "src/tailwind-preset.ts",
  ],
  external: ["astro", "react", "react-dom", "tailwindcss"],
  format: "esm",
  platform: "neutral",
  sourcemap: true,
  target: "es2022",
  treeshake: true,
});

export default config;
