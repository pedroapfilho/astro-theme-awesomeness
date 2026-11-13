import { spawn } from "node:child_process";
import { access, readdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, relative } from "node:path";

import { readPage } from "./read-page.ts";
import { buildSnapshot, readFeed } from "./snapshot.ts";

const buildWithContent = async (blog: string, contentPath: string): Promise<void> => {
  const content = await readFile(contentPath);

  const server = createServer((_request, response) => {
    response.setHeader("content-type", "application/json");
    response.end(content);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  if (address === null || typeof address === "string") {
    throw new Error("The content server has no TCP port");
  }

  const child = spawn("pnpm", ["build"], {
    cwd: blog,
    env: {
      ...process.env,
      EASEIA_API_KEY: "snapshot",
      EASEIA_API_URL: `http://127.0.0.1:${address.port}`,
      EASEIA_SITE_ID: "snapshot",
    },
    stdio: ["ignore", process.stderr, process.stderr],
  });

  const code = await new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", resolve);
  });

  server.closeAllConnections();
  server.close();

  if (code !== 0) {
    throw new Error(`pnpm build exited with ${code} in ${blog}`);
  }
};

const isPublicAsset = async (blog: string, file: string): Promise<boolean> => {
  try {
    await access(join(blog, "public", file));

    return true;
  } catch {
    return false;
  }
};

const snapshotFromDist = async (blog: string) => {
  const dist = join(blog, "dist");
  const entries = await readdir(dist, { recursive: true, withFileTypes: true });

  const emitted = entries.flatMap((entry) => {
    const file = relative(dist, join(entry.parentPath, entry.name));

    return entry.isFile() && !file.startsWith("_astro/") ? [file] : [];
  });

  const assets = await Promise.all(emitted.map((file) => isPublicAsset(blog, file)));
  const built = emitted.filter((_, index) => assets[index] === false);
  const feedXml = await readFile(join(dist, "rss.xml"), "utf8");
  const site = readFeed(feedXml).link;
  const htmlFiles = built.filter((file) => file.endsWith(".html"));

  const pages = await Promise.all(
    htmlFiles.map(async (file) => {
      const path = `/${file.replace(/index\.html$/v, "")}`;
      const html = await readFile(join(dist, file), "utf8");

      return [path, readPage(html, new URL(path, site))] as const;
    }),
  );

  return buildSnapshot({
    feedXml,
    files: built.flatMap((file) => (file.endsWith(".html") ? [] : [`/${file}`])),
    pages: new Map(pages),
    vercelJson: await readFile(join(blog, "vercel.json"), "utf8"),
  });
};

export { buildWithContent, snapshotFromDist };
