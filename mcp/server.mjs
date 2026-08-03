#!/usr/bin/env node
//
// MCP server for the JunDS design system.
//
// Exposes the existing project scripts as MCP tools so that MCP-aware clients
// (Claude Code, Cursor, …) can call them directly without going through the
// shell. Each tool simply shells out to the matching `npm run …` script via
// `child_process.spawn` (array-form args, never `exec`) so user-supplied input
// can never be interpreted by a shell.
//
// Run standalone for debugging:
//   node mcp/server.mjs

import { spawn } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ─────────────────────────── paths ───────────────────────────

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PROPS_JSON_PATH = path.join(repoRoot, ".ai", "props.json");
const A11Y_JSON_PATH = path.join(repoRoot, ".ai", "a11y.json");
const BUNDLE_JSON_PATH = path.join(repoRoot, ".ai", "bundle.json");
const DEPS_JSON_PATH = path.join(repoRoot, ".ai", "deps.json");
const SCREENSHOTS_JSON_PATH = path.join(repoRoot, ".ai", "screenshots.json");
const RECIPES_DIR = path.join(repoRoot, ".ai", "recipes");
const REQUIREMENTS_DIR = path.join(repoRoot, "requirements");
const HOOKS_DIR = path.join(repoRoot, "ds", "hooks");
const HOOKS_INDEX_PATH = path.join(HOOKS_DIR, "index.ts");

// Match `npm` whether invoked from a terminal or stdio (.cmd on Windows).
const NPM_BIN = process.platform === "win32" ? "npm.cmd" : "npm";

// ─────────────────────── input validators ────────────────────────

// Allow only the kinds the scaffold script understands. `requirement` is
// intentionally accepted because `scripts/scaffold.mjs` supports it.
const KIND_SCHEMA = z.enum(["primitive", "composite", "pattern", "requirement"]);

// Locate `--type` whitelist mirrors AGENTS.md. We accept the documented
// values plus `file` (its broadest value).
const LOCATE_TYPE_SCHEMA = z
  .enum([
    "requirement",
    "primitive",
    "composite",
    "hook",
    "token",
    "test",
    "page",
    "data",
    "config",
    "asset",
    "file",
  ])
  .optional();

// Component / requirement names: defensive regex matching what the existing
// scripts already enforce (PascalCase or kebab-case identifiers). Rejecting
// shell metacharacters here is belt-and-suspenders — `spawn` with an args
// array is already shell-safe — but it gives clearer error messages.
const COMPONENT_NAME_SCHEMA = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z][A-Za-z0-9]*$/, "must be PascalCase / alphanumeric");

const SLUG_SCHEMA = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case (lowercase, hyphens)");

// Locate query: accept anything non-empty without shell metacharacters.
// We pass it as a single argv item so spaces are fine; we only ban control
// chars and shell-significant punctuation as a courtesy.
const LOCATE_QUERY_SCHEMA = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[^`$;|&<>\\\n\r\t\0]+$/, "contains forbidden characters");

const KEYWORDS_SCHEMA = z
  .string()
  .max(400)
  .regex(/^[A-Za-z0-9 ,_\-]*$/, "must be comma-separated alphanumeric tokens")
  .optional();

// ─────────────────────── helpers ────────────────────────

/**
 * Run a command via spawn (array form, never a shell). Returns
 * `{ ok, code, stdout, stderr }`.
 */
function runCommand(cmd, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: repoRoot,
      env: process.env,
      shell: false,
      ...options,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      resolve({
        ok: false,
        code: null,
        stdout,
        stderr: stderr + (stderr ? "\n" : "") + `spawn error: ${err.message}`,
      });
    });

    child.on("close", (code) => {
      resolve({ ok: code === 0, code, stdout, stderr });
    });
  });
}

/** Format a structured error payload as an MCP tool result. */
function errorResult(summary, details = {}) {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify({ ok: false, error: summary, ...details }, null, 2),
      },
    ],
  };
}

/** Format a structured success payload. */
function successResult(payload) {
  return {
    content: [
      {
        type: "text",
        text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2),
      },
    ],
  };
}

/** Read a UTF-8 file, returning null if absent. */
async function readMaybe(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Read and parse a JSON artifact. Returns one of:
 *   { ok: true, data }                                   — parsed successfully
 *   { ok: false, missing: true }                          — file does not exist
 *   { ok: false, missing: false, reason: "..." }         — file exists but failed to parse
 */
async function readJson(filePath) {
  const raw = await readMaybe(filePath);
  if (raw === null) {
    return { ok: false, missing: true };
  }
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch (err) {
    return { ok: false, missing: false, reason: err.message };
  }
}

/** Pull a "Title: Foo" / "**Status:** shipped" style frontmatter field. */
function extractField(markdown, label) {
  // Tolerate any combination of leading list markers, asterisks, and
  // backticks around both the label and the value:
  //   - **Status:** shipped
  //   * **Owner:** Junha (foo@bar)
  //     Slug: `theming`
  const re = new RegExp(
    `^[\\s>*\\-]*\\*{0,2}\\s*${label}\\s*\\*{0,2}\\s*:\\s*\\*{0,2}\\s*\`?([^\`\\n]+?)\`?\\s*\\*{0,2}\\s*$`,
    "im",
  );
  const m = markdown.match(re);
  return m ? m[1].trim() : null;
}

