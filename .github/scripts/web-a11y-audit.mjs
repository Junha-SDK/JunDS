/**
 * @junds/web 실브라우저 접근성 감사.
 *
 * - 작성된 demo fixture만 axe 대상으로 인정한다. 빈 jd-* 태그를 자동 생성해
 *   coverage를 부풀리지 않는다.
 * - critical/serious는 항상 실패한다.
 * - moderate/minor는 기본 advisory지만 보고서와 로그에 반드시 남는다.
 *   JUNDS_A11Y_STRICT=1이면 impact와 무관하게 모든 위반이 실패한다.
 * - 공개 태그 등록 수, 페이지 수, 실제 fixture coverage가 기준선보다 내려가면
 *   axe 위반이 0이어도 실패한다.
 *
 * 전제: `npm run build -w @junds/web`
 * 사용: `npm run audit:a11y -w @junds/web`
 */
import { chromium } from "playwright";
import { createRequire } from "node:module";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const webRoot = join(root, "packages/web");
const demoDir = join(webRoot, "demo");
const componentDir = join(webRoot, "src/components");
const reportPath = join(root, "coverage/web-a11y/a11y-summary.json");

const strict = process.env.JUNDS_A11Y_STRICT === "1";
const minimumPages = Number(process.env.JUNDS_A11Y_MIN_PAGES ?? 10);
const minimumPublicComponents = Number(
  process.env.JUNDS_A11Y_MIN_PUBLIC_COMPONENTS ?? 390,
);
const minimumComponents = Number(process.env.JUNDS_A11Y_MIN_COMPONENTS ?? 98);
// 고위험 Patterns fixture 확장 실측 98/390. 새 컴포넌트에 fixture가 없으면
// 비율이 내려가 CI가 알려준다.
const minimumCoverageRatio = Number(
  process.env.JUNDS_A11Y_MIN_COVERAGE_RATIO ?? 98 / 390,
);

function publicTagInventory() {
  const tags = new Set();
  for (const directory of readdirSync(componentDir, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    const file = join(componentDir, directory.name, "element.ts");
    if (!existsSync(file)) continue;
    const source = readFileSync(file, "utf8");
    const constants = new Map();
    for (const match of source.matchAll(
      /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:"([^"]+)"|'([^']+)')/g,
    )) {
      constants.set(match[1], match[2] ?? match[3]);
    }
    for (const match of source.matchAll(
      /static\s+(?:override\s+)?(?:readonly\s+)?tag\s*=\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))/g,
    )) {
      const tag = match[1] ?? match[2] ?? constants.get(match[3]);
      if (tag?.startsWith("jd-")) tags.add(tag);
    }
  }
  return [...tags].sort();
}

function authoredTags(file) {
  const source = readFileSync(join(demoDir, file), "utf8");
  return [
    ...new Set(
      [...source.matchAll(/<\s*(jd-[a-z0-9-]+)/gi)].map((match) =>
        match[1].toLowerCase(),
      ),
    ),
  ].sort();
}

if (!existsSync(join(webRoot, "dist/junds.min.js"))) {
  console.error("[a11y] packages/web/dist 없음 — 먼저 `npm run build -w @junds/web`");
  process.exit(1);
}

const pages = existsSync(demoDir)
  ? readdirSync(demoDir)
      .filter((file) => file.endsWith(".html"))
      .sort()
  : [];
const inventory = publicTagInventory();
if (pages.length < minimumPages) {
  console.error(
    `[a11y] 데모 페이지 ${pages.length}건 < 기준 ${minimumPages}건 — 빈/축소 통과 금지`,
  );
  process.exit(1);
}
if (inventory.length === 0) {
  console.error("[a11y] 공개 jd-* 태그 인벤토리 0건 — 소스 스캔 실패");
  process.exit(1);
}

// 관리 브라우저가 없는 개발 머신에서는 시스템 Chrome으로만 폴백한다.
const browser = await chromium.launch({ headless: true }).catch(() => {
  console.warn("[a11y] Playwright Chromium 없음 — 시스템 Chrome으로 폴백");
  return chromium.launch({ headless: true, channel: "chrome" });
});

const coveredTags = new Set();
const auditErrors = [];
const pageReports = [];
let blockingRules = 0;
let advisoryRules = 0;
let missingDefinitions = [];
let checkedDefinitions = false;

