#!/usr/bin/env node
/**
 * docs-spec/parity/tools/surface.mjs
 * 스토리가 없어 캡처 불가한 ledger 행에 대해 ds/ 소스에서 variant 표면
 * (문자열 유니온 prop)만 기록한다. ds/ 는 읽기 전용.
 * 출력: tools/.surface.json  { id: { file, kind, props: { name: [values] } } }
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");
const DS = path.join(REPO, "ds");

const ledger = JSON.parse(
  readFileSync(path.join(REPO, "docs-spec/registry/ledger.json"), "utf8"),
);

// 카테고리 디렉토리 내 파일 인덱스(1회 스캔)
const filesByCat = {};
for (const cat of ["core", "layout", "primitives", "composites", "patterns", "hooks", "finance"]) {
  const dir = path.join(DS, cat);
  const acc = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      if (name === "__tests__" || name === "node_modules") continue;
      const p = path.join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(name) && !/\.(test|stories|spec)\./.test(name)) acc.push(p);
    }
  };
  if (existsSync(dir)) walk(dir);
  filesByCat[cat] = acc;
}

// id 의 정의 파일 찾기: 1) ds/<cat>/<Id>/ 디렉토리 2) 파일명 <Id>.tsx? 3) export 그렙
const findFile = (cat, id) => {
  const dirCand = path.join(DS, cat, id);
  if (existsSync(dirCand) && statSync(dirCand).isDirectory()) {
    const main = [`${id}.tsx`, `${id}.ts`, "index.tsx", "index.ts"]
      .map((n) => path.join(dirCand, n))
      .find(existsSync);
    if (main) return main;
  }
  const byName = filesByCat[cat].find((f) => path.basename(f).replace(/\.(tsx|ts)$/, "") === id);
  if (byName) return byName;
  const re = new RegExp(`export\\s+(?:const|function|class)\\s+${id}\\b`);
  const direct = filesByCat[cat].find((f) => re.test(readFileSync(f, "utf8")));
  if (direct) return direct;
  // 배럴 별칭 재수출: export { X as Id } from "./Y"
  const idx = path.join(DS, cat, "index.ts");
  if (existsSync(idx)) {
    const m = readFileSync(idx, "utf8").match(
      new RegExp(`export\\s*\\{[^}]*\\b(\\w+)\\s+as\\s+${id}\\b[^}]*\\}\\s*from\\s*"\\.\\/([^"]+)"`),
    );
    if (m) {
      const target = [`${m[2]}.tsx`, `${m[2]}.ts`, path.join(m[2], "index.tsx"), path.join(m[2], "index.ts")]
        .map((n) => path.join(DS, cat, n))
        .find(existsSync);
      if (target) return target;
    }
  }
  return null;
};

// 문자열 유니온 prop 추출 — interface/type Props 블록 한정하지 않고
// `name?: "a" | "b"` 패턴을 파일 전역에서 수집(간결·보수적)
// prop 인라인 유니온 + `type XVariant = "a" | "b"` 별칭 선언 둘 다 수집
const UNION_RE =
  /(?:type\s+(\w+)\s*=|(\w+)\??:)\s*("(?:[^"\\]|\\.)*"(?:\s*\|\s*"(?:[^"\\]|\\.)*")+)/g;
const extract = (src) => {
  const props = {};
  for (const m of src.matchAll(UNION_RE)) {
    const name = m[1] ?? m[2];
    const union = m[3];
    const values = [...union.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
    // variant 표면으로 의미있는 것만: 2~12개 값, 짧은 토큰
    if (values.length < 2 || values.length > 12) continue;
    if (values.some((v) => v.length > 24)) continue;
    props[name] = values;
  }
  return props;
};

// `const variantStyles: Record<..> = { a: .., b: .. }` 패턴의 키도 표면으로 수집
const STYLES_OBJ_RE =
  /const\s+(\w*(?:[Vv]ariant|[Ss]ize|[Tt]one|[Cc]olor|[Ss]tatus)\w*?)(?:Styles|Classes|Map)\s*(?::[^=]+)?=\s*\{([\s\S]*?)\n\}/g;
const extractStyleKeys = (src, props) => {
  for (const m of src.matchAll(STYLES_OBJ_RE)) {
    const name = m[1].replace(/^./, (c) => c.toLowerCase());
    if (props[name]) continue;
    const keys = [...m[2].matchAll(/^\s{2}(?:"([\w-]+)"|([\w-]+)):/gm)].map((x) => x[1] ?? x[2]);
    if (keys.length >= 2 && keys.length <= 12) props[name] = keys;
  }
  return props;
};

const out = {};
for (const row of ledger.rows) {
  const file = findFile(row.category, row.id);
  if (!file) {
    out[row.id] = { file: null, kind: "정의 파일 미탐지", props: {} };
    continue;
  }
  const src = readFileSync(file, "utf8");
  const isHook = row.category === "hooks" || /^use[A-Z]/.test(row.id);
  const isProvider = /Provider$/.test(row.id);
  const hasJsx = file.endsWith(".tsx") && /<[A-Za-z]/.test(src);
  const kind = isHook
    ? "훅(비시각)"
    : isProvider
      ? "프로바이더(래퍼)"
      : hasJsx
        ? "시각 컴포넌트"
        : "비시각 모듈";
  // ledger 중복 id(예: AreaChart — composites·finance 양쪽) → 카테고리 접두 키
  const key = out[row.id] ? `${row.category}/${row.id}` : row.id;
  out[key] = { file: path.relative(REPO, file), kind, props: extractStyleKeys(src, extract(src)) };
}

writeFileSync(path.join(__dirname, ".surface.json"), JSON.stringify(out, null, 2));
const kinds = {};
for (const v of Object.values(out)) kinds[v.kind] = (kinds[v.kind] ?? 0) + 1;
console.log("[surface]", JSON.stringify(kinds));
