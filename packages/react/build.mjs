/**
 * packages/react/build.mjs — esbuild 직접 구동 (packages/web/build.mjs 동형, 01 §6).
 * 어댑터는 단일 엔트리 ESM 번들 + tsc 타입 산출. react/react-dom과 @junds/web은
 * external — 코어의 클래스 identity(splitting 단일 빌드, DEC-012-7)를 소비자
 * 번들러가 그대로 공유하게 한다.
 */
import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const p = (...s) => join(here, ...s);
const manifest = JSON.parse(
  readFileSync(p("scripts/adapters.generated.json"), "utf8"),
);

const entryPoints = {
  index: p("src/index.ts"),
  button: p("src/entries/button.ts"),
  "text-field": p("src/entries/text-field.ts"),
  modal: p("src/entries/modal.ts"),
};
for (const { dir, name } of manifest) {
  if (entryPoints[dir]) {
    throw new Error(`@junds/react subpath 충돌: ${dir}`);
  }
  entryPoints[dir] = p(`src/generated/${name}.ts`);
}

// 제거·이름 변경된 entry/chunk/type 선언이 npm 산출물에 남지 않게 항상 새로 만든다.
rmSync(p("dist"), { recursive: true, force: true });
await build({
  entryPoints,
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: p("dist"),
  entryNames: "[name]",
  chunkNames: "chunks/[name]-[hash]",
  target: ["safari16.4", "chrome110", "firefox110"], // DEC-004 지원선
  jsx: "automatic",
  banner: { js: '"use client";' }, // RSC 경계 — 어댑터 전체가 클라이언트 컴포넌트
  external: ["react", "react-dom", "react/*", "react-dom/*", "@junds/web", "@junds/web/*"],
  // 조상(레포 루트 = v2 @junds/ui) package.json의 exports 조건 순서 결함("types"가
  // "import"/"require" 뒤)을 esbuild가 지적하는 소음 억제 — v2 패키징 소유 밖(보고서 기재)
  logOverride: { "package.json": "silent" },
  logLevel: "info",
  absWorkingDir: here,
});

// 타입 선언 — esbuild가 못 하므로 tsc로 별도 산출 (워크스페이스 호이스팅 대응: require.resolve)
const require = createRequire(import.meta.url);
execFileSync(
  process.execPath,
  [require.resolve("typescript/lib/tsc.js"), "-p", p("tsconfig.json")],
  { stdio: "inherit", cwd: here },
);

/**
 * 대표 subpath의 실제 ESM 그래프를 따라가며 전체 Web Component 등록이 다시 섞이지
 * 않았는지 확인한다. 엔트리 파일 크기만 재면 공유 chunk로 숨은 회귀를 놓친다.
 */
function inspectSubpath(entry) {
  const visited = new Set();
  const webImports = new Set();
  let bytes = 0;
  const visit = (file) => {
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, "utf8");
    bytes += Buffer.byteLength(source);
    for (const match of source.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)) {
      const specifier = match[1];
      if (specifier.startsWith("@junds/web/")) webImports.add(specifier);
      else if (specifier.startsWith(".")) {
        visit(resolve(dirname(file), specifier));
      }
    }
  };
  visit(entry);
  return { bytes, webImports };
}

const alertGraph = inspectSubpath(p("dist/alert.js"));
if (
  alertGraph.webImports.size !== 1 ||
  !alertGraph.webImports.has("@junds/web/alert") ||
  alertGraph.bytes > 10_000
) {
  throw new Error(
    `@junds/react/alert isolation 실패: ${alertGraph.bytes} bytes, ` +
      `web imports=${[...alertGraph.webImports].join(",")}`,
  );
}
console.log(
  `✓ React subpath isolation — alert graph ${alertGraph.bytes} bytes, @junds/web/alert만 등록`,
);
