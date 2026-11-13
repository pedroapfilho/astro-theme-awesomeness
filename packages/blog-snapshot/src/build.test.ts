import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildWithContent, snapshotFromDist } from "./build";
import { feed, page, pages } from "./__tests__/fixtures";

const blogWith = (files: Record<string, string>): string => {
  const blog = mkdtempSync(join(tmpdir(), "blog-snapshot-"));

  for (const [file, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(blog, file)), { recursive: true });
    writeFileSync(join(blog, file), contents);
  }

  return blog;
};

const manifest = (build: string): string =>
  JSON.stringify({ name: "fake-blog", private: true, scripts: { build } });

const fetchContent = `import { writeFileSync } from "node:fs";

const { EASEIA_API_KEY, EASEIA_API_URL, EASEIA_SITE_ID } = process.env;
const response = await fetch(EASEIA_API_URL + "/sites/" + EASEIA_SITE_ID + "/posts");

writeFileSync("served.json", JSON.stringify({ key: EASEIA_API_KEY, posts: await response.json() }));
`;

describe("snapshotFromDist", () => {
  it("snapshots the built pages, the feed and the resolved redirects, without assets", async () => {
    const headers = [{ headers: [{ key: "X-Frame-Options", value: "DENY" }], source: "/(.*)" }];
    const { "/": home, "/notes/hello/": article } = pages();

    const blog = blogWith({
      "dist/_astro/app.css": "",
      "dist/404.html": page("/404.html", "website", []),
      "dist/favicon.svg": "",
      "dist/index.html": home ?? "",
      "dist/notes/hello/index.html": article ?? "",
      "dist/rss.xml": feed(),
      "dist/sitemap-index.xml": "",
      "public/favicon.svg": "",
      "vercel.json": JSON.stringify({
        headers,
        redirects: [{ destination: "/rss.xml", permanent: true, source: "/feed" }],
      }),
    });

    expect(await snapshotFromDist(blog)).toEqual({
      feed: {
        description: "A blog.",
        items: [
          {
            description: "First post.",
            link: "https://www.example.com/notes/hello/",
            pubDate: "Fri, 02 Jan 2026 00:00:00 GMT",
            title: "Hello",
          },
        ],
        title: "Blog",
      },
      files: ["/rss.xml", "/sitemap-index.xml"],
      pages: {
        "/": {
          canonical: "https://www.example.com/",
          description: "About /",
          posts: ["/notes/hello/"],
          title: "Page /",
        },
        "/404.html": {
          canonical: "https://www.example.com/404.html",
          description: "About /404.html",
          posts: [],
          title: "Page /404.html",
        },
        "/notes/hello/": {
          canonical: "https://www.example.com/notes/hello/",
          description: "About /notes/hello/",
          posts: [],
          tags: ["/tag/astro/"],
          title: "Page /notes/hello/",
        },
      },
      vercel: { headers, redirects: { "/feed": "308 /rss.xml" } },
    });
  });
});

describe("buildWithContent", () => {
  it("serves the saved copy to the blog's own build as its CMS", async () => {
    const posts = { data: [{ slug: "hello" }] };

    const blog = blogWith({
      "build.mjs": fetchContent,
      "content.json": JSON.stringify(posts),
      "package.json": manifest("node build.mjs"),
    });

    await buildWithContent(blog, join(blog, "content.json"));

    const served = readFileSync(join(blog, "served.json"), "utf8");

    expect(JSON.parse(served)).toEqual({ key: "snapshot", posts });
  });

  it("fails when the blog's build fails", async () => {
    const blog = blogWith({
      "content.json": "{}",
      "package.json": manifest("node -e 'process.exit(1)'"),
    });

    await expect(buildWithContent(blog, join(blog, "content.json"))).rejects.toThrow(
      `pnpm build exited with 1 in ${blog}`,
    );
  });
});
