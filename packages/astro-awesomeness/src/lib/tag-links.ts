import { slugify } from "./slugify";

type ArchiveLink = { href: string; name: string; slug: string };

const tagLinks = (tags: Array<string>): Array<ArchiveLink> => {
  const links = new Map<string, ArchiveLink>();

  for (const tag of tags) {
    const slug = slugify(tag);

    if (slug === "") {
      throw new Error(`Tag ${JSON.stringify(tag)} must normalize to a nonempty slug`);
    }

    if (!links.has(slug)) {
      links.set(slug, { href: `/tag/${slug}/`, name: tag.replace(/^#/v, ""), slug });
    }
  }

  return [...links.values()];
};

export { tagLinks };

export type { ArchiveLink };
