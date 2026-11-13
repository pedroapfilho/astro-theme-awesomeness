import { describe, expect, it } from "vitest";

import { diff } from "./diff";

describe("diff", () => {
  it("reports nothing for equal snapshots", () => {
    expect(
      diff({ pages: { "/": { posts: ["/a/b/"] } } }, { pages: { "/": { posts: ["/a/b/"] } } }),
    ).toEqual([]);
  });

  it("counts repeated entries, so losing one of two equal links is a removal", () => {
    expect(diff({ links: ["/a/", "/b/", "/a/"] }, { links: ["/a/", "/b/"] })).toEqual([
      'links: - "/a/"',
    ]);
    expect(diff({ links: ["/a/"] }, { links: ["/a/", "/a/"] })).toEqual(['links: + "/a/"']);
  });

  it("names every route, listing entry and value that changed", () => {
    const before = {
      feed: { title: "Blog" },
      pages: {
        "/a/": { posts: ["/a/1/", "/a/2/"], title: "A" },
        "/b/": { posts: ["/b/1/", "/b/2/"] },
      },
    };

    const after = {
      feed: { title: "Blog!" },
      pages: {
        "/a/": { posts: ["/a/2/", "/a/3/"], title: "A" },
        "/b/": { posts: ["/b/2/", "/b/1/"] },
        "/c/": {},
      },
    };

    expect(diff(before, after)).toEqual([
      'feed title: "Blog" -> "Blog!"',
      'pages /a/ posts: - "/a/1/"',
      'pages /a/ posts: + "/a/3/"',
      "pages /b/ posts: order changed",
      "pages /c/: absent -> {}",
    ]);
  });
});
