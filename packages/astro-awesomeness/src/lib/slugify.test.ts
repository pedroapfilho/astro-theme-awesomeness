import { describe, expect, it } from "vitest";

import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("strips diacritics", () => {
    expect(slugify("São Paulo")).toBe("sao-paulo");
  });
  it("strips punctuation", () => {
    expect(slugify("It's a Test!")).toBe("its-a-test");
  });
  it("collapses repeated hyphens", () => {
    expect(slugify("foo  --  bar")).toBe("foo-bar");
  });
  it("trims leading/trailing hyphens", () => {
    expect(slugify("-foo-")).toBe("foo");
  });
});
