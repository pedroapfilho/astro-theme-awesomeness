import { describe, expect, it } from "vitest";

import { createPostUrl } from "./post-url";

const map = { "Aluguel de Espaços": "aluguel-de-espacos", Arquitetura: "arquitetura" };
const DEFAULT = "sem-categoria";

describe("createPostUrl", () => {
  const { postParams, postUrl } = createPostUrl(map, DEFAULT);

  it("returns mapped category + post id when categories has a known entry", () => {
    const post = { data: { categories: ["Arquitetura"] }, id: "casa-minimal" };
    expect(postParams(post)).toEqual({ category: "arquitetura", slug: "casa-minimal" });
    expect(postUrl(post)).toBe("/arquitetura/casa-minimal/");
  });

  it("slugifies an unmapped first category", () => {
    const post = { data: { categories: ["Arquitetura Moderna"] }, id: "x" };
    expect(postParams(post)).toEqual({ category: "arquitetura-moderna", slug: "x" });
  });

  it("uses the default category when there are no categories", () => {
    const post = { data: { categories: [] }, id: "orphan" };
    expect(postUrl(post)).toBe("/sem-categoria/orphan/");
  });

  it("honors seo.canonical_url over derived category when it has >=2 segments", () => {
    const post = {
      data: { categories: ["Arquitetura"], seo: { canonical_url: "https://x.com/foo/bar/" } },
      id: "ignored",
    };
    expect(postParams(post)).toEqual({ category: "foo", slug: "bar" });
  });

  it("falls back to derived category when seo.canonical_url is malformed", () => {
    const post = {
      data: { categories: ["Arquitetura"], seo: { canonical_url: "not-a-url" } },
      id: "x",
    };
    expect(postParams(post)).toEqual({ category: "arquitetura", slug: "x" });
  });

  it("falls back when canonical_url has fewer than 2 segments", () => {
    const post = {
      data: { categories: ["Arquitetura"], seo: { canonical_url: "https://x.com/foo" } },
      id: "x",
    };
    expect(postParams(post)).toEqual({ category: "arquitetura", slug: "x" });
  });
});
