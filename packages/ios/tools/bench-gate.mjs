#!/usr/bin/env node
/**
 * packages/ios/tools/bench-gate.mjs — iOS 벤치 회귀 게이트 (05-perf §3.2, 의존성 0).
 *
 * 판정 절차:
 *   ① benchmarks/results/ios/의 최신 <YYYY-MM-DD>-sim.json 채택
 *   ② 기준선(baseline.json) 부재 → 최신을 기준선으로 복사하고 "기준선 신설" 후 exit 0
 *   ③ 기준선 존재 →
 *      (a) bench-budgets.json 절대 예산(maxAvgSeconds) 위반 → exit 1
 *      (b) 기준선 대비 avgSeconds +10% 초과 → exit 1 (위반 목록 출력)
 *      통과 시 항목별 Δ% 표 출력
 *
 * 사용: node packages/ios/tools/bench-gate.mjs
 * 주의: baseline.json 갱신(승격)은 통합자 몫 — 이 스크립트는 신설 외에는 기준선을 건드리지 않는다.
 */
import { copyFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)); // packages/ios/tools
const repoRoot = resolve(here, "..", "..", "..");
const resultsDir = join(repoRoot, "benchmarks", "results", "ios");
const baselinePath = join(resultsDir, "baseline.json");
const budgetsPath = join(here, "bench-budgets.json");

const REGRESSION_TOLERANCE = 0.1; // 시간 지표 ±10% 허용 오차 (05-perf §3.2)

// ① 최신 결과 — 파일명이 ISO 날짜라 사전순 = 시간순
if (!existsSync(resultsDir)) {
  console.error(`[gate] FAIL: 결과 디렉터리 없음 — ${resultsDir} (run-bench.mjs 먼저)`);
  process.exit(1);
}
const files = readdirSync(resultsDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}-sim\.json$/.test(f))
  .sort();
if (files.length === 0) {
  console.error(
    `[gate] FAIL: <YYYY-MM-DD>-sim.json 결과 없음 — ${resultsDir} (run-bench.mjs 먼저)`,
  );
  process.exit(1);
}
const latestFile = files[files.length - 1];
const latest = JSON.parse(readFileSync(join(resultsDir, latestFile), "utf8"));
console.log(
  `[gate] 최신 결과: ${latestFile} (${latest.meta?.device ?? "?"} · ${latest.meta?.os ?? "?"})`,
);

// ② 기준선 신설
if (!existsSync(baselinePath)) {
  copyFileSync(join(resultsDir, latestFile), baselinePath);
  console.log(`[gate] 기준선 신설: ${latestFile} → baseline.json (판정 없음, 다음 실행부터 대조)`);
  process.exit(0);
}

// ③ 대조 — 절대 예산 + 기준선 상대 회귀
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const budgets = JSON.parse(readFileSync(budgetsPath, "utf8"));
const failures = [];
const rows = [];

for (const [key, { avgSeconds }] of Object.entries(latest.results ?? {})) {
  const budget = budgets[key];
  const base = baseline.results?.[key]?.avgSeconds;

  // (a) 절대 예산 — I1 환산치(05-perf §1)
  if (budget && avgSeconds > budget.maxAvgSeconds) {
    failures.push(`${key}: avg ${avgSeconds}s > 예산 ${budget.maxAvgSeconds}s`);
  }

  // (b) 기준선 상대 회귀 — 기준선 0s(측정 해상도 이하)면 상대 비교 불능이라 절대 예산만 적용
  let deltaLabel = "기준선 없음(신규)";
  if (typeof base === "number" && base > 0) {
    const delta = (avgSeconds - base) / base;
    deltaLabel = `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}%`;
    if (delta > REGRESSION_TOLERANCE) {
      failures.push(
        `${key}: avg ${avgSeconds}s — 기준선 ${base}s 대비 ${deltaLabel} (> +${
          REGRESSION_TOLERANCE * 100
        }%)`,
      );
    }
  } else if (typeof base === "number") {
    deltaLabel = "기준선 0s — Δ 비교 생략";
  }

  const perInstance = budget?.perInstanceDivisor
    ? `${((avgSeconds / budget.perInstanceDivisor) * 1000).toFixed(4)}ms/개`
    : "-";
  rows.push({
    key,
    avg: `${avgSeconds}s`,
    perInstance,
    base: typeof base === "number" ? `${base}s` : "-",
    delta: deltaLabel,
  });
}

// 예산에는 있는데 결과에 없는 벤치 = 이름 변경/삭제 회귀 — 조용히 통과시키지 않는다
for (const key of Object.keys(budgets)) {
  if (key === "$comment") continue;
  if (!latest.results?.[key])
    failures.push(`${key}: 예산 항목이 결과에 없음 — 벤치 삭제/개명 여부 확인`);
}

// Δ% 표
const widths = ["key", "avg", "perInstance", "base", "delta"].map((c) =>
  Math.max(c.length, ...rows.map((r) => r[c].length)),
);
const line = (r) =>
  [
    r.key.padEnd(widths[0]),
    r.avg.padStart(widths[1]),
    r.perInstance.padStart(widths[2]),
    r.base.padStart(widths[3]),
    r.delta.padStart(widths[4]),
  ].join("  ");
console.log(
  line({ key: "key", avg: "avg", perInstance: "perInstance", base: "base", delta: "delta" }),
);
for (const r of rows) console.log(line(r));

if (failures.length > 0) {
  console.error(`\n[gate] FAIL (${failures.length}건):`);
  for (const f of failures) console.error(`[gate]   ${f}`);
  process.exit(1);
}
console.log(
  `\n[gate] PASS — ${rows.length}건 (절대 예산 + 기준선 ±${REGRESSION_TOLERANCE * 100}% 이내)`,
);
