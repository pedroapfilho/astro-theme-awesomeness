import rss from "@astrojs/rss";
import type { APIRoute } from "astro";

import { content } from "../lib/content";
import { SITE_TITLE } from "../lib/site";

const GET: APIRoute = (context) => {
  if (!context.site) {
    throw new Error("astro.config.ts must define `site` for RSS.");
  }

  return rss({
    description: "The reference blog for astro-awesomeness.",
    items: content.feedItems(),
    site: context.site,
    title: SITE_TITLE,
  });
};

export { GET };
