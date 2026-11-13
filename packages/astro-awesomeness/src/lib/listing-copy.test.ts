import { describe, expect, it } from "vitest";

import { listingCopy } from "./listing-copy";

describe("listingCopy", () => {
  it("fills the known placeholders once and leaves everything else as written", () => {
    expect(
      listingCopy(
        { description: 'Posts marcados com "{name}": {total} de {other}.', title: "{name}" },
        { name: "{total}", total: 3 },
      ),
    ).toEqual({
      description: 'Posts marcados com "{total}": 3 de {other}.',
      eyebrow: undefined,
      title: "{total}",
    });
  });

  it("fills the eyebrow when the site sets one", () => {
    expect(
      listingCopy({ description: "", eyebrow: "Tag {total}", title: "" }, { total: 2 }).eyebrow,
    ).toBe("Tag 2");
  });
});
