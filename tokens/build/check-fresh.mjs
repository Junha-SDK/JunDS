#!/usr/bin/env node
/**
 * tokens/build/check-fresh.mjs — 산출물 신선도 검사 (01-repo-structure §9 tokens-fresh 게이트)
 * 재생성 후 산출물 전량의 git diff가 비어 있어야 한다. diff 발생 → exit 1.
 */
import { execFileSync } from "node:child_process";
import { relative } from "node:path";
import { generate, REPO_ROOT, OUT_CSS, OUT_SWIFT, OUT_TS, OUT_WEB_NUMBERS } from "./generate.mjs";

await generate();

const outputs = [OUT_CSS, OUT_SWIFT, OUT_TS, OUT_WEB_NUMBERS].map((p) => relative(REPO_ROOT, p));
try {
  execFileSync("git", ["-C", REPO_ROOT, "diff", "--quiet", "--", ...outputs]);
  // 미추적(신규 미커밋) 산출물도 stale로 간주
  const untracked = execFileSync(
    "git",
    ["-C", REPO_ROOT, "ls-files", "--others", "--exclude-standard", "--", ...outputs],
    { encoding: "utf8" },
  ).trim();
  if (untracked) {
    console.error(`[tokens-fresh] 미커밋 산출물 존재:\n${untracked}`);
    process.exit(1);
  }
  console.log("[tokens-fresh] OK — 재생성 후 diff 없음");
} catch (e) {
  if (e.status === 1) {
    console.error(
      "[tokens-fresh] 실패 — 산출물이 tokens/*.json과 어긋남. `npm run tokens:gen` 후 커밋할 것.",
    );
    execFileSync("git", ["-C", REPO_ROOT, "diff", "--stat", "--", ...outputs], {
      stdio: "inherit",
    });
    process.exit(1);
  }
  throw e;
}
