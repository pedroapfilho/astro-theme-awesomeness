import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { z } from "zod";

import { buildWithContent, snapshotFromDist } from "./build";
import { contentFromPages } from "./content";
import { diff } from "./diff";
import { crawlProduction } from "./production";
import { buildSnapshot } from "./snapshot";

const USAGE = `Usage:
  blog-snapshot capture --site <origin> --blog <checkout> --archive <path> --default-category <slug> --out <dir>
  blog-snapshot record --blog <checkout> --content <content.json> --out <snapshot.json>
  blog-snapshot diff <before.json> <after.json>`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    archive: { type: "string" },
    blog: { type: "string" },
    content: { type: "string" },
    "default-category": { type: "string" },
    out: { type: "string" },
    site: { type: "string" },
  },
});

const required = (name: keyof typeof values): string => {
  const value = values[name];

  if (value === undefined) {
    throw new Error(`--${name} is required.\n${USAGE}`);
  }

  return value;
};

const readJson = async (path: string) => z.json().parse(JSON.parse(await readFile(path, "utf8")));

const capture = async (): Promise<void> => {
  const blog = required("blog");
  const out = required("out");

  const [production, pageFiles, categorySlugs, vercelJson] = await Promise.all([
    crawlProduction(required("site")),
    readdir(join(blog, "src/pages")),
    readJson(join(blog, "src/data/category-slugs.json")),
    readFile(join(blog, "vercel.json"), "utf8"),
  ]);

  const content = contentFromPages(production.pages, {
    archivePath: required("archive"),
    categorySlugMap: z.record(z.string(), z.string()).parse(categorySlugs),
    defaultCategory: required("default-category"),
    staticPages: pageFiles.flatMap((file) =>
      file.endsWith(".astro") && !file.startsWith("[") ? [file.replace(/\.astro$/v, "")] : [],
    ),
  });

  const snapshot = buildSnapshot({ ...production, vercelJson });
  await mkdir(out, { recursive: true });

  await Promise.all([
    writeFile(join(out, "content.json"), `${JSON.stringify(content, undefined, 1)}\n`),
    writeFile(join(out, "production.json"), `${JSON.stringify(snapshot, undefined, 1)}\n`),
  ]);
  process.stdout.write(`${content.data.length} posts, ${production.pages.size} pages\n`);
};

const record = async (): Promise<void> => {
  const blog = required("blog");
  await buildWithContent(blog, required("content"));
  const snapshot = await snapshotFromDist(blog);
  await writeFile(required("out"), `${JSON.stringify(snapshot, undefined, 1)}\n`);
};

const compare = async (before: string, after: string): Promise<void> => {
  const [left, right] = await Promise.all([readJson(before), readJson(after)]);
  const differences = diff(left, right);
  const report = differences.length === 0 ? "Snapshots match." : differences.join("\n");
  process.stdout.write(`${report}\n`);
  process.exitCode = differences.length === 0 ? 0 : 1;
};

const [command, before, after] = positionals;

if (command === "capture") {
  await capture();
} else if (command === "record") {
  await record();
} else if (command === "diff" && before !== undefined && after !== undefined) {
  await compare(before, after);
} else {
  throw new Error(USAGE);
}
