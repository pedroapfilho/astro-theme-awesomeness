import nodeConfig from "@repo/config-vitest/node";
import { defineConfig, mergeConfig } from "vitest/config";
import zodCompiler from "zod-compiler/vite";

const libraryConfig = mergeConfig(nodeConfig, defineConfig({ plugins: [zodCompiler()] }));

export default libraryConfig;
