import { describe, expect, it } from "vitest";

import { contentFromPages } from "./content";
import type { PageFacts } from "./read-page";

const page = (facts: Partial<PageFacts>): PageFacts => ({
  description: "",
  documentTitle: "",
  h1: "",
  links: [],
  stylesheets: 0,
  text: "",
  title: "",
  type: "website",
  ...facts,
});

const article = (links: Array<string> = []): PageFacts =>
  page({
    links: links.map((path) => ({ path, text: path.split("/").at(-2) ?? "" })),
    published: "2026-01-01T00:00:00.000Z",
    title: "Post",
    type: "article",
  });

const listing = (title: string, posts: Array<string>): PageFacts =>
  page({ links: posts.map((path) => ({ path, text: "" })), title });

const options = {
  archivePath: "postagens",
  categorySlugMap: { "Reformas &amp; Tendências": "reformas-2", Wedding: "casamento" },
  defaultCategory: "sem-categoria",
  staticPages: ["index", "sobre-nos"],
};

const categoriesBySlug = (pages: Map<string, PageFacts>) =>
  Object.fromEntries(
    contentFromPages(pages, options).data.map(({ frontmatter, slug }) => [
      slug,
      frontmatter.categories,
    ]),
  );

describe("contentFromPages", () => {
  it("rebuilds a raw category name that routes to each production slug", () => {
    const pages = new Map([
      ["/casamento/a/", article()],
      ["/reformas-2/b/", article()],
      ["/luz-amp-sombra/c/", article()],
      ["/sem-categoria/d/", article()],
      ["/casamento/", listing("Wedding", ["/casamento/a/"])],
      ["/reformas-2/", listing("Reformas & Tendências", ["/reformas-2/b/"])],
      ["/luz-amp-sombra/", listing("Luz & Sombra", ["/luz-amp-sombra/c/"])],
      ["/sem-categoria/", listing("Sem categoria", ["/sem-categoria/d/"])],
    ]);

    expect(categoriesBySlug(pages)).toEqual({
      a: ["Wedding", "Snapshot secondary category"],
      b: ["Reformas &amp; Tendências", "Snapshot secondary category"],
      c: ["Luz &amp; Sombra", "Snapshot secondary category"],
      d: [],
    });
  });

  it("reads secondary categories from other category listings and ignores other pages", () => {
    const pages = new Map([
      ["/casamento/a/", article()],
      ["/festa/b/", article()],
      ["/casamento/", listing("Casamento", ["/casamento/a/"])],
      ["/festa/", listing("Festa", ["/festa/b/"])],
      ["/festa/2/", listing("Festa", ["/casamento/a/"])],
      ["/postagens/", listing("Arquivo", ["/casamento/a/", "/festa/b/"])],
      ["/sobre-nos/", listing("Sobre", ["/festa/b/"])],
      ["/tag/x/", listing("x", ["/festa/b/"])],
    ]);

    expect(categoriesBySlug(pages)).toEqual({ a: ["Casamento", "Festa"], b: ["Festa"] });
  });

  it("keeps each post's tag labels in page order, one per tag", () => {
    const pages = new Map([
      ["/casamento/a/", article(["/tag/luz/", "/sobre-nos/", "/tag/cor/", "/tag/luz/"])],
      ["/casamento/", listing("Casamento", ["/casamento/a/"])],
    ]);

    expect(contentFromPages(pages, options).data[0]?.frontmatter.tags).toEqual(["luz", "cor"]);
  });

  it("fails when production has no category page for an article", () => {
    expect(() => contentFromPages(new Map([["/casamento/a/", article()]]), options)).toThrow(
      "Production has no category page at /casamento/",
    );
  });
});
