import { createServer, type Server } from "node:http";

import { afterEach, describe, expect, it } from "vitest";

import { feed, pages } from "./__tests__/fixtures";
import { crawlProduction } from "./production";

const servers: Array<Server> = [];

const sitemap = (site: string, paths: Array<string>): string =>
  `<urlset>${paths.map((path) => `<url><loc>${site}${path}</loc></url>`).join("")}</urlset>`;

const startSite = async (listed: Array<string>, failOnce: Array<string> = []) => {
  const hits = new Map<string, number>();

  const server = createServer((request, response) => {
    const path = request.url ?? "";
    const site = `http://${request.headers.host}`;
    const hit = (hits.get(path) ?? 0) + 1;

    const body = {
      ...pages(site),
      "/rss.xml": feed(site),
      "/sitemap-0.xml": sitemap(site, listed),
      "/sitemap-index.xml": `<sitemapindex><sitemap><loc>${site}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
    }[path];

    hits.set(path, hit);
    response.statusCode = body === undefined || (failOnce.includes(path) && hit === 1) ? 500 : 200;
    response.end(body);
  });

  servers.push(server);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  if (address === null || typeof address === "string") {
    throw new Error("The test site has no TCP port");
  }

  return { hits, site: `http://127.0.0.1:${address.port}` };
};

afterEach(() => {
  for (const server of servers.splice(0)) {
    server.closeAllConnections();
    server.close();
  }
});

describe("crawlProduction", () => {
  it("reads every page the sitemaps list, the feed and the sitemap files", async () => {
    const { site } = await startSite(["/", "/notes/hello/"]);
    const { feedXml, files, pages: crawled } = await crawlProduction(site);

    expect(feedXml).toBe(feed(site));
    expect(files).toEqual(["/rss.xml", "/sitemap-index.xml", "/sitemap-0.xml"]);
    expect([...crawled.keys()].toSorted()).toEqual(["/", "/notes/hello/"]);
    expect(crawled.get("/notes/hello/")).toMatchObject({
      canonical: `${site}/notes/hello/`,
      links: [
        { path: "/", text: "/" },
        { path: "/tag/astro/", text: "/tag/astro/" },
      ],
      type: "article",
    });
  });

  it("retries a request that fails", async () => {
    const { hits, site } = await startSite(["/notes/hello/"], ["/notes/hello/"]);
    const { pages: crawled } = await crawlProduction(site);

    expect(crawled.get("/notes/hello/")?.title).toBe("Page /notes/hello/");
    expect(hits.get("/notes/hello/")).toBe(2);
  });

  it("gives up on a page after three attempts", async () => {
    const { hits, site } = await startSite(["/gone/"]);

    await expect(crawlProduction(site)).rejects.toThrow(`GET ${site}/gone/ failed`);
    expect(hits.get("/gone/")).toBe(3);
  });
});
