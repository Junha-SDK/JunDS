/**
 * 데이터 로더 — 해석 우선순위(08-mcp §3.3):
 *   1. $JUNDS_REPO_ROOT (env 명시 — 디버그·CI)
 *   2. 서버 파일 위치 기준 상향 탐색 (docs-spec/registry/ledger.json 존재 확인)
 *   3. 패키지 동봉 data/snapshot.json (npx 소비자 — prepublishOnly 생성물)
 *
 * 탐색 기점은 cwd가 아니라 **서버 파일 위치**다 — cwd 기준이면 소비자 앱 루트를
 * JunDS 레포로 오인한다(v2 mcp/server.mjs의 import.meta.url 방식 계승).
 *
 * 라이브 모드는 토큰 생성기(tokens/build/generate.mjs)의 export 함수를 재사용한다
 * (main 가드 확인 — import 부작용 없음). 이름 규칙 재저작 금지: cssVarName·swiftKey·
 * collectLeaves·aliasToVar가 정본이고, 여기서 보태는 것은 Swift enum 그룹 매핑뿐이다
 * (buildSwift 내부 구조라 미export — __tests__/live-data가 생성물 대조로 드리프트 차단).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SNAPSHOT = join(HERE, "..", "data", "snapshot.json");
const LEDGER_REL = join("docs-spec", "registry", "ledger.json");

/**
 * 조회 가능한 토큰 그룹 — 생성기 CSS_CATEGORIES(미export) 11종과 동일 + 데이터 전용
 * theme-presets(방출 없음 — cssVar/swift는 null). 목록 드리프트는 토큰 패리티
 * 테스트(tokens.css 변수 전수 대조)가 잡는다.
 */
export const TOKEN_GROUPS = [
  "color", "space", "radius", "type", "motion", "shadow",
  "zindex", "opacity", "border", "breakpoint", "gradient", "theme-presets",
];

/** env 우선, 아니면 startDir부터 상향 탐색. 실패 시 null. */
export function findRepoRoot({ env = process.env, startDir = HERE } = {}) {
  if (env.JUNDS_REPO_ROOT) {
    const root = env.JUNDS_REPO_ROOT;
    if (existsSync(join(root, LEDGER_REL))) return root;
    throw new Error(`JUNDS_REPO_ROOT=${root} — ${LEDGER_REL} 없음`);
  }
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(dir, LEDGER_REL))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// ─── Swift 접근자 파생 ──────────────────────────────────────────────────────

/** 생성기 buildSwift의 JdToken enum 구조 미러 (JdToken.swift 실측·02-tokens §4.2) */
const SWIFT_ENUM = {
  color: "Color", space: "Space", radius: "Radius", shadow: "Shadow",
  zindex: "Z", opacity: "Opacity", border: "Border", breakpoint: "Breakpoint",
};
const SWIFT_TYPE_SUB = {
  fontSize: "FontSize", fontWeight: "FontWeight",
  lineHeight: "LineHeight", letterSpacing: "LetterSpacing",
};
const SWIFT_MOTION_SUB = { duration: "Duration", easing: "Easing" };
/** 생성기 SWIFT_KEYWORDS 미러 */
const SWIFT_KEYWORDS = new Set(["default", "none", "in", "for", "class", "enum", "import"]);

/** `JdToken.Color.statusTodoBg` 류 접근자 문자열. 방출 대상 아니면 null. */
function swiftAccessor(category, path, swiftKeyFn) {
  let group = null;
  let segs = path;
  if (category === "type") {
    group = SWIFT_TYPE_SUB[path[0]] ?? null; // fontFamily → 웹 전용, 미방출
    segs = path.slice(1);
  } else if (category === "motion") {
    group = SWIFT_MOTION_SUB[path[0]] ?? null;
    segs = path.slice(1);
  } else {
    group = SWIFT_ENUM[category] ?? null; // gradient → 웹 전용, 미방출
  }
  if (!group || segs.length === 0) return null;
  const keys = segs.map((s) => swiftKeyFn(s, category));
  let name = keys
    .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
    .join("");
  if (SWIFT_KEYWORDS.has(name)) name = "`" + name + "`";
  return `JdToken.${group}.${name}`;
}

// ─── 로더 ──────────────────────────────────────────────────────────────────

