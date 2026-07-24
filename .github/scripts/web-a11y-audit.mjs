/**
 * .github/scripts/web-a11y-audit.mjs — v3 web-a11y 게이트 (01-repo-structure §9).
 * packages/web/demo/*.html 전 페이지를 Playwright Chromium으로 열고 axe-core를 주입해
 * 감사한다. critical/serious 위반 → exit 1 (v2 audit:a11y:strict의 v3 이식 —
 * 데모 페이지가 대표 컴포넌트 집합이며, 페이지 목록은 디렉터리 스캔으로 자동 확장).
 *
 * 전제: `npm run build -w @junds/web` 완료 (데모는 dist/junds.css + dist/junds.min.js만 로드).
 * 의존성: 루트 devDependency의 playwright(@playwright/test 경유)·axe-core — 신규 설치 없음.
 * 사용: node .github/scripts/web-a11y-audit.mjs
 */
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const demoDir = join(root, "packages/web/demo");

// 전제 검증 — 빈 감사(false pass) 금지
if (!existsSync(join(root, "packages/web/dist/junds.min.js"))) {
  console.error("[a11y] packages/web/dist 산출물 없음 — 먼저 `npm run build -w @junds/web`");
  process.exit(1);
}
const pages = existsSync(demoDir) ? readdirSync(demoDir).filter((f) => f.endsWith(".html")).sort() : [];
if (pages.length === 0) {
  console.error("[a11y] 감사 대상 데모 페이지 0건(packages/web/demo/*.html) — 빈 통과 금지");
  process.exit(1);
}

// Playwright 관리 chromium 부재 시 시스템 Chrome 폴백 (benchmarks/run.mjs와 동일 규약)
const browser = await chromium.launch({ headless: true }).catch(() => {
  console.warn("[a11y] playwright chromium 미설치 — 시스템 Chrome(channel: chrome)으로 폴백");
  return chromium.launch({ headless: true, channel: "chrome" });
});

let gateViolations = 0;
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => {
    console.error(`[a11y] pageerror: ${e.message}`);
    process.exitCode = 1;
  });

  for (const file of pages) {
    await page.goto(pathToFileURL(join(demoDir, file)).href, { waitUntil: "load" });
    // 최초 render는 지연 실행(DEC-012-1: DCL/microtask) — rAF+tick으로 플러시 대기
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50))));

    // 진입 애니메이션이 끝난 뒤 감사한다. jd-motion 같은 fill:both 진입 모션은 감사 시점에
    // 아직 opacity 0이라 색대비가 "실패"로 잡힌다 — 감사 대상은 정지 상태여야 한다.
    // 무한 반복(스피너 등)은 finished가 영원히 대기하므로 제외하고, 전체에 상한을 둔다.
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          const finite = document
            .getAnimations()
            .filter((a) => a.effect?.getComputedTiming?.().iterations !== Infinity);
          const done = Promise.all(finite.map((a) => a.finished.catch(() => {})));
          const cap = new Promise((r) => setTimeout(r, 2000));
          Promise.race([done, cap]).then(resolve);
        }),
    );

    // 업그레이드 검증 — 미정의 CE만 있는 죽은 페이지를 감사해 통과하는 것을 차단
    const upgraded = await page.evaluate(() => {
      const jd = [...document.querySelectorAll("*")].filter((el) => el.tagName.startsWith("JD-"));
      return { total: jd.length, defined: jd.filter((el) => el.matches(":defined")).length };
    });
    if (upgraded.total === 0 || upgraded.defined === 0) {
      console.error(`[a11y] ${file}: jd-* 요소 업그레이드 0건 (total=${upgraded.total}) — dist 로드 실패 의심`);
      process.exitCode = 1;
      continue;
    }

    await page.addScriptTag({ path: axePath });
    const res = await page.evaluate(() => window.axe.run(document, { resultTypes: ["violations"] }));
    const gate = res.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    const advisory = res.violations.length - gate.length;

    console.log(`[a11y] ${file}: jd-* ${upgraded.defined}/${upgraded.total} 업그레이드 · 위반 ${res.violations.length}건 (게이트 대상 ${gate.length} · advisory ${advisory})`);
    for (const v of res.violations) {
      const mark = v.impact === "critical" || v.impact === "serious" ? "✗" : "·";
      console.log(`  ${mark} [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
      for (const n of v.nodes.slice(0, 5)) console.log(`      ${n.target.join(" ")}`);
    }
    gateViolations += gate.length;
  }
} finally {
  await browser.close();
}

if (gateViolations > 0 || process.exitCode === 1) {
  console.error(`\n[a11y] FAIL — critical/serious ${gateViolations}건`);
  process.exit(1);
}
console.log(`\n[a11y] PASS — ${pages.length}페이지, critical/serious 0건`);
