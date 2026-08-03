#!/usr/bin/env node
/**
 * generate-components-md.mjs
 *
 * Auto-generates COMPONENTS.md from `.ai/props.json` (component metadata) and
 * the source files under `ds/`. The output is the single source of truth for
 * the public component reference and is intended to be committed.
 *
 * Inputs:
 *   - .ai/props.json   : component name / kind / file / props
 *   - ds/<kind>/<Name>/<Name>.tsx : leading JSDoc above the component export
 *   - ds/hooks/index.ts + ds/hooks/<name>.ts : public hook list + JSDoc
 *
 * Output:
 *   - COMPONENTS.md
 *
 * Run:
 *   npm run docs:components
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const PROPS_PATH = join(ROOT, ".ai", "props.json");
const HOOKS_INDEX = join(ROOT, "ds", "hooks", "index.ts");
const OUTPUT_PATH = join(ROOT, "COMPONENTS.md");

/* ──────────────────────────── helpers ──────────────────────────── */

/** Strip leading "* " and surrounding whitespace from a JSDoc body line. */
function stripJsDocLine(line) {
  return line.replace(/^\s*\*\s?/, "").replace(/\s+$/, "");
}

/**
 * Parse a JSDoc block (the raw text between `/**` and `* /`) into a
 * structured object: `{ description, status, since, tags, example }`.
 */
function parseJsDocBlock(rawBlock) {
  const inner = rawBlock.replace(/^\/\*\*\s*\n?/, "").replace(/\s*\*\/\s*$/, "");
  const lines = inner.split("\n").map(stripJsDocLine);

  const result = {
    description: "",
    status: null,
    since: null,
    tags: [],
    example: "",
  };

  // Description: contiguous non-tag lines from the top.
  const descLines = [];
  let i = 0;
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("@")) break;
    descLines.push(l);
  }
  result.description = descLines.join("\n").trim();

  // Tags
  let currentTag = null;
  let exampleLines = [];
  for (; i < lines.length; i++) {
    const l = lines[i];
    const tagMatch = l.match(/^@(\w+)\s*(.*)$/);
    if (tagMatch) {
      // flush previous example if needed
      if (currentTag === "example") {
        result.example = exampleLines.join("\n").trim();
        exampleLines = [];
      }
      currentTag = tagMatch[1];
      const value = tagMatch[2];
      if (currentTag === "status") result.status = value.trim() || null;
      else if (currentTag === "since") result.since = value.trim() || null;
      else if (currentTag === "tags") {
        result.tags = value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (currentTag === "example") {
        if (value.trim()) exampleLines.push(value);
      }
    } else if (currentTag === "example") {
      exampleLines.push(l);
    }
  }
  if (currentTag === "example") {
    result.example = exampleLines.join("\n").replace(/^\n+|\n+$/g, "");
  }

  return result;
}

// Walk the source and collect every JSDoc block along with start/end offsets.
// Used to match the JSDoc that sits _immediately_ above an export, while
// ignoring earlier prop-level one-liners inside the same file.
function collectJsDocBlocks(source) {
  const blocks = [];
  const re = /\/\*\*[\s\S]*?\*\//g;
  let m;
  while ((m = re.exec(source))) {
    blocks.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
  }
  return blocks;
}

// Find a JSDoc whose immediate trailing content (after only whitespace and an
// optional `"use client";` directive) satisfies `predicate(tail)`.
function jsDocImmediatelyBefore(source, blocks, predicate) {
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    let j = b.end;
    // Skip whitespace.
    while (j < source.length && /\s/.test(source[j])) j++;
    // Optional "use client";
    if (source.slice(j, j + 12) === '"use client"') {
      j += 12;
      if (source[j] === ";") j++;
      while (j < source.length && /\s/.test(source[j])) j++;
    }
    const tail = source.slice(j, j + 200);
    if (predicate(tail)) return b;
  }
  return null;
}

// Find the leading JSDoc above the export of `name` in `source`. We use a
// positional scan rather than a single regex so that single-line prop docs
// near the export don't accidentally match.
//
// Strategy:
//   1. Find a JSDoc whose immediate trailing tokens are `export ... <name>`.
//   2. Otherwise, the last JSDoc that sits directly above any top-level
//      `export function|const|class` (handles renamed exports like
//      `Calendar` -> `DsCalendar`).
function findComponentJsDoc(source, name) {
  const blocks = collectJsDocBlocks(source);

  // Pattern A: directly above `export ... <name>`.
  const reNamed = new RegExp(`^export\\s+[\\s\\S]{0,200}?\\b${name}\\b`);
  const a = jsDocImmediatelyBefore(source, blocks, (tail) => reNamed.test(tail));
  if (a) return parseJsDocBlock(a.text);

  // Pattern B: directly above any top-level export.
  const reAny = /^export\s+(?:default\s+)?(?:function|const|class)\b/;
  const b = jsDocImmediatelyBefore(source, blocks, (tail) => reAny.test(tail));
  if (b) return parseJsDocBlock(b.text);

  return {
    description: "",
    status: null,
    since: null,
    tags: [],
    example: "",
  };
}