/** First non-empty H1 in a markdown doc. */
function extractTitle(markdown) {
  const m = markdown.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

// ─────────────────────── tool: locate ────────────────────────

async function toolLocate({ query, type }) {
  const args = ["run", "--silent", "locate", "--", query, "--json"];
  if (type) args.push("--type", type);

  const res = await runCommand(NPM_BIN, args);

  // `locate` exits non-zero when there are zero matches even though the
  // query was well-formed, so try to parse stdout regardless.
  let parsed = null;
  if (res.stdout.trim()) {
    try {
      parsed = JSON.parse(res.stdout);
    } catch {
      // fall through
    }
  }

  if (parsed) {
    return successResult({ ok: true, ...parsed });
  }

  if (!res.ok) {
    return errorResult("locate failed", {
      exitCode: res.code,
      stderr: res.stderr.trim(),
      stdout: res.stdout.trim(),
    });
  }

  return successResult({ ok: true, query, count: 0, results: [] });
}

// ─────────────────────── tool: map_refresh ────────────────────────

async function toolMapRefresh() {
  const res = await runCommand(NPM_BIN, ["run", "--silent", "map"]);
  if (!res.ok) {
    return errorResult("map regeneration failed", {
      exitCode: res.code,
      stderr: res.stderr.trim(),
      stdout: res.stdout.trim(),
    });
  }
  return successResult({
    ok: true,
    message: "Regenerated .ai/MAP.md",
    path: path.join(repoRoot, ".ai", "MAP.md"),
    stdout: res.stdout.trim(),
  });
}

// ─────────────────────── tool: extract_props ────────────────────────

async function toolExtractProps() {
  const res = await runCommand(NPM_BIN, ["run", "--silent", "extract-props"]);
  if (!res.ok) {
    return errorResult("extract-props failed", {
      exitCode: res.code,
      stderr: res.stderr.trim(),
      stdout: res.stdout.trim(),
    });
  }
  return successResult({
    ok: true,
    message: "Regenerated .ai/props.json",
    path: PROPS_JSON_PATH,
    stdout: res.stdout.trim(),
  });
}

// ─────────────────────── tool: get_component_props ────────────────────────

async function toolGetComponentProps({ name }) {
  const raw = await readMaybe(PROPS_JSON_PATH);
  if (raw === null) {
    return errorResult(".ai/props.json is missing — run extract_props first", {
      path: PROPS_JSON_PATH,
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return errorResult("could not parse .ai/props.json", {
      reason: err.message,
    });
  }

  const components = Array.isArray(parsed?.components) ? parsed.components : [];
  const lower = name.toLowerCase();
  const entry = components.find(
    (c) => typeof c?.name === "string" && c.name.toLowerCase() === lower,
  );

  if (!entry) {
    return errorResult(`component "${name}" not found in props.json`, {
      hint: "Try one of the registered component names.",
      available: components.slice(0, 50).map((c) => c.name),
      total: components.length,
    });
  }

  return successResult({ ok: true, component: entry });
}

// ─────────────────────── tool: list_recipes ────────────────────────

async function toolListRecipes() {
  let entries;
  try {
    entries = await readdir(RECIPES_DIR);
  } catch (err) {
    if (err.code === "ENOENT") {
      return successResult({
        ok: true,
        path: RECIPES_DIR,
        recipes: [],
        note: ".ai/recipes/ does not exist yet",
      });
    }
    return errorResult("could not list recipes", { reason: err.message });
  }

  const recipes = [];
  for (const file of entries) {
    if (!file.endsWith(".md")) continue;
    const slug = file.slice(0, -3);
    const full = path.join(RECIPES_DIR, file);
    let title = null;
    try {
      const content = await readFile(full, "utf8");
      title = extractTitle(content) ?? slug;
    } catch {
      title = slug;
    }
    recipes.push({ slug, title, path: full });
  }
  recipes.sort((a, b) => a.slug.localeCompare(b.slug));

  return successResult({ ok: true, count: recipes.length, recipes });
}

// ─────────────────────── tool: read_recipe ────────────────────────

async function toolReadRecipe({ slug }) {
  const full = path.join(RECIPES_DIR, `${slug}.md`);
  // Defensive: ensure no traversal even though slug is regex-validated.
  if (!full.startsWith(RECIPES_DIR + path.sep)) {
    return errorResult("invalid slug");
  }
  const content = await readMaybe(full);
  if (content === null) {
    return errorResult(`recipe "${slug}" not found`, { path: full });
  }
  return successResult({
    ok: true,
    slug,
    path: full,
    title: extractTitle(content) ?? slug,
    content,
  });
}

// ─────────────────────── tool: scaffold ────────────────────────

async function toolScaffold({ kind, name, keywords }) {
  // Component kinds want PascalCase; requirements want kebab-case. The
  // scaffold script enforces this itself, but we double-check here so we
  // can return a clean MCP error instead of a script crash.
  if (kind === "requirement") {
    const slugCheck = SLUG_SCHEMA.safeParse(name);
    if (!slugCheck.success) {
      return errorResult("requirement names must be kebab-case", {
        name,
        issues: slugCheck.error.issues,
      });
    }
  } else {
    const compCheck = COMPONENT_NAME_SCHEMA.safeParse(name);
    if (!compCheck.success) {
      return errorResult("component names must be PascalCase", {
        name,
        issues: compCheck.error.issues,
      });
    }
  }

  const args = ["run", "--silent", "scaffold", "--", kind, name];
  if (keywords && keywords.length > 0) {
    args.push("--keywords", keywords);
  }

  const res = await runCommand(NPM_BIN, args);
  if (!res.ok) {
    return errorResult("scaffold failed", {
      exitCode: res.code,
      stderr: res.stderr.trim(),
      stdout: res.stdout.trim(),
    });
  }
  return successResult({
    ok: true,
    kind,
    name,
    keywords: keywords ?? null,
    stdout: res.stdout.trim(),
  });
}

// ─────────────────────── tool: list_requirements ────────────────────────

async function toolListRequirements() {
  let entries;
  try {
    entries = await readdir(REQUIREMENTS_DIR);
  } catch (err) {
    return errorResult("could not list requirements", { reason: err.message });
  }

  const reqs = [];
  for (const file of entries) {
    if (!file.endsWith(".md")) continue;
    if (file.startsWith("_")) continue; // skip _template.md
    if (file.toLowerCase() === "readme.md") continue;
    const slug = file.slice(0, -3);
    const full = path.join(REQUIREMENTS_DIR, file);
    let status = null;
    let title = null;
    try {
      const content = await readFile(full, "utf8");
      status = extractField(content, "Status");
      title = extractTitle(content);
    } catch {
      // ignore — we'll still report the slug
    }
    reqs.push({ slug, title, status, path: full });
  }
  reqs.sort((a, b) => a.slug.localeCompare(b.slug));

  return successResult({ ok: true, count: reqs.length, requirements: reqs });
}

// ─────────────────────── tool: read_requirement ────────────────────────

async function toolReadRequirement({ slug }) {
  const full = path.join(REQUIREMENTS_DIR, `${slug}.md`);
  if (!full.startsWith(REQUIREMENTS_DIR + path.sep)) {
    return errorResult("invalid slug");
  }
  const content = await readMaybe(full);
  if (content === null) {
    return errorResult(`requirement "${slug}" not found`, { path: full });
  }
  return successResult({
    ok: true,
    slug,
    path: full,
    title: extractTitle(content),
    status: extractField(content, "Status"),
    owner: extractField(content, "Owner"),
    content,
  });
}

// ─────────────────────── tool: list_hooks ────────────────────────

/** Pull the first JSDoc block sitting immediately above a named export. */
function extractHookDescription(source, hookName) {
  // Match an `export function <name>` or `export const <name>` declaration
  // and capture the JSDoc block (`/** ... */`) directly above it.
  const re = new RegExp(
    `/\\*\\*([\\s\\S]*?)\\*/\\s*(?:export\\s+(?:function|const|async\\s+function))\\s+${hookName}\\b`,
    "m",
  );
  const m = source.match(re);
  if (!m) return null;
  // Strip leading "*" and whitespace from each line, then take the first
  // non-empty line as the description (mirrors how editors render JSDoc).
  const lines = m[1]
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("@")) break;
    if (line) return line;
  }
  return null;
}

async function toolListHooks() {
  const indexSrc = await readMaybe(HOOKS_INDEX_PATH);
  if (indexSrc === null) {
    return errorResult("ds/hooks/index.ts is missing", {
      path: HOOKS_INDEX_PATH,
    });
  }

  // Capture the named hook exports from the barrel. We look for
  //   export { useFoo, useBar } from "./useFoo";
  // and pull every identifier that starts with "use".
  const names = new Set();
  const re = /export\s*\{([^}]+)\}\s*from/g;
  let match;
  while ((match = re.exec(indexSrc)) !== null) {
    for (const segment of match[1].split(",")) {
      const ident = segment
        .trim()
        .split(/\s+as\s+/i)[0]
        ?.trim();
      if (ident && /^use[A-Z][A-Za-z0-9]*$/.test(ident)) {
        names.add(ident);
      }
    }
  }

  const hooks = [];
  for (const name of [...names].sort((a, b) => a.localeCompare(b))) {
    const filePath = path.join(HOOKS_DIR, `${name}.ts`);
    let description = null;
    const src = await readMaybe(filePath);
    if (src) {
      description = extractHookDescription(src, name);
    }
    hooks.push({ name, description });
  }

  return successResult({ ok: true, count: hooks.length, hooks });
}

