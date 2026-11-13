import { z } from "zod";

const pathSegment = z
  .string()
  .regex(/^(?!\.{1,2}$)[^\/\\?#\s]+$/v, "must be a nonempty URL path segment");

const listingCopy = z.strictObject({
  description: z.string(),
  eyebrow: z.string().optional(),
  title: z.string(),
});

const namedListingCopy = listingCopy.extend({ title: z.string().default("{name}") });

const configSchema = z.strictObject({
  archivePath: pathSegment.default("posts"),
  categorySlugs: z.string().default("./src/data/category-slugs.json"),
  colorScheme: z.enum(["auto", "light", "dark"]).default("auto"),
  components: z.strictObject({
    ArchiveLayout: z.string().optional(),
    ListLayout: z.string(),
    PostLayout: z.string(),
  }),
  defaultCategory: pathSegment,
  description: z.string(),
  includeSecondaryCategories: z.boolean().default(false),
  logo: z.string().optional(),
  ogImage: z.string().optional(),
  pageSize: z.int().positive().default(24),
  strings: z.strictObject({
    archive: listingCopy,
    category: namedListingCopy,
    tag: namedListingCopy,
  }),
  tagAliases: z.string().optional(),
  title: z.string().min(1),
});

type AwesomenessUserConfig = z.input<typeof configSchema>;

type AwesomenessConfig = z.output<typeof configSchema>;

const resolveConfig = (options: AwesomenessUserConfig): AwesomenessConfig => {
  const result = configSchema.safeParse(options);

  if (!result.success) {
    throw new Error(`Invalid astro-awesomeness config:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
};

export { resolveConfig };

export type { AwesomenessConfig, AwesomenessUserConfig };
