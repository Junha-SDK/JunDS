/**
 * packages/web/build.mjs — esbuild 직접 구동 (01-repo-structure §6 결정).
 * 빌드타임 의존성: esbuild, typescript (런타임 의존성 0 유지). rollup 미사용.
 * 산출물:
 *  - dist/index.js·define.js·components/<n>/{index,element}.js·behaviors/* (ESM, splitting
 *    — 공유 청크로 클래스 단일 인스턴스 보장: "."과 "./button" 혼용 시 identity 유지)
 *  - dist/junds.min.js (IIFE, globalName JunDS — CDN 한 줄 소비)
 *  - dist/junds.css (레이어 서열 + tokens + base + 컴포넌트 css 텍스트 수집, §6.1-3)
 *  - dist/css/<name>.css (컴포넌트별 정적 CSS)
 *  - dist/types/ (tsc emitDeclarationOnly)
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

// 컴포넌트 디렉터리 스캔 (01 §2 물리 규약: 폴더당 1컴포넌트)
const componentsDir = p("src/components");
const componentNames = existsSync(componentsDir)
  ? readdirSync(componentsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [];

// 1) npm 소비용 ESM — 단일 빌드 + splitting (엔트리 간 공유 청크로 클래스 identity 보존)
const esmEntries = [p("src/index.ts"), p("src/define.ts")];
for (const name of componentNames) {
  esmEntries.push(p("src/components", name, "index.ts"), p("src/components", name, "element.ts"));
}
const behaviorsDir = p("src/behaviors");
if (existsSync(behaviorsDir)) {
  for (const f of readdirSync(behaviorsDir)) {
    if (f.endsWith(".ts")) esmEntries.push(p("src/behaviors", f));
  }
}
await build({
  ...shared,
  entryPoints: esmEntries,
  format: "esm",
  splitting: true,
  outdir: p("dist"),
  outbase: p("src"),
  chunkNames: "chunks/[name]-[hash]",
});

// 2) CDN 단일 파일 — <script src="…/junds.min.js"> 한 줄 소비 (전량 자동 define)
await build({
  ...shared,
  entryPoints: [p("src/cdn.ts")],
  format: "iife",
  globalName: "JunDS",
  minify: true,
  outfile: p("dist/junds.min.js"),
});

// 3) 정적 CSS — css 태그 `text`를 빌드타임 수집 (03-web-arch §6.1-3).
//    *.css.ts를 esbuild로 번들 후 data: URL import — 소스가 곧 단일 진실(정규식 추출 금지).
async function collectCssText(entry) {
  const r = await build({
    ...shared,
    entryPoints: [entry],
    format: "esm",
    write: false,
    logLevel: "silent",
  });
  const mod = await import(
    `data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`
  );
  return mod.default.text;
}

mkdirSync(p("dist/css"), { recursive: true });
const componentCss = [];
for (const name of componentNames) {
  const cssFile = readdirSync(p("src/components", name)).find((f) => f.endsWith(".css.ts"));
  if (!cssFile) continue;
  const text = await collectCssText(p("src/components", name, cssFile));
  componentCss.push(text);
  writeFileSync(p("dist/css", `${name}.css`), `${text}\n`);
}
writeFileSync(
  p("dist/junds.css"),
  [
    "@layer junds.tokens, junds.base, junds.components;",
    readFileSync(p("src/styles/tokens.css"), "utf8"),
    readFileSync(p("src/styles/base.css"), "utf8"),
    ...componentCss,
  ].join("\n"),
);

// 4) 타입 선언 — esbuild가 못 하므로 tsc로 별도 산출 (워크스페이스 호이스팅 대응: require.resolve)
//    tsconfig가 emitDeclarationOnly + outDir dist/types를 이미 규정한다.
const require = createRequire(import.meta.url);
execFileSync(
  process.execPath,
  [require.resolve("typescript/lib/tsc.js"), "-p", p("tsconfig.json")],
  { stdio: "inherit", cwd: here },
);
