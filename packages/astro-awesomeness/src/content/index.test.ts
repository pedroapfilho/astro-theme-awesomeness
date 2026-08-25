import { describe, expect, it } from "vitest";

import { authorSchema, byPubDateDesc, postSchema, tagSchema } from "./index";

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
});

const entry = (iso: string) => ({ data: { pubDate: new Date(iso) } });

describe("byPubDateDesc", () => {
  it("sorts newest first", () => {
    const sorted = [entry("2026-01-01"), entry("2026-03-01"), entry("2026-02-01")].toSorted(
      byPubDateDesc,
    );
    expect(sorted.map((post) => post.data.pubDate.toISOString().slice(0, 10))).toEqual([
      "2026-03-01",
      "2026-02-01",
      "2026-01-01",
    ]);
  });

  it("returns 0 for equal dates so the sort stays stable", () => {
    expect(byPubDateDesc(entry("2026-01-01"), entry("2026-01-01"))).toBe(0);
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
  it("rejects an empty name", () => {
    expect(authorSchema.safeParse({ name: "" }).success).toBe(false);
  });
  it("tolerates a malformed url so a typo never fails a site build", () => {
    expect(authorSchema.safeParse({ name: "Pedro", url: "not-a-url" }).success).toBe(true);
  });
});
