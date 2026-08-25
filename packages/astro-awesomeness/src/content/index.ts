import { z } from "zod";

// Mirrors @easeia/astro-content's BuildAuthor after its loader strips nulls
// to undefined. Plain strings (not z.url()) on purpose: a typo in the admin's
// author URL must not fail 12 site builds.
const authorSchema = z.object({
  bio: z.string().optional(),
  name: z.string().min(1),
  photoUrl: z.string().optional(),
  url: z.string().optional(),
});

const postSchema = z.object({
  author: authorSchema.optional(),
  categories: z.array(z.string()).default([]),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  description: z.string().default(""),
  draft: z.boolean().default(false),
  heroImageHeight: z.number().int().optional(),
  heroImageUrl: z.url().optional(),
  heroImageWidth: z.number().int().optional(),
  pubDate: z.coerce.date(),
  seo: z
    .object({
      canonical_url: z.string().optional(),
    })
    .optional(),
  series: z.string().optional(),
  slug: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).default([]),
  title: z.string().min(1),
  updatedDate: z.coerce.date().optional(),
});

const tagSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1),
});

type Post = z.infer<typeof postSchema>;
type Tag = z.infer<typeof tagSchema>;
type Author = z.infer<typeof authorSchema>;

const notDraft = (post: { data: { draft?: boolean; status?: string } }): boolean =>
  post.data.status !== "DRAFT" && post.data.draft !== true;

const byPubDateDesc = (a: { data: { pubDate: Date } }, b: { data: { pubDate: Date } }): number =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

export { authorSchema, byPubDateDesc, notDraft, postSchema, tagSchema };
export type { Author, Post, Tag };
