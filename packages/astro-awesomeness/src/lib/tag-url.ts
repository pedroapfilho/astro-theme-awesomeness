import { slugify } from "./slugify";

const tagSlug = (tag: string): string => {
  const slug = slugify(tag);
  if (slug === "") {
    throw new Error(`Tag ${JSON.stringify(tag)} must normalize to a nonempty slug`);
  }
  return slug;
};

const tagUrl = (tag: string): string => `/tag/${tagSlug(tag)}/`;

const tagLabel = (tag: string): string => tag.replace(/^#/v, "");

const uniqueTags = (tags: Array<string>): Array<string> => {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    const slug = tagSlug(tag);
    if (seen.has(slug)) {
      return false;
    }
    seen.add(slug);
    return true;
  });
};

export { tagLabel, tagSlug, tagUrl, uniqueTags };
