import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildVercelJson } from "./vercel-json";

const categorySlugMap = { Architecture: "arquitetura" };

const site = { redirects: [{ destination: "/b/", permanent: true, source: "/a/" }] };

const expected = buildVercelJson({ categorySlugMap, site });

const origin = process.cwd();

const { argv } = process;

const run = async (args: Array<string>, committed?: string): Promise<string> => {
  const blog = mkdtempSync(join(tmpdir(), "astro-awesomeness-"));

  mkdirSync(join(blog, "src/data"), { recursive: true });
  writeFileSync(join(blog, "src/data/category-slugs.json"), JSON.stringify(categorySlugMap));
  writeFileSync(join(blog, "src/data/redirects.json"), JSON.stringify(site));

  if (committed !== undefined) {
    writeFileSync(join(blog, "vercel.json"), committed);
  }

  process.chdir(blog);
  process.argv = ["node", "astro-awesomeness", ...args];
  vi.resetModules();
  await import("./cli");

  return readFileSync(join(blog, "vercel.json"), "utf8");
};

afterEach(() => {
  process.chdir(origin);
  process.argv = argv;
  process.exitCode = undefined;
  vi.restoreAllMocks();
});

describe("astro-awesomeness vercel-json", () => {
  it("writes vercel.json from the blog's slug map and redirect list", async () => {
    expect(await run(["vercel-json"])).toBe(expected);
  });

  it("passes the check on a current file and leaves it alone", async () => {
    expect(await run(["vercel-json", "--check"], expected)).toBe(expected);
    expect(process.exitCode).toBeUndefined();
  });

  it("fails the check on a stale file without rewriting it", async () => {
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    expect(await run(["vercel-json", "--check"], "{}\n")).toBe("{}\n");
    expect(process.exitCode).toBe(1);
    expect(stderr).toHaveBeenCalledWith(
      "vercel.json is stale. Run `astro-awesomeness vercel-json`.\n",
    );
  });

  it("rejects any other command", async () => {
    await expect(run(["deploy"])).rejects.toThrow("Usage: astro-awesomeness vercel-json [--check]");
    await expect(run([])).rejects.toThrow("Usage: astro-awesomeness vercel-json [--check]");
  });
});
