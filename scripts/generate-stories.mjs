#!/usr/bin/env node
/**
 * generate-stories.mjs
 *
 * Auto-creates a minimal Storybook story file for every primitive /
 * composite / pattern that lacks one. Idempotent — re-running adds zero
 * new files when everything is covered.
 *
 * Reuses the fixture logic of generate-smoke-tests.mjs to mock required
 * props (string → "", ReactNode → null, Array<*> → [], () => void → noop).
 * Components with required props the fixture cannot synthesize are
 * skipped — their owners must hand-write a richer story.
 *
 * Input:  .ai/props.json
 * Output: ds/<kindPlural>/<Name>/<Name>.stories.tsx
 *
 * Run:    node scripts/generate-stories.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PROPS_JSON = path.join(ROOT, ".ai", "props.json");

const KIND_TO_PLURAL = {
  primitive: "primitives",
  composite: "composites",
  pattern: "patterns",
};
const KIND_TO_TITLE = {
  primitive: "Primitives",
  composite: "Composites",
  pattern: "Patterns",
};

// Components that crash with empty-fixture render (same list as test gen).
const SKIP_STORY = new Set([
  "FormWizard",
  "Calendar",
  "Sidebar",
  // Callbacks with non-void specific return types — fixture cannot synthesize.
  "PullToRefresh", // onRefresh: () => Promise<void>
  "DataTable", // getRowKey: (row) => string
]);

function normalizeType(raw) {
  return (raw ?? "")
    .replace(/import\("[^"]+"\)\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fixtureFor(type) {
  const t = normalizeType(type);
  if (/^(React\.)?ReactNode$/.test(t)) return { value: "{null}", asChildren: true };
  if (t === "string") return { value: '""' };
  if (t === "number") return { value: "{0}" };
  if (t === "boolean") return { value: "{false}" };
  if (t === "Date") return { value: "{new Date()}" };
  if (/^\[number,\s*number\]$/.test(t)) return { value: "{[0, 0]}" };
  if (/^string\s*\|\s*number$/.test(t) || /^number\s*\|\s*string$/.test(t)) return { value: '""' };
  if (/^Array<.+>$/.test(t) || /\[\]$/.test(t)) return { value: "{[]}" };
  if (/=>\s*(void|undefined|boolean|string|number)/.test(t) || /^\(\)\s*=>/.test(t))
    return { value: "{() => {}}" };
  return null;
}

function hasValueExport(sourcePath, name) {
  let src;
  try {
    src = fs.readFileSync(sourcePath, "utf8");
  } catch {
    return false;
  }
  const patterns = [
    new RegExp(`export\\s+const\\s+${name}\\b`),
    new RegExp(`export\\s+function\\s+${name}\\b`),
    new RegExp(`export\\s+class\\s+${name}\\b`),
    new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`),
  ];
  return patterns.some((p) => p.test(src));
}

function buildJsxProps(component) {
  const required = (component.props || []).filter((p) => p.optional !== true);
  const attrs = [];
  let childrenJsx = null;
  for (const p of required) {
    const fixture = fixtureFor(p.type);
    if (!fixture) return { ok: false, missing: p.name };
    // `children` is always nested as JSX children, never as an attribute —
    // even when typed as Array<ReactNode>, since `<X children={...} />` is
    // forbidden by react/no-children-prop.
    if (p.name === "children") {
      const t = normalizeType(p.type);
      const isArray = /^Array<.+>$/.test(t) || /\[\]$/.test(t);
      childrenJsx = isArray ? "{null}{null}" : "{null}";
      continue;
    }
    const value = fixture.asChildren ? "{null}" : fixture.value;
    attrs.push(`${p.name}=${value}`);
  }
  return { ok: true, attrs, childrenJsx };
}

function storyFile(component, jsxProps) {
  const { name, kind } = component;
  const groupTitle = KIND_TO_TITLE[kind];
  const attrs = jsxProps.attrs.length ? " " + jsxProps.attrs.join(" ") : "";
  const tag =
    jsxProps.childrenJsx !== null
      ? `<${name}${attrs}>${jsxProps.childrenJsx}</${name}>`
      : `<${name}${attrs} />`;
  return `import type { Meta, StoryObj } from "@storybook/react";
import { ${name} } from "./${name}";

const meta: Meta<typeof ${name}> = {
  title: "${groupTitle}/${name}",
  component: ${name},
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  render: () => ${tag},
};
`;
}

function main() {
  if (!fs.existsSync(PROPS_JSON)) {
    console.error(`[generate-stories] missing ${PROPS_JSON}. Run \`npm run extract-props\` first.`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(PROPS_JSON, "utf8"));
  const components = data.components || [];

  const stats = {
    total: components.length,
    created: [],
    skippedExisting: [],
    skippedRequired: [],
    skippedNotRenderable: [],
    skippedExplicit: [],
    skippedUnknownKind: [],
  };

  for (const c of components) {
    const plural = KIND_TO_PLURAL[c.kind];
    if (!plural) {
      stats.skippedUnknownKind.push(c.name);
      continue;
    }
    if (SKIP_STORY.has(c.name)) {
      stats.skippedExplicit.push(c.name);
      continue;
    }

    const storyPath = path.join(ROOT, "ds", plural, c.name, `${c.name}.stories.tsx`);
    if (fs.existsSync(storyPath)) {
      stats.skippedExisting.push(c.name);
      continue;
    }

    const sourceAbs = path.join(ROOT, c.file);
    if (!hasValueExport(sourceAbs, c.name)) {
      stats.skippedNotRenderable.push(c.name);
      continue;
    }

    const jsxProps = buildJsxProps(c);
    if (!jsxProps.ok) {
      stats.skippedRequired.push(`${c.name}(${jsxProps.missing})`);
      continue;
    }

    fs.mkdirSync(path.dirname(storyPath), { recursive: true });
    fs.writeFileSync(storyPath, storyFile(c, jsxProps), "utf8");
    stats.created.push({ name: c.name, kind: plural, path: storyPath });
  }

  console.log(`[generate-stories] components in props.json: ${stats.total}`);
  console.log(`[generate-stories] stories created:          ${stats.created.length}`);
  console.log(`[generate-stories] skipped (already has):    ${stats.skippedExisting.length}`);
  console.log(`[generate-stories] skipped (required props): ${stats.skippedRequired.length}`);
  console.log(`[generate-stories] skipped (not renderable): ${stats.skippedNotRenderable.length}`);
  if (stats.skippedExplicit.length) {
    console.log(
      `[generate-stories] skipped (explicit list): ${
        stats.skippedExplicit.length
      } — ${stats.skippedExplicit.join(", ")}`,
    );
  }
  if (stats.created.length) {
    const byKind = stats.created.reduce((acc, x) => {
      acc[x.kind] = (acc[x.kind] || 0) + 1;
      return acc;
    }, {});
    console.log(`[generate-stories] created by kind:        `, byKind);
  }
  if (stats.skippedRequired.length) {
    console.log(`[generate-stories] required-prop names:`, stats.skippedRequired.join(", "));
  }
}

main();
