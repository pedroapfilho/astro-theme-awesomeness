import { defineConfig } from "tsdown";

const config = defineConfig({
  clean: true,
  dts: true,
  entry: ["src/components/index.ts", "src/content/index.ts", "src/lib/index.ts"],
  format: "esm",
  minify: false,
  platform: "neutral",
  sourcemap: true,
  target: "es2022",
  treeshake: true,
});

export default config;