// ─────────────────────── tool: get_a11y ────────────────────────

async function toolGetA11y({ name } = {}) {
  const res = await readJson(A11Y_JSON_PATH);
  if (!res.ok) {
    if (res.missing) {
      return errorResult(".ai/a11y.json is missing — run the a11y script first", {
        path: A11Y_JSON_PATH,
      });
    }
    return errorResult("could not parse .ai/a11y.json", { reason: res.reason });
  }

  const data = res.data ?? {};
  const components = Array.isArray(data.components) ? data.components : [];

  if (name) {
    const lower = name.toLowerCase();
    const entry = components.find(
      (c) => typeof c?.name === "string" && c.name.toLowerCase() === lower,
    );
    if (!entry) {
      return errorResult(`component "${name}" not found in a11y.json`, {
        total: components.length,
      });
    }
    return successResult({
      ok: true,
      name: entry.name,
      kind: entry.kind ?? null,
      violations: Array.isArray(entry.violations) ? entry.violations : [],
      error: entry.error ?? null,
    });
  }

  const withViolations = components.filter(
    (c) => Array.isArray(c?.violations) && c.violations.length > 0,
  );

  return successResult({
    ok: true,
    generatedAt: data.generatedAt ?? null,
    tooling: data.tooling ?? null,
    summary: data.summary ?? null,
    componentsWithViolations: withViolations,
  });
}

