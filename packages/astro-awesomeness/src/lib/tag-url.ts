import { slugify } from "./slugify";

const DEFAULT_TAG_BASE = "/tag";

// The trailing slash is not cosmetic. @astrojs/sitemap emits directory-style
// URLs, so a chip pointing at /tag/foo names a URL that is absent from the
// sitemap and only reachable through a redirect.
const tagUrl = (tag: string, base: string = DEFAULT_TAG_BASE): string =>
  `${base.replace(/\/+$/v, "")}/${slugify(tag)}/`;

export { DEFAULT_TAG_BASE, tagUrl };
