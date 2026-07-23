#!/usr/bin/env node
/**
 * docs-spec/parity/tools/build-css.mjs
 * app/globals.css(Tailwind v4)를 레포 자체 의존성(@tailwindcss/postcss)으로
 * 컴파일해 캡처 시 주입할 단일 CSS 를 만든다.
 *
 * 필요한 이유: 루트 package.json 의 "sideEffects": false 가 storybook 프로덕션
 * 빌드에서 preview.ts 의 `import "../app/globals.css"` 를 트리셰이킹으로
 * 제거해, 정적 빌드에 앱 CSS 가 전혀 실리지 않는다(무스타일 렌더).
 * 레포 파일은 수정 금지이므로 CSS 를 별도 산출해 런타임 주입으로 보정한다.
 *
 * 사용: node build-css.mjs <출력파일.css>
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");
const input = path.join(REPO, "app/globals.css");
const output = process.argv[2];
if (!output) {
  console.error("usage: node build-css.mjs <out.css>");
  process.exit(1);
}

const css = readFileSync(input, "utf8");
const result = await postcss([tailwind({ base: REPO })]).process(css, {
  from: input,
  to: output,
});
writeFileSync(output, result.css);
console.log(`[build-css] ${input} → ${output} (${Math.round(result.css.length / 1024)}KB)`);
