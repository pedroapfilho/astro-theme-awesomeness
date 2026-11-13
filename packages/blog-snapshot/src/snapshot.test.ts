import { describe, expect, it } from "vitest";
import { z } from "zod";

import { feed, page, SITE } from "./__tests__/fixtures";
import { diff } from "./diff";
import { readPage } from "./read-page";
import { buildSnapshot } from "./snapshot";

const listing = page("/", "website", ["/notes/hello/", "/2/"]);

const wildcard = { destination: "/novo/", permanent: true, source: "/old/:path*" };

const snapshotOf = (html: string, redirects: Array<object> = [wildcard]) => {
  const facts = readPage(html, new URL(`${SITE}/`));

  const stored = JSON.stringify(
    buildSnapshot({
      feedXml: feed(),
      files: [],
      pages: new Map([["/", facts]]),
      vercelJson: JSON.stringify({ redirects }),
    }),
  );

  return z.json().parse(JSON.parse(stored));
};

const changed = (html: string): Array<string> => {
  const lines = diff(snapshotOf(listing), snapshotOf(html));

  return [...new Set(lines.map((line) => line.replace(/:.*$/v, "")))];
};

describe("buildSnapshot", () => {
  it("matches a second build of the same page", () => {
    expect(changed(listing)).toEqual([]);
  });

  it.each([
    ["its body", "<p>Body of /.</p>", "", ["pages / text"]],
    ["its heading", "<h1>Page /</h1>", "", ["pages / h1", "pages / text"]],
    ["its title", "<title>Page / · Blog</title>", "", ["pages / documentTitle"]],
    [
      "its social image",
      `<meta property="og:image" content="${SITE}/og.jpg">`,
      "",
      ["pages / image"],
    ],
    [
      "its Twitter image",
      `<meta name="twitter:image" content="${SITE}/og.jpg">`,
      "",
      ["pages / twitterImage"],
    ],
    [
      "its stylesheet",
      '<link rel="stylesheet" href="/_astro/site.css">',
      "",
      ["pages / stylesheets"],
    ],
    ["a pagination link", '<a href="/2/">/2/</a>', "", ["pages / links", "pages / text"]],
    [
      "its feed link",
      '<link rel="alternate" type="application/rss+xml" href="/rss.xml">',
      "",
      ["pages / feed"],
    ],
    [
      "its fixed colour scheme",
      '<meta name="color-scheme" content="light">',
      '<meta name="color-scheme" content="light dark"><meta name="theme-color">',
      ["pages / colorScheme", "pages / themeColor"],
    ],
  ])("fails the diff when a page loses %s", (_name, lost, replacement, fields) => {
    expect(listing).toContain(lost);
    expect(changed(listing.replace(lost, replacement))).toEqual(fields);
  });

  it("fails the diff when a page loses a link whose target another link repeats", () => {
    const paged = page("/postagens/2/", "website", ["/postagens/", "/notes/hello/", "/postagens/"]);
    const previous = '<a href="/postagens/">/postagens/</a>';
    const last = paged.lastIndexOf(previous);
    const unlinked = `${paged.slice(0, last)}<span>/postagens/</span>${paged.slice(last + previous.length)}`;

    expect(paged.indexOf(previous)).toBeLessThan(last);
    expect(diff(snapshotOf(paged), snapshotOf(unlinked))).toEqual([
      'pages / links: - "/postagens/"',
    ]);
  });

  it("ignores a stylesheet's hashed file name", () => {
    const renamed = listing.replace("/_astro/site.css", "/_astro/site.B2x9.css");

    expect(changed(renamed)).toEqual([]);
  });

  it("fails the diff when a wildcard redirect becomes a literal with the same probe", () => {
    const literal = { ...wildcard, source: "/old/a/b" };
    const before = snapshotOf(listing);
    const after = snapshotOf(listing, [literal]);

    expect(before).toMatchObject({ vercel: { redirects: { "/old/a/b": "308 /novo/" } } });
    expect(after).toMatchObject({ vercel: { redirects: { "/old/a/b": "308 /novo/" } } });
    expect(diff(before, after)).toEqual([
      'vercel rules: - "308 /old/:path* -> /novo/"',
      'vercel rules: + "308 /old/a/b -> /novo/"',
    ]);
  });
});
