import { describe, expect, it } from "vitest";

import { buildMetadata, type ArticlePost } from "./article-metadata";

const post: ArticlePost = {
  data: {
    description: "An article description",
    pubDate: new Date("2026-05-20T12:00:00Z"),
    title: "Article title",
  },
};
const url = new URL("https://preview.example/architecture/article/?source=feed#heading");
const site = new URL("https://example.com/");
const image = "https://example.com/og-image.jpg";
const siteTitle = "Example Blog";

describe("buildMetadata", () => {
  it("builds the reference BlogPosting shape with a Person and the site publisher logo", () => {
    const metadata = buildMetadata(
      {
        image,
        post: {
          data: {
            ...post.data,
            author: {
              bio: "Architect and writer",
              name: "Ana",
              photoUrl: "https://example.com/ana.jpg",
              url: "CMS author URL typo",
            },
            heroImage: {
              alt: "A house",
              height: 900,
              src: "https://example.com/house.jpg",
              width: 1600,
            },
            updatedDate: new Date("2026-05-21T12:00:00Z"),
          },
        },
        siteTitle,
      },
      url,
      site,
    );

    expect(metadata).toMatchObject({
      authorName: "Ana",
      canonical: "https://example.com/architecture/article/",
      description: post.data.description,
      documentTitle: "Article title · Example Blog",
      image: "https://example.com/house.jpg",
      modifiedTime: "2026-05-21T12:00:00.000Z",
      noindex: false,
      publishedTime: "2026-05-20T12:00:00.000Z",
      title: "Article title",
      type: "article",
    });
    expect(metadata.jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      author: {
        "@type": "Person",
        description: "Architect and writer",
        image: "https://example.com/ana.jpg",
        name: "Ana",
        url: "CMS author URL typo",
      },
      dateModified: "2026-05-21T12:00:00.000Z",
      datePublished: "2026-05-20T12:00:00.000Z",
      description: post.data.description,
      headline: "Article title",
      image: "https://example.com/house.jpg",
      mainEntityOfPage: { "@id": metadata.canonical, "@type": "WebPage" },
      publisher: {
        "@type": "Organization",
        logo: { "@type": "ImageObject", url: image },
        name: siteTitle,
      },
    });
  });

  it("uses the site image and Organization author without an author or hero image", () => {
    const metadata = buildMetadata({ image, post, siteTitle }, url, site);
    expect(metadata.image).toBe(image);
    expect(metadata.authorName).toBeUndefined();
    expect(metadata.modifiedTime).toBeUndefined();
    expect(metadata.jsonLd).toMatchObject({
      author: { "@type": "Organization", name: siteTitle },
      dateModified: metadata.publishedTime,
      datePublished: metadata.publishedTime,
      image,
    });
  });

  it("omits unavailable Person fields and images", () => {
    const metadata = buildMetadata(
      { post: { data: { ...post.data, author: { name: "Ana" } } }, siteTitle },
      url,
    );
    expect(metadata.jsonLd?.author).toEqual({ "@type": "Person", name: "Ana" });
    expect(metadata.image).toBeUndefined();
    expect(metadata.jsonLd?.publisher).toEqual({ "@type": "Organization", name: siteTitle });
  });

  it("uses the request origin without Astro.site and strips search/hash in every URL", () => {
    const metadata = buildMetadata({ post, siteTitle }, url);
    expect(metadata.canonical).toBe("https://preview.example/architecture/article/");
    expect(metadata.jsonLd?.mainEntityOfPage["@id"]).toBe(metadata.canonical);
  });

  it("builds website metadata without article fields or duplicated site titles", () => {
    const metadata = buildMetadata(
      { description: "", image, siteTitle, title: siteTitle },
      url,
      site,
    );
    expect(metadata).toEqual({
      authorName: undefined,
      canonical: "https://example.com/architecture/article/",
      description: "",
      documentTitle: siteTitle,
      image,
      jsonLd: undefined,
      modifiedTime: undefined,
      noindex: false,
      publishedTime: undefined,
      siteTitle,
      title: siteTitle,
      type: "website",
    });
  });

  it("preserves noindex for a 404 page", () => {
    const metadata = buildMetadata(
      { description: "", noindex: true, siteTitle, title: "Page not found" },
      new URL("https://example.com/404"),
      site,
    );
    expect(metadata.noindex).toBe(true);
    expect(metadata.type).toBe("website");
  });
});
