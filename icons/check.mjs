#!/usr/bin/env node
// JunDS v3 아이콘 검증기 — 의존성 0.
// 검사: XML 정형성(자체 파서) · 루트 문법(24×24, stroke 1.5, round cap/join, fill none)
// · 허용 요소/속성 화이트리스트 · 좌표 대역 · 이름 규약 · 별칭표 무결성 · lucide 커버리지.
// 단독 실행: node icons/check.mjs  (오류 시 exit 1)
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

export const ICONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "svg");
export const ALIASES_PATH = join(dirname(fileURLToPath(import.meta.url)), "aliases.json");

// 루트 <svg>가 반드시 지녀야 하는 문법 속성 (이 외 속성 금지)
export const ROOT_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.5",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

// 자식 요소 화이트리스트와 요소별 허용 속성 — 기하 속성만. 색·굵기·변환 오버라이드 금지.
const CHILD_ATTRS = {
  path: ["d"],
  circle: ["cx", "cy", "r"],
  ellipse: ["cx", "cy", "rx", "ry"],
  rect: ["x", "y", "width", "height", "rx", "ry"],
  line: ["x1", "y1", "x2", "y2"],
  polyline: ["points"],
  polygon: ["points"],
};

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RESERVED = new Set(["index", "sprite", "aliases", "meta", "icons"]);

// v2 ds/finance/AppIcon.tsx가 실제 import하던 lucide 이름 전수(73) — 커버리지 게이트.
// AppIcon 마이그레이션 전까지 이 목록의 별칭·아이콘이 빠지면 빌드가 실패해야 한다.
export const REQUIRED_LUCIDE = [
  "Activity",
  "AlertTriangle",
  "ArrowDown",
  "ArrowLeft",
  "ArrowLeftRight",
  "ArrowRight",
  "ArrowUp",
  "Banknote",
  "BarChart3",
  "Bell",
  "Building2",
  "Calendar",
  "CalendarCheck",
  "Check",
  "ChevronDown",
  "ChevronLeft",
  "ChevronRight",
  "ChevronUp",
  "ChevronsUpDown",
  "Clock",
  "Columns2",
  "Command",
  "Crown",
  "Download",
  "Equal",
  "Eraser",
  "ExternalLink",
  "Eye",
  "EyeOff",
  "Flame",
  "Globe2",
  "Grid2x2",
  "Hammer",
  "Info",
  "LayoutDashboard",
  "LayoutGrid",
  "LineChart",
  "ListOrdered",
  "Lock",
  "Magnet",
  "Maximize",
  "Menu",
  "Minus",
  "Moon",
  "MousePointer",
  "Move",
  "Newspaper",
  "Pencil",
  "Percent",
  "PieChart",
  "Plane",
  "Plus",
  "Redo",
  "RefreshCw",
  "Rows2",
  "Ruler",
  "Search",
  "Settings",
  "Slash",
  "SlidersHorizontal",
  "Sparkles",
  "Square",
  "Star",
  "Sun",
  "Target",
  "Trash",
  "TrendingDown",
  "TrendingUp",
  "Type",
  "Undo",
  "Wallet",
  "Wind",
  "X",
];

// ── 초소형 XML 파서 (SVG 부분집합: 선언·주석·CDATA·텍스트 노드 불허) ──────────
export function parseSvg(text) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  let i = 0;
  while (i < text.length) {
    if (text[i] !== "<") {
      const end = text.indexOf("<", i);
      const chunk = end === -1 ? text.slice(i) : text.slice(i, end);
      if (chunk.trim() !== "")
        throw new Error(`텍스트 노드 불허: ${JSON.stringify(chunk.trim().slice(0, 30))}`);
      if (end === -1) break;
      i = end;
      continue;
    }
    if (text.startsWith("<!--", i) || text.startsWith("<?", i) || text.startsWith("<![", i)) {
      throw new Error("주석·선언·CDATA 불허");
    }
    if (text[i + 1] === "/") {
      const gt = text.indexOf(">", i);
      if (gt === -1) throw new Error("닫는 태그 미종결");
      const tag = text.slice(i + 2, gt).trim();
      const open = stack.pop();
      if (!open || open.tag !== tag) throw new Error(`태그 불일치: </${tag}> vs <${open?.tag}>`);
      i = gt + 1;
      continue;
    }
    const gt = text.indexOf(">", i);
    if (gt === -1) throw new Error("태그 미종결");
    let inner = text.slice(i + 1, gt);
    const selfClose = inner.endsWith("/");
    if (selfClose) inner = inner.slice(0, -1);
    const m = inner.match(/^([a-zA-Z][a-zA-Z0-9:-]*)/);
    if (!m) throw new Error(`태그명 없음: <${inner.slice(0, 20)}`);
    const node = { tag: m[1], attrs: {}, children: [] };
    let rest = inner.slice(m[1].length);
    const attrRe = /\s+([a-zA-Z_:][a-zA-Z0-9_:.-]*)="([^"]*)"/g;
    let consumed = 0,
      am;
    while ((am = attrRe.exec(rest))) {
      if (am.index !== consumed)
        throw new Error(`속성 문법 오류: ${rest.slice(consumed, consumed + 20)}`);
      if (am[1] in node.attrs) throw new Error(`중복 속성: ${am[1]}`);
      node.attrs[am[1]] = am[2];
      consumed = attrRe.lastIndex;
    }
    if (rest.slice(consumed).trim() !== "")
      throw new Error(`속성 파싱 실패: ${rest.slice(consumed, consumed + 30)}`);
    stack[stack.length - 1].children.push(node);
    if (!selfClose) stack.push(node);
    i = gt + 1;
  }
  if (stack.length !== 1) throw new Error(`미닫힘 태그: <${stack[stack.length - 1].tag}>`);
  if (root.children.length !== 1)
    throw new Error(`루트 요소는 정확히 1개여야 함 (현재 ${root.children.length})`);
  return root.children[0];
}

