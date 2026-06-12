#!/usr/bin/env node
/**
 * junds:doctor — 환경/설정/메타 일관성 진단.
 *
 * `npm run doctor` 한 번으로 다음을 보고:
 *  1. node 버전 (>= 20)
 *  2. tailwind v4 설치 + globals.css에 핵심 토큰 존재
 *  3. peer deps (react/react-dom) 설치 여부
 *  4. .ai/ 메타 일관성 (props.json/MAP.md/coverage.json/bundle.json 최신 여부)
 *  5. requirements/ vs code 누락
 *  6. 검색 사전 vs 쇼케이스 페이지 일치
 *  7. a11y 강제 게이트 통과 여부
 *
 * 종료 코드: 0 = 모두 OK, 1 = 경고 또는 오류.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const colors = {
  ok: "\x1b[32m✓\x1b[0m",
  warn: "\x1b[33m⚠\x1b[0m",
  fail: "\x1b[31m✗\x1b[0m",
  dim: "\x1b[90m",
  reset: "\x1b[0m",
};

let okCount = 0;
let warnCount = 0;
let failCount = 0;

function ok(msg) { console.log(`  ${colors.ok} ${msg}`); okCount++; }
function warn(msg) { console.log(`  ${colors.warn} ${msg}`); warnCount++; }
function fail(msg) { console.log(`  ${colors.fail} ${msg}`); failCount++; }
function header(title) { console.log(`\n\x1b[1m${title}\x1b[0m`); }

// 1. node version
header("1. Node 환경");
const nodeVer = process.versions.node.split(".").map(Number);
if (nodeVer[0] >= 20) ok(`node ${process.versions.node}`);
else fail(`node ${process.versions.node} — v20+ 필요`);

// 2. tailwind & globals
header("2. Tailwind v4 + globals.css");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const twDep = pkg.devDependencies?.tailwindcss ?? pkg.dependencies?.tailwindcss;
if (twDep && twDep.startsWith("^4")) ok(`tailwindcss ${twDep}`);
else fail(`tailwindcss ${twDep ?? "없음"} — v4 필요`);

const globals = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf8");
const requiredVars = ["--color-primary", "--color-foreground", "--color-surface", "--color-border"];
for (const v of requiredVars) {
  if (globals.includes(v)) ok(`globals.css 에 ${v}`);
  else fail(`globals.css 에 ${v} 누락 — bg-${v.replace("--color-", "")}/text-${v.replace("--color-", "")} 클래스가 작동 안 함`);
}

// 3. peer deps
header("3. Peer dependencies");
for (const peer of ["react", "react-dom"]) {
  const installed = pkg.devDependencies?.[peer] ?? pkg.dependencies?.[peer];
  if (installed) ok(`${peer} ${installed}`);
  else fail(`${peer} 미설치`);
}

// 4. .ai 메타 일관성
header("4. .ai 메타");
const aiFiles = [
  "MAP.md",
  "props.json",
  "coverage.json",
  "bundle.json",
  "deps.json",
  "a11y.json",
  "ssr-rsc.json",
];
for (const f of aiFiles) {
  const p = path.join(ROOT, ".ai", f);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    const ageH = (Date.now() - stat.mtimeMs) / 1000 / 60 / 60;
    if (ageH > 24 * 7) warn(`.ai/${f} — ${ageH.toFixed(0)}h 전 생성 (오래됨)`);
    else ok(`.ai/${f}`);
  } else {
    warn(`.ai/${f} 없음 — 해당 스크립트 미실행`);
  }
}

// 5. requirements 인덱스
header("5. requirements/ 인덱스");
try {
  execSync("node scripts/validate-requirements.mjs", { cwd: ROOT, stdio: "pipe" });
  ok("validate:requirements 통과");
} catch {
  fail("validate:requirements 실패 — README.md 행 누락 또는 touched files 불일치");
}

// 6. search-dictionary
header("6. search-dictionary 동기화");
try {
  execSync("node scripts/validate-search-dictionary.mjs", { cwd: ROOT, stdio: "pipe" });
  ok("validate:search-dictionary 통과");
} catch {
  fail("validate:search-dictionary 실패 — 쇼케이스 페이지 vs 사전 항목 불일치");
}

// 7. a11y strict 결과
header("7. a11y strict");
const a11yPath = path.join(ROOT, ".ai", "a11y.json");
if (fs.existsSync(a11yPath)) {
  const a11y = JSON.parse(fs.readFileSync(a11yPath, "utf8"));
  const crit = a11y.summary?.byImpact?.critical ?? 0;
  const sev = a11y.summary?.byImpact?.serious ?? 0;
  if (crit === 0 && sev === 0) ok(`critical=0 serious=0 (총 ${a11y.summary?.total} 컴포넌트)`);
  else fail(`critical=${crit} serious=${sev} — npm run audit:a11y 로 자세히 확인`);
} else {
  warn("a11y.json 없음 — npm run audit:a11y 실행");
}

// 종료
console.log();
const total = okCount + warnCount + failCount;
console.log(`\x1b[1m요약:\x1b[0m ${colors.ok} ${okCount}  ${colors.warn} ${warnCount}  ${colors.fail} ${failCount}  (총 ${total})`);
if (failCount > 0) process.exit(1);
if (warnCount > 0) process.exit(0);
process.exit(0);
