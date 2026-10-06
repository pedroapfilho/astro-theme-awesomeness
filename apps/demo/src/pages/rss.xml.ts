import rss from "@astrojs/rss";

import { index } from "../lib/content";

const GET = (context: { site?: URL }) => {
  if (!context.site) {
    throw new Error("astro.config.ts must define `site` for RSS.");
  }
  return rss({
    description: "The reference blog for astro-awesomeness.",
    items: index.feedItems(),
    site: context.site,
    title: "Awesomeness",
  });
};

export { GET };
