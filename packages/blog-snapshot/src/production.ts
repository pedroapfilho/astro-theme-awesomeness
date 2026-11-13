import { z } from "zod";

import { readPage, type PageFacts } from "./read-page.ts";
import { xml } from "./snapshot.ts";

const CONCURRENCY = 8;
const ATTEMPTS = 3;

const locations = z.array(z.object({ loc: z.string() }));

const sitemapIndexSchema = z.object({ sitemapindex: z.object({ sitemap: locations }) });

const sitemapSchema = z.object({ urlset: z.object({ url: locations }) });

const sitemapUrls = (document: string): Array<URL> =>
  sitemapSchema.parse(xml.parse(document)).urlset.url.map(({ loc }) => new URL(loc));

const fetchText = async (url: string, attempt = 1): Promise<string> => {
  try {
    const response = await fetch(url, { headers: { "user-agent": "blog-snapshot" } });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    if (attempt === ATTEMPTS) {
      throw new Error(`GET ${url} failed`, { cause: error });
    }

    return fetchText(url, attempt + 1);
  }
};

const crawlProduction = async (site: string) => {
  const indexXml = await fetchText(`${site}/sitemap-index.xml`);
  const index = sitemapIndexSchema.parse(xml.parse(indexXml));
  const sitemaps = index.sitemapindex.sitemap.map(({ loc }) => loc);
  const sitemapXml = await Promise.all(sitemaps.map((sitemap) => fetchText(sitemap)));
  const pages = new Map<string, PageFacts>();
  const queue = sitemapXml.flatMap(sitemapUrls).values();

  const worker = async (): Promise<void> => {
    for (const url of queue) {
      pages.set(url.pathname, readPage(await fetchText(url.href), url));
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  return {
    feedXml: await fetchText(`${site}/rss.xml`),
    files: ["/rss.xml", "/sitemap-index.xml", ...sitemaps.map((url) => new URL(url).pathname)],
    pages,
  };
};

export { crawlProduction };
