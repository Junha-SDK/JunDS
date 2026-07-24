/**
 * B5 특수 입력 — 실브라우저에서만 증명되는 계약.
 * happy-dom은 순차 포커스 규칙(라디오 그룹 단일 탭스톱)·네이티브 화살표 순회·
 * 실제 드래그 상태·스크롤을 재현하지 못한다. 배치 판단의 근거가 된 항목만 고정한다.
 */
import { expect, test } from "@playwright/test";
import { mount } from "./helpers.js";

test("jd-star-rating: 라디오 그룹은 탭스톱 1개 (v2는 별 개수만큼 탭했다)", async ({ page }) => {
  await mount(page, `<button id="before">앞</button><jd-star-rating value="3"></jd-star-rating><button id="after">뒤</button>`);
  await page.locator("#before").focus();

  let stops = 0;
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() =>
      document.querySelector("jd-star-rating")!.contains(document.activeElement),
    );
    if (inside) stops++;
    else if (stops > 0) break;
  }
  expect(stops).toBe(1);
  await expect(page.locator("#after")).toBeFocused(); // 그룹을 정확히 통과
});

test("jd-star-rating: 화살표가 선택을 옮긴다 — 수제 키보드 코드 0줄", async ({ page }) => {
  await mount(page, `<jd-star-rating value="2"></jd-star-rating>`);
  const el = page.locator("jd-star-rating");
  await el.locator("input:checked").focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => el.evaluate((n: HTMLElement & { value: number }) => n.value)).toBe(3);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => el.evaluate((n: HTMLElement & { value: number }) => n.value)).toBe(2);
  await expect(el.locator("[data-filled]")).toHaveCount(2);
});

test("jd-pin-input: 실제 타이핑이 칸을 자동 전진시키고 Backspace가 후퇴시킨다", async ({ page }) => {
  await mount(page, `<jd-pin-input length="4"></jd-pin-input>`);
  const cells = page.locator("jd-pin-input input");
  await cells.first().focus();
  await page.keyboard.type("123");
  await expect(cells.nth(3)).toBeFocused();
  await expect(page.locator("jd-pin-input")).toHaveJSProperty("value", "123");

  await page.keyboard.press("Backspace"); // 빈 칸 → 앞칸으로 후퇴하며 지운다
  await expect(cells.nth(2)).toBeFocused();
  await expect(page.locator("jd-pin-input")).toHaveJSProperty("value", "12");
});

test("jd-pin-input: 칸 포커스 시 기존 글자가 선택되어 덮어쓰기가 된다", async ({ page }) => {
  await mount(page, `<jd-pin-input length="3" value="789"></jd-pin-input>`);
  const first = page.locator("jd-pin-input input").first();
  await first.focus();
  await page.keyboard.type("5"); // 선택 상태라 교체
  await expect(first).toHaveValue("5");
});

test("jd-number-input: 스텝 버튼은 탭 순서 밖 — Tab은 입력으로 바로 간다", async ({ page }) => {
  await mount(page, `<button id="before">앞</button><jd-number-input value="1" label="수량"></jd-number-input>`);
  await page.locator("#before").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("jd-number-input input")).toBeFocused();
});

test("jd-number-input: ↑↓ 네이티브 스테퍼가 동작하고 확정 시 클램프된다", async ({ page }) => {
  await mount(page, `<jd-number-input value="9" max="10" label="수량"></jd-number-input>`);
  const input = page.locator("jd-number-input input");
  await input.focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("jd-number-input")).toHaveJSProperty("value", 10);
  await page.keyboard.press("ArrowUp"); // 네이티브 max에서 멈춘다
  await expect(input).toHaveValue("10");
});

test("jd-phone-input: 국가 select를 키보드로 바꿀 수 있다 (v2 수제 드롭다운은 불가)", async ({ page }) => {
  await mount(page, `<jd-phone-input value="1012345678"></jd-phone-input>`);
  const el = page.locator("jd-phone-input");
  await expect(el.locator("input")).toHaveValue("101-2345-678");
  await el.locator("select").selectOption("US");
  await expect(el).toHaveJSProperty("country", "US");
  await expect(el).toHaveJSProperty("fullNumber", "+11012345678");
});

test("jd-currency-input: 포커스/블러가 표기를 갈아끼운다", async ({ page }) => {
  await mount(page, `<jd-currency-input value="1500000" label="금액"></jd-currency-input>`);
  const input = page.locator("jd-currency-input input");
  await expect(input).toHaveValue("₩1,500,000");
  await input.focus();
  await expect(input).toHaveValue("1500000");
  await input.blur();
  await expect(input).toHaveValue("₩1,500,000");
});

