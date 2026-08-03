#!/usr/bin/env node
//
// Scaffolds a new JunDS component (primitive / composite / pattern) or a new
// requirement file in one command.
//
// Usage:
//   node scripts/scaffold.mjs <kind> <Name> [--keywords "kw1,kw2"]
//
// kind: primitive | composite | pattern | requirement
// Name: PascalCase for component kinds, kebab-case for requirement.

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const KIND_TO_PLURAL = {
  primitive: "primitives",
  composite: "composites",
  pattern: "patterns",
};

const KIND_TO_SECTION_TITLE = {
  primitive: "Primitives",
  composite: "Composites",
  pattern: "Patterns",
};

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function usage() {
  return [
    "Usage:",
    "  node scripts/scaffold.mjs <kind> <Name> [options]",
    "",
    "  kind  primitive | composite | pattern | hook | requirement | recipe",
    "  Name  PascalCase (component), useCamelCase (hook), kebab-case (requirement, recipe)",
    "",
    "Options (component scaffold):",
    '  --keywords "kw1,kw2"   Korean search keywords',
    "",
    "Options (recipe scaffold):",
    "  --target <path>         Output directory (default: cwd)",
    "  --filename <name>       Output filename (default: page.tsx)",
    "  --force                 Overwrite existing file",
    "",
    "Examples:",
    "  node scripts/scaffold.mjs composite Avatar",
    "  node scripts/scaffold.mjs recipe dashboard-overview --target app/dashboard",
  ].join("\n");
}

function parseArgs(argv) {
  const out = {
    positional: [],
    keywords: null,
    target: null,
    filename: null,
    force: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--keywords") {
      out.keywords = argv[++i] ?? "";
    } else if (a.startsWith("--keywords=")) {
      out.keywords = a.slice("--keywords=".length);
    } else if (a === "--target") {
      out.target = argv[++i] ?? "";
    } else if (a.startsWith("--target=")) {
      out.target = a.slice("--target=".length);
    } else if (a === "--filename") {
      out.filename = argv[++i] ?? "";
    } else if (a.startsWith("--filename=")) {
      out.filename = a.slice("--filename=".length);
    } else if (a === "--force") {
      out.force = true;
    } else if (a === "-h" || a === "--help") {
      console.log(usage());
      process.exit(0);
    } else {
      out.positional.push(a);
    }
  }
  return out;
}

function pascalToKebab(name) {
  // Insert "-" between lower/digit -> Upper boundaries, then lowercase.
  // e.g. JSONViewer -> JSON-Viewer -> json-viewer
  //      OTPInput   -> OTP-Input   -> otp-input
  //      BentoGrid  -> Bento-Grid  -> bento-grid
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function isPascalCase(s) {
  return /^[A-Z][A-Za-z0-9]*$/.test(s);
}

function isKebabCase(s) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(s);
}

function isHookName(s) {
  return /^use[A-Z][A-Za-z0-9]*$/.test(s);
}

