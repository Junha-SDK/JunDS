#!/usr/bin/env node
/**
 * codemod-token-vocabulary — DEC-045 어휘 이동 자동 변환
 *
 * ## 무엇을 옮기나
 * 스타일 프롭의 `radius`·`fontSize`가 v2 리터럴 척도에서 tokens/*.json 척도로 옮겨가면서
 * **이름은 같은데 값이 한 칸 달라졌다.** 손으로 고치면 반드시 빠뜨리고, 빠뜨린 자리는
 * 화면이 조금 어긋난 채로 남아 나중에 원인을 못 찾는다.
 *
 *   radius   : xs→sm  sm→md  md→lg  lg→xl  xl→2xl        (2xl·3xl은 대체 없음)
 *   fontSize : sm→md  md→lg  lg→xl  xl→2xl  2xl→3xl  3xl→4xl  4xl→5xl
 *              (xs는 양쪽 값이 같아 그대로, 2xs·6xl은 대체 없음)
 *   zIndex   : docked→dropdown  banner→header            (그 외는 이름 유지, 값만 변경)
 *
 * ## 왜 "값이 같은 이름"으로 옮기나
 * 목표는 **화면을 그대로 유지**하는 것이다. 이름을 그대로 두면 값이 바뀌어 화면이 변하고,
 * 값을 유지하려면 이름을 옮겨야 한다. 마이그레이션에서 원하는 쪽은 후자다 —
 * 어휘 통합은 구조 정리이지 디자인 변경이 아니다.
 *
 * ## 대체가 없는 이름
 * `radius="2xl"`(20px)·`radius="3xl"`(24px)·`fontSize="2xs"`·`fontSize="6xl"`은 토큰 척도에
 * 없는 값이다. 임의로 가까운 값에 붙이면 조용히 디자인이 바뀌므로 **건드리지 않고 보고만
 * 한다.** 사람이 정해야 하는 자리다.
 *
 * ## ⚠️ 한 번만 돌려라 (멱등이 아니다)
 * 이동 후의 이름(`lg`)은 그 자체로 유효한 v2 이름이라, 두 번째 실행은 그것을 또 옮긴다.
 * 값만 보고 "이미 옮겼는지"를 알 방법이 없다 — 이름 이동형 codemod의 성질이다.
 * 그래서 --write는 커밋되지 않은 변경이 있으면 멈춘다: 되돌릴 수 있는 상태에서만 돌린다.
 *
 * 실행:
 *   node scripts/codemod-token-vocabulary.mjs <경로...>            # 미리보기 (기본)
 *   node scripts/codemod-token-vocabulary.mjs --write <경로...>    # 실제 수정
 *   node scripts/codemod-token-vocabulary.mjs --write --force ...  # 더러운 트리에서도 강행
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, extname } from "node:path";
import { pathToFileURL } from "node:url";

/** v2 이름 → 같은 **값**을 갖는 토큰 이름. null = 토큰 척도에 없는 값(사람이 판단) */
export const RENAMES = {
  radius: { xs: "sm", sm: "md", md: "lg", lg: "xl", xl: "2xl", "2xl": null, "3xl": null },
  fontSize: {
    sm: "md",
    md: "lg",
    lg: "xl",
    xl: "2xl",
    "2xl": "3xl",
    "3xl": "4xl",
    "4xl": "5xl",
    "2xs": null,
    "6xl": null, // xs는 양쪽 0.75rem으로 같아 대상이 아니다
  },
  zIndex: { docked: "dropdown", banner: "header" },
};

/** 스타일 프롭이 나타나는 두 표기 — HTML attribute(kebab)와 JS 프로퍼티(camel) */
const ATTR_NAME = { radius: "radius", fontSize: "font-size", zIndex: "z-index" };

const EXTENSIONS = new Set([".html", ".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte", ".md"]);

function walk(target, out = []) {
  const stat = statSync(target);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(target)) {
      if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
      walk(join(target, entry), out);
    }
  } else if (EXTENSIONS.has(extname(target))) {
    out.push(target);
  }
  return out;
}

/**
 * 한 파일의 변환 결과와 보고. 값이 문자열 리터럴인 경우만 바꾼다 —
 * 변수(`radius={size}`)는 정적으로 알 수 없으므로 건드리지 않고 보고한다.
 */
