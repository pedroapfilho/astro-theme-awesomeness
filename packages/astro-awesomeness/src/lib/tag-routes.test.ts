import { describe, expect, it } from "vitest";

import type { ContentPost, TagBucket } from "./content-index";
import { tagRoutes } from "./tag-routes";

const bucket = (slug: string, labels: Array<string> = [slug]): TagBucket<ContentPost> => ({
  href: `/tag/${slug}/`,
  labels,
  name: slug,
  posts: [],
  slug,
});

describe("tagRoutes", () => {
  it("routes every tag by its slug when the site has no aliases", () => {
    const tags = [bucket("astro"), bucket("moda")];

    expect(tagRoutes(tags, () => [])).toEqual([
      { params: { tag: "astro" }, props: { tag: tags[0] } },
      { params: { tag: "moda" }, props: { tag: tags[1] } },
    ]);
  });

  it("adds alias routes without replacing a tag's own slug or an earlier alias", () => {
    const moda = bucket("moda-praia", ["Moda Praia", "#modapraia"]);
    const praia = bucket("modapraia");
    const verao = bucket("verao");

    const routes = tagRoutes([moda, praia, verao], (tag) =>
      tag === praia ? [] : ["modapraia", "shared", ...(tag.labels.length > 1 ? ["moda-2"] : [])],
    );

    expect(routes.map(({ params, props }) => [params.tag, props.tag.slug])).toEqual([
      ["moda-praia", "moda-praia"],
      ["modapraia", "modapraia"],
      ["shared", "moda-praia"],
      ["moda-2", "moda-praia"],
      ["verao", "verao"],
    ]);
  });
});
