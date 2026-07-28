#!/usr/bin/env node
/**
 * packages/ios/tools/run-bench.mjs — iOS 벤치 러너 (05-perf §2.2, 의존성 0).
 *
 * 절차:
 *   ① CLT swift로 --build-tests 시뮬레이터 빌드 (테스트 번들까지 컴파일)
 *   ② 부팅된 시뮬레이터에 xctest 에이전트를 spawn해 JunDSPackageTests.xctest 실행
 *   ③ stdout/stderr의 measured 라인 파싱 — JdBench 접두 클래스만 채택
 *   ④ benchmarks/results/ios/<YYYY-MM-DD>-sim.json 기록 (게이트는 bench-gate.mjs 별도)
 *
 * 사용: node packages/ios/tools/run-bench.mjs [--scratch-path <경로>] [--skip-build]
 *   --scratch-path  빌드 산출 경로. 기본은 공용 .build — 러너는 통합 환경 전용이라 공용을 쓰되,
 *                   배치 에이전트/병렬 환경은 자기 전용 경로로 재정의한다(동시 빌드 충돌 방지).
 *   --skip-build    빌드 생략(직전 빌드 재사용) — 수치 재채집용.
 *
 * 전제: 부팅된 iOS 시뮬레이터 1대(xcrun simctl boot). 시뮬레이터 수치는 참고치다 —
 *       I1 판정의 정본은 실기 스팟체크(05-perf §1 기준 머신)이고, 여기서는 회귀 추적이 목적.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)); // packages/ios/tools
const repoRoot = resolve(here, "..", "..", "..");

const CLT_SWIFT = "/Library/Developer/CommandLineTools/usr/bin/swift";
const SIM_PLATFORM =
  "/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer";
const SIM_SDK = join(SIM_PLATFORM, "SDKs", "iPhoneSimulator.sdk");
const SIM_FRAMEWORKS = join(SIM_PLATFORM, "Library", "Frameworks");
const SIM_USR_LIB = join(SIM_PLATFORM, "usr", "lib");
const XCTEST_AGENT = join(SIM_PLATFORM, "Library", "Xcode", "Agents", "xctest");

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const i = args.indexOf(name);
  return i > -1 && args[i + 1] ? args[i + 1] : fallback;
};
const scratch = resolve(argValue("--scratch-path", join(repoRoot, ".build")));
const skipBuild = args.includes("--skip-build");

// ① 빌드 — DESIGN §3 공통 커맨드 + 테스트 타겟 컴파일 옵션(XCTest 프레임워크 경로)
if (!skipBuild) {
  const buildArgs = [
    "build",
    "--triple",
    "arm64-apple-ios16.0-simulator",
    "--sdk",
    SIM_SDK,
    "--scratch-path",
    scratch,
    "--build-tests",
    "-Xswiftc",
    "-F",
    "-Xswiftc",
    SIM_FRAMEWORKS,
    "-Xswiftc",
    "-I",
    "-Xswiftc",
    SIM_USR_LIB,
    "-Xlinker",
    "-F",
    "-Xlinker",
    SIM_FRAMEWORKS,
    "-Xlinker",
    "-L",
    "-Xlinker",
    SIM_USR_LIB,
  ];
  console.log(`[bench] 빌드: swift ${buildArgs.join(" ")}`);
  const build = spawnSync(CLT_SWIFT, buildArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (build.status !== 0) {
    console.error(build.stdout ?? "");
    console.error(build.stderr ?? "");
    console.error(`[bench] FAIL: 빌드 실패 (exit ${build.status})`);
    process.exit(build.status ?? 1);
  }
  console.log("[bench] 빌드 완료");
}

// ② 실행 — 시뮬레이터 프로세스는 호스트 FS를 그대로 보므로 플랫폼 경로를 SIMCTL_CHILD_*로 주입
const debugDir = join(scratch, "arm64-apple-ios-simulator", "debug");
const bundle = join(debugDir, "JunDSPackageTests.xctest");
if (!existsSync(bundle)) {
  console.error(`[bench] FAIL: 테스트 번들 없음 — ${bundle}`);
  console.error("[bench] --build-tests 빌드가 선행돼야 한다 (--skip-build를 뺐는지 확인)");
  process.exit(1);
}

console.log(`[bench] 실행: simctl spawn booted xctest ${bundle}`);
const run = spawnSync("xcrun", ["simctl", "spawn", "booted", XCTEST_AGENT, bundle], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  env: {
    ...process.env,
    SIMCTL_CHILD_DYLD_FRAMEWORK_PATH: `${SIM_FRAMEWORKS}:${debugDir}`,
    SIMCTL_CHILD_DYLD_LIBRARY_PATH: `${SIM_USR_LIB}:${debugDir}`,
  },
});
const output = `${run.stdout ?? ""}\n${run.stderr ?? ""}`;
if (run.error) {
  console.error(
    `[bench] FAIL: xctest 실행 불가 — ${run.error.message} (시뮬레이터 부팅 여부 확인: xcrun simctl boot)`,
  );
  process.exit(1);
}

// ③ measured 라인 파싱 — JdBench 클래스만 채택 (다른 테스트의 measure는 벤치 아님)
const MEASURED = /Test Case '-\[(\S+) (\w+)\]' measured \[Time, seconds\] average: ([0-9.]+)/g;
const results = {};
let matched = 0;
for (const m of output.matchAll(MEASURED)) {
  const className = m[1].split(".").pop(); // "JunDSCoreTests.JdBenchCoreTests" → "JdBenchCoreTests"
  if (!className.startsWith("JdBench")) continue;
  results[`${className}.${m[2]}`] = { avgSeconds: Number(m[3]) };
  matched += 1;
}
if (matched === 0) {
  console.error(output.split("\n").slice(-40).join("\n"));
  console.error("[bench] FAIL: JdBench measured 라인 0건 — 테스트 크래시나 필터 불일치를 의심하라");
  process.exit(1);
}

// ④ 기록 — 기기/OS는 booted 목록에서 파싱(실패 시 unknown), 시뮬레이터 참고치 라벨 고정
const meta = {
  device: "unknown",
  os: "unknown",
  simulator: true,
  toolchain: "CLT Swift 6.2.3",
  label: "시뮬레이터 참고치",
};
const list = spawnSync("xcrun", ["simctl", "list", "devices", "booted"], { encoding: "utf8" });
if (list.status === 0 && list.stdout) {
  let currentOS = null;
  for (const line of list.stdout.split("\n")) {
    const section = line.match(/^-- (.+) --/);
    if (section) currentOS = section[1];
    const booted = line.match(/^\s+(.+?) \([0-9A-F-]+\) \(Booted\)/);
    if (booted && currentOS) {
      meta.device = booted[1];
      meta.os = currentOS;
      break;
    }
  }
}
const swiftVersion = spawnSync(CLT_SWIFT, ["--version"], { encoding: "utf8" });
const versionMatch = (swiftVersion.stdout ?? "").match(/Apple Swift version ([0-9.]+)/);
if (versionMatch) meta.toolchain = `CLT Swift ${versionMatch[1]}`;

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const outDir = join(repoRoot, "benchmarks", "results", "ios");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `${stamp}-sim.json`);
writeFileSync(outFile, `${JSON.stringify({ meta, results }, null, 2)}\n`);

console.log(`[bench] ${meta.device} · ${meta.os} · ${meta.toolchain}`);
for (const [key, { avgSeconds }] of Object.entries(results)) {
  console.log(`[bench]   ${key}: avg ${avgSeconds}s`);
}
console.log(`[bench] 기록: ${outFile} (${matched}건)`);

// 스위트 전체가 도는 구조라 벤치 외 테스트 실패도 여기서 드러난다 — 숨기지 않고 실패로 전파
if (run.status !== 0) {
  console.error(
    `[bench] WARN: xctest exit ${run.status} — 벤치 외 테스트 실패 포함 가능. 위 기록은 참고용.`,
  );
  process.exit(run.status ?? 1);
}