async function pathExists(p) {
  try {
    await access(p, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function refuseIfAnyExists(paths) {
  for (const p of paths) {
    if (await pathExists(p)) {
      die(`refusing to overwrite existing file: ${path.relative(repoRoot, p)}`);
    }
  }
}

// ───────────── component templates ─────────────

function componentSource(name, kind) {
  // Composites follow the compound-api contract (requirements/compound-api.md):
  // createCompound member 부착 + root 전용 asChild(Slot 위임) 골격을 자동 주입한다.
  if (kind === "composite") {
    return compoundComponentSource(name);
  }
  return `"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface ${name}Props extends HTMLAttributes<HTMLDivElement> {}

export const ${name} = forwardRef<HTMLDivElement, ${name}Props>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
${name}.displayName = "${name}";
`;
}

// 표준 템플릿 — requirements/compound-api.md §표준 템플릿과 동기화 유지.
function compoundComponentSource(name) {
  return `"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Slot } from "../../utils/Slot";
import { createCompound } from "../../utils/createCompound";
import type { HTMLAttributes } from "react";

export interface ${name}Props extends HTMLAttributes<HTMLDivElement> {
  /**
   * 자식 엘리먼트로 렌더 위임 (Radix-style asChild).
   *
   * root 전용 — sub-member(\`${name}.Header\` 등)에는 사용할 수 없습니다.
   *
   * @default false
   */
  asChild?: boolean;
}

const ${name}Root = forwardRef<HTMLDivElement, ${name}Props>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return <Comp ref={ref as never} className={cn("", className)} {...props} />;
  },
);
${name}Root.displayName = "${name}";

function ${name}Header({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

function ${name}Body({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

/**
 * TODO: 1–2문장 설명
 * @status new
 * @since 2.2.0
 */
export const ${name} = createCompound(${name}Root, {
  Header: ${name}Header,
  Body: ${name}Body,
});
`;
}

function componentBarrel(name) {
  return `export { ${name} } from "./${name}";
export type { ${name}Props } from "./${name}";
`;
}

function componentTest(name, kindPlural) {
  return `import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ${name} } from "../../${kindPlural}/${name}";

describe("${name}", () => {
  it("renders", () => {
    const { container } = render(<${name} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
`;
}

function showcasePage(name, kindPlural) {
  return `"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ${name} } from "@/ds/${kindPlural}/${name}";

export default function ${name}Page() {
  return (
    <ComponentPage
      name="${name}"
      description="TODO: 1–2문장 설명"
      importPath='import { ${name} } from "@/ds/${kindPlural}/${name}"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <${name} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
`;
}

// ───────────── barrel + search-dictionary patches ─────────────

function appendKindBarrelLine(src, name) {
  // Append two lines (export + export type) at the end of the barrel.
  // Preserve trailing newline behavior.
  const trimmed = src.replace(/\s+$/, "");
  const addition = `\n\nexport { ${name} } from "./${name}";\nexport type { ${name}Props } from "./${name}";\n`;
  return trimmed + addition;
}

function patchSearchDictionary(src, sectionTitle, href, label, keywordsArr) {
  // 1) Append nav item to the matching section's items array.
  //    We locate `title: "<sectionTitle>"` and then the next `items: [` block,
  //    and insert a line before its closing `],`.
  const titleNeedle = `title: "${sectionTitle}"`;
  const titleIdx = src.indexOf(titleNeedle);
  if (titleIdx === -1) {
    throw new Error(`could not find section title "${sectionTitle}" in search-dictionary.ts`);
  }
  const itemsIdx = src.indexOf("items: [", titleIdx);
  if (itemsIdx === -1) {
    throw new Error(`could not find items: [ for section "${sectionTitle}"`);
  }
  // Find the matching closing "]" for this items array (track bracket depth).
  let depth = 0;
  let cursor = itemsIdx + "items: ".length; // points at "["
  let closeIdx = -1;
  for (let i = cursor; i < src.length; i++) {
    const ch = src[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }
  }
  if (closeIdx === -1) {
    throw new Error(`could not find closing ] for section "${sectionTitle}"`);
  }
  // The line containing `]` starts after the newline at `closingLineStart`.
  // We want to insert a new item line as the last item — right before that line.
  // Indent should match the previous (item) line, NOT the bracket line itself.
  const closingLineStart = src.lastIndexOf("\n", closeIdx - 1); // newline before `]`
  const prevLineStart = src.lastIndexOf("\n", closingLineStart - 1); // newline before that
  const prevLine = src.slice(prevLineStart + 1, closingLineStart);
  const indentMatch = prevLine.match(/^(\s*)/);
  const indent = indentMatch && indentMatch[1].length > 0 ? indentMatch[1] : "      ";
  const newLine = `${indent}{ href: "${href}", label: "${label}" },\n`;

  // Insert before the closing-bracket line.
  const patched = src.slice(0, closingLineStart + 1) + newLine + src.slice(closingLineStart + 1);

  // 2) If keywords given, append a koreanKeywords entry.
  if (!keywordsArr || keywordsArr.length === 0) {
    return patched;
  }

  return appendKoreanKeywordsEntry(patched, label, keywordsArr);
}

function appendKoreanKeywordsEntry(src, label, keywordsArr) {
  const declNeedle = "const koreanKeywords: Record<string, string[]> = {";
  const declIdx = src.indexOf(declNeedle);
  if (declIdx === -1) {
    throw new Error("could not find koreanKeywords declaration");
  }
  // Find matching closing brace for this object literal.
  const openBrace = src.indexOf("{", declIdx + declNeedle.length - 1);
  let depth = 0;
  let closeIdx = -1;
  for (let i = openBrace; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }
  }
  if (closeIdx === -1) {
    throw new Error("could not find closing } for koreanKeywords");
  }
  // Determine indent from the previous entry line, not from the closing-brace line.
  const closingLineStart = src.lastIndexOf("\n", closeIdx - 1);
  const prevLineStart = src.lastIndexOf("\n", closingLineStart - 1);
  const prevLine = src.slice(prevLineStart + 1, closingLineStart);
  const indentMatch = prevLine.match(/^(\s*)/);
  const indent = indentMatch && indentMatch[1].length > 0 ? indentMatch[1] : "  ";
  const labelKey = /^[A-Za-z_][A-Za-z0-9_]*$/.test(label) ? label : JSON.stringify(label);
  const kwLiterals = keywordsArr.map((k) => JSON.stringify(k)).join(", ");
  const newLine = `${indent}${labelKey}: [${kwLiterals}],\n`;
  return src.slice(0, closingLineStart + 1) + newLine + src.slice(closingLineStart + 1);
}

// ───────────── requirement scaffolding ─────────────

function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function patchRequirementsReadme(src, slug) {
  const placeholder = "_(none yet — add a row when you create a requirement file)_";
  const newRow = `| [\`${slug}\`](./${slug}.md) | draft | TODO: one-line summary |`;

  if (src.includes(placeholder)) {
    return src.replace(
      new RegExp(`^.*${placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.*$`, "m"),
      newRow,
    );
  }

  // Find the table header line and its separator, then collect rows until a blank line.
  const lines = src.split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\|\s*Slug\s*\|\s*Status\s*\|/.test(lines[i])) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    throw new Error("could not find requirements table header");
  }
  // Separator is the next line; rows start at headerIdx + 2.
  let i = headerIdx + 2;
  const rowStart = i;
  while (i < lines.length && lines[i].startsWith("|")) i++;
  const rowEnd = i; // exclusive

  const rows = lines.slice(rowStart, rowEnd);
  rows.push(newRow);

  // Sort by slug — extract slug between [` and `] on each row.
  rows.sort((a, b) => {
    const sa = (a.match(/\[`([^`]+)`\]/) || [, ""])[1];
    const sb = (b.match(/\[`([^`]+)`\]/) || [, ""])[1];
    return sa.localeCompare(sb);
  });

  const updated = [...lines.slice(0, rowStart), ...rows, ...lines.slice(rowEnd)];
  return updated.join("\n");
}

