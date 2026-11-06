import { describe, expect, it } from "vitest";

import { tagLinks } from "./tag-links";

describe("tagLinks", () => {
  it("keeps accent normalization, hash prefixes and the first label for duplicate slugs", () => {
    expect(tagLinks(["#Construção", "construção", "ASTRO", "#astro", "c#"])).toEqual([
      { href: "/tag/construcao/", name: "Construção", slug: "construcao" },
      { href: "/tag/astro/", name: "ASTRO", slug: "astro" },
      { href: "/tag/c/", name: "c#", slug: "c" },
    ]);
  });

  it.each(["", " \t ", "!!!", "#", "🎉", "日本語"])(
    "rejects tag %j before it can become an empty route or a duplicate identity",
    (tag) => {
      const message = `Tag ${JSON.stringify(tag)} must normalize to a nonempty slug`;
      expect(() => tagLinks([tag])).toThrow(message);
      expect(() => tagLinks(["Astro", tag, tag])).toThrow(message);
    },
  );
});
