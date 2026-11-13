import { createHash } from "node:crypto";

import { parse, type DefaultTreeAdapterTypes } from "parse5";
import { z } from "zod";

type Node = DefaultTreeAdapterTypes.Node;

type Element = DefaultTreeAdapterTypes.Element;

type PageFacts = {
  author?: { bio?: string; name: string; photoUrl?: string; url?: string };
  canonical?: string;
  colorScheme?: string;
  description: string;
  documentTitle: string;
  feed?: string;
  h1: string;
  image?: string;
  links: Array<{ path: string; text: string }>;
  modified?: string;
  published?: string;
  publisherLogo?: string;
  robots?: string;
  stylesheets: number;
  text: string;
  themeColor?: string;
  title: string;
  twitterImage?: string;
  type: string;
};

const HASH_LENGTH = 16;

const UNRENDERED = new Set(["script", "style", "template"]);

const authorSchema = z.looseObject({
  "@type": z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  name: z.string(),
  url: z.string().optional(),
});

const logoSchema = z.looseObject({ url: z.string() });

const publisherSchema = z.looseObject({ logo: logoSchema.optional() });

const jsonLdSchema = z.looseObject({
  author: authorSchema.optional(),
  publisher: publisherSchema.optional(),
});

const children = (node: Node): Array<Node> => ("childNodes" in node ? node.childNodes : []);

const elements = (node: Node): Array<Element> => {
  const found: Array<Element> = [];

  for (const child of children(node)) {
    if ("attrs" in child) {
      found.push(child);
    }

    found.push(...elements(child));
  }

  return found;
};

const text = (node: Node): string =>
  "value" in node ? node.value : children(node).map(text).join("");

const visibleText = (node: Node | undefined): string => {
  if (node === undefined || ("tagName" in node && UNRENDERED.has(node.tagName))) {
    return "";
  }

  const rendered = "value" in node ? node.value : children(node).map(visibleText).join(" ");

  return rendered.replaceAll(/\s+/gv, " ").trim();
};

const fingerprint = (rendered: string): string => {
  const hash = createHash("sha256").update(rendered).digest("hex").slice(0, HASH_LENGTH);

  return `${rendered.length} characters, sha256 ${hash}`;
};

const attribute = (element: Element | undefined, name: string): string | undefined =>
  element?.attrs.find((attr) => attr.name === name)?.value;

const isStylesheet = (element: Element): boolean =>
  element.tagName === "style" ||
  (element.tagName === "link" && attribute(element, "rel") === "stylesheet");

const readJsonLd = (jsonLd: Element | undefined): Pick<PageFacts, "author" | "publisherLogo"> => {
  if (jsonLd === undefined) {
    return {};
  }

  const { author, publisher } = jsonLdSchema.parse(JSON.parse(text(jsonLd)));

  return {
    author:
      author?.["@type"] === "Person"
        ? { bio: author.description, name: author.name, photoUrl: author.image, url: author.url }
        : undefined,
    publisherLogo: publisher?.logo?.url,
  };
};

const readPage = (html: string, url: URL): PageFacts => {
  const all = elements(parse(html));

  const first = (tagName: string, attrs: Record<string, string> = {}): Element | undefined =>
    all.find(
      (element) =>
        element.tagName === tagName &&
        Object.entries(attrs).every(([name, value]) => attribute(element, name) === value),
    );

  const meta = (key: string): string | undefined =>
    attribute(first("meta", { name: key }) ?? first("meta", { property: key }), "content");

  const themeColor = first("meta", { name: "theme-color" });

  const links = all.flatMap((element) => {
    const href = element.tagName === "a" ? attribute(element, "href") : undefined;
    const target = href === undefined ? null : URL.parse(href, url);

    return target?.origin === url.origin
      ? [{ path: target.pathname, text: text(element).trim() }]
      : [];
  });

  return {
    ...readJsonLd(first("script", { type: "application/ld+json" })),
    canonical: attribute(first("link", { rel: "canonical" }), "href"),
    colorScheme: meta("color-scheme"),
    description: meta("description") ?? "",
    documentTitle: visibleText(first("title")),
    feed: attribute(first("link", { rel: "alternate", type: "application/rss+xml" }), "href"),
    h1: visibleText(first("h1")),
    image: meta("og:image"),
    links,
    modified: meta("article:modified_time"),
    published: meta("article:published_time"),
    robots: meta("robots"),
    stylesheets: all.filter(isStylesheet).length,
    text: fingerprint(visibleText(first("body"))),
    themeColor: themeColor === undefined ? undefined : (attribute(themeColor, "content") ?? ""),
    title: meta("og:title") ?? "",
    twitterImage: meta("twitter:image"),
    type: meta("og:type") ?? "",
  };
};

export { readPage };

export type { PageFacts };
