#!/usr/bin/env node
/**
 * format — Swift는 swift-format, 나머지는 Prettier. 기본은 **변경된 파일만**.
 *
 * ## 왜 전체가 아니라 변경분인가
 * 이 저장소에 포매터를 처음 들이면 Swift 4,589건 · JS/TS 597파일이 한 번에 바뀐다.
 * 그 diff를 기능 변경과 같은 커밋에 섞으면 리뷰가 불가능해지고, 리뷰가 불가능한 diff는
 * 결국 아무도 안 본다 — 포매터를 넣은 목적(사람이 스타일을 안 보게 하는 것)과 반대다.
 *
 * 그래서 기본 동작은 "이 브랜치가 건드린 파일"만이다. 트리는 파일 단위로 수렴하고,
 * 전면 적용은 하고 싶을 때 `--all`로 **독립 커밋** 하나를 만들면 된다.
 *
 * ## 끈 규칙 (.swift-format은 주석을 못 달아 여기 적는다)
 * - `OnlyOneTrailingClosureArgument` — `VStack(spacing:) { … }` 같은 관용적 SwiftUI 호출을
 *   오탐한다(실측: demo/ModalDemo). 라벨 인자는 클로저가 아닌데 함께 잡힌다.
 * - `AllPublicDeclarationsHaveDocumentation` — 문서화 여부는 사람이 판단할 몫이고,
 *   게이트로 강제하면 의미 없는 한 줄 주석만 늘어난다.
 *
 * ## 생성물은 건드리지 않는다
 * tokens.css·*.generated.ts·custom-elements.json 등은 생성기가 형식을 소유한다.
 * 포매터가 만지면 tokens-fresh·gen-* 신선도 게이트와 매 커밋 싸운다 (.prettierignore).
 *
 * 실행:
 *   node scripts/format.mjs                # 변경분 포맷
 *   node scripts/format.mjs --check        # 변경분 검사만 (CI 게이트)
 *   node scripts/format.mjs --all          # 전체 포맷 (전면 적용용 — 독립 커밋 권장)
 *   node scripts/format.mjs --all --check  # 전체 검사
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SWIFT_CONFIG = join(REPO_ROOT, ".swift-format");
const BASE_REF = process.env.JUNDS_FORMAT_BASE ?? "main";

const args = process.argv.slice(2);
const check = args.includes("--check");
const all = args.includes("--all");

const PRETTIER_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css", ".md"]);

/**
 * 생성된 Swift — swift-format은 .prettierignore를 모르므로 여기서 뺀다.
 * 포맷하면 생성기가 다시 만드는 순간 형식이 어긋나 tokens-fresh 게이트가 영구히 깨진다.
 * 생성물의 형식은 생성기가 소유한다.
 */
const SWIFT_IGNORE = [/\/Generated\//];

const git = (...a) => execFileSync("git", a, { cwd: REPO_ROOT, encoding: "utf8" });

/** 이 브랜치가 건드린 파일 — 커밋된 것(base 대비) + 아직 커밋 안 한 것 */
function changedFiles() {
  const sets = [];
  try {
    const mergeBase = git("merge-base", BASE_REF, "HEAD").trim();
    sets.push(git("diff", "--name-only", "--diff-filter=ACMR", mergeBase, "HEAD"));
  } catch {
    // base 브랜치가 없는 클론(얕은 체크아웃 등) — 워킹 트리 변경만 본다
  }
  sets.push(git("diff", "--name-only", "--diff-filter=ACMR", "HEAD"));
  sets.push(git("ls-files", "--others", "--exclude-standard"));
  return [
    ...new Set(
      sets
        .join("\n")
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
    ),
  ];
}

function allFiles() {
  return git("ls-files")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
}

function run(command, commandArgs, { allowFailure = false } = {}) {
  try {
    execFileSync(command, commandArgs, { cwd: REPO_ROOT, stdio: "inherit" });
    return true;
  } catch (error) {
    if (allowFailure) return false;
    throw error;
  }
}

const files = (all ? allFiles() : changedFiles()).filter((f) => existsSync(join(REPO_ROOT, f)));
const swift = files.filter(
  (f) => extname(f) === ".swift" && !SWIFT_IGNORE.some((pattern) => pattern.test(`/${f}`)),
);
const web = files.filter((f) => PRETTIER_EXTENSIONS.has(extname(f)));

if (swift.length === 0 && web.length === 0) {
  console.log(`[format] 대상 없음 (${all ? "전체" : `${BASE_REF} 대비 변경분`})`);
  process.exit(0);
}

console.log(
  `[format] ${check ? "검사" : "적용"} — swift ${swift.length}개 · web ${web.length}개` +
    ` (${all ? "전체" : `${BASE_REF} 대비 변경분`})`,
);

let ok = true;

if (swift.length) {
  // lint는 경고를 내고 종료 코드 0을 주는 경우가 있어 --strict로 실패를 강제한다
  const swiftArgs = check
    ? ["format", "lint", "--strict", "--configuration", SWIFT_CONFIG, ...swift]
    : ["format", "--in-place", "--configuration", SWIFT_CONFIG, ...swift];
  ok = run("swift", swiftArgs, { allowFailure: true }) && ok;
}

if (web.length) {
  // prettier는 .prettierignore를 알아서 존중한다 — 생성물이 여기서 걸러진다
  const webArgs = [check ? "--check" : "--write", ...web];
  ok = run("npx", ["prettier", ...webArgs], { allowFailure: true }) && ok;
}

if (!ok) {
  console.error(
    check
      ? "\n[format] 형식이 맞지 않는 파일이 있다 — `npm run format` 후 커밋할 것."
      : "\n[format] 일부 파일을 처리하지 못했다.",
  );
  process.exit(1);
}

console.log(`[format] OK`);
