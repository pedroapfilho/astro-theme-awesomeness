import type { ContentPost, TagBucket } from "./content-index";

type TagAliases<P extends ContentPost> = (tag: TagBucket<P>) => Array<string>;

const tagRoutes = <P extends ContentPost>(tags: Array<TagBucket<P>>, aliasesOf: TagAliases<P>) => {
  const routes = new Map<string, TagBucket<P>>();

  for (const tag of tags) {
    routes.set(tag.slug, tag);

    for (const alias of aliasesOf(tag)) {
      if (!routes.has(alias)) {
        routes.set(alias, tag);
      }
    }
  }

  return [...routes].map(([slug, tag]) => ({ params: { tag: slug }, props: { tag } }));
};

export { tagRoutes };

export type { TagAliases };
