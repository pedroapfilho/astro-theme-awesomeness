import { describe, expect, it } from "vitest";

import { DEFAULT_TAG_BASE, tagUrl } from "./tag-url";

describe("tagUrl", () => {
  it("defaults to the /tag base every consuming blog routes on", () => {
    expect(DEFAULT_TAG_BASE).toBe("/tag");
    expect(tagUrl("Arquitetura")).toBe("/tag/arquitetura/");
  });

  it("ends every url with a slash so it matches the sitemap entry", () => {
    expect(tagUrl("design")).toMatch(/\/$/v);
    expect(tagUrl("design", "/etiqueta")).toBe("/etiqueta/design/");
  });

  it("does not double the separator when the base already ends in a slash", () => {
    expect(tagUrl("design", "/tag/")).toBe("/tag/design/");
  });

  it("slugifies accents and spaces the same way the route params do", () => {
    expect(tagUrl("Área Externa")).toBe("/tag/area-externa/");
  });
});
