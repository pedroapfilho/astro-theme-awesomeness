import { execFileSync } from "node:child_process";

import { ESLint } from "eslint";

import config from "../eslint.astro.config.mjs";

const files = execFileSync("git", ["ls-files", "-z", "--", "*.astro"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const eslint = new ESLint({ overrideConfig: config, overrideConfigFile: true });
const results = await eslint.lintFiles(files);
const formatter = await eslint.loadFormatter("stylish");
process.stdout.write(formatter.format(results));
if (results.some(({ errorCount, warningCount }) => errorCount + warningCount > 0)) {
  process.exitCode = 1;
}
