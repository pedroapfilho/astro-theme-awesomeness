import type { Post } from "../content";

type ArticlePost = {
  data: Pick<Post, "author" | "description" | "heroImage" | "pubDate" | "title" | "updatedDate">;
};

type MetadataProps = {
  image?: string;
  siteTitle: string;
} & (
  | { description: string; noindex?: boolean; post?: never; title: string }
  | { description?: never; noindex?: never; post: ArticlePost; title?: never }
);

const present = (value?: string): string | undefined => (value === "" ? undefined : value);

const buildMetadata = (props: MetadataProps, url: URL, site?: URL) => {
  const { post, siteTitle } = props;
  const { description, title } = post ? post.data : props;
  const origin = site ?? url.origin;
  const canonical = new URL(url.pathname, origin).toString();
  const imagePath = present(props.image);
  const image = imagePath === undefined ? undefined : new URL(imagePath, origin).toString();
  const ogImage = post?.data.heroImage?.src ?? image;
  const author = post?.data.author;
  const publishedTime = post?.data.pubDate.toISOString();
  const modifiedTime = post?.data.updatedDate?.toISOString();

  const authorJsonLd = author
    ? {
        "@type": "Person",
        description: present(author.bio),
        image: present(author.photoUrl),
        name: author.name,
        url: present(author.url),
      }
    : { "@type": "Organization", name: siteTitle };

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        author: authorJsonLd,
        dateModified: modifiedTime ?? publishedTime,
        datePublished: publishedTime,
        description,
        headline: title,
        image: ogImage,
        mainEntityOfPage: { "@id": canonical, "@type": "WebPage" },
        publisher: {
          "@type": "Organization",
          logo: image === undefined ? undefined : { "@type": "ImageObject", url: image },
          name: siteTitle,
        },
      }
    : undefined;

  return {
    authorName: author?.name,
    canonical,
    description,
    documentTitle: title === siteTitle ? title : `${title} · ${siteTitle}`,
    image: ogImage,
    jsonLd,
    modifiedTime,
    noindex: props.noindex ?? false,
    publishedTime,
    siteTitle,
    title,
    type: post ? "article" : "website",
  };
};

export { buildMetadata };

export type { ArticlePost, MetadataProps };
