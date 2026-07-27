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
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const p = (...s) => join(here, ...s);
const distDir = p("dist");

// 0) 생성물 선행 — src/elements.generated.ts 는 번들 엔트리(src/index.ts)가 import 하는
//    실소스이고 custom-elements.json 은 배포 대상(package.json "customElements")이다.
//    셋 다 생성물이라, 빌드가 스스로 만들지 않으면 신규 클론·CI 체크아웃에서
//    esbuild가 "Could not resolve src/elements.generated.ts"로 죽는다(DEC-050 실측).
//    스테일 생성물이 빌드를 깨뜨리는 경로도 같은 호출로 함께 닫힌다.
execFileSync(process.execPath, [p("scripts/gen-manifest.mjs")], { stdio: "inherit" });

const shared = {
  bundle: true,
  target: ["safari16.4", "chrome110", "firefox110"], // DEC-004 지원선
  logLevel: "info",
  absWorkingDir: here,
};

// 해시 청크는 빌드마다 이름이 달라진다. 이전 JS/CSS 산출물은 제거하되 types는
// 유지한다. @junds/react 같은 다운스트림 패키지가 병렬로 타입을 읽는 순간 dist
// 전체를 지우면 TS7016이 간헐적으로 발생한다. 새 선언은 아래 tsc가 원자적인 파일
// 교체로 덮고, 제거된 소스의 오래된 선언만 빌드 끝에서 정리한다.
mkdirSync(distDir, { recursive: true });
for (const entry of readdirSync(distDir, { withFileTypes: true })) {
  if (entry.name === "types") continue;
  rmSync(join(distDir, entry.name), { recursive: true, force: true });
}

// 컴포넌트 디렉터리 스캔 (01 §2 물리 규약: 폴더당 1컴포넌트)
const componentsDir = p("src/components");
const componentNames = existsSync(componentsDir)
  ? readdirSync(componentsDir, { withFileTypes: true })
      .filter(
        (d) =>
          d.isDirectory() &&
          existsSync(p("src/components", d.name, "index.ts")) &&
          existsSync(p("src/components", d.name, "element.ts")),
      )
      .map((d) => d.name)
  : [];

// 1) npm 소비용 ESM — 단일 빌드 + splitting (엔트리 간 공유 청크로 클래스 identity 보존)
const esmEntries = [
  p("src/index.ts"),
  p("src/define.ts"),
  p("src/core/content.ts"),
  // 타입 전용 — HTMLElementTagNameMap 증강. 런타임 산출은 비지만 d.ts 가 본체다.
  p("src/elements.generated.ts"),
];
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
  outdir: distDir,
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
  const text = (await collectCssText(p("src/components", name, cssFile))).trimEnd();
  componentCss.push(text);
  writeFileSync(p("dist/css", `${name}.css`), `${text}\n`);
  // 한 폴더가 여러 태그를 소유하는 경우(page → jd-page-header 등)에도 소비자가
  // 태그 이름 그대로 `@junds/web/css/page-header.css`를 가져올 수 있어야 한다.
  // JS 서브패스 별칭과 같은 규칙으로 동일 CSS를 별칭 파일에 방출한다.
  const elementSource = readFileSync(
    p("src/components", name, "element.ts"),
    "utf8",
  );
  const tagConstants = new Map();
  for (const match of elementSource.matchAll(
    /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:"([^"]+)"|'([^']+)')/g,
  )) {
    tagConstants.set(match[1], match[2] ?? match[3]);
  }
  for (const match of elementSource.matchAll(
    /static\s+(?:override\s+)?(?:readonly\s+)?tag\s*=\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))/g,
  )) {
    const tagName = match[1] ?? match[2] ?? tagConstants.get(match[3]);
    if (!tagName?.startsWith("jd-")) continue;
    const tag = tagName.slice(3);
    if (tag !== name) writeFileSync(p("dist/css", `${tag}.css`), `${text}\n`);
  }
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
// 부분 import의 공통 기반. 앱에서 한 번만 로드하고 필요한 컴포넌트 CSS를 더하면
// 전체 junds.css 없이도 토큰·포커스 링·FOUC 기본값이 빠지지 않는다.
writeFileSync(
  p("dist/core.css"),
  [
    "@layer junds.tokens, junds.base, junds.components;",
    readFileSync(p("src/styles/tokens.css"), "utf8"),
    readFileSync(p("src/styles/base.css"), "utf8"),
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

// tsc는 outDir의 오래된 파일을 지우지 않는다. 병렬 소비자를 위해 선언 디렉터리
// 자체는 보존하면서, 대응하는 src/*.ts가 사라진 선언만 선택적으로 제거한다.
const typesDir = p("dist/types");
function pruneStaleDeclarations(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      pruneStaleDeclarations(path);
      if (readdirSync(path).length === 0) rmSync(path, { recursive: true });
      continue;
    }
    if (!entry.name.endsWith(".d.ts")) continue;
    const source = p(
      "src",
      relative(typesDir, path).replace(/\.d\.ts$/, ".ts"),
    );
    if (!existsSync(source)) rmSync(path);
  }
}
pruneStaleDeclarations(typesDir);
