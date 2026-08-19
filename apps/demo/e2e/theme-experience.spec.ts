import { expect, test, type Page } from "@playwright/test";

const expectNoPageOverflow = async (page: Page) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
};

const expectDarkTheme = async (page: Page) => {
  const isDark = await page
    .locator("html")
    .evaluate((element) => element.classList.contains("dark"));
  expect(isDark).toBe(true);
};

test("preserves keyboard navigation and theme preference across pages", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

  const themeToggle = page.getByRole("button", { name: "Toggle theme" });
  await expect(themeToggle).toBeVisible();

  if (testInfo.project.name === "mobile-chromium") {
    const target = await themeToggle.boundingBox();
    expect(target?.height).toBeGreaterThanOrEqual(44);
    expect(target?.width).toBeGreaterThanOrEqual(44);
  }

  await themeToggle.click();
  await expectDarkTheme(page);
  expect(await page.evaluate(() => window.localStorage.getItem("theme"))).toBe("dark");

  await page.getByRole("link", { name: "Code, blockquotes, and prose" }).first().click();
  expect(new URL(page.url()).pathname).toBe("/blog/code-and-prose");
  await expect(
    page.getByRole("heading", { level: 1, name: "Code, blockquotes, and prose" }),
  ).toBeVisible();
  await expectDarkTheme(page);

  await page.reload();
  await expectDarkTheme(page);
});

test("keeps article content inside the viewport", async ({ page }) => {
  await page.goto("/blog/code-and-prose");
  await expect(
    page.getByRole("heading", { level: 1, name: "Code, blockquotes, and prose" }),
  ).toBeVisible();
  await expectNoPageOverflow(page);
});
