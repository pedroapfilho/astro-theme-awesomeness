import { describe, expect, it } from "vitest";

import { buildVercelJson, vercelJsonOptionsSchema } from "./vercel-json";

const categorySlugMap = Object.fromEntries([
  ["Architecture", "arquitetura"],
  ["Arquitetura", "arquitetura"],
  ["Entrevistas com Arquitetos", "entrevistas-arquitetos"],
  ["Reformas % Tendências", "reformas-tendencias"],
  ["Reformas &amp; Tendências", "reformas-tendencias-2"],
  ["Tutorial &amp; Técnicas", "tutoriais-tecnicas"],
  ["Tutorial &#8211; Técnicas", "tutoriais-tecnicas"],
]);

const categoryRows = (options: Parameters<typeof buildVercelJson>[0]): Array<string> =>
  buildVercelJson(options)
    .split("\n")
    .filter((line) => /"(?:source|destination)"/v.test(line))
    .slice(56, -1)
    .map((line) => line.trim());

describe("buildVercelJson", () => {
  it("writes the WordPress redirects first and the security headers last, in Vercel's key order", () => {
    const json = buildVercelJson({ categorySlugMap: {}, site: {} });
    const { headers, redirects } = JSON.parse(json);
    expect(redirects).toHaveLength(28);
    expect(json.startsWith('{\n  "$schema": "https://openapi.vercel.sh/vercel.json",\n')).toBe(
      true,
    );
    expect(JSON.stringify(redirects[0])).toBe(
      '{"source":"/sitemap_index.xml","destination":"/sitemap-index.xml","permanent":true}',
    );
    expect(JSON.stringify(redirects[13])).toBe(
      '{"source":"/","has":[{"type":"query","key":"feed"}],"destination":"/rss.xml","permanent":true}',
    );
    expect(redirects.at(-1).source).toBe("/wp-json/:path*");
    expect(JSON.stringify(headers)).toBe(
      '[{"source":"/(.*)","headers":[{"key":"X-Frame-Options","value":"DENY"},{"key":"X-Content-Type-Options","value":"nosniff"},{"key":"Referrer-Policy","value":"strict-origin-when-cross-origin"}]}]',
    );
  });

  it("redirects each renamed category's decoded natural slug in four URL shapes", () => {
    const rows = categoryRows({ categorySlugMap, site: { skip: ["Entrevistas com Arquitetos"] } });

    expect(rows.filter((row) => row.includes('"source"'))).toEqual([
      '"source": "/architecture",',
      '"source": "/architecture/:path*",',
      '"source": "/tutorial-tecnicas",',
      '"source": "/tutorial-tecnicas/:path*",',
      '"source": "/architecture/",',
      '"source": "/tutorial-tecnicas/",',
      '"source": "/architecture/:path*/",',
      '"source": "/tutorial-tecnicas/:path*/",',
    ]);
    expect(rows.filter((row) => row.includes('"destination"')).slice(4)).toEqual([
      '"destination": "/arquitetura/",',
      '"destination": "/tutoriais-tecnicas/",',
      '"destination": "/arquitetura/:path*/",',
      '"destination": "/tutoriais-tecnicas/:path*/",',
    ]);
  });

  it("never redirects a slug the map still routes to", () => {
    const json = buildVercelJson({ categorySlugMap, site: {} });
    expect(json).not.toContain('"source": "/reformas-tendencias');
    expect(json).toContain('"source": "/entrevistas-com-arquitetos/:path*/"');
  });

  it("appends per-site renames to the families and per-site redirects at the end", () => {
    const { redirects } = JSON.parse(
      buildVercelJson({
        categorySlugMap: {},
        site: {
          redirects: [{ destination: "/b/post/", permanent: true, source: "/a/post-2/" }],
          renames: { marketingdigital: "marketing-digital" },
        },
      }),
    );

    expect(redirects.slice(28).map(({ source }: { source: string }) => source)).toEqual([
      "/marketingdigital",
      "/marketingdigital/:path*",
      "/marketingdigital/",
      "/marketingdigital/:path*/",
      "/a/post-2/",
    ]);
    expect(JSON.stringify(redirects.at(-1))).toBe(
      '{"source":"/a/post-2/","destination":"/b/post/","permanent":true}',
    );
  });

  it("keeps a per-site redirect's conditions, in Vercel's key order", () => {
    const { redirects } = JSON.parse(
      buildVercelJson({
        categorySlugMap: {},
        site: {
          redirects: [
            {
              destination: "/busca/",
              has: [
                { key: "s", type: "query" },
                { key: "lang", type: "cookie", value: "pt" },
              ],
              permanent: false,
              source: "/",
            },
          ],
        },
      }),
    );

    expect(JSON.stringify(redirects.at(-1))).toBe(
      '{"source":"/","has":[{"type":"query","key":"s"},{"type":"cookie","key":"lang","value":"pt"}],"destination":"/busca/","permanent":false}',
    );
  });

  it("rejects two targets for one slug, a skip entry the map lacks and an unknown redirect key", () => {
    expect(() =>
      buildVercelJson({ categorySlugMap, site: { renames: { architecture: "arq" } } }),
    ).toThrow("/architecture/ cannot redirect to both /arquitetura/ and /arq/");
    expect(() => buildVercelJson({ categorySlugMap, site: { skip: ["Missing"] } })).toThrow(
      'skip names "Missing"',
    );
    expect(() =>
      vercelJsonOptionsSchema.parse({
        categorySlugMap,
        site: { redirects: [{ destination: "/", permanent: true, source: "/a", statusCode: 301 }] },
      }),
    ).toThrow("statusCode");
  });
});