// ─────────────────────── tool: get_bundle_info ────────────────────────

async function toolGetBundleInfo({ name } = {}) {
  const res = await readJson(BUNDLE_JSON_PATH);
  if (!res.ok) {
    if (res.missing) {
      return errorResult(".ai/bundle.json is missing — run the bundle script first", {
        path: BUNDLE_JSON_PATH,
      });
    }
    return errorResult("could not parse .ai/bundle.json", {
      reason: res.reason,
    });
  }

  const data = res.data ?? {};
  const components = Array.isArray(data.components) ? data.components : [];

  if (name) {
    const lower = name.toLowerCase();
    const entry = components.find(
      (c) => typeof c?.name === "string" && c.name.toLowerCase() === lower,
    );
    if (!entry) {
      return errorResult(`component "${name}" not found in bundle.json`, {
        total: components.length,
      });
    }
    return successResult({
      ok: true,
      name: entry.name,
      kind: entry.kind ?? null,
      file: entry.file ?? null,
      rawBytes: entry.rawBytes ?? null,
      gzipBytes: entry.gzipBytes ?? null,
    });
  }

  const top10 = [...components]
    .filter((c) => typeof c?.gzipBytes === "number")
    .sort((a, b) => (b.gzipBytes ?? 0) - (a.gzipBytes ?? 0))
    .slice(0, 10)
    .map((c) => ({
      name: c.name,
      kind: c.kind ?? null,
      rawBytes: c.rawBytes ?? null,
      gzipBytes: c.gzipBytes ?? null,
    }));

  return successResult({
    ok: true,
    generatedAt: data.generatedAt ?? null,
    mode: data.mode ?? null,
    totals: data.totals ?? null,
    top10ByGzip: top10,
  });
}

