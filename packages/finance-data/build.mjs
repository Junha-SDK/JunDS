/**
 * @junds/finance-data 빌드 — ESM + CJS + d.ts 3중 산출 (01-repo-structure §6 산출물 매트릭스).
 *
 * rollup 재활용(react 설정 축소판) 대신 tsc 듀얼 에밋을 쓴다:
 * 이 패키지는 CSS도 "use client" 배너도 번들링 필요도 없어 rollup이 풀어주는
 * 문제가 존재하지 않는다 (근거 기록: DECISIONS DEC-014).
 *
 * 산출:
 *   dist/esm/*.js   — ESM (루트 package.json "type": "module")
 *   dist/cjs/*.js   — CJS (+ dist/cjs/package.json {"type":"commonjs"} 마커)
 *   dist/types/*.d.ts
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const run = (cmd) => execSync(cmd, { stdio: "inherit", cwd: root });

rmSync(join(root, "dist"), { recursive: true, force: true });

// 1) ESM + 타입 선언
run("npx tsc -p tsconfig.build.json");

// 2) CJS
run("npx tsc -p tsconfig.cjs.json");

// 3) CJS 마커 — dist/cjs 하위 .js를 CommonJS로 해석시킨다
mkdirSync(join(root, "dist/cjs"), { recursive: true });
writeFileSync(
  join(root, "dist/cjs/package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2) + "\n",
);

console.log("[finance-data] build ok: dist/esm + dist/cjs + dist/types");
