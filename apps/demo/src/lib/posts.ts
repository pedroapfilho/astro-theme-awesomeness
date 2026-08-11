import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { byPubDateDesc, notDraft } from "astro-awesomeness/content";

type PostEntry = CollectionEntry<"posts">;

const getPublishedPosts = () => getCollection("posts", notDraft);

const getSortedPosts = async () => {
  const posts = await getPublishedPosts();
  return posts.toSorted(byPubDateDesc);
};

export { getPublishedPosts, getSortedPosts };
export type { PostEntry };
