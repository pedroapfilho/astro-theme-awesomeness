import { slugify } from "./slugify";

const tagUrl = (tag: string): string => `/tag/${slugify(tag)}/`;

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

export { tagLabel, tagUrl, uniqueTags };
