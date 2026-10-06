type ArticlePost = {
  data: {
    author?: { bio?: string; name: string; photoUrl?: string; url?: string };
    description: string;
    heroImage?: { alt: string; height: number; src: string; width: number };
    pubDate: Date;
    title: string;
    updatedDate?: Date;
  };
};

type MetadataProps = {
  image?: string;
  siteTitle: string;
} & (
  | { description: string; noindex?: boolean; post?: never; title: string }
  | { description?: never; noindex?: never; post: ArticlePost; title?: never }
);

type AuthorJsonLd = {
  "@type": "Person" | "Organization";
  description?: string;
  image?: string;
  name: string;
  url?: string;
};

const buildMetadata = (props: MetadataProps, url: URL, site?: URL) => {
  const { image, post, siteTitle } = props;
  const { description, title } = post ? post.data : props;
  const canonical = new URL(url.pathname, site ?? url.origin).toString();
  const ogImage = post?.data.heroImage?.src ?? image;
  const author = post?.data.author;
  const publishedTime = post?.data.pubDate.toISOString();
  const modifiedTime = post?.data.updatedDate?.toISOString();
  const authorJsonLd: AuthorJsonLd = author
    ? { "@type": "Person", name: author.name }
    : { "@type": "Organization", name: siteTitle };
  if (author?.url !== undefined && author.url !== "") {
    authorJsonLd.url = author.url;
  }
  if (author?.photoUrl !== undefined && author.photoUrl !== "") {
    authorJsonLd.image = author.photoUrl;
  }
  if (author?.bio !== undefined && author.bio !== "") {
    authorJsonLd.description = author.bio;
  }
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
