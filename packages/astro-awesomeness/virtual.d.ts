declare module "virtual:astro-awesomeness/components/ArchiveLayout" {
  import type { CollectionEntry } from "astro:content";
  import type { ListLayoutProps } from "astro-awesomeness";

  const ArchiveLayout: (props: ListLayoutProps<CollectionEntry<"posts">>) => unknown;

  export default ArchiveLayout;
}

declare module "virtual:astro-awesomeness/components/ListLayout" {
  import type { CollectionEntry } from "astro:content";
  import type { ListLayoutProps } from "astro-awesomeness";

  const ListLayout: (props: ListLayoutProps<CollectionEntry<"posts">>) => unknown;

  export default ListLayout;
}

declare module "virtual:astro-awesomeness/components/PostLayout" {
  import type { CollectionEntry } from "astro:content";
  import type { PostLayoutProps } from "astro-awesomeness";

  const PostLayout: (props: PostLayoutProps<CollectionEntry<"posts">>) => unknown;

  export default PostLayout;
}

declare module "virtual:astro-awesomeness/config" {
  import type { AwesomenessConfig } from "astro-awesomeness";

  const config: AwesomenessConfig;

  export default config;
}

declare module "virtual:astro-awesomeness/content" {
  import type { CollectionEntry } from "astro:content";
  import type { ContentIndex } from "astro-awesomeness/lib";

  export const content: ContentIndex<CollectionEntry<"posts">>;
}

declare module "virtual:astro-awesomeness/tag-aliases" {
  import type { CollectionEntry } from "astro:content";
  import type { TagAliases } from "astro-awesomeness";

  const tagAliases: TagAliases<CollectionEntry<"posts">>;

  export default tagAliases;
}