// ─────────────────────── tool: get_deps_for ────────────────────────

async function toolGetDepsFor({ name }) {
  const res = await readJson(DEPS_JSON_PATH);
  if (!res.ok) {
    if (res.missing) {
      return errorResult(".ai/deps.json is missing — run the deps script first", {
        path: DEPS_JSON_PATH,
      });
    }
    return errorResult("could not parse .ai/deps.json", { reason: res.reason });
  }

  const graph = res.data?.graph ?? {};
  // Case-insensitive match to be friendly to callers who pascalCase wrong.
  const lower = name.toLowerCase();
  const matchedKey = Object.keys(graph).find((key) => key.toLowerCase() === lower);
  if (!matchedKey) {
    return errorResult(`component "${name}" not found in deps.json`, {
      total: Object.keys(graph).length,
    });
  }

  const entry = graph[matchedKey] ?? {};
  return successResult({
    ok: true,
    name: matchedKey,
    kind: entry.kind ?? null,
    file: entry.file ?? null,
    imports: Array.isArray(entry.imports) ? entry.imports : [],
    importedBy: Array.isArray(entry.importedBy) ? entry.importedBy : [],
  });
}

// ─────────────────────── tool: get_screenshot_info ────────────────────────

async function toolGetScreenshotInfo({ name } = {}) {
  const res = await readJson(SCREENSHOTS_JSON_PATH);
  if (!res.ok) {
    if (res.missing) {
      return errorResult(".ai/screenshots.json is missing — run the screenshots script first", {
        path: SCREENSHOTS_JSON_PATH,
      });
    }
    return errorResult("could not parse .ai/screenshots.json", {
      reason: res.reason,
    });
  }

  const data = res.data ?? {};
  // Tolerate either a `components` array or a `shots` keyed map — whichever
  // the screenshot script ends up writing.
  const components = Array.isArray(data.components)
    ? data.components
    : Array.isArray(data.shots)
    ? data.shots
    : [];

  if (name) {
    const lower = name.toLowerCase();
    const entry = components.find(
      (c) => typeof c?.name === "string" && c.name.toLowerCase() === lower,
    );
    if (!entry) {
      return errorResult(`component "${name}" not found in screenshots.json`, {
        total: components.length,
      });
    }
    return successResult({ ok: true, entry });
  }

  return successResult({
    ok: true,
    generatedAt: data.generatedAt ?? null,
    summary: data.summary ?? null,
    count: components.length,
    components,
  });
}

// ─────────────────────── server wiring ────────────────────────

const server = new McpServer({
  name: "junds",
  version: "0.1.0",
});

server.registerTool(
  "locate",
  {
    title: "locate",
    description:
      "Rank source files by relevance to a free-form query. Wraps `npm run locate -- <query> [--type <type>] --json`. Use this instead of broad glob/grep when looking for a concept.",
    inputSchema: {
      query: LOCATE_QUERY_SCHEMA.describe(
        'Free-form search query (e.g. "button variants", "Toast").',
      ),
      type: LOCATE_TYPE_SCHEMA.describe(
        'Optional locate "--type" filter (requirement / primitive / composite / hook / token / test / page / data / config / asset / file).',
      ),
    },
  },
  toolLocate,
);

server.registerTool(
  "map_refresh",
  {
    title: "map_refresh",
    description:
      "Regenerate `.ai/MAP.md`, the flat inventory of every important file. Run this after structural changes (adding/renaming/moving files under ds/, app/, requirements/).",
    inputSchema: {},
  },
  toolMapRefresh,
);

server.registerTool(
  "extract_props",
  {
    title: "extract_props",
    description:
      "Regenerate `.ai/props.json` (TypeScript-derived prop tables for every JunDS component). Returns the path of the refreshed file.",
    inputSchema: {},
  },
  toolExtractProps,
);