/** Read a file and return JSDoc info; resilient to missing files. */
function readComponentDoc(file, name) {
  const abs = resolve(ROOT, file);
  if (!existsSync(abs)) {
    return {
      description: "",
      status: null,
      since: null,
      tags: [],
      example: "",
    };
  }
  const src = readFileSync(abs, "utf8");
  return findComponentJsDoc(src, name);
}

/** Escape pipes in markdown table cells. */
function tcell(s) {
  return String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
}

/** Trim & flatten verbose prop descriptions to the first sentence/line. */
function shortDesc(s) {
  if (!s) return "";
  const cleaned = String(s).trim();
  // First non-empty line, then truncate at the first sentence boundary.
  const firstLine = cleaned.split(/\n+/).find((l) => l.trim().length > 0) ?? "";
  return firstLine.trim();
}

/** Slugify for table-of-contents anchors (GitHub-style). */
function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Format an inline tag list. */
function inlineTags(tags) {
  if (!tags || tags.length === 0) return "";
  return tags.map((t) => `\`${t}\``).join(" ");
}

/** Format a status badge (italic plain text — no emoji). */
function statusBadge(status, since) {
  const parts = [];
  if (status) parts.push(`*${status}*`);
  if (since) parts.push(`*v${since}*`);
  return parts.join(" · ");
}

/** Kind → import path segment. */
function kindDir(kind) {
  if (kind === "primitive") return "primitives";
  if (kind === "composite") return "composites";
  if (kind === "pattern") return "patterns";
  return kind;
}

/** Clean the giant `import("/abs/path/...").ReactNode` style types. */
function cleanType(t) {
  if (!t) return "";
  return String(t)
    .replace(/import\("[^"]+"\)\./g, "")
    .trim();
}

/* ──────────────────────────── hooks ──────────────────────────── */

/** Parse a hook source file and return its leading description. */
function readHookDescription(hookName) {
  const file = join(ROOT, "ds", "hooks", `${hookName}.ts`);
  if (!existsSync(file)) return "";
  const src = readFileSync(file, "utf8");
  // Look for the JSDoc that sits immediately above `export function <hookName>` /
  // `export const <hookName>`.
  const blocks = collectJsDocBlocks(src);
  const reNamed = new RegExp(`^export\\s+(?:function|const|class)\\s+${hookName}\\b`);
  const named = jsDocImmediatelyBefore(src, blocks, (tail) => reNamed.test(tail));
  if (named) {
    const parsed = parseJsDocBlock(named.text);
    if (parsed.description) return parsed.description.split("\n")[0].trim();
  }
  // Otherwise, the JSDoc above any first export.
  const reAny = /^export\s+(?:function|const|class)\b/;
  const any = jsDocImmediatelyBefore(src, blocks, (tail) => reAny.test(tail));
  if (any) {
    const parsed = parseJsDocBlock(any.text);
    if (parsed.description) return parsed.description.split("\n")[0].trim();
  }
  return "";
}

/** Parse `ds/hooks/index.ts` → ordered list of public hook names. */
function readPublicHooks() {
  const src = readFileSync(HOOKS_INDEX, "utf8");
  const names = [];
  const seen = new Set();
  const re = /export\s*\{\s*([^}]+)\s*\}\s*from\s*"\.\/(\w+)"/g;
  let m;
  while ((m = re.exec(src))) {
    const inside = m[1];
    for (const part of inside.split(",")) {
      const id = part
        .trim()
        .split(/\s+as\s+/)[0]
        .trim();
      if (id && id.startsWith("use") && !seen.has(id)) {
        seen.add(id);
        names.push(id);
      }
    }
  }
  return names.sort((a, b) => a.localeCompare(b));
}

/* ──────────────────────────── builder ──────────────────────────── */

function buildPropsTable(props) {
  if (!props || props.length === 0) {
    return "_props 없음_\n";
  }
  const head = "| Prop | Type | Required | Description |\n|------|------|:--------:|-------------|";
  const rows = props.map((p) => {
    const required = p.optional ? "" : "✓";
    return `| \`${tcell(p.name)}\` | \`${tcell(cleanType(p.type))}\` | ${required} | ${tcell(
      shortDesc(p.description),
    )} |`;
  });
  return [head, ...rows].join("\n");
}

function buildComponentSection(c, doc) {
  const importPath = `@/ds/${kindDir(c.kind)}/${c.name}`;
  const headerBits = [`### ${c.name}`];

  const meta = [];
  const badge = statusBadge(doc.status ?? c.status, doc.since ?? c.since);
  if (badge) meta.push(badge);
  const tags = inlineTags(doc.tags && doc.tags.length ? doc.tags : c.tags);
  if (tags) meta.push(tags);
  if (meta.length) headerBits.push(meta.join(" — "));

  const description = doc.description ? doc.description.split("\n")[0].trim() : "";

  const lines = [];
  lines.push(headerBits.join("\n\n"));
  if (description) {
    lines.push("");
    lines.push(description);
  }
  lines.push("");
  lines.push(`**Import:** \`import { ${c.name} } from "${importPath}";\``);
  lines.push("");
  lines.push("**Props**");
  lines.push("");
  lines.push(buildPropsTable(c.props));
  if (doc.example) {
    lines.push("");
    lines.push("**Example**");
    lines.push("");
    lines.push("```tsx");
    lines.push(doc.example.replace(/\n+$/g, ""));
    lines.push("```");
  }
  return lines.join("\n");
}

