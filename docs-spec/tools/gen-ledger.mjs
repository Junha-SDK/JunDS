#!/usr/bin/env node
/**
 * gen-ledger.mjs — JunDS v3 재구축 원장(ledger.json) 생성기
 *
 * 의존성 0 (node 내장 모듈만). 실행 (레포 루트에서, nvm v22 노드로):
 *   ~/.nvm/versions/node/v22.5.1/bin/node docs-spec/tools/gen-ledger.mjs
 * 산출:
 *   docs-spec/registry/ledger.json
 *
 * 분류 규칙은 docs-spec/00-inventory.md §1·§3·§4와 1:1 일치:
 *   - core/layout/primitives/composites/patterns: 배럴의 value export 중
 *     PascalCase 컴포넌트만 (lowercase 유틸·ALL_CAPS 상수·타입 export 제외).
 *     기대치: core 13 · layout 12 · primitives 51 · composites 201 · patterns 43 = 320
 *   - hooks: `use` 접두 export만 (invalidateResource 제외). 기대치: 62
 *   - finance: 컴포넌트만 — `./lib/*`(131 lib export)와 `./charts/lazy`(6 lazy 래퍼) 소스 제외,
 *     남은 소스에서 PascalCase만 (buildFlow·heatmapColor 등 lowercase 유틸 제외). 기대치: 86
 *
 * 행 스키마:
 *   { id, category, tier, web, ios, docs, tests, bench, notes }
 *   - tier: T1 = primitives/layout/core/hooks · T2 = composites/patterns · T3 = finance
 *   - web/docs/tests: "todo"
 *   - ios: "todo" | "n/a" (웹 전용 개념 ErrorBoundary·Portal·FocusGuard 3건만 n/a)
 *   - bench: "todo"(00-inventory 바닐라 난이도 L만) | "n/a"
 *
 * 재실행 정책: 항상 배럴 재파싱으로 전체 재생성하되, 기존 ledger.json이 있으면
 * 동일 id 행의 상태 필드(web/ios/docs/tests/bench/notes)를 보존 병합한다.
 * (진행 중 상태를 잃지 않기 위함 — 규칙 변경 시에도 안전)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..", "..");
const OUT = join(REPO, "docs-spec", "registry", "ledger.json");

// ── 카테고리 정의 ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "core", tier: "T1" },
  { name: "layout", tier: "T1" },
  { name: "primitives", tier: "T1" },
  { name: "hooks", tier: "T1" },
  { name: "composites", tier: "T2" },
  { name: "patterns", tier: "T2" },
  { name: "finance", tier: "T3" },
];

// 00-inventory §1 기대치 — 어긋나면 경고를 출력하고 exit 1
// 2026-07-27 myself-migration 1차: hooks 55→61 (+6), composites 185→194 (+9).
// 2026-07-27 myself-migration 2차: hooks 61→62 (+1), composites 194→201 (+7).
const EXPECTED = {
  core: 13,
  layout: 12,
  primitives: 51,
  hooks: 62,
  composites: 201,
  patterns: 43,
  finance: 86,
};

// iOS n/a — 웹 전용 개념 (00-inventory §3 primitives 표)
const IOS_NA = new Set(["ErrorBoundary", "Portal", "FocusGuard"]);

// 00-inventory §3 바닐라 난이도 L (bench: "todo" 대상) — UI 42개
const BENCH_L_UI = new Set([
  // composites (29)
  "AudioPlayer",
  "Carousel",
  "CodeEditor",
  "ColorPicker",
  "DataGrid",
  "DateRangePicker",
  "DiffViewer",
  "EmojiPicker",
  "FunnelChart",
  "GaugeChart",
  "Globe",
  "Heatmap",
  "ImageCropper",
  "MarkdownViewer",
  "MiniChart",
  "QRCode",
  "SignaturePad",
  "Table",
  "Transfer",
  "TreemapChart",
  "VideoPlayer",
  "VirtualScroll",
  "LineChart",
  "BarChart",
  "PieChart",
  "AreaChart",
  "RadarChart",
  "ScatterPlot",
  "SankeyDiagram",
  // patterns (13)
  "DataTable",
  "CommandPalette",
  "DsCalendar",
  "Kanban",
  "FormBuilder",
  "InfiniteList",
  "VirtualList",
  "SortableList",
  "RichTextEditor",
  "FlowDiagram",
  "GanttChart",
  "BookReader",
  "EmailInbox",
]);

// finance L — 00-inventory §3 finance 그룹표: Live* 실시간 계열(15) + 차트(12) = L
const FINANCE_L_RE = /^Live/;
const FINANCE_L_CHARTS = new Set([
  "CandleChart",
  "RealCandleChart",
  "MarketHeatmap",
  "PortfolioHeatmap",
  "InvestorFlowChart",
  "DonutChart",
  "Sparkline",
  "AreaChart",
  "MiniCandle",
  "MultiLineChart",
  "QuarterBarChart",
  "MarketIndexChart",
]);

// ── 배럴 파서 ────────────────────────────────────────────────────────────────
// export { A, B as C } from "./X" 형태에서 value export의 (로컬명, 소스) 추출.
// export type { ... }는 제외. 멀티라인 export 블록 지원.
function parseBarrel(src) {
  const out = [];
  // 주석 제거(라인 주석만 — 배럴에 블록 주석 없음 확인)
  const code = src.replace(/^\s*\/\/.*$/gm, "");
  const re = /export\s+(type\s+)?\{([\s\S]*?)\}\s*from\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const [, isType, names, from] = m;
    if (isType) continue;
    for (const raw of names.split(",")) {
      const part = raw.trim();
      if (!part) continue;
      // "A as B" → 외부 노출명 B / "type X" 인라인 타입 제외
      if (/^type\s/.test(part)) continue;
      const asMatch = part.match(/^\S+\s+as\s+(\S+)$/);
      const name = asMatch ? asMatch[1] : part;
      out.push({ name, from });
    }
  }
  return out;
}

// PascalCase 컴포넌트 판정. ALL_CAPS는 원칙적으로 상수(SPACING 등)로 제외하되,
// 소스 파일명이 export명과 같으면 컴포넌트로 인정 (FAQ from "./FAQ").
const isComponent = (n, from) =>
  /^[A-Z]/.test(n) && (!/^[A-Z0-9_]+$/.test(n) || from.endsWith(`/${n}`));

function collectCategory(cat) {
  const barrelPath = join(REPO, "ds", cat, "index.ts");
  const exports = parseBarrel(readFileSync(barrelPath, "utf8"));

  if (cat === "hooks") {
    // use* 만 (invalidateResource 등 비-훅 제외)
    return exports.filter((e) => /^use[A-Z]/.test(e.name)).map((e) => e.name);
  }
  if (cat === "finance") {
    // lib/·charts/lazy 소스 제외 후 PascalCase만 → 00-inventory "86 컴포넌트"와 일치
    return exports
      .filter((e) => !e.from.includes("/lib/") && !e.from.includes("charts/lazy"))
      .filter((e) => isComponent(e.name, e.from))
      .map((e) => e.name);
  }
  // UI 카테고리: PascalCase 컴포넌트만
  // (core의 resolveStyleProps·SPACING 등 유틸/상수, useCoreConfig 훅 자동 제외)
  return exports.filter((e) => isComponent(e.name, e.from)).map((e) => e.name);
}

// ── 행 생성 ──────────────────────────────────────────────────────────────────
function benchFor(cat, id) {
  if (cat === "finance") {
    return FINANCE_L_RE.test(id) || FINANCE_L_CHARTS.has(id) ? "todo" : "n/a";
  }
  if (cat === "hooks") return "n/a"; // Behavior는 컴포넌트 벤치에 흡수
  return BENCH_L_UI.has(id) ? "todo" : "n/a";
}

const rows = [];
const counts = {};
for (const { name: cat, tier } of CATEGORIES) {
  const ids = collectCategory(cat);
  counts[cat] = ids.length;
  const dupCheck = new Set();
  for (const id of ids) {
    if (dupCheck.has(id)) {
      console.warn(`[warn] 중복 export: ${cat}/${id} — 1행만 유지`);
      continue;
    }
    dupCheck.add(id);
    rows.push({
      id,
      category: cat,
      tier,
      web: "todo",
      ios: IOS_NA.has(id) ? "n/a" : "todo",
      docs: "todo",
      tests: "todo",
      bench: benchFor(cat, id),
      notes: "",
    });
  }
}

// ── 기존 원장과 상태 보존 병합 ───────────────────────────────────────────────
if (existsSync(OUT)) {
  try {
    const prev = JSON.parse(readFileSync(OUT, "utf8"));
    const prevById = new Map((prev.rows ?? []).map((r) => [`${r.category}/${r.id}`, r]));
    for (const row of rows) {
      const old = prevById.get(`${row.category}/${row.id}`);
      if (!old) continue;
      for (const f of ["web", "ios", "docs", "tests", "bench", "notes"]) {
        // ios/bench의 n/a 재분류는 새 규칙 우선, 나머지는 진행 상태 보존
        if (old[f] !== undefined && old[f] !== "todo" && row[f] !== "n/a") row[f] = old[f];
      }
    }
  } catch (e) {
    console.warn(`[warn] 기존 ledger 병합 실패(전체 재생성): ${e.message}`);
  }
}

// ── 검증 + 출력 ──────────────────────────────────────────────────────────────
let fail = false;
for (const [cat, expected] of Object.entries(EXPECTED)) {
  const got = counts[cat];
  const ok = got === expected;
  console.log(`${ok ? "ok " : "MISMATCH"} ${cat.padEnd(11)} ${got} (기대 ${expected})`);
  if (!ok) fail = true;
}
const total = rows.length;
console.log(`총 행 수: ${total} (기대 468 = UI 320 + hooks 62 + finance 86)`);

const ledger = {
  $schema: "docs-spec/tools/gen-ledger.mjs 가 생성 — 직접 편집은 상태 필드만",
  generatedAt: new Date().toISOString().slice(0, 10),
  source: "ds/{core,layout,primitives,composites,patterns,hooks,finance}/index.ts",
  counts: { ...counts, total },
  rows,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(ledger, null, 2) + "\n");
console.log(`쓰기 완료: ${OUT}`);
if (fail) {
  console.error("기대치 불일치 — 00-inventory.md 규칙과 배럴 상태를 대조하라.");
  process.exit(1);
}
