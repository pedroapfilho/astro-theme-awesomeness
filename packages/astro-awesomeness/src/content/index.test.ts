import { defineCollection } from "astro/content/config";
import { describe, expect, expectTypeOf, it } from "vitest";

import type { Post } from "./index";
import { authorSchema, postSchema } from "./index";

describe("postSchema", () => {
  it("accepts a minimal post", () => {
    const result = postSchema.safeParse({
      description: "World",
      pubDate: new Date("2026-01-01"),
      title: "Hello",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = postSchema.safeParse({
      description: "World",
      pubDate: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it("coerces ISO date string to Date", () => {
    const result = postSchema.safeParse({
      description: "World",
      pubDate: "2026-01-01",
      title: "Hello",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pubDate).toBeInstanceOf(Date);
    }
  });

  it("defaults draft to false", () => {
    const result = postSchema.safeParse({
      description: "World",
      pubDate: new Date(),
      title: "Hello",
    });
    if (result.success) {
      expect(result.data.draft).toBe(false);
    }
  });

  it("validates tags as string array", () => {
    const result = postSchema.safeParse({
      description: "World",
      pubDate: new Date(),
      tags: ["foo", "bar"],
      title: "Hello",
    });
    expect(result.success).toBe(true);
  });

  it("defaults a missing description to an empty string", () => {
    const result = postSchema.safeParse({ pubDate: new Date(), title: "Hello" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
    }
  });

  it("accepts a top-level author entity", () => {
    const result = postSchema.safeParse({
      author: { bio: "Records rooms.", name: "Pedro", url: "https://example.com/pedro" },
      pubDate: new Date(),
      title: "Hello",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author?.name).toBe("Pedro");
    }
  });

  it("transforms complete hero metadata into a single image value", () => {
    const post = postSchema.parse({
      cover: "obsolete.jpg",
      coverAlt: "A sunlit house",
      heroImage: "loader legacy value",
      heroImageHeight: 800,
      heroImageUrl: "https://example.test/house.jpg",
      heroImageWidth: 1200,
      pubDate: "2026-01-01",
      series: "obsolete",
      title: "A house",
    });
    expect(post.heroImage).toEqual({
      alt: "A sunlit house",
      height: 800,
      src: "https://example.test/house.jpg",
      width: 1200,
    });
    for (const key of [
      "cover",
      "coverAlt",
      "series",
      "heroImageUrl",
      "heroImageWidth",
      "heroImageHeight",
    ]) {
      expect(post).not.toHaveProperty(key);
    }
    expectTypeOf<Post["heroImage"]>().toEqualTypeOf<
      | {
          alt: string;
          height: number;
          src: string;
          width: number;
        }
      | undefined
    >();
  });

  it.each([
    {},
    { heroImageUrl: "https://example.test/house.jpg" },
    { heroImageWidth: 1200 },
    { heroImageHeight: 800 },
    { heroImageUrl: "https://example.test/house.jpg", heroImageWidth: 1200 },
    { heroImageHeight: 800, heroImageUrl: "https://example.test/house.jpg" },
    { heroImageHeight: 800, heroImageWidth: 1200 },
  ])("omits heroImage for missing or partial metadata: %j", (metadata) => {
    const post = postSchema.parse({ pubDate: "2026-01-01", title: "A house", ...metadata });
    expect(post).not.toHaveProperty("heroImage");
    expect(post).not.toHaveProperty("heroImageUrl");
    expect(post).not.toHaveProperty("heroImageWidth");
    expect(post).not.toHaveProperty("heroImageHeight");
  });

  it.each([
    [undefined, "A house"],
    ["", ""],
  ])("defaults missing alt text to title but preserves %s", (coverAlt, alt) => {
    const post = postSchema.parse({
      coverAlt,
      heroImageHeight: 800,
      heroImageUrl: "https://example.test/house.jpg",
      heroImageWidth: 1200,
      pubDate: "2026-01-01",
      title: "A house",
    });
    expect(post.heroImage?.alt).toBe(alt);
  });

  it("accepts the transformed schema directly in Astro defineCollection", () => {
    const collection = defineCollection({
      loader: () => [{ id: "fixture", pubDate: "2026-01-01", title: "A house" }],
      schema: postSchema,
    });
    expect(collection.schema).toBe(postSchema);
  });
});

describe("authorSchema", () => {
  it("accepts a minimal author", () => {
    expect(authorSchema.safeParse({ name: "Pedro" }).success).toBe(true);
  });
  it("rejects an empty name", () => {
    expect(authorSchema.safeParse({ name: "" }).success).toBe(false);
  });
  it("tolerates a malformed url so a typo never fails a site build", () => {
    expect(authorSchema.safeParse({ name: "Pedro", url: "not-a-url" }).success).toBe(true);
  });
});