server.registerTool(
  "get_component_props",
  {
    title: "get_component_props",
    description:
      "Look up a single component's prop table from `.ai/props.json` without shelling out. Case-insensitive name match.",
    inputSchema: {
      name: COMPONENT_NAME_SCHEMA.describe(
        'PascalCase component name, e.g. "Button", "Modal", "DataTable".',
      ),
    },
  },
  toolGetComponentProps,
);

server.registerTool(
  "list_recipes",
  {
    title: "list_recipes",
    description:
      "List every recipe under `.ai/recipes/`. Returns each recipe's slug, title (from H1), and absolute path.",
    inputSchema: {},
  },
  toolListRecipes,
);

server.registerTool(
  "read_recipe",
  {
    title: "read_recipe",
    description: "Return the full markdown body of `.ai/recipes/<slug>.md`.",
    inputSchema: {
      slug: SLUG_SCHEMA.describe("Recipe slug (file name without .md)."),
    },
  },
  toolReadRecipe,
);

server.registerTool(
  "scaffold",
  {
    title: "scaffold",
    description:
      "Scaffold a new primitive / composite / pattern component or a new requirement file. Wraps `npm run scaffold <kind> <name> [--keywords ...]`.",
    inputSchema: {
      kind: KIND_SCHEMA.describe(
        "What to scaffold: primitive | composite | pattern | requirement.",
      ),
      name: z
        .string()
        .min(1)
        .max(80)
        .describe(
          'PascalCase for components (e.g. "Modal"), kebab-case for requirements (e.g. "theming").',
        ),
      keywords: KEYWORDS_SCHEMA.describe(
        'Optional comma-separated keywords used to seed the showcase search dictionary, e.g. "modal,dialog,overlay".',
      ),
    },
  },
  toolScaffold,
);

server.registerTool(
  "list_requirements",
  {
    title: "list_requirements",
    description:
      "List every spec under `requirements/*.md`. Returns slug, H1 title, status (parsed from frontmatter), and absolute path. Skips `_template.md` and `README.md`.",
    inputSchema: {},
  },
  toolListRequirements,
);

server.registerTool(
  "read_requirement",
  {
    title: "read_requirement",
    description:
      "Return the full markdown body of `requirements/<slug>.md`, plus parsed title / status / owner.",
    inputSchema: {
      slug: SLUG_SCHEMA.describe('Requirement slug, e.g. "theming" or "agent-onboarding".'),
    },
  },
  toolReadRequirement,
);

server.registerTool(
  "list_hooks",
  {
    title: "list_hooks",
    description:
      "List every hook re-exported from `ds/hooks/index.ts` along with the leading JSDoc description from `ds/hooks/<name>.ts`.",
    inputSchema: {},
  },
  toolListHooks,
);

server.registerTool(
  "get_a11y",
  {
    title: "get_a11y",
    description:
      "Return axe-core a11y data from `.ai/a11y.json`. With `name`, returns that component's violations. Without, returns the run summary plus the list of components that have any violations.",
    inputSchema: {
      name: COMPONENT_NAME_SCHEMA.optional().describe(
        "Optional PascalCase component name. Omit to get the summary view.",
      ),
    },
  },
  toolGetA11y,
);

server.registerTool(
  "get_bundle_info",
  {
    title: "get_bundle_info",
    description:
      "Return bundle-size data from `.ai/bundle.json`. With `name`, returns that component's `{ rawBytes, gzipBytes }`. Without, returns totals plus the top 10 components by gzip size.",
    inputSchema: {
      name: COMPONENT_NAME_SCHEMA.optional().describe(
        "Optional PascalCase component name. Omit to get the top-10 view.",
      ),
    },
  },
  toolGetBundleInfo,
);

server.registerTool(
  "get_deps_for",
  {
    title: "get_deps_for",
    description:
      "Return one component's `{ kind, imports, importedBy }` entry from `.ai/deps.json`.",
    inputSchema: {
      name: COMPONENT_NAME_SCHEMA.describe(
        'PascalCase component name, e.g. "Button", "DataTable".',
      ),
    },
  },
  toolGetDepsFor,
);

