#!/usr/bin/env node
/**
 * Requirements validator.
 *
 * - For each `requirements/<slug>.md` (skipping `_template.md` / `README.md`):
 *   - Verifies the header has `Slug:`, `Status:`, `Owner:`, `Last updated:`.
 *   - Verifies the required `## ...` sections all exist.
 *   - For every backtick-quoted file path under `## Touched files`, verifies
 *     the file exists on disk (skipping glob patterns).
 * - Validates `requirements/README.md`:
 *   - Every row in the table maps to a real `requirements/<slug>.md`.
 *   - Every requirement file has a corresponding row in the table.
 *
 * Exits with 0 if clean, 1 if any failure.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REQ_DIR = path.join(ROOT, "requirements");

const REQUIRED_HEADER_FIELDS = [
  "Slug:",
  "Status:",
  "Owner:",
  "Last updated:",
];

const REQUIRED_SECTIONS = [
  "## Goal",
  "## Changelog",
];

const RECOMMENDED_SECTIONS = [
  "## Scope",
  "## User stories / acceptance criteria",
  "## Design / behavior notes",
  "## Touched files",
  "## Open questions",
];

/** @type {{ file: string; line?: number; message: string }[]} */
const errors = [];

/** Push an error scoped to a file. */
function err(file, message, line) {
  errors.push({ file, line, message });
}

/** Read a file as text, or empty string if missing. */
function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

/** List requirement files (skipping `_template.md` and `README.md`). */
function listRequirementFiles() {
  return fs
    .readdirSync(REQ_DIR)
    .filter((name) => name.endsWith(".md"))
    .filter((name) => name !== "_template.md" && name !== "README.md")
    .map((name) => path.join(REQ_DIR, name));
}

/** Validate the header block of a requirement file. */
function validateHeader(file, content) {
  const lines = content.split("\n");
  // Look for the lines starting with `- **Foo:**` or simply `Foo:` in first ~10 lines
  const headerRegion = lines.slice(0, 15).join("\n");
  for (const field of REQUIRED_HEADER_FIELDS) {
    if (!headerRegion.includes(field)) {
      err(file, `header missing field: ${field}`);
    }
  }
}

/** Validate that all required sections exist. Recommended sections are warned, not failed. */
function validateSections(file, content) {
  for (const section of REQUIRED_SECTIONS) {
    const re = new RegExp(`^${section.replace(/\//g, "\\/")}(\\b|\\s|$)`, "m");
    if (!re.test(content)) {
      err(file, `missing required section: ${section}`);
    }
  }
  for (const section of RECOMMENDED_SECTIONS) {
    const re = new RegExp(`^${section.replace(/\//g, "\\/")}(\\b|\\s|$)`, "m");
    if (!re.test(content)) {
      console.warn(`  warn: ${path.relative(process.cwd(), file)} — recommended section missing: ${section}`);
    }
  }
}

/** Extract the body of a top-level section by heading. Returns "" if absent. */
function extractSection(content, heading) {
  const lines = content.split("\n");
  const re = new RegExp(`^${heading.replace(/\//g, "\\/")}(\\b|\\s|$)`);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return "";
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

/** Validate that backtick-quoted paths under `## Touched files` exist. */
function validateTouchedFiles(file, content) {
  const body = extractSection(content, "## Touched files");
  if (!body.trim()) {
    // Already reported by validateSections if section is missing entirely.
    return;
  }
  const lines = body.split("\n");
  for (const rawLine of lines) {
    const trimmed = rawLine.trimStart();
    if (!trimmed.startsWith("- ")) continue;
    // Find the first backtick-quoted token. Path entries are of the form:
    //   - `path/to/file.tsx` — comment...
    //   - `path/to/dir/`
    const backtickRe = /`([^`]+)`/;
    const match = trimmed.match(backtickRe);
    if (!match) continue;
    const target = match[1].trim();
    // Skip glob patterns and angle-bracket placeholders.
    if (target.includes("*")) continue;
    if (target.includes("<") || target.includes(">")) continue;
    // Strip a trailing slash (directory references).
    const rel = target.replace(/\/$/, "");
    const abs = path.resolve(ROOT, rel);
    if (!fs.existsSync(abs)) {
      err(file, `Touched files entry does not exist on disk: ${target}`);
    }
  }
}

/** Validate `requirements/README.md` table <-> file system bijection. */
function validateIndex(reqFiles) {
  const indexPath = path.join(REQ_DIR, "README.md");
  const content = read(indexPath);
  if (!content) {
    err(indexPath, "README.md is missing or empty");
    return;
  }
  // Collect slugs from table rows. The format is:
  //   | [`slug`](./slug.md) | status | summary |
  const rowRe = /^\|\s*\[`([^`]+)`\]\(\.\/([^)]+)\)\s*\|/gm;
  /** @type {Set<string>} */
  const tableSlugs = new Set();
  let m;
  while ((m = rowRe.exec(content)) !== null) {
    const slug = m[1];
    const target = m[2];
    tableSlugs.add(slug);
    const expected = `${slug}.md`;
    if (target !== expected) {
      err(
        indexPath,
        `table row slug \`${slug}\` links to \`${target}\` (expected \`${expected}\`)`,
      );
    }
    const abs = path.join(REQ_DIR, target);
    if (!fs.existsSync(abs)) {
      err(indexPath, `table row links to missing file: ${target}`);
    }
  }

  const fileSlugs = new Set(
    reqFiles.map((f) => path.basename(f, ".md")),
  );

  for (const slug of fileSlugs) {
    if (!tableSlugs.has(slug)) {
      err(indexPath, `requirement file has no row in README table: ${slug}.md`);
    }
  }
  for (const slug of tableSlugs) {
    if (!fileSlugs.has(slug)) {
      err(indexPath, `README table row has no matching file: ${slug}.md`);
    }
  }
}

function main() {
  if (!fs.existsSync(REQ_DIR)) {
    console.error(`requirements directory not found: ${REQ_DIR}`);
    process.exit(1);
  }

  const reqFiles = listRequirementFiles();
  for (const file of reqFiles) {
    const content = read(file);
    validateHeader(file, content);
    validateSections(file, content);
    validateTouchedFiles(file, content);
  }
  validateIndex(reqFiles);

  if (errors.length === 0) {
    console.log(
      `PASS  validate-requirements — ${reqFiles.length} requirement file(s) clean.`,
    );
    process.exit(0);
  }

  console.log(
    `FAIL  validate-requirements — ${errors.length} error(s) across ${
      new Set(errors.map((e) => e.file)).size
    } file(s):`,
  );
  for (const e of errors) {
    const rel = path.relative(ROOT, e.file);
    const where = e.line ? `${rel}:${e.line}` : rel;
    console.log(`  - ${where} — ${e.message}`);
  }
  process.exit(1);
}

main();
