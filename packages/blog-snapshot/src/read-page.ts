import { parse, type DefaultTreeAdapterTypes } from "parse5";
import { z } from "zod";

type Node = DefaultTreeAdapterTypes.Node;

type Element = DefaultTreeAdapterTypes.Element;

type PageFacts = {
  author?: { bio?: string; name: string; photoUrl?: string; url?: string };
  canonical?: string;
  description: string;
  links: Array<{ path: string; text: string }>;
  modified?: string;
  published?: string;
  robots?: string;
  title: string;
  type: string;
};

const authorSchema = z.looseObject({
  "@type": z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  name: z.string(),
  url: z.string().optional(),
});

const jsonLdSchema = z.looseObject({ author: authorSchema.optional() });

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

const attribute = (element: Element | undefined, name: string): string | undefined =>
  element?.attrs.find((attr) => attr.name === name)?.value;

const readAuthor = (jsonLd: Element | undefined): PageFacts["author"] => {
  if (jsonLd === undefined) {
    return undefined;
  }

  const { author } = jsonLdSchema.parse(JSON.parse(text(jsonLd)));

  return author?.["@type"] === "Person"
    ? { bio: author.description, name: author.name, photoUrl: author.image, url: author.url }
    : undefined;
};

const readPage = (html: string, url: URL): PageFacts => {
  const all = elements(parse(html));

  const meta = (key: string): string | undefined =>
    attribute(
      all.find(
        (element) =>
          element.tagName === "meta" &&
          (attribute(element, "name") === key || attribute(element, "property") === key),
      ),
      "content",
    );

  const canonical = all.find(
    (element) => element.tagName === "link" && attribute(element, "rel") === "canonical",
  );

  const jsonLd = all.find(
    (element) =>
      element.tagName === "script" && attribute(element, "type") === "application/ld+json",
  );

  const links = all.flatMap((element) => {
    const href = element.tagName === "a" ? attribute(element, "href") : undefined;
    const target = href === undefined ? null : URL.parse(href, url);

    return target?.origin === url.origin
      ? [{ path: target.pathname, text: text(element).trim() }]
      : [];
  });

  return {
    author: readAuthor(jsonLd),
    canonical: attribute(canonical, "href"),
    description: meta("description") ?? "",
    links,
    modified: meta("article:modified_time"),
    published: meta("article:published_time"),
    robots: meta("robots"),
    title: meta("og:title") ?? "",
    type: meta("og:type") ?? "",
  };
};

export { readPage };

export type { PageFacts };
