/**
 * 대표 UI 시각 회귀선.
 *
 * OS 폰트·렌더러 차이를 피하려 Chromium 한 엔진만 기준 이미지를 소유한다.
 * 라이트/다크와 좁은 화면을 같은 fixture로 고정해 토큰, 간격, 반응형 회귀를 잡는다.
 */
import { expect, test } from "@playwright/test";
import { mount } from "./helpers.js";

const FIXTURE = `
  <main id="visual-fixture">
    <section class="visual-hero">
      <div>
        <jd-badge variant="secondary">JunDS v3</jd-badge>
        <h1>빠르고 편안한 인터페이스</h1>
        <p>일관된 상태와 접근 가능한 상호작용을 기본값으로 제공합니다.</p>
      </div>
      <jd-avatar name="김준하" size="lg"></jd-avatar>
    </section>

    <jd-alert variant="info" title="새로운 업데이트">
      컴포넌트 사용법과 키보드 동작이 더 단순해졌습니다.
    </jd-alert>

    <section class="visual-form" aria-label="프로젝트 만들기">
      <jd-text-field label="프로젝트 이름" value="새 디자인 시스템"></jd-text-field>
      <jd-select label="공개 범위" value="team">
        <script type="application/json">[
          {"value":"private","label":"나만 보기"},
          {"value":"team","label":"팀과 공유"},
          {"value":"public","label":"전체 공개"}
        ]</script>
      </jd-select>
    </section>

    <jd-tabs label="프로젝트 보기" value="overview" variant="segment">
      <script type="application/json">[
        {"value":"overview","label":"개요","badge":4},
        {"value":"activity","label":"활동"},
        {"value":"settings","label":"설정"}
      ]</script>
    </jd-tabs>

    <footer class="visual-actions">
      <jd-button variant="ghost">취소</jd-button>
      <jd-button>프로젝트 만들기</jd-button>
    </footer>
  </main>
`;

const PAGE_CSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; }
  body {
    padding: 28px;
    background: var(--jd-color-background);
    color: var(--jd-color-foreground);
    font-family: var(--jd-font-sans);
  }
  #visual-fixture {
    width: min(100%, 680px);
    margin: 0 auto;
    padding: 24px;
    border: 1px solid var(--jd-color-border);
    border-radius: 18px;
    background: var(--jd-color-card);
    box-shadow: var(--jd-shadow-lg);
    display: grid;
    gap: 20px;
  }
  .visual-hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }
  .visual-hero h1 { margin: 12px 0 6px; font-size: 24px; line-height: 1.25; }
  .visual-hero p { margin: 0; color: var(--jd-color-muted); line-height: 1.6; }
  .visual-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .visual-actions { display: flex; justify-content: flex-end; gap: 8px; }
  @media (max-width: 520px) {
    body { padding: 14px; }
    #visual-fixture { padding: 18px; gap: 16px; border-radius: 14px; }
    .visual-form { grid-template-columns: 1fr; }
    .visual-hero h1 { font-size: 21px; }
    .visual-actions jd-button { flex: 1; }
  }
`;

test.beforeEach(async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "기준 이미지는 Chromium에서만 관리");
  await mount(page, FIXTURE);
  await page.addStyleTag({ content: PAGE_CSS });
  await page.evaluate(() => document.fonts.ready);
});

test("대표 폼 — 라이트 데스크톱", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 760 });
  await expect(page.locator("#visual-fixture")).toHaveScreenshot(
    "components-light.png",
    { maxDiffPixelRatio: 0.05, threshold: 0.3 },
  );
});

test("대표 폼 — 다크 데스크톱", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 760 });
  await page.evaluate(() =>
    document.documentElement.setAttribute("data-jd-theme", "dark"),
  );
  await expect(page.locator("#visual-fixture")).toHaveScreenshot(
    "components-dark.png",
    { maxDiffPixelRatio: 0.05, threshold: 0.3 },
  );
});

test("대표 폼 — 모바일 반응형", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#visual-fixture")).toHaveScreenshot(
    "components-mobile.png",
    { maxDiffPixelRatio: 0.05, threshold: 0.3 },
  );
});
