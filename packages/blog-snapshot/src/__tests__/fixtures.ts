const SITE = "https://www.example.com";

const page = (path: string, type: string, links: Array<string>, site = SITE): string =>
  `<!doctype html><html><head>
<meta name="description" content="About ${path}">
<link rel="canonical" href="${site}${path}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="Page ${path}">
</head><body>${links.map((link) => `<a href="${link}">${link}</a>`).join("")}</body></html>`;

const feed = (site = SITE): string =>
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
<title>Blog</title><description>A blog.</description><link>${site}/</link>
<item><title>Hello</title><link>${site}/notes/hello/</link><description>First post.</description><pubDate>Fri, 02 Jan 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`;

const pages = (site = SITE): Record<string, string> => ({
  "/": page("/", "website", ["/notes/hello/", "/tag/astro/"], site),
  "/notes/hello/": page("/notes/hello/", "article", ["/", "/tag/astro/"], site),
});

export { feed, page, pages };
