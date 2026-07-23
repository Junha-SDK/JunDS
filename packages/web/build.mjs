/**
 * packages/web/build.mjs — esbuild 직접 구동 (01-repo-structure §6 결정).
 * 빌드타임 의존성: esbuild, typescript (런타임 의존성 0 유지). rollup 미사용.
 * 산출물: dist/index.js(ESM) · dist/junds.min.js(IIFE, globalName JunDS)
 *        · dist/components/*(분할, 컴포넌트 존재 시) · dist/junds.css · dist/types/
 */
import { build } from "esbuild";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const p = (...s) => join(here, ...s);

const shared = {
  bundle: true,
  target: ["safari16.4", "chrome110", "firefox110"], // DEC-004 지원선
  logLevel: "info",
  absWorkingDir: here,
};

// 1) npm 소비용 ESM 배럴 (부수효과 없음)
await build({ ...shared, entryPoints: [p("src/index.ts")], format: "esm", outfile: p("dist/index.js") });

// 2) CDN 단일 파일 — <script src="…/junds.min.js"> 한 줄 소비
await build({
  ...shared,
  entryPoints: [p("src/cdn.ts")],
  format: "iife",
  globalName: "JunDS",
  minify: true,
  outfile: p("dist/junds.min.js"),
});

// 3) 컴포넌트별 분할 — dist/components/<name>.js (공유 청크 자동 추출)
//    B0에는 컴포넌트가 없다(다음 슬라이스) — 디렉터리 스캔 규약(01 §2)만 준비.
const componentsDir = p("src/components");
if (existsSync(componentsDir)) {
  const entries = readdirSync(componentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => p("src/components", d.name, "index.ts"));
  if (entries.length > 0) {
    await build({ ...shared, entryPoints: entries, format: "esm", splitting: true, outdir: p("dist/components") });
  }
}

// 4) 정적 CSS — 레이어 서열 선언 + tokens + base (03-web-arch §6.1-3)
mkdirSync(p("dist"), { recursive: true });
writeFileSync(
  p("dist/junds.css"),
  [
    "@layer junds.tokens, junds.base, junds.components;",
    readFileSync(p("src/styles/tokens.css"), "utf8"),
    readFileSync(p("src/styles/base.css"), "utf8"),
  ].join("\n"),
);

// 5) 타입 선언 — esbuild가 못 하므로 tsc로 별도 산출 (워크스페이스 호이스팅 대응: require.resolve)
//    tsconfig가 emitDeclarationOnly + outDir dist/types를 이미 규정한다.
const require = createRequire(import.meta.url);
execFileSync(
  process.execPath,
  [require.resolve("typescript/lib/tsc.js"), "-p", p("tsconfig.json")],
  { stdio: "inherit", cwd: here },
);
