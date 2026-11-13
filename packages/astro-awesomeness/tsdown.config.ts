import { defineConfig } from "tsdown";

const config = defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/components/index.ts",
    "src/content/index.ts",
    "src/lib/index.ts",
    "src/vercel/cli.ts",
  ],
  fixedExtension: false,
  format: "esm",
  minify: false,
  platform: "node",
  sourcemap: true,
  target: "es2022",
  treeshake: true,
});

export default config;
