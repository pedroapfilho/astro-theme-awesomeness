import { compile, match } from "path-to-regexp";
import { z } from "zod";

const querySchema = z.strictObject({ key: z.string(), type: z.literal("query") });

const redirectSchema = z.looseObject({
  destination: z.string(),
  has: z.array(querySchema).default([]),
  permanent: z.boolean().default(false),
  source: z.string(),
});

type Redirect = z.output<typeof redirectSchema>;

type Probe = { path: string; query: Array<string> };

const PERMANENT = 308;
const TEMPORARY = 307;

const probeFor = ({ has, source }: Redirect): Probe => ({
  path: source.replaceAll(/:\w+\*/gv, "a/b").replaceAll(/:\w+/gv, "a"),
  query: has.map(({ key }) => key),
});

const follow = (redirects: Array<Redirect>, { path, query }: Probe): string => {
  for (const { destination, has, permanent, source } of redirects) {
    const matched = match(source, { sensitive: true, strict: true })(path);

    if (matched !== false && has.every(({ key }) => query.includes(key))) {
      return `${permanent ? PERMANENT : TEMPORARY} ${compile(destination)(matched.params)}`;
    }
  }

  return "no redirect";
};

const resolveRedirects = (redirects: Array<Redirect>): Record<string, string> =>
  Object.fromEntries(
    redirects.map((redirect) => {
      const probe = probeFor(redirect);
      const query = probe.query.map((key) => `?${key}`).join("");

      return [`${probe.path}${query}`, follow(redirects, probe)];
    }),
  );

export { redirectSchema, resolveRedirects };
