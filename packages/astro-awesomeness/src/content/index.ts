import { z } from "zod";

const postSchema = z.object({
  author: z.string().optional(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  description: z.string().min(1),
  draft: z.boolean().default(false),
  pubDate: z.coerce.date(),
  series: z.string().optional(),
  tags: z.array(z.string()).default([]),
  title: z.string().min(1),
  updatedDate: z.coerce.date().optional(),
});

const tagSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1),
});

const authorSchema = z.object({
  avatar: z.string().optional(),
  bio: z.string().optional(),
  name: z.string().min(1),
  url: z.url().optional(),
});

type Post = z.infer<typeof postSchema>;
type Tag = z.infer<typeof tagSchema>;
type Author = z.infer<typeof authorSchema>;

export { authorSchema, postSchema, tagSchema };
export type { Author, Post, Tag };
