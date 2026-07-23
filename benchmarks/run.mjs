/**
 * benchmarks/run.mjs — 웹 벤치 드라이버 (05-perf §2.1, 01-repo-structure §4 "bench" 스크립트).
 * Playwright(기존 루트 devDependency) 헤드리스 Chromium으로 시나리오 페이지를 구동한다.
 * G1: S3(모달 개폐 100회) 1종. 벤치 탭은 포그라운드 단일 탭, RAF 무발화 시 즉시 실패(§2.1 주의).
 *
 * 사용: node benchmarks/run.mjs [--cycles 100]
 * 게이트: W3 — 상호작용 p95 < 50ms · 롱태스크 0건 · 노드/리스너 누수 0.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cyclesArg = process.argv.indexOf("--cycles");
const cycles = cyclesArg > -1 ? Number(process.argv[cyclesArg + 1]) : 100;

const BUDGET_INTERACTION_P95_MS = 50; // W3

// Playwright 관리 chromium 부재 시(캐시 버전 불일치) 시스템 Chrome 폴백
const browser = await chromium.launch({ headless: true }).catch(() => {
  console.warn("[bench] playwright chromium 미설치 — 시스템 Chrome(channel: chrome)으로 폴백");
  return chromium.launch({ headless: true, channel: "chrome" });
});
const page = await browser.newPage();
page.on("pageerror", (e) => {
  console.error("[bench] pageerror:", e.message);
  process.exitCode = 1;
});

await page.goto(pathToFileURL(join(here, "web/modal.html")).href);
await page.waitForFunction(() => customElements.get("jd-modal") !== undefined);

// 5회 반복, 첫 1회 워밍업 폐기, 중앙값 채택 (05 §2.1 규약)
const runs = [];
for (let i = 0; i < 5; i++) {
  const report = await page.evaluate((n) => window.runScenario(n), cycles);
  if (report.rafDead) {
    console.error("[bench] FAIL: rAF 무발화 감지 — 벤치 탭이 포그라운드가 아니거나 컴포지터 정지");
    await browser.close();
    process.exit(1);
  }
  runs.push(report);
}
await browser.close();

const measured = runs.slice(1); // 워밍업 폐기
const median = (arr) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];
const agg = (label, key) => median(measured.map((r) => r.interactions[label][key]));

const result = {
  scenario: `S3 modal open/close x${cycles} (focus trap + scroll lock)`,
  machine: `${process.platform}-${process.arch}`,
  date: new Date().toISOString(),
  cycles,
  reps: { total: runs.length, warmupDiscarded: 1 },
  open: { mean: agg("modal-open", "mean"), median: agg("modal-open", "median"), p95: agg("modal-open", "p95") },
  close: { mean: agg("modal-close", "mean"), median: agg("modal-close", "median"), p95: agg("modal-close", "p95") },
  longtasks: median(measured.map((r) => r.longtasks.count)),
  leak: measured[measured.length - 1].leak,
};

const fmt = (o) => Object.entries(o).map(([k, v]) => `${k}=${typeof v === "number" ? v.toFixed(2) : v}`).join(" ");
console.log(`\n[bench] ${result.scenario}`);
console.log(`[bench] open : ${fmt(result.open)} ms`);
console.log(`[bench] close: ${fmt(result.close)} ms`);
console.log(`[bench] longtasks(중앙값): ${result.longtasks}건`);
console.log(`[bench] leak: nodeDelta=${result.leak.nodeDelta} overflowRestored=${result.leak.bodyOverflowRestored}`);

// 판정
const failures = [];
if (result.open.p95 >= BUDGET_INTERACTION_P95_MS) failures.push(`open p95 ${result.open.p95.toFixed(2)}ms ≥ ${BUDGET_INTERACTION_P95_MS}ms`);
if (result.close.p95 >= BUDGET_INTERACTION_P95_MS) failures.push(`close p95 ${result.close.p95.toFixed(2)}ms ≥ ${BUDGET_INTERACTION_P95_MS}ms`);
if (result.longtasks > 0) failures.push(`longtask ${result.longtasks}건 (허용 0)`);
if (result.leak.nodeDelta !== 0) failures.push(`노드 누수 ${result.leak.nodeDelta}`);
if (!result.leak.bodyOverflowRestored) failures.push("스크롤 락 미해제");

const dir = join(here, "results");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "modal-s3.json"), JSON.stringify({ ...result, pass: failures.length === 0, failures }, null, 2));

if (failures.length) {
  console.error(`\n[bench] FAIL (W3): ${failures.join(" · ")}`);
  process.exit(1);
}
console.log(`\n[bench] PASS (W3): 상호작용 p95 < ${BUDGET_INTERACTION_P95_MS}ms · 롱태스크 0 · 누수 0`);
