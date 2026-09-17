import { slugify } from "./slugify";

const DEFAULT_TAG_BASE = "/tag";

const tagUrl = (tag: string, base: string = DEFAULT_TAG_BASE): string =>
  `${base.replace(/\/+$/v, "")}/${slugify(tag)}/`;

const tagLabel = (tag: string): string => tag.replace(/^#/v, "");

const uniqueTags = (tags: Array<string>): Array<string> => {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    const slug = slugify(tag);
    if (seen.has(slug)) {
      return false;
    }
    seen.add(slug);
    return true;
  });
};

export { DEFAULT_TAG_BASE, tagLabel, tagUrl, uniqueTags };