test("jd-file-upload: 실제 드롭이 파일을 통지하고 드래그 상태가 반영된다", async ({ page }) => {
  await mount(page, `<jd-file-upload max-size="16"></jd-file-upload>`);
  const zone = page.locator(".jd-file-upload__zone");
  await zone.dispatchEvent("dragover"); // 핸들러는 dataTransfer를 읽지 않는다
  await expect(zone).toHaveAttribute("data-drag", "");
  await zone.dispatchEvent("dragleave");
  await expect(zone).not.toHaveAttribute("data-drag", "");

  await page.evaluate(() => {
    const w = window as unknown as { got?: string[]; failed?: string };
    document.addEventListener("jd-change", (e) => {
      w.got = (e as CustomEvent<{ files: File[] }>).detail.files.map((f) => f.name);
    });
    document.addEventListener("jd-error", (e) => {
      w.failed = (e as CustomEvent<{ reason: string }>).detail.reason;
    });
  });
  const small = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(["ok"], "a.txt", { type: "text/plain" }));
    return dt;
  });
  await zone.dispatchEvent("drop", { dataTransfer: small });
  expect(await page.evaluate(() => (window as unknown as { got?: string[] }).got)).toEqual(["a.txt"]);

  // max-size(16B) 초과는 거부 — 메시지가 보이고 jd-change는 없다
  const big = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(["x".repeat(64)], "big.bin"));
    return dt;
  });
  await zone.dispatchEvent("drop", { dataTransfer: big });
  expect(await page.evaluate(() => (window as unknown as { failed?: string }).failed)).toBe("max-size");
  await expect(page.locator(".jd-file-upload__error")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { got?: string[] }).got)).toEqual(["a.txt"]);

  // 키보드로 피커 열기 — 실제 파일 선택창은 열지 않고 click 위임만 확인
  await page.evaluate(() => {
    const input = document.querySelector("jd-file-upload input")!;
    input.addEventListener("click", (e) => {
      e.preventDefault();
      (window as unknown as { picked: boolean }).picked = true;
    });
  });
  await zone.focus();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => (window as unknown as { picked?: boolean }).picked)).toBe(true);
});

test("jd-back-top: 초기엔 숨김, 임계 초과 스크롤에서 노출되고 클릭이 최상단으로 보낸다", async ({ page }) => {
  await mount(page, `<div style="height:300vh"></div><jd-back-top threshold="200"></jd-back-top>`);
  const el = page.locator("jd-back-top");
  await expect(el).toBeHidden(); // 프리렌더 결정성: 첫 골격은 항상 숨김

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(el).toBeVisible();

  await el.locator("button").click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(el).toBeHidden();
});

/**
 * 클립보드 성공 경로는 보안 컨텍스트가 필요하다 — 이 스위트는 서버 없이
 * setContent(about:blank)로 도는 설계라 navigator.clipboard 자체가 없다.
 * 그래서 여기서는 그 환경이 그대로 재현해 주는 **실패 경로**를 고정한다:
 * v2는 await만 걸어 unhandled rejection을 냈고, v3는 jd-error로 흡수한다.
 * (성공 경로는 vitest에서 clipboard 스텁으로 검증)
 */
test("jd-copy-button: 클립보드 불가 환경에서 jd-error로 흡수 — unhandled rejection 없음", async ({ page }) => {
  await mount(page, `<jd-copy-button text="복사 대상"></jd-copy-button>`);
  expect(await page.evaluate(() => window.isSecureContext || !!navigator.clipboard)).toBe(false);

  await page.evaluate(() => {
    const w = window as unknown as { errs: number; unhandled: number };
    w.errs = 0;
    w.unhandled = 0;
    document.addEventListener("jd-error", () => (w.errs += 1));
    window.addEventListener("unhandledrejection", () => (w.unhandled += 1));
  });
  const el = page.locator("jd-copy-button");
  await el.locator("button").click();
  await page.waitForTimeout(50);
  const state = await page.evaluate(() => {
    const w = window as unknown as { errs: number; unhandled: number };
    return { errs: w.errs, unhandled: w.unhandled };
  });
  expect(state).toEqual({ errs: 1, unhandled: 0 });
  await expect(el).not.toHaveAttribute("copied", "");
});
