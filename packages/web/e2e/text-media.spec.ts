/**
 * B6 텍스트·미디어 — 실브라우저에서만 증명되는 계약.
 * happy-dom은 레이아웃(box-sizing·스크롤 기하)·실제 이미지 로드·미디어쿼리 에뮬레이션을
 * 재현하지 못한다. 배치 판단의 근거가 된 항목만 고정한다.
 */
import { expect, test } from "@playwright/test";
import { mount } from "./helpers.js";

const BLUE_PNG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='45'%3E%3Crect width='80' height='45' fill='%235b4cc7'/%3E%3C/svg%3E";

test("jd-scroll-area: max-height가 padding·border를 포함한 총높이 상한 (DEC-014-9)", async ({
  page,
}) => {
  await mount(
    page,
    `<jd-scroll-area max-height="140" style="padding:12px;border:1px solid #000">
       <div style="height:600px">긴 내용</div>
     </jd-scroll-area>`,
  );
  const box = await page.locator("jd-scroll-area").evaluate((el) => ({
    total: el.getBoundingClientRect().height,
    overflows: el.scrollHeight > el.clientHeight,
  }));
  // content-box였다면 140 + 24(padding) + 2(border) = 166이 된다
  expect(box.total).toBe(140);
  expect(box.overflows).toBe(true);
});

test("jd-scroll-area: 포커스 후 PageDown이 영역을 스크롤한다 (role=region + tabIndex)", async ({
  page,
}) => {
  await mount(
    page,
    `<jd-scroll-area max-height="120"><div style="height:800px">긴 내용</div></jd-scroll-area>`,
  );
  const area = page.locator("jd-scroll-area");
  await area.focus();
  await expect(area).toBeFocused();
  await page.keyboard.press("PageDown");
  await expect.poll(() => area.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});

test("jd-image: 실제 로드 성공 → loaded, 404 → error + fallback 노출", async ({ page }) => {
  await mount(
    page,
    `<jd-image id="ok" src="${BLUE_PNG}" alt="파랑" style="width:80px"></jd-image>
     <jd-image id="bad" src="/none.png" alt="없음" style="width:80px">
       <span slot="fallback">실패</span>
     </jd-image>`,
  );
  await expect(page.locator("#ok")).toHaveAttribute("status", "loaded");
  await expect(page.locator("#bad")).toHaveAttribute("status", "error");
  await expect(page.locator("#bad [slot=fallback]")).toBeVisible();
  await expect(page.locator("#bad img")).toBeHidden(); // 실패 이미지는 감춘다
});

test("jd-image: 캐시된 이미지도 loaded로 보정된다 (리스너보다 로드가 빠른 경우)", async ({
  page,
}) => {
  await mount(page, `<jd-image src="${BLUE_PNG}" alt="첫 로드" style="width:80px"></jd-image>`);
  await expect(page.locator("jd-image")).toHaveAttribute("status", "loaded");
  // 같은 src로 새 요소를 붙이면 메모리 캐시에서 즉시 complete일 수 있다
  await page.evaluate((src) => {
    const el = document.createElement("jd-image");
    el.id = "cached";
    el.setAttribute("src", src);
    el.setAttribute("alt", "캐시");
    document.body.append(el);
  }, BLUE_PNG);
  await expect(page.locator("#cached")).toHaveAttribute("status", "loaded");
});

test("jd-motion: 감속 선호에서 애니메이션이 꺼지고 force-motion은 유지한다 (JS 0줄)", async ({
  page,
}) => {
  await mount(
    page,
    `<jd-motion id="a" preset="fade-up">기본</jd-motion>
     <jd-motion id="b" preset="fade-up" force-motion>강제</jd-motion>`,
  );
  const name = (sel: string) =>
    page.locator(sel).evaluate((el) => getComputedStyle(el).animationName);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await name("#a")).toBe("jd-m-fade-up");

  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await name("#a")).toBe("none");
  expect(await name("#b")).toBe("jd-m-fade-up"); // 옵트아웃
});

test("jd-motion: delay가 실효 animation-delay로 적용된다", async ({ page }) => {
  await mount(page, `<jd-motion preset="scale" delay="120">지연</jd-motion>`);
  const delay = await page
    .locator("jd-motion")
    .evaluate((el) => getComputedStyle(el).animationDelay);
  expect(delay).toBe("0.12s");
});

test("jd-link: 외부 링크는 새 탭 + 탭내빙 차단 rel", async ({ page }) => {
  await mount(
    page,
    `<jd-link href="https://example.com">외부</jd-link>
     <jd-link href="/docs">내부</jd-link>`,
  );
  const ext = page.locator("jd-link").first().locator("a");
  await expect(ext).toHaveAttribute("target", "_blank");
  await expect(ext).toHaveAttribute("rel", "noopener noreferrer");
  const int = page.locator("jd-link").nth(1).locator("a");
  expect(await int.evaluate((a: HTMLAnchorElement) => a.hasAttribute("target"))).toBe(false);
});

test("jd-mark: 다크 테마에서 배경·글자색이 반전된다", async ({ page }) => {
  await mount(page, `<jd-mark>강조</jd-mark>`);
  const read = () =>
    page.locator("jd-mark .jd-mark").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, fg: cs.color };
    });
  const light = await read();
  // 색값은 톤 레시피(DEC-044)가 파생하므로 리터럴을 못박지 않는다 —
  // 계약은 "형광펜 배경이 실제로 칠해져 있고, 다크에서 배경·글자 모두 바뀐다"이다.
  expect(light.bg).not.toBe("rgba(0, 0, 0, 0)");

  await page.evaluate(() => document.documentElement.setAttribute("data-jd-theme", "dark"));
  const dark = await read();
  expect(dark.bg).not.toBe("rgba(0, 0, 0, 0)");
  expect(dark.bg).not.toBe(light.bg);
  expect(dark.fg).not.toBe(light.fg);
});
