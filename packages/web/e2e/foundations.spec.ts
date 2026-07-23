/**
 * 파운데이션 — happy-dom이 보증 못 하는 실브라우저 구간(03 §9.1):
 * adoptedStyleSheets 실적용, @layer 소비자 승리 계약, :defined FOUC 가드,
 * style-props 반응형 미디어 규칙, jd-page box-sizing 회귀(DEC-014-9).
 */
import { expect, test } from "@playwright/test";
import { mount } from "./helpers.js";

test.describe("adoptedStyleSheets 실적용", () => {
  test("jd-button 내부 골격이 컴포넌트 시트의 계산 스타일을 받는다", async ({ page }) => {
    await mount(page, `<jd-button>저장</jd-button>`);
    const btn = page.locator("jd-button > button.jd-button");
    await expect(btn).toBeVisible();
    // 호스트가 inline-flex(컴포넌트 시트 적용 증거). 내부 button은 flex 아이템이라
    // 지정값 inline-flex가 blockification으로 computed "flex"가 된다 — 호스트로 판정.
    await expect(page.locator("jd-button")).toHaveCSS("display", "inline-flex");
    await expect(btn).toHaveCSS("align-items", "center");
    // 토큰이 실제로 해석된다 — 배경이 초기값(transparent)이 아니다
    const bg = await btn.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("@layer 계약 — 레이어 밖 소비자 규칙이 특이도 무관하게 이긴다 (WEB-08)", async ({ page }) => {
    await mount(page, `<jd-button>저장</jd-button>`);
    await page.addStyleTag({ content: `.jd-button { letter-spacing: 3px; }` });
    // toHaveCSS는 자동 재시도 — transition: all(200ms) 전이 완료 후 값으로 수렴 판정
    await expect(page.locator("jd-button > button.jd-button")).toHaveCSS("letter-spacing", "3px");
  });
});

test.describe(":defined FOUC 가드 (JS 이전 — 정적 junds.css만)", () => {
  test("업그레이드 전 jd-modal 내용이 보이지 않고 jd-button은 자리를 잡는다", async ({ page }) => {
    await mount(
      page,
      `<jd-button>버튼</jd-button>
       <jd-modal><p>비밀 내용</p></jd-modal>`,
      { withJs: false },
    );
    await expect(page.locator("jd-modal")).toBeHidden(); // display:none
    const display = await page
      .locator("jd-button")
      .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe("inline-flex");
  });
});

test.describe("style-props 반응형 (실 미디어쿼리)", () => {
  test(`p="4 md:6" — 뷰포트 교차 시 패딩이 16px↔24px 전환된다`, async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 600 });
    await mount(page, `<jd-box id="t" p="4 md:6">x</jd-box>`);
    const pad = () =>
      page.locator("#t").evaluate((el) => getComputedStyle(el).paddingTop);
    expect(await pad()).toBe("16px");
    await page.setViewportSize({ width: 900, height: 600 });
    expect(await pad()).toBe("24px");
  });

  test("반응형 클래스는 내용 결정적 — 같은 프롭이면 같은 클래스", async ({ page }) => {
    await mount(
      page,
      `<jd-box id="a" p="4 md:6">a</jd-box><jd-box id="b" p="4 md:6">b</jd-box>`,
    );
    const [a, b] = await Promise.all([
      page.locator("#a").evaluate((el) => [...el.classList].find((c) => c.startsWith("jd-r-"))),
      page.locator("#b").evaluate((el) => [...el.classList].find((c) => c.startsWith("jd-r-"))),
    ]);
    expect(a).toBeTruthy();
    expect(a).toBe(b);
  });
});

test.describe("jd-page 레이아웃 회귀 (DEC-014-9)", () => {
  test("width:100%+padding에서 부모를 넘치지 않는다 (box-sizing 자기 선언)", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 600 });
    await mount(
      page,
      `<div id="wrap" style="width: 600px">
         <jd-page max-width="md"><jd-page-body><jd-box>내용</jd-box></jd-page-body></jd-page>
       </div>`,
    );
    const overflow = await page.evaluate(() => {
      const wrap = document.querySelector("#wrap")!;
      const pg = document.querySelector("jd-page")!;
      return pg.getBoundingClientRect().width - wrap.getBoundingClientRect().width;
    });
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
