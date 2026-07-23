#!/usr/bin/env node
// JunDS v3 아이콘 생성기 — 의존성 0. (03-web-arch §7.2)
// icons/svg/*.svg + icons/aliases.json →
//   icons/dist/icons/<name>.js(.d.ts)  아이콘별 ESM 모듈(트리셰이킹)
//   icons/dist/index.js(.d.ts)         전량 re-export + iconNames
//   icons/dist/sprite.svg              <symbol id="jd-<name>"> 심볼 스프라이트
//   icons/dist/aliases.json            lucide→jd 별칭표(검증 통과본)
//   icons/dist/meta.json               이름 목록·문법 요약
//   icons/preview.html                 전 아이콘 카탈로그(눈검수용)
// 실행: node icons/build.mjs   (검증 실패 시 생성하지 않고 exit 1)
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { validateAll, ICONS_DIR, ROOT_ATTRS, REQUIRED_LUCIDE } from "./check.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");

const { names, aliases, problems } = validateAll();
if (problems.length) {
  console.error(`✗ 검증 실패 ${problems.length}건 — 생성 중단:`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

const BANNER = "// 생성물 — 직접 수정 금지. `node icons/build.mjs`가 icons/svg/에서 생성.";
const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const minify = (text) => text.replace(/>\s+</g, "><").trim();
const inner = (svgText) => {
  const min = minify(svgText);
  return min.slice(min.indexOf(">") + 1, min.lastIndexOf("</svg>"));
};

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, "icons"), { recursive: true });

// dist를 어느 레포 스코프에서든 ESM으로 로드 가능하게 하는 마커 (레포 루트는 CJS 기본)
writeFileSync(join(DIST, "package.json"), JSON.stringify({ type: "module" }, null, 2) + "\n");

// ── (a) 아이콘별 ESM 모듈 ────────────────────────────────────
const icons = names.map((name) => ({
  name,
  exportName: `${camel(name)}Icon`,
  svg: minify(readFileSync(join(ICONS_DIR, `${name}.svg`), "utf8")),
}));

for (const { name, exportName, svg } of icons) {
  writeFileSync(
    join(DIST, "icons", `${name}.js`),
    `${BANNER}\nexport const ${exportName} = { name: ${JSON.stringify(name)}, svg: ${JSON.stringify(svg)} };\n`,
  );
  writeFileSync(
    join(DIST, "icons", `${name}.d.ts`),
    `${BANNER}\nexport declare const ${exportName}: { readonly name: ${JSON.stringify(name)}; readonly svg: string };\n`,
  );
}

// ── (b) index: 전량 re-export + 이름 목록 ─────────────────────
writeFileSync(
  join(DIST, "index.js"),
  [
    BANNER,
    ...icons.map(({ name, exportName }) => `export { ${exportName} } from "./icons/${name}.js";`),
    `export const iconNames = ${JSON.stringify(names)};`,
    "",
  ].join("\n"),
);
writeFileSync(
  join(DIST, "index.d.ts"),
  [
    BANNER,
    "export interface JdIconDef { readonly name: string; readonly svg: string }",
    ...icons.map(({ name, exportName }) =>
      `export declare const ${exportName}: { readonly name: ${JSON.stringify(name)}; readonly svg: string };`,
    ),
    `export declare const iconNames: readonly string[];`,
    "",
  ].join("\n"),
);

// ── (c) 심볼 스프라이트 ─────────────────────────────────────
const symbolAttrs = Object.entries(ROOT_ATTRS)
  .filter(([k]) => k !== "xmlns")
  .map(([k, v]) => `${k}="${v}"`)
  .join(" ");
const sprite = [
  `<svg xmlns="${ROOT_ATTRS.xmlns}">`,
  "<defs>",
  ...icons.map(
    ({ name }) =>
      `<symbol id="jd-${name}" ${symbolAttrs}>${inner(readFileSync(join(ICONS_DIR, `${name}.svg`), "utf8"))}</symbol>`,
  ),
  "</defs>",
  "</svg>",
  "",
].join("\n");
writeFileSync(join(DIST, "sprite.svg"), sprite);

// ── (d) 별칭표·메타 ─────────────────────────────────────────
const cleanAliases = Object.fromEntries(
  Object.entries(aliases).filter(([k]) => !k.startsWith("$")).sort(([a], [b]) => a.localeCompare(b)),
);
writeFileSync(join(DIST, "aliases.json"), JSON.stringify(cleanAliases, null, 2) + "\n");
writeFileSync(
  join(DIST, "meta.json"),
  JSON.stringify(
    {
      count: names.length,
      grammar: { viewBox: ROOT_ATTRS.viewBox, strokeWidth: ROOT_ATTRS["stroke-width"], cap: "round", join: "round", fill: "none" },
      lucideCoverage: { required: REQUIRED_LUCIDE.length, aliased: Object.keys(cleanAliases).length },
      names,
    },
    null,
    2,
  ) + "\n",
);