/**
 * docs-content 정본은 레포 루트 `docs-content/<kebab>.json` 445건(콘텐츠 트랙
 * DEC-021 — 스키마·검증은 docs-content/build-index.mjs가 강제). 조인 키는
 * (ledgerId, category) — ledger 중복 id(AreaChart 2건)가 있어 id 단독 키 불가.
 * CE 태그는 파일에 없으므로 web 스니펫의 첫 <jd-*>에서 파생한다(스니펫 태그는
 * 검증기가 packages/web 실물과 대조하므로 근거로 충분).
 */
const TAG_RE = /<(jd-[a-z0-9-]+)/;
export const contentKey = (ledgerId, category) => `${ledgerId}::${category}`;

/** 레포 체크아웃에서 4계열을 직독 — 항상 최신(stale 함정은 스냅샷 경로로 한정). */
export async function loadLive(repoRoot) {
  const ledger = JSON.parse(readFileSync(join(repoRoot, LEDGER_REL), "utf8"));

  const contentDir = join(repoRoot, "docs-content");
  const content = {};
  if (existsSync(contentDir)) {
    for (const file of readdirSync(contentDir).sort()) {
      if (!file.endsWith(".json") || file === "index.json") continue;
      const json = JSON.parse(readFileSync(join(contentDir, file), "utf8"));
      const tag = json.snippets?.web?.code?.match(TAG_RE)?.[1] ?? null;
      content[contentKey(json.ledgerId, json.category)] = { ...json, tag };
    }
  }

  const gen = await import(
    pathToFileURL(join(repoRoot, "tokens", "build", "generate.mjs")).href
  );
  const raw = gen.loadTokens();
  const tokens = [];
  for (const group of TOKEN_GROUPS) {
    if (group === "theme-presets") {
      const presets = JSON.parse(
        readFileSync(join(repoRoot, "tokens", "theme-presets.json"), "utf8"),
      );
      for (const [name, preset] of Object.entries(presets)) {
        if (name.startsWith("$")) continue;
        for (const [key, value] of Object.entries(preset)) {
          if (key.startsWith("$")) continue;
          tokens.push({
            group, path: `theme-presets.${name}.${key}`,
            cssVar: null, value: String(value), swift: null,
          });
        }
      }
      continue;
    }
    for (const leaf of gen.collectLeaves(group, raw[group])) {
      const toVal = (v) => gen.aliasToVar(raw, v);
      tokens.push({
        group,
        path: `${group}.${leaf.path.join(".")}`,
        cssVar: gen.cssVarName(group, leaf.path),
        value: leaf.isMode
          ? { light: toVal(leaf.light), dark: toVal(leaf.dark) }
          : toVal(leaf.light),
        swift: swiftAccessor(group, leaf.path, gen.swiftKey),
      });
    }
  }

  const sizeBaseline = JSON.parse(
    readFileSync(join(repoRoot, "docs-spec", "registry", "size-baseline.json"), "utf8"),
  );

  return {
    mode: "live",
    generatedAt: ledger.generatedAt ?? null,
    ledger, content, tokens, sizeBaseline,
  };
}

/** 동봉 스냅샷 로드 (npx 소비자 경로). */
export function loadSnapshot(snapshotPath = DEFAULT_SNAPSHOT) {
  const snap = JSON.parse(readFileSync(snapshotPath, "utf8"));
  return { ...snap, mode: "snapshot" };
}

/** §3.3 우선순위 그대로. 도구 호출마다 부르므로 라이브 모드는 항상 최신 파일을 읽는다. */
export async function loadData({
  env = process.env,
  forceSnapshot = false,
  snapshotPath = DEFAULT_SNAPSHOT,
} = {}) {
  if (!forceSnapshot) {
    const root = findRepoRoot({ env });
    if (root) return loadLive(root);
  }
  if (existsSync(snapshotPath)) return loadSnapshot(snapshotPath);
  throw new Error(
    "JunDS 데이터를 찾을 수 없음 — 시도: $JUNDS_REPO_ROOT, " +
      `${HERE} 기준 상향 탐색(${LEDGER_REL}), 스냅샷 ${snapshotPath}. ` +
      "레포 체크아웃 안에서 실행하거나 JUNDS_REPO_ROOT를 지정하거나, " +
      "퍼블리시된 패키지(스냅샷 동봉)를 사용하라.",
  );
}
