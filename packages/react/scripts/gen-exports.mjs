/**
 * @junds/react 컴포넌트별 subpath export 생성기.
 *
 * `@junds/react/alert`처럼 하나만 import했을 때 387개 Web Component 등록을 함께
 * 끌고 오지 않도록, gen-adapters의 manifest를 package exports 정본으로 투영한다.
 *
 * 실행: node scripts/gen-exports.mjs [--check]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const reactDir = join(here, "..");
const packagePath = join(reactDir, "package.json");
const manifest = JSON.parse(readFileSync(join(here, "adapters.generated.json"), "utf8"));
const pkg = JSON.parse(readFileSync(packagePath, "utf8"));

const exportsMap = {
  ".": {
    types: "./dist/types/index.d.ts",
    default: "./dist/index.js",
  },
  "./button": {
    types: "./dist/types/entries/button.d.ts",
    default: "./dist/button.js",
  },
  "./text-field": {
    types: "./dist/types/entries/text-field.d.ts",
    default: "./dist/text-field.js",
  },
  "./modal": {
    types: "./dist/types/entries/modal.d.ts",
    default: "./dist/modal.js",
  },
};

for (const { dir, name } of manifest) {
  const subpath = `./${dir}`;
  if (exportsMap[subpath]) {
    throw new Error(`@junds/react subpath 충돌: ${subpath}`);
  }
  exportsMap[subpath] = {
    types: `./dist/types/generated/${name}.d.ts`,
    default: `./dist/${dir}.js`,
  };
}

const current = JSON.stringify(pkg.exports);
const expected = JSON.stringify(exportsMap);
if (process.argv.includes("--check")) {
  if (current !== expected) {
    console.error("✗ @junds/react package exports drift — npm run gen:exports 필요");
    process.exit(1);
  }
  console.log(`✓ React subpath exports drift 없음 (${Object.keys(exportsMap).length}개)`);
} else {
  pkg.exports = exportsMap;
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`✓ React subpath exports ${Object.keys(exportsMap).length}개 → package.json`);
}
