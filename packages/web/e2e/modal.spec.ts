/**
 * jd-modal + focus-trap — 실브라우저 의무 구간(03 §9.1): 실제 Tab 순환·포커스 복귀는
 * DOM 시뮬레이터가 보증하지 못한다. 이벤트 계약은 §1.5(요청형 jd-request-close만 cancelable).
 */
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { mount, pressTab } from "./helpers.js";

const MODAL = `
  <jd-button id="opener">열기</jd-button>
  <jd-modal id="m">
    <div>
      <input id="first" data-autofocus placeholder="첫 필드">
      <input id="mid" placeholder="중간">
      <jd-button id="last">저장</jd-button>
    </div>
  </jd-modal>`;

async function openModal(page: Page): Promise<void> {
  await page.evaluate(() => {
    // 포커스는 실제 포커서블(내부 네이티브 button)에 — 호스트는 tabindex가 없다
    document.querySelector<HTMLButtonElement>("#opener button")!.focus();
    (document.querySelector("#m") as HTMLElement & { showModal(): void }).showModal();
  });
  await expect(page.locator("#m .jd-modal__panel")).toBeVisible();
}

test("열기: 패널 표시 + [data-autofocus] 초기 포커스 + body 스크롤 락", async ({ page }) => {
  await mount(page, MODAL);
  await openModal(page);
  await expect(page.locator("#first")).toBeFocused();
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  expect(bodyOverflow).toBe("hidden");
});

test("Tab이 패널 안에서 순환한다 (마지막→첫, Shift+Tab 역방향)", async ({ page, browserName }) => {
  await mount(page, MODAL);
  await openModal(page);
  // first → mid → last(내부 button) → 다시 first
  await pressTab(page, browserName);
  await pressTab(page, browserName);
  await expect(page.locator("#last button")).toBeFocused();
  await pressTab(page, browserName);
  await expect(page.locator("#first")).toBeFocused();
  await pressTab(page, browserName, true);
  await expect(page.locator("#last button")).toBeFocused();
});

test("ESC: jd-close 발행 + 닫힘 + 오프너로 포커스 복귀", async ({ page }) => {
  await mount(page, MODAL);
  await openModal(page);
  const closed = page.evaluate(
    () =>
      new Promise((r) =>
        document.querySelector("#m")!.addEventListener("jd-close", () => r(true), { once: true }),
      ),
  );
  await page.keyboard.press("Escape");
  expect(await closed).toBe(true);
  await expect(page.locator("#m .jd-modal__panel")).toBeHidden();
  await expect(page.locator("#opener button")).toBeFocused();
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  expect(bodyOverflow).toBe("");
});

test("백드롭 클릭으로 닫힌다 — persistent면 무시, ESC는 여전히 동작", async ({ page }) => {
  await mount(page, MODAL);
  await openModal(page);
  // 중앙은 패널이 덮는다 — 백드롭 자신이 이벤트 타깃이 되도록 모서리를 찍는다
  await page.locator("#m .jd-modal__backdrop").click({ position: { x: 5, y: 5 } });
  await expect(page.locator("#m .jd-modal__panel")).toBeHidden();

  await page.evaluate(() => document.querySelector("#m")!.setAttribute("persistent", ""));
  await openModal(page);
  await page.locator("#m .jd-modal__backdrop").click({ position: { x: 5, y: 5 } });
  await expect(page.locator("#m .jd-modal__panel")).toBeVisible(); // persistent — 유지
  await page.keyboard.press("Escape");
  await expect(page.locator("#m .jd-modal__panel")).toBeHidden(); // ESC는 항상
});

test("jd-request-close preventDefault → 상태 변화 중단 (WEB-04)", async ({ page }) => {
  await mount(page, MODAL);
  await openModal(page);
  await page.evaluate(() =>
    document.querySelector("#m")!.addEventListener("jd-request-close", (e) => e.preventDefault(), {
      once: true,
    }),
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("#m .jd-modal__panel")).toBeVisible(); // 취소됨
  await page.keyboard.press("Escape");
  await expect(page.locator("#m .jd-modal__panel")).toBeHidden(); // 두 번째는 통과
});

test("중첩 모달은 ESC로 위에서부터 닫히고 마지막까지 스크롤 락을 유지한다", async ({ page }) => {
  await mount(
    page,
    `<jd-modal id="first"><button>첫 모달</button></jd-modal>
     <jd-modal id="second"><button>둘째 모달</button></jd-modal>`,
  );
  await page.evaluate(() => {
    (document.querySelector("#first") as HTMLElement & { showModal(): void }).showModal();
    (document.querySelector("#second") as HTMLElement & { showModal(): void }).showModal();
  });

  await page.keyboard.press("Escape");
  await expect(page.locator("#second")).toBeHidden();
  await expect(page.locator("#first .jd-modal__panel")).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(page.locator("#first")).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});
