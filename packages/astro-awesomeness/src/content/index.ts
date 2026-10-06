import { z } from "zod";

const authorSchema = z.object({
  bio: z.string().optional(),
  name: z.string().min(1),
  photoUrl: z.string().optional(),
  url: z.string().optional(),
});

const postSchema = z
  .object({
    author: authorSchema.optional(),
    categories: z.array(z.string()).default([]),
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
    slug: z.string().optional(),
    status: z.string().optional(),
    tags: z.array(z.string()).default([]),
    title: z.string().min(1),
    updatedDate: z.coerce.date().optional(),
  })
  .transform(({ coverAlt, heroImageHeight, heroImageUrl, heroImageWidth, ...post }) => {
    const result: typeof post & {
      heroImage?: { alt: string; height: number; src: string; width: number };
    } = post;
    if (
      heroImageUrl !== undefined &&
      heroImageWidth !== undefined &&
      heroImageHeight !== undefined
    ) {
      result.heroImage = {
        alt: coverAlt ?? post.title,
        height: heroImageHeight,
        src: heroImageUrl,
        width: heroImageWidth,
      };
    }
    return result;
  });

type Post = z.infer<typeof postSchema>;
type Author = z.infer<typeof authorSchema>;

export { authorSchema, postSchema };
export type { Author, Post };
