import { describe, expect, it } from "vitest";

import { tagLabel, tagUrl, uniqueTags } from "./tag-url";

describe("tag identities", () => {
  it("keeps accent normalization, hash prefixes and the first label for duplicate slugs", () => {
    const tags = ["#Construção", "construção", "ASTRO", "#astro", "c#"];
    expect(uniqueTags(tags)).toEqual(["#Construção", "ASTRO", "c#"]);
    expect(uniqueTags(tags).map(tagUrl)).toEqual(["/tag/construcao/", "/tag/astro/", "/tag/c/"]);
    expect(uniqueTags(tags).map(tagLabel)).toEqual(["Construção", "ASTRO", "c#"]);
  });

  it.each(["", " \t ", "!!!", "#", "🎉", "日本語"])(
    "rejects tag %j before it can become an empty route or a duplicate identity",
    (tag) => {
      const message = `Tag ${JSON.stringify(tag)} must normalize to a nonempty slug`;
      expect(() => tagUrl(tag)).toThrow(message);
      expect(() => uniqueTags([tag])).toThrow(message);
      expect(() => uniqueTags(["Astro", tag, tag])).toThrow(message);
    },
  );
});
