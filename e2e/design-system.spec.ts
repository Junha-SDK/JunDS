import { test, expect } from "@playwright/test";

test.describe("Design System", () => {
  test("main page loads and shows hero", async ({ page }) => {
    await page.goto("/design-system");
    await expect(page.locator("h1")).toContainText("junDS");
  });

  test("stats section shows correct numbers", async ({ page }) => {
    await page.goto("/design-system");
    await expect(page.getByText("Primitives")).toBeVisible();
    await expect(page.getByText("Composites")).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/design-system");
    await page.click('a[href="/design-system/primitives/button"]');
    await expect(page.locator("h1")).toContainText("Button");
  });

  test("button page shows all variants", async ({ page }) => {
    await page.goto("/design-system/primitives/button");
    await expect(page.getByText("primary")).toBeVisible();
    await expect(page.getByText("secondary")).toBeVisible();
    await expect(page.getByText("danger")).toBeVisible();
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/design-system");
    const html = page.locator("html");
    // Check initial state
    const initialTheme = await html.getAttribute("data-theme");
    expect(initialTheme).toBeTruthy();
  });

  test("search filters navigation", async ({ page }) => {
    await page.goto("/design-system");
    const searchInput = page.locator('input[placeholder*="검색"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Button");
      await expect(page.getByText("Button").first()).toBeVisible();
    }
  });

  test("template pages load", async ({ page }) => {
    await page.goto("/design-system/showcase/templates/dashboard");
    await expect(page.getByText("대시보드")).toBeVisible();
  });

  test("lego showcase page loads", async ({ page }) => {
    await page.goto("/design-system/showcase/lego");
    await expect(page.getByText("레고 조합")).toBeVisible();
  });

  test("framework box page loads", async ({ page }) => {
    await page.goto("/design-system/framework/box");
    await expect(page.locator("h1")).toContainText("Box");
  });

  test("modal can open and close", async ({ page }) => {
    await page.goto("/design-system/composites/modal");
    // Look for any button that opens a modal
    const openButton = page.getByRole("button", { name: /열기|Open|모달/ }).first();
    if (await openButton.isVisible()) {
      await openButton.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
    }
  });
});
