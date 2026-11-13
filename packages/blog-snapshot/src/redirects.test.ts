import { describe, expect, it } from "vitest";

import { redirectSchema, resolveRedirects } from "./redirects";

const table = (rows: Array<object>) =>
  resolveRedirects(rows.map((row) => redirectSchema.parse(row)));

describe("resolveRedirects", () => {
  it("resolves one probe per rule against the whole ordered list, as Vercel's first match does", () => {
    expect(
      table([
        { destination: "/sitemap-index.xml", permanent: true, source: "/post-sitemap:n.xml" },
        { destination: "/novo", permanent: true, source: "/old" },
        { destination: "/novo/:path*", permanent: true, source: "/old/:path*" },
        { destination: "/novo/", permanent: true, source: "/old/" },
        { destination: "/novo/:path*/", permanent: true, source: "/old/:path*/" },
        { destination: "/:slug/", source: "/categoria/:slug" },
      ]),
    ).toEqual({
      "/categoria/a": "307 /a/",
      "/old": "308 /novo",
      "/old/": "308 /novo/",
      "/old/a/b": "308 /novo/a/b",
      "/old/a/b/": "308 /novo/a/b/",
      "/post-sitemapa.xml": "308 /sitemap-index.xml",
    });
  });

  it("shows a rule shadowed by an earlier one and applies query conditions", () => {
    expect(
      table([
        { destination: "/first/", permanent: true, source: "/a/:path*/" },
        { destination: "/never/", permanent: true, source: "/a/b/" },
        {
          destination: "/rss.xml",
          has: [{ key: "feed", type: "query" }],
          permanent: true,
          source: "/",
        },
      ]),
    ).toEqual({ "/?feed": "308 /rss.xml", "/a/a/b/": "308 /first/", "/a/b/": "308 /first/" });
  });
});
