#!/usr/bin/env node
/**
 * junds:add — 컴포넌트 추가 안내. 실 scaffold 작업은 `npm run scaffold`에
 * 위임하되, 이 명령은 사용자에게 (1) 종류 결정 가이드, (2) 추천 스캐폴드
 * 명령, (3) 추가 후 다음 단계(레시피·테스트·쇼케이스 보강)를 한 번에 안내.
 *
 * 사용:
 *   npm run add <Name>
 *   npm run add <Name> --kind composite
 *   npm run add <Name> --recipe          // 추천 레시피만 출력
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const kindFlag = args.indexOf("--kind");
const explicitKind = kindFlag >= 0 ? args[kindFlag + 1] : null;
const recipeOnly = args.includes("--recipe");

if (!name) {
  console.log(`junds:add — 컴포넌트 추가 안내

사용법:
  npm run add <Name>                     # 자동 분류 + 스캐폴드 명령 안내
  npm run add <Name> --kind <kind>       # primitive | composite | pattern
  npm run add <Name> --recipe            # 추천 레시피만 출력

예:
  npm run add ProductGallery
  npm run add UseDebounce --kind hook
`);
  process.exit(0);
}

/** 이름 패턴으로 kind 자동 추론 */
function inferKind(n) {
  if (n.startsWith("use") && /^use[A-Z]/.test(n)) return "hook";
  // 패턴 키워드
  if (/Page$|Layout$|Reader$|Inbox$|Editor$|Dashboard$|Builder$|Wizard$|Center$|Feed$|Album$|Diagram$/.test(n)) return "pattern";
  // primitive 키워드 (단일 element 표시)
  if (/Button$|Icon$|Badge$|Tag$|Chip$|Mark$|Dot$|Indicator$|Spinner$/.test(n)) return "primitive";
  // 그 외 composite 기본
  return "composite";
}

const kind = explicitKind ?? inferKind(name);

console.log(`\n\x1b[1m${name}\x1b[0m → kind: \x1b[36m${kind}\x1b[0m`);

if (recipeOnly) {
  console.log(`\n추천 레시피 후보:
  - 가격 표시:    .ai/recipes/pricing-page-full.md
  - 카드 그리드:   .ai/recipes/photo-album-page.md
  - 폼:          .ai/recipes/form-validation.md
  - 채팅 UI:      .ai/recipes/chat-app.md
  - 캘린더:       .ai/recipes/calendar-page.md
`);
  process.exit(0);
}

console.log(`\n1) 스캐폴드:`);
console.log(`   \x1b[33mnpm run scaffold ${kind} ${name}\x1b[0m`);
console.log(`\n2) 본문 구현 후 메타 갱신:`);
console.log(`   \x1b[33mnpm run map && npm run extract-props\x1b[0m`);
console.log(`\n3) 검증:`);
console.log(`   \x1b[33mnpm run typecheck && npm test\x1b[0m`);
console.log(`\n4) 강건성:`);
console.log(`   \x1b[33mnpm run audit:a11y:strict\x1b[0m`);
console.log(`   \x1b[33mnpm run bundle:check\x1b[0m`);

if (kind === "primitive" || kind === "composite" || kind === "pattern") {
  const slug = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const showcasePath = path.join(ROOT, "app", "design-system", `${kind}s`, slug, "page.tsx");
  console.log(`\n5) 쇼케이스 페이지에 fixture 채우기:`);
  console.log(`   ${path.relative(ROOT, showcasePath)}`);
}

console.log(`\n6) (선택) 새 도메인이라면 requirements/<slug>.md 추가`);
console.log();
