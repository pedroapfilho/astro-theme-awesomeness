import { z } from "zod";

const postSchema = z.object({
  author: z.string().optional(),
  categories: z.array(z.string()).default([]),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  description: z.string().min(1),
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

const authorSchema = z.object({
  avatar: z.string().optional(),
  bio: z.string().optional(),
  name: z.string().min(1),
  url: z.url().optional(),
});

type Post = z.infer<typeof postSchema>;
type Tag = z.infer<typeof tagSchema>;
type Author = z.infer<typeof authorSchema>;

// Predicate the 12 blog repos previously inlined ~72 times per repo
// (`data.status !== "DRAFT" && !data.draft`). One source of truth so the
// loader contract stays in sync with the consumer-side guard.
const notDraft = <T extends { data: { draft?: boolean; status?: string } }>(post: T): boolean =>
  post.data.status !== "DRAFT" && !post.data.draft;

export { authorSchema, notDraft, postSchema, tagSchema };
export type { Author, Post, Tag };
