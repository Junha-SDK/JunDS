#!/usr/bin/env node
/**
 * docs-spec/parity/tools/manifest.mjs
 * .capture-raw.json + .surface.json + ledger.json → manifest.json + COVERAGE.md
 * manifest 는 이후 픽셀 대조 스크립트의 입력(컴포넌트→캡처→sha256).
 */
import { readFileSync, writeFileSync, openSync, readSync, closeSync } from "node:fs";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARITY = path.resolve(__dirname, "..");
const REPO = path.resolve(PARITY, "../..");

const raw = JSON.parse(readFileSync(path.join(__dirname, ".capture-raw.json"), "utf8"));
const surface = JSON.parse(readFileSync(path.join(__dirname, ".surface.json"), "utf8"));
const ledger = JSON.parse(readFileSync(path.join(REPO, "docs-spec/registry/ledger.json"), "utf8"));

const pngSize = (file) => {
  // IHDR: bytes 16..24 = width/height (BE)
  const fd = openSync(file, "r");
  const buf = Buffer.alloc(24);
  readSync(fd, buf, 0, 24, 0);
  closeSync(fd);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
};

const git = (cmd) => execSync(`git -C ${REPO} ${cmd}`, { encoding: "utf8" }).trim();

// ── 캡처 결과 집계 ─────────────────────────────────────────
const components = {};
const failures = [];
let totalBytes = 0;
let totalCaptures = 0;

// 중복 id(AreaChart) 대비: 스토리 타이틀 접두(Composites/…)와 카테고리를 함께 대조
const findRow = (id, title) => {
  const cat = title.split("/")[0].toLowerCase();
  return (
    ledger.rows.find((r) => r.id === id && r.category === cat) ??
    ledger.rows.find((r) => r.id === id)
  );
};

for (const rec of raw.results) {
  for (const f of rec.failures)
    failures.push({ storyId: rec.storyId, ledgerId: rec.ledgerId, ...f });
  if (!rec.captures.length) continue;
  const row = findRow(rec.ledgerId, rec.title);
  const comp = (components[rec.ledgerId] ??= {
    category: row?.category ?? "(ledger 밖)",
    tier: row?.tier ?? null,
    storyTitle: rec.title,
    captures: [],
  });
  for (const c of rec.captures) {
    const abs = path.join(PARITY, c.file);
    const data = readFileSync(abs);
    const { w, h } = pngSize(abs);
    totalBytes += data.length;
    totalCaptures++;
    comp.captures.push({
      variant: rec.variant,
      theme: c.theme,
      storyId: rec.storyId,
      file: c.file,
      w,
      h,
      bytes: data.length,
      sha256: createHash("sha256").update(data).digest("hex"),
    });
  }
}

// ── 미확보 목록 ───────────────────────────────────────────
// 스토리는 있지만 전 스토리가 빈 렌더(placeholder, 빈 props)인 컴포넌트
const attemptedIds = new Set(raw.results.map((r) => r.ledgerId));
const uncaptured = {};
for (const row of ledger.rows) {
  if (components[row.id]?.category === row.category) continue;
  const s = surface[`${row.category}/${row.id}`] ??
    surface[row.id] ?? { kind: "?", file: null, props: {} };
  const reason =
    row.category === "hooks"
      ? "훅 — 시각 표면 없음"
      : s.kind === "프로바이더(래퍼)"
      ? "프로바이더 — 단독 시각 표면 없음"
      : s.kind === "비시각 모듈"
      ? "비시각 모듈"
      : attemptedIds.has(row.id)
      ? "스토리가 빈 placeholder — 빈 props 렌더(시각 표면 0)"
      : "스토리 없음 — v2 storybook 미작성";
  uncaptured[uncaptured[row.id] ? `${row.category}/${row.id}` : row.id] = {
    category: row.category,
    tier: row.tier,
    reason,
    kind: s.kind,
    file: s.file,
    variantSurface: s.props,
  };
}

// ── manifest ──────────────────────────────────────────────
const capturedIds = Object.keys(components);
const manifest = {
  $schema: "docs-spec/parity/tools/manifest.mjs 가 생성 — 직접 편집 금지",
  generatedAt: new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), // KST
  purpose:
    "v2 컴포넌트 실렌더 스크린샷 기준(baseline). 42배치 바닐라·iOS 구현의 시각 패리티 대조 정답지.",
  provenance: {
    // 캡처에 쓴 storybook 은 58f57b5 시점 HEAD 에서 빌드했다.
    // 이후 f456624 까지 ds/·app/globals.css·.storybook 무변경을 git diff 로 확인 —
    // 캡처는 현 HEAD 에도 유효하다.
    buildCommit: "58f57b5",
    manifestCommit: git("rev-parse --short HEAD"),
    v3Branch: git("branch --show-current"),
    storybook: {
      builtFrom: "v3 워크트리 HEAD (storybook build → 스크래치패드, 레포 불변)",
      note: "레포의 기존 storybook-static/(2026-04-29)은 sideEffects:false 트리셰이킹으로 앱 CSS 가 전무한 무스타일 렌더라 기준으로 사용 불가 — DECISIONS.md 참조",
    },
    cssInjection:
      "app/globals.css 를 @tailwindcss/postcss(레포 의존성)로 별도 컴파일해 캡처 시 주입 (tools/build-css.mjs)",
  },
  captureConditions: {
    viewport: raw.viewport,
    deviceScaleFactor: raw.dsf,
    fixedDate: raw.fixedDate,
    mathRandomSeed: 20260429,
    reducedMotion: "reduce",
    animations: "none(강제 비활성)",
    locale: "ko-KR",
    timezone: "Asia/Seoul",
    themeMechanism: 'documentElement[data-theme="dark"] 토글',
    fileRule: "baseline/<ledger-id>/<variant>-<theme>.png",
  },
  aliases: {
    "Composites/Progress": "ProgressBar",
    "Composites/Progress → Steps 스토리": "ProgressSteps",
    "Composites/Toast": "DsToastProvider",
  },
  counts: {
    ledgerRows: ledger.rows.length,
    capturedComponents: capturedIds.length,
    captures: totalCaptures,
    totalBytes,
    failures: failures.length,
  },
  components: Object.fromEntries(Object.entries(components).sort(([a], [b]) => a.localeCompare(b))),
  uncaptured,
  failures,
};

