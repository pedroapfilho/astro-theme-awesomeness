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
