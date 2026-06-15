import { describe, expect, it } from "vitest";

import { getRelatedPosts } from "./get-related-posts";

type TestPost = { data: { tags: Array<string> }; id: string };

const a: TestPost = { data: { tags: ["x", "y"] }, id: "a" };
const b: TestPost = { data: { tags: ["x"] }, id: "b" };
const c: TestPost = { data: { tags: ["z"] }, id: "c" };
const d: TestPost = { data: { tags: ["x", "y", "z"] }, id: "d" };

describe("getRelatedPosts", () => {
  it("excludes the current post", () => {
    const related = getRelatedPosts(a, [a, b, c, d], 3);
    expect(related.find((p) => p.id === "a")).toBeUndefined();
  });
  it("ranks by shared tag count (desc)", () => {
    const related = getRelatedPosts(a, [a, b, c, d], 3);
    expect(related.map((p) => p.id)).toEqual(["d", "b", "c"]);
  });
  it("limits to n", () => {
    const related = getRelatedPosts(a, [a, b, c, d], 1);
    expect(related).toHaveLength(1);
    expect(related[0].id).toBe("d");
  });
  it("falls back to other posts when no overlap exists", () => {
    const lonely: TestPost = { data: { tags: ["nothing"] }, id: "lonely" };
    const related = getRelatedPosts(lonely, [lonely, b, c], 2);
    expect(related).toHaveLength(2);
  });
  it("works with Astro-entry-shaped objects keyed on id (regression)", () => {
    const current = { data: { tags: ["x"] }, id: "current" };
    const other = { data: { tags: ["x"] }, id: "other" };
    const related = getRelatedPosts(current, [current, other], 5);
    expect(related.map((p) => p.id)).toEqual(["other"]);
  });
});
