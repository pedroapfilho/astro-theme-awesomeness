import { getCollection } from "astro:content";
import { createContentIndex } from "astro-awesomeness/lib";

import categorySlugMap from "../data/category-slugs.json";

const index = createContentIndex({
  categorySlugMap,
  defaultCategory: "notes-field",
  posts: await getCollection("posts"),
});

export { index };
