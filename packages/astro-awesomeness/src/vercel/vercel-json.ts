import { z } from "zod";

import { categoryLabel } from "../lib/category-label";
import { slugify } from "../lib/slugify";

const KEY_ORDER = [
  "$schema",
  "redirects",
  "source",
  "has",
  "type",
  "key",
  "value",
  "destination",
  "permanent",
  "headers",
];

const slugRecord = z.record(z.string(), z.string());

const conditionSchema = z.strictObject({
  key: z.string(),
  type: z.string(),
  value: z.string().optional(),
});

const redirectSchema = z.strictObject({
  destination: z.string(),
  has: z.array(conditionSchema).optional(),
  permanent: z.boolean(),
  source: z.string(),
});

const siteSchema = z.strictObject({
  redirects: z.array(redirectSchema).default([]),
  renames: slugRecord.default({}),
  skip: z.array(z.string()).default([]),
});

const vercelJsonOptionsSchema = z.strictObject({ categorySlugMap: slugRecord, site: siteSchema });

type Redirect = z.infer<typeof redirectSchema>;

type VercelJsonOptions = z.input<typeof vercelJsonOptionsSchema>;

const permanent = (source: string, destination: string): Redirect => ({
  destination,
  permanent: true,
  source,
});

const withChildren = (path: string): Array<string> => [path, `${path}/`, `${path}/:path*`];

const WORDPRESS_REDIRECTS: Array<Redirect> = [
  ...[
    "/sitemap_index.xml",
    "/post-sitemap.xml",
    "/post-sitemap:n.xml",
    "/page-sitemap.xml",
    "/category-sitemap.xml",
    "/post_tag-sitemap.xml",
    "/author-sitemap.xml",
  ].map((source) => permanent(source, "/sitemap-index.xml")),
  ...["/feed", "/feed/", "/feed/atom", "/feed/atom/", "/comments/feed", "/comments/feed/"].map(
    (source) => permanent(source, "/rss.xml"),
  ),
  { ...permanent("/", "/rss.xml"), has: [{ key: "feed", type: "query" }] },
  ...[
    ...withChildren("/wp-admin"),
    "/wp-login.php",
    "/xmlrpc.php",
    ...withChildren("/wp-content"),
    ...withChildren("/wp-includes"),
    ...withChildren("/wp-json"),
  ].map((source) => permanent(source, "/")),
];

const SECURITY_HEADERS = [
  {
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ],
    source: "/(.*)",
  },
];

const categoryRenames = ({ categorySlugMap, site }: z.output<typeof vercelJsonOptionsSchema>) => {
  const liveSlugs = new Set(Object.values(categorySlugMap));
  const skipped = new Set(site.skip);
  const targets = new Map<string, string>();

  const rename = (from: string, to: string): void => {
    const existing = targets.get(from);

    if (existing !== undefined && existing !== to) {
      throw new Error(`/${from}/ cannot redirect to both /${existing}/ and /${to}/`);
    }

    targets.set(from, to);
  };

  for (const name of skipped) {
    if (!Object.hasOwn(categorySlugMap, name)) {
      throw new Error(`skip names ${JSON.stringify(name)}, which is not in the category slug map`);
    }
  }

  for (const [name, slug] of Object.entries(categorySlugMap)) {
    const natural = slugify(categoryLabel(name));

    if (natural !== "" && !liveSlugs.has(natural) && !skipped.has(name)) {
      rename(natural, slug);
    }
  }

  for (const [from, to] of Object.entries(site.renames)) {
    rename(from, to);
  }

  return [...targets];
};

const buildVercelJson = (options: VercelJsonOptions): string => {
  const parsed = vercelJsonOptionsSchema.parse(options);
  const renames = categoryRenames(parsed);

  const config = {
    $schema: "https://openapi.vercel.sh/vercel.json",
    headers: SECURITY_HEADERS,
    redirects: [
      ...WORDPRESS_REDIRECTS,
      ...renames.flatMap(([from, to]) => [
        permanent(`/${from}`, `/${to}`),
        permanent(`/${from}/:path*`, `/${to}/:path*`),
      ]),
      ...renames.map(([from, to]) => permanent(`/${from}/`, `/${to}/`)),
      ...renames.map(([from, to]) => permanent(`/${from}/:path*/`, `/${to}/:path*/`)),
      ...parsed.site.redirects,
    ],
  };

  return `${JSON.stringify(config, KEY_ORDER, 2)}\n`;
};

export { buildVercelJson, vercelJsonOptionsSchema };
