import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { byPubDateDesc, notDraft } from "astro-awesomeness/content";

type PostEntry = CollectionEntry<"posts">;

// One place owns the "published, newest-first" post contract so the four routes
// that surface posts (home, blog pagination, tag pages, RSS) can't drift on the
// notDraft predicate or the sort order.
const getPublishedPosts = () => getCollection("posts", notDraft);

const getSortedPosts = async () => {
  const posts = await getPublishedPosts();
  return posts.toSorted(byPubDateDesc);
};

export { getPublishedPosts, getSortedPosts };
export type { PostEntry };
