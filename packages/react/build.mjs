/**
 * packages/react/build.mjs — esbuild 직접 구동 (packages/web/build.mjs 동형, 01 §6).
 * 어댑터는 단일 엔트리 ESM 번들 + tsc 타입 산출. react/react-dom과 @junds/web은
 * external — 코어의 클래스 identity(splitting 단일 빌드, DEC-012-7)를 소비자
 * 번들러가 그대로 공유하게 한다.
 */
import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const p = (...s) => join(here, ...s);

await build({
  entryPoints: [p("src/index.ts")],
  bundle: true,
  format: "esm",
  outdir: p("dist"),
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