export function transform(source) {
  const changes = [];
  const manual = [];
  let output = source;

  for (const [prop, table] of Object.entries(RENAMES)) {
    const attr = ATTR_NAME[prop];
    // ⚠️ 이름을 하나씩 순차 치환하면 **연쇄된다**: md→lg로 바꾼 값이 다음 규칙(lg→xl)에
    // 다시 걸려 척도 끝까지 밀린다(실측: radius="md"가 "2xl"이 됐다).
    // 그래서 전체 이름을 한 번에 매칭하고 **한 번만** 치환한다.
    // 긴 이름을 먼저 둬 2xl이 xl로 잘리지 않게 한다.
    const names = Object.keys(table).sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${attr}|${prop})=(["'])(${names.join("|")})\\2`, "g");
    output = output.replace(pattern, (match, lead, quote, from) => {
      const to = table[from];
      if (to === null || to === undefined) {
        manual.push({ prop, from, match });
        return match; // 임의 대체 금지 — 조용히 디자인이 바뀐다
      }
      changes.push({ prop, from, to });
      return `${lead}=${quote}${to}${quote}`;
    });
  }

  // 동적 값 — 사람이 봐야 한다
  for (const prop of Object.keys(RENAMES)) {
    const attr = ATTR_NAME[prop];
    const dynamic = new RegExp(`\\b(?:${attr}|${prop})=\\{`, "g");
    for (const match of source.matchAll(dynamic)) {
      manual.push({ prop, from: "(동적 값)", match: match[0] });
    }
  }

  return { output, changes, manual };
}

/* ─── main ─── */

// import 되었을 때(테스트) 실행되지 않도록 — 위 export만 쓰게 한다
const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (!isMain) {
  // 모듈로 불린 경우 여기서 끝. 아래는 CLI 경로다.
} else {
  runCli();
}

function runCli() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const force = args.includes("--force");
  const targets = args.filter((a) => a !== "--write" && a !== "--force");

  if (targets.length === 0) {
    console.error(
      "사용법: node scripts/codemod-token-vocabulary.mjs [--write] [--force] <경로...>",
    );
    process.exit(2);
  }

  // 두 번 돌리면 이름이 또 밀린다(비멱등). 되돌릴 수 있는 상태가 아니면 아예 시작하지 않는다 —
  // "실수로 두 번 돌렸는데 git으로 못 되돌린다"가 이 도구의 유일한 치명적 실패다.
  if (write && !force) {
    try {
      const dirty = execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim();
      if (dirty) {
        console.error(
          "커밋되지 않은 변경이 있다. 이 codemod는 멱등이 아니라서 두 번 돌리면 이름이 또 밀리고,\n" +
            "깨끗한 트리가 아니면 되돌릴 수가 없다. 커밋하고 다시 실행하라 (강행: --force).",
        );
        process.exit(1);
      }
    } catch (error) {
      if (error.status === 1 || error.code === "ENOENT") {
        console.error("git 저장소가 아니거나 git을 찾을 수 없다 — --force로 강행할 수 있다.");
        process.exit(1);
      }
      throw error;
    }
  }

  let touched = 0;
  let totalChanges = 0;
  const manualReports = [];

  for (const target of targets) {
    for (const file of walk(target)) {
      const source = readFileSync(file, "utf8");
      const { output, changes, manual } = transform(source);
      if (manual.length) manualReports.push({ file, manual });
      if (!changes.length) continue;

      touched++;
      totalChanges += changes.length;
      const summary = changes
        .map((c) => `${c.prop} ${c.from}→${c.to}`)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(", ");
      console.log(`${write ? "수정" : "변경 예정"}: ${file} — ${summary}`);
      if (write) writeFileSync(file, output);
    }
  }

  console.log(`\n${write ? "적용" : "미리보기"} — 파일 ${touched}개 · 치환 ${totalChanges}건`);

  if (manualReports.length) {
    console.log("\n사람이 정해야 하는 자리 (자동 변환하지 않았다):");
    for (const { file, manual } of manualReports) {
      for (const item of manual) {
        const reason =
          item.from === "(동적 값)"
            ? "값이 변수라 정적으로 알 수 없다"
            : "토큰 척도에 같은 값이 없다 — 가까운 값으로 옮기면 디자인이 바뀐다";
        console.log(`  ${file}: ${item.match} — ${reason}`);
      }
    }
  }

  if (!write && totalChanges > 0) {
    console.log("\n적용하려면 --write 를 붙여 다시 실행하라.");
  }
}