// ── path d 좌표 대역 검사: 절대 명령의 좌표쌍이 [-0.75, 24.75] 안인지 ─────────
function checkPathBounds(d, errors) {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
  let cmd = "";
  const nums = [];
  const flush = () => {
    if (!cmd || nums.length === 0) return;
    // 절대 명령만 검사 (A는 rx ry rot laf sf x y — 끝 좌표쌍만)
    const upper = cmd.toUpperCase();
    if (cmd !== upper) return;
    let coords = nums;
    if (upper === "A") coords = nums.filter((_, idx) => idx % 7 >= 5);
    else if (upper === "H" || upper === "V") coords = nums;
    for (const n of coords) {
      if (n < -0.75 || n > 24.75) errors.push(`path 좌표 이탈: ${cmd} …${n}`);
    }
  };
  for (const t of tokens) {
    if (/[a-zA-Z]/.test(t)) {
      flush();
      cmd = t;
      nums.length = 0;
      if (!/[MmLlHhVvCcSsQqTtAaZz]/.test(t)) errors.push(`지원 외 path 명령: ${t}`);
    } else nums.push(Number(t));
  }
  flush();
}

// ── 아이콘 1종 검증 → 오류 배열 ──────────────────────────────
export function validateIcon(name, text) {
  const errors = [];
  if (!NAME_RE.test(name)) errors.push(`이름 규약 위반(kebab-case): ${name}`);
  if (RESERVED.has(name)) errors.push(`예약어 이름 사용 불가: ${name}`);
  let svg;
  try {
    svg = parseSvg(text);
  } catch (e) {
    return [`XML 정형성: ${e.message}`];
  }
  if (svg.tag !== "svg") return [`루트가 <svg>가 아님: <${svg.tag}>`];
  for (const [k, v] of Object.entries(ROOT_ATTRS)) {
    if (svg.attrs[k] !== v) errors.push(`루트 ${k}="${svg.attrs[k] ?? "(없음)"}" ≠ "${v}"`);
  }
  for (const k of Object.keys(svg.attrs)) {
    if (!(k in ROOT_ATTRS)) errors.push(`루트에 허용 외 속성: ${k}`);
  }
  if (svg.children.length === 0) errors.push("빈 아이콘(자식 요소 0)");
  const walk = (node) => {
    for (const child of node.children) {
      const allowed = CHILD_ATTRS[child.tag];
      if (!allowed) {
        errors.push(`허용 외 요소: <${child.tag}>`);
        continue;
      }
      if (child.children.length > 0) errors.push(`<${child.tag}>는 자식을 가질 수 없음`);
      for (const [k, v] of Object.entries(child.attrs)) {
        if (!allowed.includes(k)) {
          errors.push(`<${child.tag}> 허용 외 속성: ${k} (색·굵기·transform 오버라이드 금지)`);
          continue;
        }
        if (k === "d") checkPathBounds(v, errors);
        else if (k !== "points") {
          const n = Number(v);
          if (Number.isNaN(n)) errors.push(`<${child.tag}> ${k} 숫자 아님: "${v}"`);
          else if (n < -0.75 || n > 24.75) errors.push(`<${child.tag}> ${k}=${v} 좌표 이탈`);
        }
      }
    }
  };
  walk(svg);
  return errors;
}

// ── 전체 검증: svg 셋 + 별칭표 + lucide 커버리지 ───────────────
export function validateAll() {
  const problems = [];
  const files = readdirSync(ICONS_DIR)
    .filter((f) => f.endsWith(".svg"))
    .sort();
  const names = files.map((f) => f.replace(/\.svg$/, ""));
  for (const file of files) {
    const name = file.replace(/\.svg$/, "");
    const errs = validateIcon(name, readFileSync(join(ICONS_DIR, file), "utf8"));
    for (const e of errs) problems.push(`${file}: ${e}`);
  }
  let aliases = {};
  try {
    aliases = JSON.parse(readFileSync(ALIASES_PATH, "utf8"));
  } catch (e) {
    problems.push(`aliases.json 파싱 실패: ${e.message}`);
  }
  const nameSet = new Set(names);
  for (const [lucide, jd] of Object.entries(aliases)) {
    if (lucide.startsWith("$")) continue;
    if (!/^[A-Z][A-Za-z0-9]*$/.test(lucide))
      problems.push(`aliases: 키가 PascalCase 아님: ${lucide}`);
    if (!nameSet.has(jd)) problems.push(`aliases: ${lucide} → "${jd}" 아이콘 없음`);
  }
  for (const req of REQUIRED_LUCIDE) {
    if (!(req in aliases)) problems.push(`lucide 커버리지 누락: ${req} (AppIcon.tsx 사용분)`);
  }
  return { names, aliases, problems };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { names, problems } = validateAll();
  if (problems.length) {
    console.error(`✗ ${problems.length}건 위반:`);
    for (const p of problems) console.error("  - " + p);
    process.exit(1);
  }
  console.log(
    `✓ ${names.length}종 검증 통과 (문법·별칭·lucide 커버리지 ${REQUIRED_LUCIDE.length}종)`,
  );
}
