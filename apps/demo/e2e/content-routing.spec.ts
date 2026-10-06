import { expect, test } from "@playwright/test";

const titles = ["A longer post for reading-time", "Code, blockquotes, and prose", "Hello, world"];
const draftTitle = "An unpublished field note";
const articlePath = "/notes-field/code-and-prose/";
const site = "https://demo.astro-awesomeness.dev";

test("groups normalized tags without duplicating posts", async ({ page }) => {
  await page.goto("/tag/astro/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tagged “astro”");
  const posts = page.getByRole("region", { exact: true, name: "Posts" });
  await expect(posts.locator("article")).toHaveCount(titles.length);
  await expect(posts.getByRole("heading", { level: 2 })).toHaveText(titles);
  for (const title of titles) {
    await expect(posts.getByRole("link", { exact: true, name: title })).toHaveCount(1);
  }
  await expect(page.getByRole("navigation", { name: "Pagination" })).toHaveCount(0);
});

test("derives article metadata from the route and Astro locale", async ({ page }) => {
  await page.goto(articlePath);
  const canonical = `${site}${articlePath}`;
  await expect(page).toHaveTitle("Code, blockquotes, and prose · Awesomeness");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Code, blockquotes, and prose",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
    "content",
    "2026-05-21T00:00:00.000Z",
  );
  await expect(page.locator('meta[property="article:modified_time"]')).toHaveAttribute(
    "content",
    "2026-05-23T00:00:00.000Z",
  );
  const jsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
  );
  expect(jsonLd).toMatchObject({
    "@type": "BlogPosting",
    author: { "@type": "Person", name: "Demo editor", url: "https://example.com/editor" },
    image: "https://images.example.test/prose.jpg",
    mainEntityOfPage: { "@id": canonical },
  });
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", jsonLd.image);
  await expect(page.locator('img[src="https://images.example.test/prose.jpg"]')).toHaveCount(0);
  await expect(page.getByRole("link", { exact: true, name: "astro" })).toHaveCount(1);
  await expect(page.getByText(draftTitle, { exact: true })).toHaveCount(0);
});

for (const archive of ["/posts/", "/notes-field/"]) {
  test(`paginates ${archive} with working previous and next links`, async ({ page, request }) => {
    await page.goto(archive);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${site}${archive}`,
    );
    const next = page.getByRole("link", { name: "Next →" });
    const nextHref = await next.getAttribute("href");
    expect(nextHref).toBe(`${archive}2/`);
    const nextResponse = await request.get(nextHref!);
    expect(nextResponse.status()).toBe(200);
    await next.click();
    await expect(page.getByRole("heading", { name: "Hello, world" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Next →" })).toHaveCount(0);
    const previous = page.getByRole("link", { name: "← Previous" });
    const previousHref = await previous.getAttribute("href");
    expect(previousHref).toBe(archive);
    const previousResponse = await request.get(previousHref!);
    expect(previousResponse.status()).toBe(200);
    await previous.click();
    await expect(page.getByRole("link", { name: "← Previous" })).toHaveCount(0);
    if (archive === "/notes-field/") {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Notes – Field");
    }
  });
}

test("publishes matching RSS and sitemap links without the draft", async ({ page, request }) => {
  const response = await request.get("/rss.xml");
  expect(response.status()).toBe(200);
  const feed = await response.text();
  expect(feed).not.toContain(draftTitle);
  await page.goto("/");
  const items = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    return [...document.querySelectorAll("item")].map((item) => ({
      link: item.querySelector("link")?.textContent,
      title: item.querySelector("title")?.textContent,
    }));
  }, feed);
  expect(items.map((item) => item.title)).toEqual(titles);
  const sitemapResponse = await request.get("/sitemap-0.xml");
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  for (const item of items) {
    const url = new URL(item.link!);
    expect(url.origin).toBe(site);
    expect(url.pathname.endsWith("/")).toBe(true);
    const articleResponse = await request.get(url.pathname);
    expect(articleResponse.status()).toBe(200);
    expect(sitemap).toContain(`<loc>${item.link}</loc>`);
  }
  for (const path of [
    "/",
    "/posts/",
    "/posts/2/",
    "/notes-field/",
    "/notes-field/2/",
    "/tag/astro/",
  ]) {
    const publicResponse = await request.get(path);
    expect(publicResponse.status()).toBe(200);
    expect(await publicResponse.text()).not.toContain(draftTitle);
  }
  expect(sitemap).not.toContain("unpublished-note");
  expect(sitemap).not.toContain("draft-only");
  const draftResponse = await request.get("/notes-field/unpublished-note/");
  const draftTagResponse = await request.get("/tag/draft-only/");
  expect(draftResponse.status()).toBe(404);
  expect(draftTagResponse.status()).toBe(404);
});

test("marks missing pages noindex", async ({ page }) => {
  const response = await page.goto("/missing-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
