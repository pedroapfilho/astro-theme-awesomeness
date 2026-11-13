import type { Page } from "astro";

type ListingCopy = { description: string; eyebrow?: string; title: string };

type ListLayoutProps<P> = ListingCopy & { page?: Page<P>; posts: Array<P> };

type PostLayoutProps<P> = { post: P };

const fill = (template: string, values: Record<string, number | string>): string =>
  template.replaceAll(/\{(?<key>\w+)\}/gv, (placeholder, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : placeholder,
  );

const listingCopy = (copy: ListingCopy, values: Record<string, number | string>): ListingCopy => ({
  description: fill(copy.description, values),
  eyebrow: copy.eyebrow === undefined ? undefined : fill(copy.eyebrow, values),
  title: fill(copy.title, values),
});

export { listingCopy };

export type { ListLayoutProps, ListingCopy, PostLayoutProps };
