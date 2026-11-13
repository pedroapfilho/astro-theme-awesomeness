import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import config from "virtual:astro-awesomeness/config";
import { content } from "virtual:astro-awesomeness/content";

const GET: APIRoute = (context) => {
  if (!context.site) {
    throw new Error("astro.config.ts must define `site` for RSS.");
  }

  return rss({
    description: config.description,
    items: content.feedItems(),
    site: context.site,
    title: config.title,
  });
};

export { GET };
