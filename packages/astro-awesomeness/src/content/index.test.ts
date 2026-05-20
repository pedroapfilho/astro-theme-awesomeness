import { describe, expect, it } from "vitest";

import { authorSchema, postSchema, tagSchema } from "./index";

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
});

describe("tagSchema", () => {
  it("accepts a minimal tag", () => {
    expect(tagSchema.safeParse({ name: "javascript" }).success).toBe(true);
  });
  it("rejects missing name", () => {
    expect(tagSchema.safeParse({}).success).toBe(false);
  });
});

describe("authorSchema", () => {
  it("accepts a minimal author", () => {
    expect(authorSchema.safeParse({ name: "Pedro" }).success).toBe(true);
  });
  it("validates url field as URL string", () => {
    const result = authorSchema.safeParse({ name: "Pedro", url: "not-a-url" });
    expect(result.success).toBe(false);
  });
});
