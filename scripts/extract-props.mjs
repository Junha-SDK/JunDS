#!/usr/bin/env node
//
// Extracts the public props interface for every component under
// `ds/primitives/`, `ds/composites/`, and `ds/patterns/` and writes a single
// JSON catalog at `.ai/props.json`.
//
// AI agents (and future tooling like the showcase) can consume this file as
// the single source of truth for component APIs, instead of parsing the TS
// source themselves or relying on hand-written `props={[...]}` arrays that
// drift from reality.
//
// Run:  node scripts/extract-props.mjs

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(repoRoot, ".ai");
const outFile = path.join(outDir, "props.json");
const cacheFile = path.join(outDir, ".props-cache.json");

/**
 * Read the current package version once at startup. Used as a sensible default
 * for `@since` if a component's leading JSDoc forgets it but is otherwise
 * present. We deliberately leave `status`/`since`/`tags` undefined when a
 * component has no leading JSDoc at all, so the source remains the source of
 * truth.
 */
async function readPackageVersion() {
  const raw = await readFile(path.join(repoRoot, "package.json"), "utf8");
  try {
    return JSON.parse(raw).version ?? null;
  } catch {
    return null;
  }
}

const KINDS = [
  { kind: "primitive", root: "ds/primitives" },
  { kind: "composite", root: "ds/composites" },
  { kind: "pattern", root: "ds/patterns" },
];

const SKIP_DIRS = new Set([".git", "node_modules", "dist", ".next", "coverage"]);

/** Recursively collect files under a directory (subdirs walked in parallel). */
async function walk(absRoot) {
  const out = [];
  async function recur(abs) {
    let entries;
    try {
      entries = await readdir(abs, { withFileTypes: true });
    } catch {
      return;
    }
    const subdirs = [];
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name)) continue;
      const next = path.join(abs, e.name);
      if (e.isDirectory()) subdirs.push(next);
      else if (e.isFile()) out.push(next);
    }
    await Promise.all(subdirs.map(recur));
  }
  await recur(absRoot);
  return out;
}

