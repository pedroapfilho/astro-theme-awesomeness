#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";

import { z } from "zod";

import { buildVercelJson, vercelJsonOptionsSchema } from "./vercel-json";

const OUTPUT = "vercel.json";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { check: { default: false, type: "boolean" } },
});

if (positionals.length !== 1 || positionals[0] !== "vercel-json") {
  throw new Error("Usage: astro-awesomeness vercel-json [--check]");
}

const readJson = async (path: string) => z.json().parse(JSON.parse(await readFile(path, "utf8")));

const [categorySlugMap, site] = await Promise.all([
  readJson("src/data/category-slugs.json"),
  readJson("src/data/redirects.json"),
]);

const options = vercelJsonOptionsSchema.parse({ categorySlugMap, site });

const generated = buildVercelJson(options);

if (!values.check) {
  await writeFile(OUTPUT, generated);
} else if ((await readFile(OUTPUT, "utf8")) !== generated) {
  process.stderr.write(`${OUTPUT} is stale. Run \`astro-awesomeness vercel-json\`.\n`);
  process.exitCode = 1;
}
