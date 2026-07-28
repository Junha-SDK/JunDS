/**
 * benchmarks/size-gate.mjs — 번들 사이즈 게이트 (05-perf §3.1).
 * 위치: 01-repo-structure §3.4("루트 scripts/를 더 불리지 않는다")에 따라 benchmarks/ —
 * 05의 `scripts/size-gate.mjs` 표기와의 충돌 해소는 DECISIONS "G1 구현 중 발견" 참조.
 *
 * 계측(node:zlib gzip, minify 산출물 기준):
 *  - 코어(W1): src/index.ts 번들 — JdElement+define+styles+behaviors(포커스트랩은 코어 계상,
 *    05 §1 근거의 코어 정의에 포함) ≤ 8KB gzip
 *  - 컴포넌트(W2): 각 src/components/<n>/index.ts 번들에서 core/behaviors import를
 *    external로 분리 계상 — 평균 ≤4KB · 개별 p95 ≤12KB · L 예외 24KB
 *  - 기준선 대비 +3% 초과 증가 실패(점진 비대화 차단). 기준선 부재 시 생성.
 *
 * 사용: node benchmarks/size-gate.mjs [--update-baseline]
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const webDir = join(root, "packages/web");
const esbuild = createRequire(join(webDir, "build.mjs"))("esbuild");

const budgets = JSON.parse(readFileSync(join(root, "docs-spec/registry/budgets.json"), "utf8"));
const baselinePath = join(root, "docs-spec/registry/size-baseline.json");
const updateBaseline = process.argv.includes("--update-baseline");

const shared = {
  bundle: true,
  minify: true,
  write: false,
  format: "esm",
  target: ["safari16.4", "chrome110", "firefox110"],
  logLevel: "silent",
  absWorkingDir: webDir,
};
const gz = (r) => gzipSync(Buffer.from(r.outputFiles[0].text)).length;

// 코어(W1) — 코어 전용 배럴: 베이스클래스·define·styles·uid·style-props·behaviors.
// 공개 배럴(src/index.ts)은 컴포넌트 클래스를 재수출해 배치가 늘수록 W1이 무한 비대해지므로
// 게이트 주석의 코어 정의와 일치하는 src/core/index.ts로 계측한다 (DECISIONS B1).
const coreSize = gz(
  await esbuild.build({ ...shared, entryPoints: [join(webDir, "src/core/index.ts")] }),
);

// 컴포넌트(W2) — core/behaviors는 external(공유 계층 분리 계상, 05 §1 W2 근거와 동형)
const externalCore = {
  name: "external-core",
  setup(b) {
    b.onResolve({ filter: /^\.\.\/\.\.\/(core|behaviors)\// }, (args) => ({
      path: args.path,
      external: true,
    }));
  },
};
const componentsDir = join(webDir, "src/components");
const components = {};
for (const d of readdirSync(componentsDir, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  components[d.name] = gz(
    await esbuild.build({
      ...shared,
      entryPoints: [join(componentsDir, d.name, "index.ts")],
      plugins: [externalCore],
    }),
  );
}

// 통계·판정
const sizes = Object.values(components);
const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length;
const sorted = [...sizes].sort((a, b) => a - b);
const p95 = sorted[Math.min(sorted.length - 1, Math.floor(0.95 * sorted.length))];

const failures = [];
const kb = (n) => `${(n / 1024).toFixed(2)}KB`;
console.log(
  `[size] core (src/core/index.ts, minify+gzip): ${kb(coreSize)} / 예산 ${kb(budgets.coreMax)}`,
);
if (coreSize > budgets.coreMax) failures.push(`W1: 코어 ${kb(coreSize)} > ${kb(budgets.coreMax)}`);

for (const [name, size] of Object.entries(components)) {
  const cap = budgets.exceptions?.[name] ?? budgets.componentMax;
  const ok = size <= cap;
  console.log(`[size] jd-${name}: ${kb(size)} / 개별 상한 ${kb(cap)} ${ok ? "OK" : "FAIL"}`);
  if (!ok) failures.push(`W2: ${name} ${kb(size)} > ${kb(cap)}`);
}
console.log(
  `[size] 평균: ${kb(avg)} / 예산 ${kb(budgets.componentAvgMax)} · p95: ${kb(p95)} / ${kb(
    budgets.componentMax,
  )}`,
);
if (avg > budgets.componentAvgMax)
  failures.push(`W2: 평균 ${kb(avg)} > ${kb(budgets.componentAvgMax)}`);
if (p95 > budgets.componentMax) failures.push(`W2: p95 ${kb(p95)} > ${kb(budgets.componentMax)}`);

// 기준선 드리프트(+3%)
const current = { core: coreSize, components };
if (existsSync(baselinePath) && !updateBaseline) {
  const base = JSON.parse(readFileSync(baselinePath, "utf8"));
  const check = (label, now, prev) => {
    if (prev && now > prev * 1.03)
      failures.push(
        `드리프트: ${label} ${kb(prev)} → ${kb(now)} (+${(((now - prev) / prev) * 100).toFixed(
          1,
        )}% > 3%)`,
      );
  };
  check("core", coreSize, base.core);
  for (const [n, s] of Object.entries(components)) check(n, s, base.components?.[n]);
} else {
  writeFileSync(baselinePath, JSON.stringify(current, null, 2) + "\n");
  console.log(`[size] 기준선 ${updateBaseline ? "갱신" : "생성"}: ${baselinePath}`);
}

if (failures.length) {
  console.error(`\n[size] FAIL:\n - ${failures.join("\n - ")}`);
  process.exit(1);
}
console.log(
  `\n[size] PASS: 코어 ≤${kb(budgets.coreMax)} · 평균 ≤${kb(budgets.componentAvgMax)} · p95 ≤${kb(
    budgets.componentMax,
  )}`,
);