async function dirExists(p) {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * For a kind/root pair, find every component entry file:
 *   `<root>/<Name>/<Name>.tsx`
 * skipping tests, stories, and barrels.
 */
async function discoverComponents(kind, root) {
  const absRoot = path.join(repoRoot, root);
  if (!(await dirExists(absRoot))) return [];

  const files = await walk(absRoot);
  const out = [];
  for (const abs of files) {
    if (!abs.endsWith(".tsx")) continue;
    if (abs.endsWith(".test.tsx") || abs.endsWith(".stories.tsx")) continue;

    const base = path.basename(abs, ".tsx");
    if (!/^[A-Z]/.test(base)) continue; // PascalCase only
    if (base.includes(".")) continue; // skip Foo.types.tsx etc.

    const parent = path.basename(path.dirname(abs));
    if (parent !== base) continue; // require Name/Name.tsx folder convention

    out.push({
      kind,
      name: base,
      file: path.relative(repoRoot, abs).split(path.sep).join("/"),
      abs,
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/**
 * Locate the props interface symbol for a component. The repo convention is
 * `<Name>Props`; it can live in the same `.tsx` file or in a sibling
 * `<Name>.types.ts` / `.tsx`. We probe all three.
 */
function findPropsSymbol(program, checker, component) {
  const candidates = [
    component.abs,
    component.abs.replace(/\.tsx$/, ".types.ts"),
    component.abs.replace(/\.tsx$/, ".types.tsx"),
  ];
  const wanted = `${component.name}Props`;

  for (const candidate of candidates) {
    const sf = program.getSourceFile(candidate);
    if (!sf) continue;

    // Look for an exported interface or type alias declaration with the
    // expected name. Interfaces are the dominant style; type aliases are
    // supported as a fallback (we only emit own members in either case).
    let foundDecl = null;
    sf.forEachChild((node) => {
      if (foundDecl) return;
      if (
        (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
        node.name &&
        node.name.text === wanted
      ) {
        foundDecl = node;
      }
    });
    if (!foundDecl) continue;

    const symbol = checker.getSymbolAtLocation(foundDecl.name);
    if (symbol) return { decl: foundDecl, symbol, sourceFile: sf };
  }
  return null;
}

/**
 * Emit only the **own** properties declared in the interface body, NOT the
 * full inherited set (which includes hundreds of HTMLAttributes/AriaAttributes
 * members). That keeps the catalog focused on what the component author
 * deliberately wrote.
 */
function extractOwnProps(decl, checker) {
  const out = [];

  // For an interface declaration the own members are decl.members. For a
  // type alias whose RHS is a type literal, look at type.members. Anything
  // more exotic (intersection, mapped type, generic) is skipped — those are
  // rare for component props and would require expanding non-own members.
  let memberNodes = [];
  if (ts.isInterfaceDeclaration(decl)) {
    memberNodes = decl.members ?? [];
  } else if (ts.isTypeAliasDeclaration(decl)) {
    if (decl.type && ts.isTypeLiteralNode(decl.type)) {
      memberNodes = decl.type.members ?? [];
    }
  }

  for (const m of memberNodes) {
    if (!ts.isPropertySignature(m) && !ts.isMethodSignature(m)) continue;
    if (!m.name) continue;

    let propName;
    if (ts.isIdentifier(m.name)) propName = m.name.text;
    else if (ts.isStringLiteral(m.name)) propName = m.name.text;
    else continue;

    const optional = !!m.questionToken;

    let typeText = "unknown";
    try {
      const type = m.type
        ? checker.getTypeFromTypeNode(m.type)
        : checker.getTypeAtLocation(m);
      typeText = checker
        .typeToString(
          type,
          m,
          ts.TypeFormatFlags.NoTruncation |
            ts.TypeFormatFlags.UseFullyQualifiedType |
            ts.TypeFormatFlags.WriteArrayAsGenericType,
        )
        .trim();
    } catch {
      // fall back to the source text of the type annotation, if any
      typeText = m.type ? m.type.getText().trim() : "unknown";
    }

    let description;
    const sym = checker.getSymbolAtLocation(m.name);
    if (sym) {
      const docParts = sym.getDocumentationComment(checker);
      if (docParts && docParts.length) {
        description = ts.displayPartsToString(docParts).trim();
      }
    }
    if (!description) {
      // Fallback: scan leading JSDoc comment ranges on the member.
      const text = m.getSourceFile().getFullText();
      const ranges = ts.getLeadingCommentRanges(text, m.getFullStart()) ?? [];
      for (const r of ranges) {
        if (r.kind === ts.SyntaxKind.MultiLineCommentTrivia) {
          const raw = text.slice(r.pos, r.end);
          const cleaned = raw
            .replace(/^\/\*+/, "")
            .replace(/\*+\/$/, "")
            .split(/\r?\n/)
            .map((line) => line.replace(/^\s*\*\s?/, ""))
            .join("\n")
            .trim();
          if (cleaned) {
            description = cleaned;
            break;
          }
        }
      }
    }

    const entry = { name: propName, type: typeText, optional };
    if (description) entry.description = description;
    out.push(entry);
  }

  return out;
}

/**
 * Locate the component's runtime declaration node so we can read its leading
 * JSDoc. The repo isn't 100% consistent — most components are
 * `export const|function <Name>`, but a few use `<Name>Base`, `Ds<Name>`,
 * `<Name>Provider`, `<Name>Group`, `<Name>Bar`, `<Name>Steps`. We probe each.
 */
function findComponentDecl(program, component) {
  const sf = program.getSourceFile(component.abs);
  if (!sf) return null;

  const candidates = [
    component.name,
    `${component.name}Base`,
    `Ds${component.name}`,
    `Ds${component.name}Provider`,
    `${component.name}Provider`,
    `${component.name}Group`,
    `${component.name}Bar`,
    `${component.name}Steps`,
  ];
  const wanted = new Set(candidates);

  // Scan top-level statements; return the first match in candidate-priority order.
  const found = new Map(); // ident -> node
  for (const stmt of sf.statements) {
    if (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) {
      const n = stmt.name?.text;
      if (n && wanted.has(n) && !found.has(n)) found.set(n, stmt);
    } else if (ts.isVariableStatement(stmt)) {
      for (const d of stmt.declarationList.declarations) {
        if (d.name && ts.isIdentifier(d.name)) {
          const n = d.name.text;
          if (wanted.has(n) && !found.has(n)) {
            // Use the VariableStatement (the parent) so leading JSDoc attached
            // to the whole `export const Foo = ...` form is reachable.
            found.set(n, stmt);
          }
        }
      }
    }
  }

  for (const c of candidates) {
    if (found.has(c)) return { node: found.get(c), sourceFile: sf, ident: c };
  }
  return null;
}

/**
 * Extract `@status`, `@since`, `@tags` from the leading JSDoc of a node. We
 * use `ts.getJSDocTags` (the supported AST API) rather than regex on the raw
 * comment text, so multi-line comments and unusual formatting still work.
 *
 * `@tags` is comma-separated in source: `@tags form, input` → `["form","input"]`.
 */
function extractMetadata(node) {
  const tags = ts.getJSDocTags(node) ?? [];
  let status;
  let since;
  let tagList;

  for (const tag of tags) {
    const tagName = tag.tagName?.text;
    if (!tagName) continue;
    // tag.comment is either a string or an array of JSDocCommentParts.
    let text;
    if (typeof tag.comment === "string") {
      text = tag.comment;
    } else if (Array.isArray(tag.comment)) {
      text = tag.comment.map((p) => p.text ?? "").join("");
    }
    text = (text ?? "").trim();
    if (!text) continue;

    if (tagName === "status" && !status) status = text;
    else if (tagName === "since" && !since) since = text;
    else if (tagName === "tags" && !tagList) {
      tagList = text
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }

  return { status, since, tags: tagList };
}

/** Best-effort mtime of a file (returns 0 if missing). */
async function mtimeOf(p) {
  try {
    return (await stat(p)).mtimeMs;
  } catch {
    return 0;
  }
}

/**
 * Build a stable mtime signature covering every input that could change the
 * extraction result: each component's `.tsx`, its sibling `.types.ts`/`.tsx`,
 * tsconfig, and package.json (for the `since` fallback).
 */
async function buildSignature(allComponents) {
  const probes = [
    path.join(repoRoot, "tsconfig.json"),
    path.join(repoRoot, "package.json"),
  ];
  for (const c of allComponents) {
    probes.push(c.abs);
    probes.push(c.abs.replace(/\.tsx$/, ".types.ts"));
    probes.push(c.abs.replace(/\.tsx$/, ".types.tsx"));
  }
  const mtimes = await Promise.all(probes.map(mtimeOf));
  const sig = {};
  probes.forEach((p, i) => {
    if (mtimes[i] > 0) sig[path.relative(repoRoot, p).split(path.sep).join("/")] = mtimes[i];
  });
  return sig;
}

function signaturesEqual(a, b) {
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (a[k] !== b[k]) return false;
  return true;
}

async function main() {
  const t0 = Date.now();
  const pkgVersion = await readPackageVersion();

  // Discover components first.
  const allComponents = [];
  for (const { kind, root } of KINDS) {
    const found = await discoverComponents(kind, root);
    allComponents.push(...found);
  }

  // Mtime fast path: if every input file has the same mtime as last run AND
  // the previous output is still on disk, just print and exit. This is the
  // common pre-commit case (only docs/tests changed).
  const signature = await buildSignature(allComponents);
  let cache;
  try {
    cache = JSON.parse(await readFile(cacheFile, "utf8"));
  } catch {
    cache = null;
  }
  if (cache && signaturesEqual(cache.signature, signature)) {
    try {
      await stat(outFile);
      const ms = Date.now() - t0;
      console.log(
        `[extract-props] up-to-date — ${cache.componentCount ?? "?"} components (${ms}ms, mtime cache hit)`,
      );
      return;
    } catch {
      // outFile missing — fall through to a real run
    }
  }

  // Build ONE TS Program for the whole repo (uses tsconfig.json so module
  // resolution / paths / lib types work correctly).
  const tsconfigPath = path.join(repoRoot, "tsconfig.json");
  const cfgFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (cfgFile.error) {
    throw new Error(
      "Failed to read tsconfig.json: " +
        ts.flattenDiagnosticMessageText(cfgFile.error.messageText, "\n"),
    );
  }
  const parsed = ts.parseJsonConfigFileContent(
    cfgFile.config,
    ts.sys,
    repoRoot,
  );

  // Make sure every component file (and its sibling .types.ts) is in the
  // program even if the include globs would otherwise miss it.
  const extra = new Set();
  for (const c of allComponents) {
    extra.add(c.abs);
    extra.add(c.abs.replace(/\.tsx$/, ".types.ts"));
    extra.add(c.abs.replace(/\.tsx$/, ".types.tsx"));
  }
  const rootFiles = Array.from(new Set([...parsed.fileNames, ...extra]));

  const program = ts.createProgram({
    rootNames: rootFiles,
    options: { ...parsed.options, noEmit: true },
  });
  const checker = program.getTypeChecker();

  const byKind = new Map(KINDS.map((k) => [k.kind, []]));
  let totalProps = 0;
  let extractedComponents = 0;

  for (const c of allComponents) {
    const found = findPropsSymbol(program, checker, c);
    if (!found) continue;

    const props = extractOwnProps(found.decl, checker);
    if (props.length === 0) continue; // nothing useful to emit

    // Pull `@status` / `@since` / `@tags` off the component declaration's
    // leading JSDoc (NOT the props interface — the docs live on the runtime
    // export by convention). Missing tags stay undefined; we don't fabricate.
    const componentDecl = findComponentDecl(program, c);
    const meta = componentDecl ? extractMetadata(componentDecl.node) : {};

    const entry = {
      name: c.name,
      kind: c.kind,
      file: c.file,
      interface: `${c.name}Props`,
    };
    if (meta.status) entry.status = meta.status;
    if (meta.since) entry.since = meta.since;
    // If a component author wrote a JSDoc block but forgot @since, fall back
    // to the current package version so consumers always have *something*.
    if (!meta.since && (meta.status || (meta.tags && meta.tags.length)) && pkgVersion) {
      entry.since = pkgVersion;
    }
    if (meta.tags && meta.tags.length) entry.tags = meta.tags;
    entry.props = props;

    byKind.get(c.kind).push(entry);
    totalProps += props.length;
    extractedComponents += 1;
  }

  // Emit in the requested order: primitive → composite → pattern, alpha within.
  const components = [];
  for (const { kind } of KINDS) {
    const list = byKind.get(kind) ?? [];
    list.sort((a, b) => a.name.localeCompare(b.name));
    components.push(...list);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    components,
  };

  await mkdir(outDir, { recursive: true });
  await Promise.all([
    writeFile(outFile, JSON.stringify(payload, null, 2) + "\n", "utf8"),
    writeFile(
      cacheFile,
      JSON.stringify({ signature, componentCount: extractedComponents }),
      "utf8",
    ),
  ]);

  const ms = Date.now() - t0;
  console.log(
    `[extract-props] extracted ${extractedComponents} components, ${totalProps} total props (${ms}ms) → ${path.relative(
      repoRoot,
      outFile,
    )}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