function fillRequirementTemplate(template, slug) {
  let out = template;
  // Replace title `# <Feature name>` with `# <Title From Slug>`.
  out = out.replace(/^# <Feature name>/m, `# ${titleFromSlug(slug)}`);
  // Replace slug placeholder.
  out = out.replace(/`<kebab-case-slug>`/, `\`${slug}\``);
  // Replace Last updated line.
  out = out.replace(/(\*\*Last updated:\*\*\s*)YYYY-MM-DD/, `$1${todayIso()}`);
  // Replace changelog date.
  out = out.replace(/^- YYYY-MM-DD — created\./m, `- ${todayIso()} — created.`);
  return out;
}

// ───────────── runners ─────────────

async function scaffoldComponent(kind, name, keywords) {
  if (!isPascalCase(name)) {
    die(`<Name> must be PascalCase for kind="${kind}", got "${name}"`);
  }
  const kindPlural = KIND_TO_PLURAL[kind];
  const slug = pascalToKebab(name);

  const componentDir = path.join(repoRoot, "ds", kindPlural, name);
  const componentFile = path.join(componentDir, `${name}.tsx`);
  const componentIndex = path.join(componentDir, "index.ts");
  const testFile = path.join(repoRoot, "ds", "__tests__", kindPlural, `${name}.test.tsx`);
  const showcaseDir = path.join(repoRoot, "app", "design-system", kindPlural, slug);
  const showcaseFile = path.join(showcaseDir, "page.tsx");
  const kindBarrel = path.join(repoRoot, "ds", kindPlural, "index.ts");
  const searchDict = path.join(repoRoot, "app", "design-system", "_data", "search-dictionary.ts");

  await refuseIfAnyExists([componentFile, componentIndex, testFile, showcaseFile]);

  // Read editable files first so failure mode = nothing written.
  let barrelSrc;
  let dictSrc;
  try {
    barrelSrc = await readFile(kindBarrel, "utf8");
  } catch (err) {
    die(`could not read kind barrel: ${kindBarrel} (${err.message})`);
  }
  try {
    dictSrc = await readFile(searchDict, "utf8");
  } catch (err) {
    die(`could not read search-dictionary: ${searchDict} (${err.message})`);
  }

  // Compute patches before any disk writes.
  const newBarrel = appendKindBarrelLine(barrelSrc, name);
  const sectionTitle = KIND_TO_SECTION_TITLE[kind];
  const href = `/design-system/${kindPlural}/${slug}`;
  const kwArr = (keywords || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  let newDict;
  try {
    newDict = patchSearchDictionary(dictSrc, sectionTitle, href, name, kwArr);
  } catch (err) {
    die(`failed to patch search-dictionary.ts: ${err.message}`);
  }

  // Now write everything.
  await ensureDir(componentDir);
  await ensureDir(path.dirname(testFile));
  await ensureDir(showcaseDir);

  await writeFile(componentFile, componentSource(name, kind));
  await writeFile(componentIndex, componentBarrel(name));
  await writeFile(testFile, componentTest(name, kindPlural));
  await writeFile(showcaseFile, showcasePage(name, kindPlural));
  await writeFile(kindBarrel, newBarrel);
  await writeFile(searchDict, newDict);

  console.log(`✓ scaffolded ${name} (${kind})`);
  console.log("  created:");
  for (const p of [componentFile, componentIndex, testFile, showcaseFile]) {
    console.log(`    + ${path.relative(repoRoot, p)}`);
  }
  console.log("  modified:");
  console.log(`    ~ ${path.relative(repoRoot, kindBarrel)}`);
  console.log(
    `    ~ ${path.relative(repoRoot, searchDict)}${kwArr.length ? " (nav + keywords)" : " (nav)"}`,
  );
  console.log("");
  console.log('  Run "npm run map" to refresh .ai/MAP.md');
}

async function scaffoldRequirement(slug) {
  if (!isKebabCase(slug)) {
    die(`<Name> must be kebab-case for kind="requirement", got "${slug}"`);
  }
  const reqFile = path.join(repoRoot, "requirements", `${slug}.md`);
  const templateFile = path.join(repoRoot, "requirements", "_template.md");
  const readmeFile = path.join(repoRoot, "requirements", "README.md");

  await refuseIfAnyExists([reqFile]);

  let template;
  let readme;
  try {
    template = await readFile(templateFile, "utf8");
  } catch (err) {
    die(`could not read template: ${templateFile} (${err.message})`);
  }
  try {
    readme = await readFile(readmeFile, "utf8");
  } catch (err) {
    die(`could not read readme: ${readmeFile} (${err.message})`);
  }

  const filled = fillRequirementTemplate(template, slug);
  let updatedReadme;
  try {
    updatedReadme = patchRequirementsReadme(readme, slug);
  } catch (err) {
    die(`failed to patch requirements/README.md: ${err.message}`);
  }

  await writeFile(reqFile, filled);
  await writeFile(readmeFile, updatedReadme);

  console.log(`✓ scaffolded ${slug} (requirement)`);
  console.log("  created:");
  console.log(`    + ${path.relative(repoRoot, reqFile)}`);
  console.log("  modified:");
  console.log(`    ~ ${path.relative(repoRoot, readmeFile)}`);
  console.log("");
  console.log('  Run "npm run map" to refresh .ai/MAP.md');
}

// ───────────── hook scaffolding ─────────────

function hookSource(name) {
  return `"use client";
import { useState } from "react";

/**
 * TODO: 1–2문장 설명
 * @status new
 * @since 2.2.0
 * @example
 * const value = ${name}();
 */
export function ${name}() {
  const [value] = useState<unknown>(null);
  return value;
}
`;
}

function hookTest(name) {
  return `import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ${name} } from "../../hooks/${name}";

describe("${name}", () => {
  it("runs", () => {
    const { result } = renderHook(() => ${name}());
    expect(result.current).toBeDefined();
  });
});
`;
}

function appendHookBarrelLine(src, name) {
  const trimmed = src.replace(/\s+$/, "");
  const addition = `\nexport { ${name} } from "./${name}";\n`;
  return trimmed + addition;
}

async function scaffoldHook(name) {
  if (!isHookName(name)) {
    die(`hook name must start with "use" + PascalCase suffix, got "${name}"`);
  }
  const hookFile = path.join(repoRoot, "ds", "hooks", `${name}.ts`);
  const testFile = path.join(repoRoot, "ds", "__tests__", "hooks", `${name}.test.ts`);
  const hooksBarrel = path.join(repoRoot, "ds", "hooks", "index.ts");

  await refuseIfAnyExists([hookFile, testFile]);

  let barrelSrc;
  try {
    barrelSrc = await readFile(hooksBarrel, "utf8");
  } catch (err) {
    die(`could not read hooks barrel: ${hooksBarrel} (${err.message})`);
  }

  if (barrelSrc.includes(`from "./${name}"`)) {
    die(`hook ${name} already registered in ds/hooks/index.ts`);
  }

  const newBarrel = appendHookBarrelLine(barrelSrc, name);

  await ensureDir(path.dirname(testFile));
  await writeFile(hookFile, hookSource(name));
  await writeFile(testFile, hookTest(name));
  await writeFile(hooksBarrel, newBarrel);

  console.log(`✓ scaffolded ${name} (hook)`);
  console.log("  created:");
  console.log(`    + ${path.relative(repoRoot, hookFile)}`);
  console.log(`    + ${path.relative(repoRoot, testFile)}`);
  console.log("  modified:");
  console.log(`    ~ ${path.relative(repoRoot, hooksBarrel)}`);
  console.log("");
  console.log('  Run "npm run map" to refresh .ai/MAP.md');
}

// ───────────── recipe scaffolding ─────────────

function extractFirstTsxBlock(md) {
  // Match the first ```tsx (or ```jsx) fenced code block.
  const m = md.match(/```(?:tsx|jsx)\s*\n([\s\S]*?)\n```/);
  return m ? m[1] : null;
}

async function scaffoldRecipe(slug, opts) {
  if (!isKebabCase(slug)) {
    die(`recipe slug must be kebab-case, got "${slug}"`);
  }
  const recipeMd = path.join(repoRoot, ".ai", "recipes", `${slug}.md`);
  if (!(await pathExists(recipeMd))) {
    die(`recipe not found: .ai/recipes/${slug}.md\n  Available: see .ai/recipes/README.md`);
  }

  const md = await readFile(recipeMd, "utf8");
  const code = extractFirstTsxBlock(md);
  if (!code) {
    die(`no \`\`\`tsx (or \`\`\`jsx) code block found in .ai/recipes/${slug}.md`);
  }

  const targetRaw = opts.target ?? ".";
  const targetAbs = path.isAbsolute(targetRaw) ? targetRaw : path.resolve(process.cwd(), targetRaw);
  await ensureDir(targetAbs);

  const filename = opts.filename || "page.tsx";
  const outFile = path.join(targetAbs, filename);

  if ((await pathExists(outFile)) && !opts.force) {
    die(
      `refusing to overwrite ${path.relative(
        process.cwd(),
        outFile,
      )}\n  Pass --force to overwrite.`,
    );
  }

  await writeFile(outFile, code.endsWith("\n") ? code : `${code}\n`);

  console.log(`✓ scaffolded recipe ${slug}`);
  console.log("  created:");
  console.log(`    + ${path.relative(process.cwd(), outFile)}`);
  console.log("");
  console.log("  Next steps:");
  console.log("    1. Review the file — recipe imports use this repo's @/ds/* paths.");
  console.log("    2. Adjust route placement / data sources as needed.");
  console.log(`    3. Read .ai/recipes/${slug}.md for variations and tips.`);
}

// ───────────── entrypoint ─────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { positional, keywords, target, filename, force } = args;
  if (positional.length < 2) {
    console.error(usage());
    process.exit(1);
  }
  const [kind, name] = positional;

  if (kind === "requirement") {
    await scaffoldRequirement(name);
    return;
  }

  if (kind === "recipe") {
    await scaffoldRecipe(name, { target, filename, force });
    return;
  }

  if (kind === "hook") {
    await scaffoldHook(name);
    return;
  }

  if (!(kind in KIND_TO_PLURAL)) {
    die(
      `unknown kind "${kind}". Expected one of: primitive, composite, pattern, hook, requirement, recipe.`,
    );
  }

  await scaffoldComponent(kind, name, keywords);
}

main().catch((err) => {
  console.error(`✗ ${err.stack || err.message || err}`);
  process.exit(1);
});
