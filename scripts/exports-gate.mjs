/**
 * exports ↔ 배포 tarball 정합 게이트.
 *
 * 워크트리에 파일이 있는 것과 npm 에 실려 나가는 것은 다르다. 이 게이트는
 * `npm pack --dry-run` 이 실제로 담는 파일 목록만을 진실로 보고,
 * package.json 이 광고하는 진입점 전수가 그 안에 있는지 확인한다.
 *
 * 과거 실측 결함 2건을 재발 방지 대상으로 고정한다 (release/CHECKLIST.md §0):
 *   - exports 에 `types` 조건이 없어 소비 프로젝트 tsc 가 TS7016 (@junds/web)
 *   - `files` 필드 부재/누락으로 광고한 경로가 tarball 에 부재 (@junds/finance-data)
 *
 * 사용:
 *   node scripts/exports-gate.mjs            # 빌드 후 검사 — CI 기본
 *   node scripts/exports-gate.mjs --no-build # 현재 dist 로 빠르게 (로컬 반복용)
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readPkg = (dir) => JSON.parse(readFileSync(join(root, dir, "package.json"), "utf8"));
const noBuild = process.argv.includes("--no-build");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

/**
 * 배포 대상 v3 워크스페이스 — **의존 순서**로 나열한다.
 * react 빌드는 web 의 dist/types 를 읽으므로 web 이 먼저 완성돼 있어야 한다.
 * mcp 는 exports 없이 bin 으로 소비되고 빌드가 없다.
 */
const PACKAGES = ["packages/web", "packages/react", "packages/finance-data", "packages/mcp"];

/**
 * 빌드와 패킹을 분리한다.
 *
 * `npm pack` 은 prepack 을 태우므로 한 번의 호출이 "빌드 + 패킹"을 겹쳐 수행한다.
 * 그 상태로 패키지를 순회하면 web 의 build.mjs 가 dist 를 비우는 순간과 react 가
 * web 의 선언을 읽는 순간이 겹칠 수 있다 — build.mjs 주석이 경고하는 TS7016 간헐
 * 실패와 같은 창이다. 실제로 연속 실행 중 1회 재현 불가한 실패를 관측했다.
 * 게이트가 가끔 빨개지면 사람은 게이트를 믿지 않게 되므로, 먼저 순서대로 전부
 * 빌드하고 그 다음 `--ignore-scripts` 로 패킹만 한다. 검사 대상은 동일하다 —
 * publish 시 prepack 이 돌리는 것과 같은 build 산출물이다.
 */
function buildAll() {
  for (const dir of PACKAGES) {
    const pkg = readPkg(dir);
    if (!pkg.scripts?.build) continue;
    console.log(`· build ${pkg.name}`);
    const res = spawnSync(npm, ["run", "build", "-w", pkg.name], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    if (res.status !== 0) throw new Error(`빌드 실패 (${pkg.name})\n${res.stdout}\n${res.stderr}`);
  }
}

/** tarball 에 실제로 담기는 파일 목록 (패키지 루트 기준 상대경로). */
function packedFiles(dir) {
  const res = spawnSync(npm, ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: join(root, dir),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (res.status !== 0) throw new Error(`npm pack 실패 (${dir})\n${res.stderr}`);
  // npm 은 stdout 앞에 로그를 섞기도 한다 — 첫 JSON 배열부터 파싱.
  const json = res.stdout.slice(res.stdout.indexOf("["));
  return new Set(JSON.parse(json)[0].files.map((f) => f.path));
}

/** `dist/css/*` 같은 와일드카드 1개를 파일 목록에 대조. */
function matchesWildcard(files, target) {
  const [head, tail] = target.split("*");
  for (const f of files) if (f.startsWith(head) && f.endsWith(tail)) return true;
  return false;
}

const problems = [];

if (!noBuild) buildAll();

for (const dir of PACKAGES) {
  const pkg = readPkg(dir);
  const files = packedFiles(dir);
  const fail = (msg) => problems.push(`${pkg.name}: ${msg}`);
  let checked = 0;

  /** 조건부 exports 트리를 훑어 말단 문자열(=파일 경로)만 검사. */
  const walk = (node, subpath, condPath) => {
    if (typeof node === "string") {
      checked++;
      const target = node.replace(/^\.\//, "");
      const ok = target.includes("*")
        ? matchesWildcard(files, target)
        : files.has(target);
      if (!ok) fail(`exports["${subpath}"]${condPath} → ${node} 이(가) tarball 에 없음`);
      return;
    }
    if (node && typeof node === "object")
      for (const [cond, v] of Object.entries(node)) walk(v, subpath, `${condPath}.${cond}`);
  };

  for (const [subpath, node] of Object.entries(pkg.exports ?? {})) {
    walk(node, subpath, "");
    // CSS 등 자산이 아닌 코드 진입점은 types 조건이 있어야 소비 프로젝트 tsc 가 성립한다.
    const isAsset =
      typeof node === "string"
        ? /\.(css|json|svg|woff2?)$/.test(node) || node.endsWith("*")
        : false;
    if (typeof node === "object" && node !== null && !node.types)
      fail(`exports["${subpath}"] 에 types 조건 없음 — 소비 프로젝트에서 TS7016`);
    if (typeof node === "string" && !isAsset)
      fail(`exports["${subpath}"] 가 조건 없는 단일 경로 — types 조건 필요`);
  }

  for (const field of ["main", "module", "types", "style", "browser"]) {
    if (typeof pkg[field] !== "string") continue;
    checked++;
    const target = pkg[field].replace(/^\.\//, "");
    if (!files.has(target)) fail(`"${field}" → ${pkg[field]} 이(가) tarball 에 없음`);
  }

  for (const [name, rel] of Object.entries(pkg.bin ?? {})) {
    checked++;
    const target = rel.replace(/^\.\//, "");
    if (!files.has(target)) fail(`bin["${name}"] → ${rel} 이(가) tarball 에 없음`);
  }

  // 라이선스·설명 문서는 npm 이 자동 동봉하지만, 존재 자체는 확인한다.
  for (const doc of ["LICENSE", "README.md"])
    if (!files.has(doc)) fail(`${doc} 이(가) tarball 에 없음`);

  // 배포 의사 표시 — 스코프 패키지는 access:public 이 없으면 publish 가 402/403.
  if (!pkg.private && pkg.name.startsWith("@") && pkg.publishConfig?.access !== "public")
    fail(`publishConfig.access:"public" 부재 — 스코프 패키지 publish 가 거부됨`);

  const mark = problems.some((p) => p.startsWith(`${pkg.name}:`)) ? "✗" : "✓";
  console.log(
    `${mark} ${pkg.name.padEnd(22)} tarball ${String(files.size).padStart(5)}파일 · 진입점 ${String(checked).padStart(5)}개 검사${pkg.private ? " (private — publish 스킵 대상)" : ""}`,
  );
}

if (problems.length) {
  console.error(`\n[exports-gate] FAIL — ${problems.length}건`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`\n[exports-gate] PASS — 광고한 진입점 전수가 배포 tarball 에 실재`);