try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => {
    auditErrors.push(`pageerror: ${error.message}`);
  });

  for (const file of pages) {
    await page.goto(pathToFileURL(join(demoDir, file)).href, {
      waitUntil: "load",
    });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50))),
    );
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          const finite = document
            .getAnimations()
            .filter(
              (animation) =>
                animation.effect?.getComputedTiming?.().iterations !== Infinity,
            );
          const done = Promise.all(
            finite.map((animation) => animation.finished.catch(() => {})),
          );
          Promise.race([done, new Promise((resolveCap) => setTimeout(resolveCap, 2000))])
            .then(resolve);
        }),
    );

    if (!checkedDefinitions) {
      missingDefinitions = await page.evaluate(
        (tags) => tags.filter((tag) => customElements.get(tag) === undefined),
        inventory,
      );
      checkedDefinitions = true;
    }

    const declared = authoredTags(file);
    const fixtureState = await page.evaluate(
      (tags) =>
        tags.map((tag) => {
          const elements = [...document.querySelectorAll(tag)];
          return {
            tag,
            total: elements.length,
            defined: elements.filter((element) => element.matches(":defined")).length,
          };
        }),
      declared,
    );
    const liveFixtures = fixtureState.filter(
      ({ total, defined }) => total > 0 && total === defined,
    );
    for (const { tag } of liveFixtures) coveredTags.add(tag);

    const deadFixtures = fixtureState.filter(
      ({ total, defined }) => total === 0 || total !== defined,
    );
    if (liveFixtures.length === 0) {
      auditErrors.push(`${file}: 실제 업그레이드된 작성 fixture 0종`);
    }
    if (deadFixtures.length > 0) {
      auditErrors.push(
        `${file}: 미렌더/미정의 fixture ${deadFixtures
          .map(({ tag, defined, total }) => `${tag}(${defined}/${total})`)
          .join(", ")}`,
      );
    }

    await page.addScriptTag({ path: axePath });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((nextTheme) => {
        const root = document.documentElement;
        if (nextTheme === "dark") {
          root.setAttribute("data-jd-theme", "dark");
        } else {
          root.removeAttribute("data-jd-theme");
          root.removeAttribute("data-theme");
        }
      }, theme);
      // 테마 전환 직후의 중간 보간색은 최종 상태가 아니다. 컴포넌트의
      // color/background transition이 끝난 뒤 대비를 측정해 실제 정착 색만 감사한다.
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => {
              const finite = document
                .getAnimations()
                .filter(
                  (animation) =>
                    animation.effect?.getComputedTiming?.().iterations !==
                    Infinity,
                );
              Promise.race([
                Promise.all(
                  finite.map((animation) => animation.finished.catch(() => {})),
                ),
                new Promise((resolveCap) => setTimeout(resolveCap, 1000)),
              ]).then(resolve);
            }),
          ),
      );

      const result = await page.evaluate(() =>
        window.axe.run(document, { resultTypes: ["violations"] }),
      );
      const blocking = result.violations.filter(
        (violation) =>
          strict ||
          violation.impact === "critical" ||
          violation.impact === "serious",
      );
      const advisory = result.violations.filter(
        (violation) => !blocking.includes(violation),
      );
      blockingRules += blocking.length;
      advisoryRules += advisory.length;

      console.log(
        `[a11y] ${file} (${theme}): fixture ${liveFixtures.length}종 · ` +
          `위반 ${result.violations.length}건 ` +
          `(blocking ${blocking.length} · advisory ${advisory.length})`,
      );
      for (const violation of result.violations) {
        const isBlocking = blocking.includes(violation);
        console.log(
          `  ${isBlocking ? "✗" : "·"} [${violation.impact ?? "unknown"}] ` +
            `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`,
        );
        for (const node of violation.nodes.slice(0, 5)) {
          console.log(`      ${node.target.join(" ")}`);
        }
      }

      pageReports.push({
        file,
        theme,
        authoredComponents: declared,
        auditedComponents: liveFixtures.map(({ tag }) => tag),
        violations: result.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          blocking: blocking.includes(violation),
          nodes: violation.nodes.map((node) => ({
            target: node.target,
            html: node.html,
            failureSummary: node.failureSummary,
          })),
        })),
      });
    }
  }
} finally {
  await browser.close();
}

const coverageRatio = coveredTags.size / inventory.length;
const uncoveredTags = inventory.filter((tag) => !coveredTags.has(tag));
if (inventory.length < minimumPublicComponents) {
  auditErrors.push(
    `공개 태그 인벤토리 ${inventory.length}종 < 기준 ${minimumPublicComponents}종`,
  );
}
if (missingDefinitions.length > 0) {
  auditErrors.push(`dist 미등록 공개 태그 ${missingDefinitions.length}종`);
}
if (coveredTags.size < minimumComponents) {
  auditErrors.push(
    `작성 fixture ${coveredTags.size}종 < 기준 ${minimumComponents}종`,
  );
}
if (coverageRatio + Number.EPSILON < minimumCoverageRatio) {
  auditErrors.push(
    `fixture coverage ${(coverageRatio * 100).toFixed(2)}% < 기준 ` +
      `${(minimumCoverageRatio * 100).toFixed(2)}%`,
  );
}

const report = {
  generatedAt: new Date().toISOString(),
  policy: {
    mode: strict ? "strict" : "release",
    themes: ["light", "dark"],
    blockingImpacts: strict ? ["all"] : ["critical", "serious"],
    advisoryImpacts: strict ? [] : ["moderate", "minor", "unknown"],
  },
  inventory: {
    publicComponents: inventory.length,
    registeredComponents: inventory.length - missingDefinitions.length,
    auditedComponents: coveredTags.size,
    coveragePercent: Number((coverageRatio * 100).toFixed(2)),
    minimumPages,
    minimumPublicComponents,
    minimumComponents,
    minimumCoveragePercent: Number((minimumCoverageRatio * 100).toFixed(2)),
    missingDefinitions,
    uncoveredComponents: uncoveredTags,
  },
  summary: {
    pages: pages.length,
    themeAudits: pageReports.length,
    blockingRules,
    advisoryRules,
    auditErrors,
  },
  pages: pageReports,
};
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(
  `\n[a11y] coverage ${coveredTags.size}/${inventory.length} ` +
    `(${(coverageRatio * 100).toFixed(2)}%) · 미감사 ${uncoveredTags.length}종`,
);
if (uncoveredTags.length > 0) {
  console.log(
    `[a11y] 다음 fixture 후보: ${uncoveredTags.slice(0, 30).join(", ")}` +
      (uncoveredTags.length > 30 ? " …" : ""),
  );
}
console.log(`[a11y] report ${reportPath}`);

if (blockingRules > 0 || auditErrors.length > 0) {
  for (const error of auditErrors) console.error(`[a11y] ✗ ${error}`);
  console.error(
    `\n[a11y] FAIL — blocking ${blockingRules}건 · 감사 오류 ${auditErrors.length}건`,
  );
  process.exit(1);
}

console.log(
  `\n[a11y] PASS — ${pages.length}페이지 × 2테마 · ` +
    `blocking 0건 · advisory ${advisoryRules}건`,
);
