const SITE = "https://www.example.com";

const page = (path: string, type: string, links: Array<string>, site = SITE): string =>
  `<!doctype html><html><head>
<title>Page ${path} · Blog</title>
<meta name="description" content="About ${path}">
<meta name="color-scheme" content="light">
<link rel="canonical" href="${site}${path}">
<link rel="alternate" type="application/rss+xml" href="/rss.xml">
<link rel="stylesheet" href="/_astro/site.css">
<meta property="og:type" content="${type}">
<meta property="og:title" content="Page ${path}">
<meta property="og:image" content="${site}/og.jpg">
<meta name="twitter:image" content="${site}/og.jpg">
</head><body><h1>Page ${path}</h1><p>Body of ${path}.</p>
${links.map((link) => `<a href="${link}">${link}</a>`).join("")}</body></html>`;

const feed = (site = SITE): string =>
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
<title>Blog</title><description>A blog.</description><link>${site}/</link>
<item><title>Hello</title><link>${site}/notes/hello/</link><description>First post.</description><pubDate>Fri, 02 Jan 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`;

const pages = (site = SITE): Record<string, string> => ({
  "/": page("/", "website", ["/notes/hello/", "/tag/astro/"], site),
  "/notes/hello/": page("/notes/hello/", "article", ["/", "/tag/astro/"], site),
});

export { feed, page, pages, SITE };