// ── (e) 카탈로그 preview.html ────────────────────────────────
const cells = icons
  .map(
    ({ name, svg }) => `<figure class="cell" data-name="${name}" title="${name}">${svg}<figcaption>${name}</figcaption></figure>`,
  )
  .join("\n");
const preview = `<!doctype html>
<!-- 생성물 — 직접 수정 금지. node icons/build.mjs -->
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>JunDS Icons — ${names.length}종</title>
<style>
  :root { color-scheme: light dark; --bg: #fbfbfa; --fg: #1c1c1c; --muted: #8a8a86; --cell: #ffffff; --grid-line: rgba(28,28,28,.07); }
  :root[data-theme="dark"] { --bg: #121212; --fg: #ececea; --muted: #7c7c78; --cell: #1b1b1b; --grid-line: rgba(236,236,234,.08); }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #121212; --fg: #ececea; --muted: #7c7c78; --cell: #1b1b1b; --grid-line: rgba(236,236,234,.08); } }
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--bg); color: var(--fg); font: 14px/1.5 ui-sans-serif, system-ui, sans-serif; padding: clamp(24px, 5vw, 64px); }
  header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 16px 28px; margin-bottom: 40px; }
  h1 { font-size: 18px; font-weight: 600; letter-spacing: -.01em; }
  h1 small { color: var(--muted); font-weight: 400; margin-left: 8px; }
  .controls { display: flex; align-items: center; gap: 20px; margin-left: auto; }
  .controls label { color: var(--muted); font-size: 12px; display: flex; align-items: center; gap: 8px; }
  input[type="search"] { background: var(--cell); color: inherit; border: 0; border-radius: 8px; padding: 8px 12px; width: 200px; font: inherit; outline-offset: 2px; }
  input[type="range"] { accent-color: var(--fg); width: 120px; }
  button { background: var(--cell); color: inherit; border: 0; border-radius: 8px; padding: 8px 12px; font: inherit; font-size: 12px; cursor: pointer; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(108px, 1fr)); gap: 8px; }
  .cell { background: var(--cell); border-radius: 10px; padding: 22px 8px 14px; display: flex; flex-direction: column; align-items: center; gap: 14px; cursor: pointer; }
  .cell svg { width: var(--size, 24px); height: var(--size, 24px); }
  body.gridlines .cell svg { background: conic-gradient(from 90deg at 1px 1px, transparent 90deg, var(--grid-line) 0) 0 0 / calc(var(--size, 24px) / 6) calc(var(--size, 24px) / 6); }
  figcaption { font-size: 10.5px; color: var(--muted); text-align: center; word-break: break-all; }
  .cell.hidden { display: none; }
  #toast { position: fixed; left: 50%; bottom: 28px; translate: -50% 0; background: var(--fg); color: var(--bg); padding: 8px 16px; border-radius: 999px; font-size: 12px; opacity: 0; transition: opacity .2s; pointer-events: none; }
</style>
</head>
<body>
<header>
  <h1>JunDS Icons<small>${names.length}종 · 24×24 · stroke 1.5 · round</small></h1>
  <div class="controls">
    <label><input type="search" id="q" placeholder="이름 검색…"></label>
    <label>크기 <input type="range" id="size" min="16" max="48" step="4" value="24"><span id="sizeval">24</span></label>
    <label><button id="gridbtn" type="button">그리드</button></label>
    <label><button id="themebtn" type="button">테마</button></label>
  </div>
</header>
<main class="grid" id="grid">
${cells}
</main>
<div id="toast"></div>
<script>
  const $ = (s) => document.querySelector(s);
  $("#q").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    for (const cell of document.querySelectorAll(".cell"))
      cell.classList.toggle("hidden", q !== "" && !cell.dataset.name.includes(q));
  });
  $("#size").addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--size", e.target.value + "px");
    $("#sizeval").textContent = e.target.value;
  });
  $("#gridbtn").addEventListener("click", () => document.body.classList.toggle("gridlines"));
  $("#themebtn").addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme ??
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = cur === "dark" ? "light" : "dark";
  });
  $("#grid").addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    navigator.clipboard?.writeText(cell.dataset.name).then(() => {
      const t = $("#toast");
      t.textContent = cell.dataset.name + " 복사됨";
      t.style.opacity = "1";
      clearTimeout(t._h);
      t._h = setTimeout(() => (t.style.opacity = "0"), 1200);
    });
  });
</script>
</body>
</html>
`;
writeFileSync(join(ROOT, "preview.html"), preview);

console.log(
  `✓ ${names.length}종 생성 → dist/icons/*.js(+d.ts), index, sprite.svg, aliases.json(${Object.keys(cleanAliases).length}), meta.json, preview.html`,
);
