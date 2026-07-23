/**
 * B2 layout 실브라우저 구간 — show/hide 실 미디어쿼리, container 기하,
 * app-shell 상호작용(Ctrl+B·모바일 드로어·스크롤 락·matchMedia 전환).
 */
import { expect, test } from "@playwright/test";
import { mount } from "./helpers.js";

test.describe("jd-show / jd-hide — 실 미디어쿼리 (display:contents 호스트)", () => {
  const VISIBILITY = `
    <jd-show above="md"><p id="s-above">md 이상에서만</p></jd-show>
    <jd-show below="md"><p id="s-below">md 미만에서만</p></jd-show>
    <jd-hide above="md"><p id="h-above">md 이상에서 숨김</p></jd-hide>`;

  test("뷰포트 500px(md 미만) — above 숨김·below 표시·hide(above) 표시", async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 600 });
    await mount(page, VISIBILITY);
    await expect(page.locator("#s-above")).toBeHidden();
    await expect(page.locator("#s-below")).toBeVisible();
    await expect(page.locator("#h-above")).toBeVisible();
  });

  test("뷰포트 900px(md 이상) — 반전된다", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 600 });
    await mount(page, VISIBILITY);
    await expect(page.locator("#s-above")).toBeVisible();
    await expect(page.locator("#s-below")).toBeHidden();
    await expect(page.locator("#h-above")).toBeHidden();
  });
});

test.describe("jd-container 기하", () => {
  test("기본 lg=1024px 상한 + 중앙 정렬(margin auto)", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 600 });
    await mount(page, `<jd-container id="c"><p>내용</p></jd-container>`);
    const box = await page.locator("#c").boundingBox();
    expect(box!.width).toBe(1024);
    expect(box!.x).toBeGreaterThan(100); // 중앙 — 좌측 여백 존재
  });

  test("width:100%+padding-inline에서 부모를 넘치지 않는다 (DEC-014-9)", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 600 });
    await mount(
      page,
      `<div id="wrap" style="width: 600px"><jd-container><p>내용</p></jd-container></div>`,
    );
    const overflow = await page.evaluate(() => {
      const wrap = document.querySelector("#wrap")!;
      const c = document.querySelector("jd-container")!;
      return c.getBoundingClientRect().width - wrap.getBoundingClientRect().width;
    });
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("jd-app-shell 상호작용", () => {
  const SHELL = `
    <jd-app-shell id="shell">
      <nav slot="sidebar"><a href="#">메뉴 1</a></nav>
      <div slot="header">헤더</div>
      <p>본문</p>
    </jd-app-shell>`;

  test("데스크톱: Ctrl+B가 레일을 접고(260→64) jd-sidebar-toggle을 사후 통지한다", async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 700 });
    await mount(page, SHELL);
    const aside = page.locator("#shell .jd-app-shell__sidebar");
    await expect.poll(async () => (await aside.boundingBox())!.width).toBe(260);

    const toggled = page.evaluate(
      () =>
        new Promise((r) =>
          document.querySelector("#shell")!.addEventListener(
            "jd-sidebar-toggle",
            (e) => r((e as CustomEvent<{ collapsed: boolean }>).detail.collapsed),
            { once: true },
          ),
        ),
    );
    await page.keyboard.press("Control+b");
    expect(await toggled).toBe(true);
    await expect(page.locator("#shell")).toHaveAttribute("sidebar-collapsed", "");
    await expect.poll(async () => (await aside.boundingBox())!.width).toBe(64); // 300ms 전이 수렴
  });

  test("모바일: 데스크톱 레일이 사라지고 햄버거→드로어+백드롭+스크롤 락, 백드롭 클릭 해제", async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 700 });
    await mount(page, SHELL);
    const shell = page.locator("#shell");
    await expect(shell).toHaveAttribute("data-mobile", "");
    await expect(page.locator("#shell .jd-app-shell__sidebar")).toBeHidden(); // 닫힌 드로어
    const menu = page.locator("#shell .jd-app-shell__menu");
    await expect(menu).toBeVisible();

    await menu.click();
    await expect(shell).toHaveAttribute("mobile-open", "");
    await expect(page.locator("#shell .jd-app-shell__sidebar")).toBeVisible();
    await expect(page.locator("#shell .jd-app-shell__backdrop")).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.locator("#shell .jd-app-shell__backdrop").click({ position: { x: 490, y: 650 } });
    await expect(shell).not.toHaveAttribute("mobile-open");
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("드로어 열린 채 데스크톱 폭 복귀 → 드로어 자동 닫힘 (matchMedia change)", async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 700 });
    await mount(page, SHELL);
    await page.locator("#shell .jd-app-shell__menu").click();
    await expect(page.locator("#shell")).toHaveAttribute("mobile-open", "");

    await page.setViewportSize({ width: 1100, height: 700 });
    await expect(page.locator("#shell")).not.toHaveAttribute("data-mobile");
    await expect(page.locator("#shell")).not.toHaveAttribute("mobile-open");
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("선점된 단축키 존중 — defaultPrevented면 토글하지 않는다 (⌘K 선례)", async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 700 });
    await mount(page, SHELL);
    await page.evaluate(() =>
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "b") e.preventDefault();
      }, { capture: true }),
    );
    await page.keyboard.press("Control+b");
    await expect(page.locator("#shell")).not.toHaveAttribute("sidebar-collapsed");
  });
});