function buildHooksTable(hookNames) {
  const head = "| Hook | Description |\n|------|-------------|";
  const rows = hookNames.map((h) => `| \`${h}\` | ${tcell(shortDesc(readHookDescription(h)))} |`);
  return [head, ...rows].join("\n");
}

function buildToc(byKind) {
  const lines = [];
  lines.push("## 목차");
  lines.push("");
  lines.push("- [사용법](#사용법)");
  lines.push("- [유틸리티](#유틸리티)");
  lines.push("- [공용 Hooks](#공용-hooks)");
  for (const kind of ["primitive", "composite", "pattern"]) {
    const list = byKind[kind] ?? [];
    if (!list.length) continue;
    const title =
      kind === "primitive" ? "Primitives" : kind === "composite" ? "Composites" : "Patterns";
    lines.push(`- [${title}](#${slug(title)})`);
    for (const c of list) {
      lines.push(`  - [${c.name}](#${slug(c.name)})`);
    }
  }
  return lines.join("\n");
}

function buildKindSection(kind, components, kindTitle) {
  const lines = [];
  lines.push(`## ${kindTitle}`);
  lines.push("");
  for (const c of components) {
    const doc = readComponentDoc(c.file, c.name);
    lines.push(buildComponentSection(c, doc));
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  // Trim the trailing separator.
  while (lines.length && (lines[lines.length - 1] === "---" || lines[lines.length - 1] === "")) {
    lines.pop();
  }
  return lines.join("\n");
}

/* ──────────────────────────── static blocks ──────────────────────────── */

const USAGE_BLOCK = `## 사용법

\`\`\`tsx
// 개별 import (권장 — 트리쉐이킹)
import { Button } from "@/ds/primitives/Button";
import { Modal } from "@/ds/composites/Modal";
import { DataTable } from "@/ds/patterns/DataTable";

// barrel import
import { Button, Modal, DataTable } from "@/ds";
\`\`\`
`;

const UTILS_BLOCK = `## 유틸리티

| 이름 | 경로 | 설명 |
|------|------|------|
| \`cn()\` | \`@/ds/utils/cn\` | clsx + twMerge. 조건부 클래스 병합 |
`;

/* ──────────────────────────── main ──────────────────────────── */

function main() {
  const data = JSON.parse(readFileSync(PROPS_PATH, "utf8"));
  const components = data.components ?? [];

  const byKind = { primitive: [], composite: [], pattern: [] };
  for (const c of components) {
    if (!byKind[c.kind]) byKind[c.kind] = [];
    byKind[c.kind].push(c);
  }
  for (const kind of Object.keys(byKind)) {
    byKind[kind].sort((a, b) => a.name.localeCompare(b.name));
  }

  const hooks = readPublicHooks();

  const out = [];
  out.push("# junDS — 디자인 시스템 컴포넌트 레퍼런스");
  out.push("");
  out.push("> 이 문서는 `.ai/props.json`과 컴포넌트 소스의 JSDoc을 토대로 자동 생성됩니다.");
  out.push(
    "> **수정하지 마세요.** 컴포넌트 props를 변경하면 `npm run extract-props && npm run docs:components`를 실행하세요.",
  );
  out.push("");
  out.push(
    `총 **${components.length}개** 컴포넌트 — Primitives ${byKind.primitive.length} · Composites ${byKind.composite.length} · Patterns ${byKind.pattern.length}.`,
  );
  out.push("");
  out.push(buildToc(byKind));
  out.push("");
  out.push(USAGE_BLOCK);
  out.push(UTILS_BLOCK);
  out.push("## 공용 Hooks");
  out.push("");
  out.push("모든 hook은 `@/ds/hooks`에서 import. 자세한 시그니처는 소스의 JSDoc을 참고하세요.");
  out.push("");
  out.push(buildHooksTable(hooks));
  out.push("");

  out.push(buildKindSection("primitive", byKind.primitive, "Primitives"));
  out.push("");
  out.push(buildKindSection("composite", byKind.composite, "Composites"));
  out.push("");
  out.push(buildKindSection("pattern", byKind.pattern, "Patterns"));
  out.push("");

  const date = new Date().toISOString().slice(0, 10);
  out.push("---");
  out.push("");
  out.push(
    `Auto-generated by \`npm run docs:components\` from \`.ai/props.json\` on ${date}. Do not edit by hand.`,
  );
  out.push("");

  writeFileSync(OUTPUT_PATH, out.join("\n"), "utf8");

  // Console summary.
  const wordCount = out.join("\n").split(/\s+/).filter(Boolean).length;
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`  components: ${components.length}`);
  console.log(`  hooks:      ${hooks.length}`);
  console.log(`  words:      ${wordCount}`);
}

main();
