#!/usr/bin/env node
/**
 * generate-smoke-tests.mjs
 *
 * Auto-creates a minimal "renders without throwing" vitest file for every
 * primitive / composite / pattern in the design system that does NOT already
 * have a test. Idempotent — re-running adds zero new files when everything
 * is already covered.
 *
 * Skips a component when:
 *   - a test file already exists at ds/__tests__/<kindPlural>/<Name>.test.tsx
 *   - any of its props is required (optional !== true) — we cannot safely
 *     conjure values for unknown types
 *   - the source file does not export the component as a value
 *     (no `export const Name`, `export function Name`, or `export { Name`)
 *     — these are typically Provider / hook / namespace modules
 *
 * Input:  .ai/props.json  (canonical metadata, do not re-parse TS here)
 * Output: ds/__tests__/<kindPlural>/<Name>.test.tsx
 *
 * Run:    node scripts/generate-smoke-tests.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PROPS_JSON = path.join(ROOT, ".ai", "props.json");
const TESTS_DIR = path.join(ROOT, "ds", "__tests__");

const KIND_TO_PLURAL = {
  primitive: "primitives",
  composite: "composites",
  pattern: "patterns",
  // layout/core 는 폴더가 아니라 평면 파일 관례 — 테스트 경로 규칙은 동일하다
  layout: "layout",
  core: "core",
};

// Components that crash with the auto-generated empty-fixture render
// (e.g. dereference `items[current].title` on first paint). Owners must
// hand-write tests with realistic data; the generator must not recreate
// the broken auto-test for them.
const SKIP_SMOKE = new Set(["FormWizard"]);

function readPropsJson() {
  const raw = fs.readFileSync(PROPS_JSON, "utf8");
  return JSON.parse(raw);
}

function hasValueExport(sourcePath, name) {
  let src;
  try {
    src = fs.readFileSync(sourcePath, "utf8");
  } catch {
    return false;
  }
  // export const Name | export function Name | export { Name | export default Name
  // (export default is intentionally NOT counted because we import named.)
  const patterns = [
    new RegExp(`export\\s+const\\s+${name}\\b`),
    new RegExp(`export\\s+function\\s+${name}\\b`),
    new RegExp(`export\\s+class\\s+${name}\\b`),
    // forwardRef pattern: `export const Name = forwardRef(...)` already covered above
    // re-export: `export { Name }` or `export { Foo as Name }`
    new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`),
  ];
  return patterns.some((p) => p.test(src));
}

function hasRequiredProp(component) {
  return (component.props || []).some((p) => p.optional !== true);
}

function normalizeType(raw) {
  return (raw ?? "")
    .replace(/import\("[^"]+"\)\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns a JSX-attr literal string (e.g. `""`, `0`, `{[]}`) for a given prop
// type, or `null` if we can't safely mock it.
function fixtureFor(type) {
  const t = normalizeType(type);
  // ReactNode-ish — pass nothing (omit the prop) — caller treats null as skip,
  // but children-as-prop is handled specially via `>...</...>`.
  if (/^(React\.)?ReactNode$/.test(t)) return { value: "{null}", asChildren: true };
  if (t === "string") return { value: '""' };
  if (t === "number") return { value: "{0}" };
  if (t === "boolean") return { value: "{false}" };
  if (t === "Date") return { value: "{new Date()}" };
  // Tuple
  if (/^\[number,\s*number\]$/.test(t)) return { value: "{[0, 0]}" };
  // Union including string/number — pick string
  if (/^string\s*\|\s*number$/.test(t) || /^number\s*\|\s*string$/.test(t)) return { value: '""' };
  // Arrays
  if (/^Array<.+>$/.test(t) || /\[\]$/.test(t)) return { value: "{[]}" };
  // Function returning a Promise — give a resolved promise so async signatures match.
  if (/=>\s*Promise<.*>/.test(t)) return { value: "{() => Promise.resolve()}" };
  // Function — any signature
  if (/=>\s*(void|undefined|boolean|string|number)/.test(t) || /^\(\)\s*=>/.test(t))
    return { value: "{() => {}}" };
  // Specific named types we know are arrays (`AccordionItem` etc.) won't end up
  // in this fallback because they appear inside `Array<...>` above.
  return null;
}

function buildJsxProps(component) {
  const required = (component.props || []).filter((p) => p.optional !== true);
  const attrs = [];
  let childrenJsx = null;
  for (const p of required) {
    const fixture = fixtureFor(p.type);
    if (!fixture) return { ok: false, missing: p.name };
    // `children` is always nested as JSX children, never as an attribute.
    // For array-children types (e.g. `ReactNode[]`, `Array<ReactNode>`),
    // emit two child expressions so React typing accepts an array.
    if (p.name === "children") {
      const t = normalizeType(p.type);
      const isArray = /^Array<.+>$/.test(t) || /\[\]$/.test(t);
      childrenJsx = isArray ? "{null}{null}" : "{null}";
      continue;
    }
    // ReactNode (non-children) → emit as null inside braces.
    const value = fixture.asChildren ? "{null}" : fixture.value;
    attrs.push(`${p.name}=${value}`);
  }
  return { ok: true, attrs, childrenJsx };
}

function existingTestPath(component) {
  const plural = KIND_TO_PLURAL[component.kind];
  if (!plural) return null;
  return path.join(TESTS_DIR, plural, `${component.name}.test.tsx`);
}

function renderTestFile(name, kindPlural, jsxProps) {
  const attrs = jsxProps.attrs.length ? " " + jsxProps.attrs.join(" ") : "";
  const tag =
    jsxProps.childrenJsx !== null
      ? `<${name}${attrs}>${jsxProps.childrenJsx}</${name}>`
      : `<${name}${attrs} />`;
  return `import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ${name} } from "../../${kindPlural}/${name}";

describe("${name}", () => {
  it("renders without throwing", () => {
    const { container } = render(${tag});
    expect(container.firstChild).toBeDefined();
  });
});
`;
}

function main() {
  if (!fs.existsSync(PROPS_JSON)) {
    console.error(
      `[generate-smoke-tests] missing ${PROPS_JSON}. Run \`npm run extract-props\` first.`,
    );
    process.exit(1);
  }

  const data = readPropsJson();
  const components = data.components || [];

  const stats = {
    total: components.length,
    created: [],
    skippedAlreadyTested: [],
    skippedRequiredProps: [],
    skippedNotRenderable: [],
    skippedUnknownKind: [],
  };

  for (const c of components) {
    const plural = KIND_TO_PLURAL[c.kind];
    if (!plural) {
      stats.skippedUnknownKind.push(c.name);
      continue;
    }

    if (SKIP_SMOKE.has(c.name)) {
      stats.skippedNotRenderable.push(c.name);
      continue;
    }

    const testPath = existingTestPath(c);
    if (testPath && fs.existsSync(testPath)) {
      stats.skippedAlreadyTested.push(c.name);
      continue;
    }

    const jsxProps = hasRequiredProp(c)
      ? buildJsxProps(c)
      : { ok: true, attrs: [], childrenJsx: null };
    if (!jsxProps.ok) {
      stats.skippedRequiredProps.push(`${c.name}(${jsxProps.missing})`);
      continue;
    }

    const sourceAbs = path.join(ROOT, c.file);
    if (!hasValueExport(sourceAbs, c.name)) {
      stats.skippedNotRenderable.push(c.name);
      continue;
    }

    fs.mkdirSync(path.dirname(testPath), { recursive: true });
    fs.writeFileSync(testPath, renderTestFile(c.name, plural, jsxProps), "utf8");
    stats.created.push({ name: c.name, kind: plural, path: testPath });
  }

  // Report
  console.log(`[generate-smoke-tests] components in props.json: ${stats.total}`);
  console.log(`[generate-smoke-tests] tests created:            ${stats.created.length}`);
  console.log(
    `[generate-smoke-tests] skipped (already tested): ${stats.skippedAlreadyTested.length}`,
  );
  console.log(
    `[generate-smoke-tests] skipped (required props): ${stats.skippedRequiredProps.length}`,
  );
  console.log(
    `[generate-smoke-tests] skipped (not renderable): ${stats.skippedNotRenderable.length}`,
  );
  if (stats.skippedUnknownKind.length) {
    console.log(
      `[generate-smoke-tests] skipped (unknown kind):   ${stats.skippedUnknownKind.length}`,
    );
  }

  if (stats.created.length) {
    const byKind = stats.created.reduce((acc, x) => {
      acc[x.kind] = (acc[x.kind] || 0) + 1;
      return acc;
    }, {});
    console.log(`[generate-smoke-tests] created by kind:        `, byKind);
  }

  if (stats.skippedRequiredProps.length) {
    console.log(
      `[generate-smoke-tests] required-prop names:`,
      stats.skippedRequiredProps.join(", "),
    );
  }
  if (stats.skippedNotRenderable.length) {
    console.log(
      `[generate-smoke-tests] not-renderable names:`,
      stats.skippedNotRenderable.join(", "),
    );
  }
}

main();
