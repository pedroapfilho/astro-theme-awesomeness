import { slugify } from "./slugify";

const DEFAULT_TAG_BASE = "/tag";

const tagUrl = (tag: string, base: string = DEFAULT_TAG_BASE): string =>
  `${base.replace(/\/+$/v, "")}/${slugify(tag)}/`;

export { DEFAULT_TAG_BASE, tagUrl };
