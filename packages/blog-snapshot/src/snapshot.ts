import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

import type { PageFacts } from "./read-page.ts";
import { redirectSchema, resolveRedirects } from "./redirects.ts";

type PageSnapshot = {
  canonical?: string;
  description: string;
  posts: Array<string>;
  robots?: string;
  tags?: Array<string>;
  title: string;
};

type SnapshotSource = {
  feedXml: string;
  files: Array<string>;
  pages: Map<string, PageFacts>;
  vercelJson: string;
};

const itemSchema = z.object({
  description: z.string(),
  link: z.string(),
  pubDate: z.string(),
  title: z.string(),
});

const channelSchema = z.object({
  description: z.string(),
  item: z.array(itemSchema).default([]),
  link: z.string(),
  title: z.string(),
});

const rssSchema = z.object({ channel: channelSchema });

const feedSchema = z.object({ rss: rssSchema });

const vercelSchema = z.looseObject({
  headers: z.json().optional(),
  redirects: z.array(redirectSchema).default([]),
});

const xml = new XMLParser({
  isArray: (name) => ["item", "sitemap", "url"].includes(name),
  parseTagValue: false,
});

const readFeed = (feedXml: string) => feedSchema.parse(xml.parse(feedXml)).rss.channel;

const articlePaths = (pages: Map<string, PageFacts>): Set<string> =>
  new Set(pages.entries().flatMap(([path, page]) => (page.type === "article" ? [path] : [])));

const buildSnapshot = ({ feedXml, files, pages, vercelJson }: SnapshotSource) => {
  const articles = articlePaths(pages);
  const vercel = vercelSchema.parse(JSON.parse(vercelJson));
  const { description, item, title } = readFeed(feedXml);

  const pageEntries = [...pages]
    .toSorted(([a], [b]) => (a < b ? -1 : 1))
    .map(([path, page]): [string, PageSnapshot] => {
      const paths = [...new Set(page.links.map((link) => link.path))];

      const facts = {
        canonical: page.canonical,
        description: page.description,
        posts: paths.filter((link) => articles.has(link) && link !== path),
        robots: page.robots,
        tags: articles.has(path) ? paths.filter((link) => link.startsWith("/tag/")) : undefined,
        title: page.title,
      };

      return [path, facts];
    });

  return {
    feed: { description, items: item, title },
    files: files.toSorted(),
    pages: Object.fromEntries(pageEntries),
    vercel: { headers: vercel.headers, redirects: resolveRedirects(vercel.redirects) },
  };
};

export { articlePaths, buildSnapshot, readFeed, xml };
