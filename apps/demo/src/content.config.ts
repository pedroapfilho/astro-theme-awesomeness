import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { postSchema, tagSchema } from "astro-awesomeness/content";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: postSchema,
});

const tags = defineCollection({
  loader: glob({ base: "./src/content/tags", pattern: "**/*.json" }),
  schema: tagSchema,
});

export const collections = { posts, tags };