server.registerTool(
  "get_screenshot_info",
  {
    title: "get_screenshot_info",
    description:
      "Return screenshot manifest data from `.ai/screenshots.json`. With `name`, returns that component's screenshot entry. Without, returns the full manifest summary.",
    inputSchema: {
      name: COMPONENT_NAME_SCHEMA.optional().describe(
        "Optional PascalCase component name. Omit to get the manifest summary.",
      ),
    },
  },
  toolGetScreenshotInfo,
);

// ─────────────── runtime (PageDoc) tools ───────────────

let runtimeModPromise = null;

/** dist/runtime.mjs 를 지연 로드한다 — 빌드 산출물이 없으면 안내와 함께 실패. */
function loadRuntime() {
  if (!runtimeModPromise) {
    runtimeModPromise = import(
      pathToFileURL(path.join(repoRoot, "dist", "runtime.mjs")).href
    ).catch((err) => {
      runtimeModPromise = null;
      throw new Error(
        `dist/runtime.mjs unavailable — run \`npm run build:lib\` first (${err?.message ?? err})`,
      );
    });
  }
  return runtimeModPromise;
}

function findNodeById(nodes, nodeId) {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.slots) {
      for (const children of Object.values(node.slots)) {
        const hit = findNodeById(children, nodeId);
        if (hit) return hit;
      }
    }
  }
  return null;
}

async function toolValidatePageDoc({ doc }) {
  let runtime;
  try {
    runtime = await loadRuntime();
  } catch (err) {
    return errorResult(err.message);
  }

  let parsed;
  try {
    parsed = JSON.parse(doc);
  } catch (err) {
    return errorResult("doc is not valid JSON", { reason: err.message });
  }

  const result = runtime.safeParsePageDoc(parsed);
  if (result.ok) {
    return successResult({ ok: true, id: result.doc.id, route: result.doc.route });
  }
  return errorResult("PageDoc validation failed", { reason: result.error.message });
}

async function toolApplyPagePatch({ doc, nodeId, patch }) {
  let runtime;
  try {
    runtime = await loadRuntime();
  } catch (err) {
    return errorResult(err.message);
  }

  let parsedDoc;
  let parsedPatch;
  try {
    parsedDoc = JSON.parse(doc);
    parsedPatch = JSON.parse(patch);
  } catch (err) {
    return errorResult("doc/patch is not valid JSON", { reason: err.message });
  }

  let validPatch;
  try {
    validPatch = runtime.parseNodePatch(parsedPatch);
  } catch (err) {
    return errorResult("patch failed NodePatch validation", { reason: err.message });
  }

  const before = runtime.safeParsePageDoc(parsedDoc);
  if (!before.ok) {
    return errorResult("input doc failed PageDoc validation", {
      reason: before.error.message,
    });
  }

  const nextDoc = structuredClone(before.doc);
  const target = findNodeById(nextDoc.tree, nodeId);
  if (!target) {
    return errorResult(`node not found: ${nodeId}`);
  }
  Object.assign(target, validPatch);

  const after = runtime.safeParsePageDoc(nextDoc);
  if (!after.ok) {
    return errorResult("patched doc failed PageDoc validation", {
      reason: after.error.message,
    });
  }

  return successResult({ ok: true, doc: after.doc });
}

server.registerTool(
  "validate_page_doc",
  {
    title: "validate_page_doc",
    description:
      "Validate a PageDoc JSON string against the ds/runtime schema. Returns ok or a human-readable error path (e.g. `tree[2].props.variant`). Requires `npm run build:lib` once.",
    inputSchema: {
      doc: z.string().min(2).describe("PageDoc as a JSON string."),
    },
  },
  toolValidatePageDoc,
);

server.registerTool(
  "apply_page_patch",
  {
    title: "apply_page_patch",
    description:
      "Apply a partial NodePatch to one node of a PageDoc (by node id), re-validate the whole doc, and return the patched doc. Patch and doc are JSON strings.",
    inputSchema: {
      doc: z.string().min(2).describe("PageDoc as a JSON string."),
      nodeId: z.string().min(1).describe("`id` of the tree node to patch."),
      patch: z.string().min(2).describe("Partial Node fields as a JSON string."),
    },
  },
  toolApplyPagePatch,
);

// ─────────────────────── main ────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // The transport keeps the process alive on stdin; nothing else to do.
}

main().catch((err) => {
  // Use stderr so we don't poison the JSON-RPC stream on stdout.
  process.stderr.write(`junds-mcp fatal: ${err?.stack ?? err}\n`);
  process.exit(1);
});