writeFileSync(path.join(PARITY, "manifest.json"), JSON.stringify(manifest, null, 2));

// ── COVERAGE.md ───────────────────────────────────────────
const byCat = {};
for (const row of ledger.rows) {
  const c = (byCat[row.category] ??= { total: 0, captured: 0 });
  c.total++;
  if (components[row.id]) c.captured++;
}
const visualUncaptured = Object.entries(uncaptured).filter(([, u]) =>
  u.reason.startsWith("스토리"),
);
// 시각 표면이 있는 행 수 = 전체 − (훅·프로바이더·비시각 모듈)
const nonVisualRows = Object.values(uncaptured).filter(
  (u) => !u.reason.startsWith("스토리"),
).length;
const visualRows = ledger.rows.length - nonVisualRows;
const mb = (b) => (b / 1024 / 1024).toFixed(1);

const md = `# v2 시각 패리티 기준 — 커버리지

생성: ${manifest.generatedAt} · 빌드 v3 ${manifest.provenance.buildCommit} · manifest.json 참조

## 요약

- ledger ${ledger.rows.length}행 중 **${capturedIds.length}컴포넌트** 캡처 (${(
  (capturedIds.length / ledger.rows.length) *
  100
).toFixed(1)}%)
- 스크린샷 **${totalCaptures}장** · ${mb(totalBytes)}MB (라이트/다크 × variant)
- 시각 표면이 있는 행(훅·프로바이더·비시각 제외 ${visualRows}행) 기준 **${(
  (capturedIds.length / visualRows) *
  100
).toFixed(1)}%**

## 카테고리별

| 카테고리 | 캡처/전체 | 비고 |
|---|---|---|
${Object.entries(byCat)
  .map(
    ([cat, c]) =>
      `| ${cat} | ${c.captured}/${c.total} | ${cat === "hooks" ? "훅 — 시각 표면 없음" : ""} |`,
  )
  .join("\n")}

## 미확보 사유

| 사유 | 행 수 |
|---|---|
${Object.entries(
  Object.values(uncaptured).reduce((acc, u) => {
    acc[u.reason] = (acc[u.reason] ?? 0) + 1;
    return acc;
  }, {}),
)
  .map(([r, n]) => `| ${r} | ${n} |`)
  .join("\n")}

스토리 부재/placeholder 인 시각 컴포넌트 ${visualUncaptured.length}종은 manifest.json
\`uncaptured.*.variantSurface\` 에 소스 추출 variant 표면(문자열 유니온 prop + styles 객체 키)을
기록했다 — 42배치 구현 시 스토리 저작과 함께 기준 캡처를 추가한다. placeholder
(\`items={[]}\` 류 빈 props)는 v2 스토리 원문의 내용 공백이므로 임의 props 로 메꾸지 않았다
(정답지 원칙: v2 가 실제로 그리는 화면만 기준으로 삼는다).

## 캡처 실패 스토리

${(() => {
  const placeholderIds = new Set(
    Object.entries(uncaptured)
      .filter(([, u]) => u.reason.startsWith("스토리가 빈"))
      .map(([id]) => id.split("/").pop()),
  );
  const unexpected = failures.filter((f) => !placeholderIds.has(f.ledgerId));
  const expected = failures.length - unexpected.length;
  return [
    expected ? `placeholder(빈 props) 기인 ${expected}건은 미확보 사유 표로 갈음.` : null,
    unexpected.length
      ? unexpected.map((f) => `- \`${f.storyId}\` (${f.theme}): ${f.reason}`).join("\n")
      : "그 외 없음 — 유효 스토리는 전수 캡처됨.",
  ]
    .filter(Boolean)
    .join("\n\n");
})()}
`;
writeFileSync(path.join(PARITY, "COVERAGE.md"), md);

console.log(
  `[manifest] ${capturedIds.length}/${
    ledger.rows.length
  } components, ${totalCaptures} captures, ${mb(totalBytes)}MB, failures ${failures.length}`,
);
