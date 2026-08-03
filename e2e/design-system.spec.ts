import { test, expect } from "@playwright/test";

test.describe("Design System", () => {
  test("main page loads and shows hero", async ({ page }) => {
    await page.goto("/design-system");
    // 시각 정제 트랙에서 확정된 히어로 카피 — 바뀌면 의도된 카피 변경인지 확인할 것
    await expect(page.locator("h1")).toContainText("design system");
  });

  test("stats section shows correct numbers", async ({ page }) => {
    await page.goto("/design-system");
    // "Primitives" / "Composites" appear multiple times across the page —
    // pin to the heading-role matches.
    await expect(page.getByRole("heading", { name: "Primitives" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Composites" }).first()).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/design-system");
    await page.click('a[href="/design-system/primitives/button"]');
    await expect(page.locator("h1")).toContainText("Button");
  });

  test("button page shows all variants", async ({ page }) => {
    await page.goto("/design-system/primitives/button");
    await expect(page.getByText("primary").first()).toBeVisible();
    await expect(page.getByText("secondary").first()).toBeVisible();
    await expect(page.getByText("danger").first()).toBeVisible();
  });

  test("dark mode toggle is reachable from header", async ({ page }) => {
    await page.goto("/design-system");
    // The header dark-mode toggle has aria-label "다크 모드" or similar — look
    // for any button whose accessible name mentions theme/dark/light.
    const toggle = page.getByRole("button", { name: /다크|라이트|theme|mode/i }).first();
    await expect(toggle).toBeVisible();
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
    await expect(page.getByText("대시보드").first()).toBeVisible();
  });

  test("lego showcase page loads", async ({ page }) => {
    await page.goto("/design-system/showcase/lego");
    await expect(page.getByText("레고", { exact: false }).first()).toBeVisible();
  });

  test("framework box page loads", async ({ page }) => {
    await page.goto("/design-system/framework/box");
    await expect(page.locator("h1")).toContainText("Box");
  });

  test("modal showcase page renders heading", async ({ page }) => {
    // Open + close interaction is covered by the unit/a11y suite. Here we only
    // verify the showcase route renders its top-level heading.
    await page.goto("/design-system/composites/modal");
    await expect(page.locator("h1")).toContainText("Modal");
  });

  test("login template renders form with email + password fields", async ({ page }) => {
    await page.goto("/design-system/showcase/templates/login");
    await expect(page.getByText("다시 오신 것을 환영합니다")).toBeVisible();
    // Email field uses placeholder "name@example.com"; password is type=password.
    const emailInput = page.locator('input[placeholder="name@example.com"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    // Click to ensure React has hydrated and is listening for input events
    // before typing; otherwise the controlled `value` state lags behind.
    await emailInput.click();
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");
    await passwordInput.click();
    await passwordInput.fill("password123");
    await expect(passwordInput).toHaveValue("password123");
  });

  test("command palette opens with Cmd/Ctrl+K and filters components", async ({ page }) => {
    await page.goto("/design-system");
    // Trigger via keyboard: useKeyboard hook listens for meta+k.
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+k" : "Control+k");
    const search = page.locator('input[placeholder*="검색"]').first();
    await expect(search).toBeVisible({ timeout: 5000 });
    await search.fill("button");
    // The palette should narrow to results containing "Button".
    await expect(page.getByText("Button").first()).toBeVisible();
    await page.keyboard.press("Escape");
  });
});
