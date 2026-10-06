import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { postSchema } from "astro-awesomeness/content";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: postSchema,
});

const collections = { posts };

export { collections };
