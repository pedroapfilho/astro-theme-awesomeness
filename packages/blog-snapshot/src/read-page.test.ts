import { describe, expect, it } from "vitest";

import { readPage } from "./read-page";

const html = `<!doctype html><html><head>
<title>Luz &amp; Sombra · Blog</title>
<meta name="description" content="Tudo sobre &quot;luz&quot;">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="https://www.example.com/luz-amp-sombra/post/">
<meta property="og:type" content="article">
<meta property="og:title" content="Luz &amp; Sombra">
<meta property="article:published_time" content="2026-01-02T03:04:05.000Z">
<script type="application/ld+json">{"author":{"@type":"Person","name":"Ana","description":"Bio","url":"https://www.example.com/sobre-nos/"}}</script>
</head><body>
<a href="/tag/luz/"> luz &amp; cor </a>
<a href="https://www.example.com/a/b/?ref=1#top">B</a>
<a href="https://other.example/a/">Other</a>
<a>No href</a>
</body></html>`;

describe("readPage", () => {
  it("reads decoded metadata, the JSON-LD author and same-origin links in document order", () => {
    expect(readPage(html, new URL("https://www.example.com/luz-amp-sombra/post/"))).toEqual({
      author: {
        bio: "Bio",
        name: "Ana",
        photoUrl: undefined,
        url: "https://www.example.com/sobre-nos/",
      },
      canonical: "https://www.example.com/luz-amp-sombra/post/",
      description: 'Tudo sobre "luz"',
      links: [
        { path: "/tag/luz/", text: "luz & cor" },
        { path: "/a/b/", text: "B" },
      ],
      modified: undefined,
      published: "2026-01-02T03:04:05.000Z",
      robots: "noindex,follow",
      title: "Luz & Sombra",
      type: "article",
    });
  });

  it("reads a page with no article metadata", () => {
    const page = readPage("<html><head></head><body></body></html>", new URL("https://a.test/"));
    expect(page).toMatchObject({
      author: undefined,
      description: "",
      links: [],
      title: "",
      type: "",
    });
  });
});
