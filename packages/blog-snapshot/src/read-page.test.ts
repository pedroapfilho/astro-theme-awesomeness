import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { readPage } from "./read-page";

const html = `<!doctype html><html><head>
<title>Luz &amp; Sombra · Blog</title>
<meta name="description" content="Tudo sobre &quot;luz&quot;">
<meta name="robots" content="noindex,follow">
<meta name="color-scheme" content="light dark">
<meta name="theme-color">
<link rel="canonical" href="https://www.example.com/luz-amp-sombra/post/">
<link rel="alternate" type="application/rss+xml" title="Blog" href="/rss.xml">
<link rel="stylesheet" href="/_astro/site.D4f1.css">
<link rel="preload" as="style" href="/_astro/later.css">
<style>h1 { color: red }</style>
<meta property="og:type" content="article">
<meta property="og:title" content="Luz &amp; Sombra">
<meta property="og:image" content="https://www.example.com/og.jpg">
<meta name="twitter:image" content="https://www.example.com/twitter.jpg">
<meta property="article:published_time" content="2026-01-02T03:04:05.000Z">
<script type="application/ld+json">{"author":{"@type":"Person","name":"Ana","description":"Bio","url":"https://www.example.com/sobre-nos/"},"publisher":{"@type":"Organization","logo":{"@type":"ImageObject","url":"https://www.example.com/logo.png"}}}</script>
</head><body>
<h1>Luz &amp;
  <em>Sombra</em></h1>
<script>window.tracked = true;</script>
<p>Corpo   do artigo.</p>
<a href="/tag/luz/"> luz &amp; cor </a>
<a href="https://www.example.com/a/b/?ref=1#top">B</a>
<a href="https://other.example/a/">Other</a>
<a>No href</a>
</body></html>`;

const VISIBLE = "Luz & Sombra Corpo do artigo. luz & cor B Other No href";

describe("readPage", () => {
  it("reads decoded metadata, JSON-LD, same-origin links and what the page renders", () => {
    const hash = createHash("sha256").update(VISIBLE).digest("hex").slice(0, 16);

    expect(readPage(html, new URL("https://www.example.com/luz-amp-sombra/post/"))).toEqual({
      author: {
        bio: "Bio",
        name: "Ana",
        photoUrl: undefined,
        url: "https://www.example.com/sobre-nos/",
      },
      canonical: "https://www.example.com/luz-amp-sombra/post/",
      colorScheme: "light dark",
      description: 'Tudo sobre "luz"',
      documentTitle: "Luz & Sombra · Blog",
      feed: "/rss.xml",
      h1: "Luz & Sombra",
      image: "https://www.example.com/og.jpg",
      links: [
        { path: "/tag/luz/", text: "luz & cor" },
        { path: "/a/b/", text: "B" },
      ],
      modified: undefined,
      published: "2026-01-02T03:04:05.000Z",
      publisherLogo: "https://www.example.com/logo.png",
      robots: "noindex,follow",
      stylesheets: 2,
      text: `${VISIBLE.length} characters, sha256 ${hash}`,
      themeColor: "",
      title: "Luz & Sombra",
      twitterImage: "https://www.example.com/twitter.jpg",
      type: "article",
    });
  });

  it("reads a page with no article metadata", () => {
    const page = readPage("<html><head></head><body></body></html>", new URL("https://a.test/"));
    expect(page).toMatchObject({
      description: "",
      documentTitle: "",
      h1: "",
      links: [],
      stylesheets: 0,
      text: "0 characters, sha256 e3b0c44298fc1c14",
      title: "",
      type: "",
    });
    expect(page.image).toBeUndefined();
    expect(page.themeColor).toBeUndefined();
  });
});
