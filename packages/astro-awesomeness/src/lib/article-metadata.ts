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

type PageProps =
  | { description: string; noindex?: boolean; post?: never; title: string }
  | { description?: never; noindex?: never; post: ArticlePost; title?: never };

type MetadataProps = PageProps & { image?: string; logo?: string; siteTitle: string };

const present = (value?: string): string | undefined => (value === "" ? undefined : value);

const buildMetadata = (props: MetadataProps, url: URL, site?: URL) => {
  const { post, siteTitle } = props;
  const { description, title } = post ? post.data : props;
  const origin = site ?? url.origin;
  const canonical = new URL(url.pathname, origin).toString();

  const absolute = (path?: string): string | undefined => {
    const value = present(path);

    return value === undefined ? undefined : new URL(value, origin).toString();
  };

  const image = absolute(props.image);
  const logo = absolute(props.logo) ?? image;
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
          logo: logo === undefined ? undefined : { "@type": "ImageObject", url: logo },
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

export type { ArticlePost, MetadataProps, PageProps };
