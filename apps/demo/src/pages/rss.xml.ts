import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { notDraft } from "astro-awesomeness/content";

export const GET = async (context: { site?: URL }) => {
  if (!context.site) {
    throw new Error("astro.config.ts must define `site` for RSS.");
  }
  const allPosts = await getCollection("posts", notDraft);
  const posts = allPosts.toSorted((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return rss({
    description: "The reference blog for astro-awesomeness.",
    items: posts.map((post) => ({
      description: post.data.description,
      link: `/blog/${post.id}/`,
      pubDate: post.data.pubDate,
      title: post.data.title,
    })),
    site: context.site,
    title: "Awesomeness demo",
  });
};
