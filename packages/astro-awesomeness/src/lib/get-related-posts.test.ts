import { describe, expect, it } from "vitest";

import { getRelatedPosts } from "./get-related-posts";

type TestPost = { data: { tags: Array<string> }; slug: string };

const a: TestPost = { data: { tags: ["x", "y"] }, slug: "a" };
const b: TestPost = { data: { tags: ["x"] }, slug: "b" };
const c: TestPost = { data: { tags: ["z"] }, slug: "c" };
const d: TestPost = { data: { tags: ["x", "y", "z"] }, slug: "d" };

describe("getRelatedPosts", () => {
  it("excludes the current post", () => {
    const related = getRelatedPosts(a, [a, b, c, d], 3);
    expect(related.find((p) => p.slug === "a")).toBeUndefined();
  });
  it("ranks by shared tag count (desc)", () => {
    const related = getRelatedPosts(a, [a, b, c, d], 3);
    expect(related.map((p) => p.slug)).toEqual(["d", "b", "c"]);
  });
  it("limits to n", () => {
    const related = getRelatedPosts(a, [a, b, c, d], 1);
    expect(related).toHaveLength(1);
    expect(related[0].slug).toBe("d");
  });
  it("falls back to other posts when no overlap exists", () => {
    const lonely: TestPost = { data: { tags: ["nothing"] }, slug: "lonely" };
    const related = getRelatedPosts(lonely, [lonely, b, c], 2);
    expect(related).toHaveLength(2);
  });
});
