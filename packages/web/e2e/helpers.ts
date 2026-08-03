/**
 * e2e 공용 헬퍼 — dist 산출물(junds.css + junds.min.js)을 빈 페이지에 주입한다.
 * 커밋된 표면만 검증한다: 태그·클래스·이벤트 계약은 G1(button/text-field/modal)+B1(core).
 */
import type { Page } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

export const CSS_PATH = join(distDir, "junds.css");
export const JS_PATH = join(distDir, "junds.min.js");

/** CSS+JS 주입 후 body를 채운다. withJs:false면 업그레이드 전(FOUC 가드) 상태 검증용 */
export async function mount(
  page: Page,
  bodyHtml: string,
  opts: { withJs?: boolean } = {},
): Promise<void> {
  await page.setContent(`<!doctype html><html><head></head><body>${bodyHtml}</body></html>`);
  await page.addStyleTag({ path: CSS_PATH });
  if (opts.withJs !== false) {
    await page.addScriptTag({ path: JS_PATH });
    // 최초 render는 microtask/DCL 지연(DEC-012-1) — 골격 구축 완료까지 대기
    await page.waitForFunction(() => customElements.get("jd-button") !== undefined);
    await page.evaluate(() => new Promise((r) => setTimeout(r, 0)));
  }
}

/**
 * 브라우저의 "모든 컨트롤 순차 탐색" 키를 누른다.
 *
 * macOS Safari(WebKit)는 시스템 기본 설정상 일반 Tab으로 버튼·라디오를
 * 건너뛰며, Option+Tab이 모든 컨트롤을 순회한다. 그 차이를 테스트 실패로
 * 오인하지 않도록 실제 사용자 키 조합을 브라우저/플랫폼에 맞춘다.
 */
export async function pressTab(page: Page, browserName: string, reverse = false): Promise<void> {
  const keys = [
    ...(browserName === "webkit" && process.platform === "darwin" ? ["Alt"] : []),
    ...(reverse ? ["Shift"] : []),
    "Tab",
  ];
  await page.keyboard.press(keys.join("+"));
}
