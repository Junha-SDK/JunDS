#!/usr/bin/env node

import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

const DEFAULT_IGNORED_DIRS = new Set([".git", ".next", "coverage", "dist", "node_modules"]);

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.query) {
  printUsage();
  process.exit(args.help ? 0 : 1);
}

const allFiles = [];
await walk(repoRoot, repoRoot, allFiles, args.all);

const rankedResults = allFiles
  .map((relativePath) => scorePath(relativePath, args.query))
  .filter((entry) => entry.score > 0)
  .filter((entry) => !args.type || entry.kind === args.type)
  .sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (left.kindRank !== right.kindRank) {
      return left.kindRank - right.kindRank;
    }

    return left.relativePath.localeCompare(right.relativePath);
  });

const topScore = rankedResults[0]?.score ?? 0;
const minimumScore = Math.max(60, Math.round(topScore * 0.18));
const results = rankedResults.filter((entry) => entry.score >= minimumScore).slice(0, args.max);

if (args.json) {
  console.log(
    JSON.stringify(
      {
        query: args.query,
        root: repoRoot,
        count: results.length,
        results: results.map((entry) => ({
          hint: entry.hint,
          kind: entry.kind,
          relativePath: entry.relativePath,
          route: entry.route,
          score: entry.score,
        })),
      },
      null,
      2,
    ),
  );
  process.exit(results.length > 0 ? 0 : 1);
}

if (results.length === 0) {
  console.log(`No matches found for "${args.query}".`);
  console.log("Try a broader keyword or add --all to include ignored directories.");
  process.exit(1);
}

console.log(`Query: ${args.query}`);
console.log(`Root: ${repoRoot}`);
console.log("");

results.forEach((entry, index) => {
  console.log(`${index + 1}. [${entry.kind}] ${entry.relativePath}`);

  if (entry.route) {
    console.log(`   route: ${entry.route}`);
  }

  console.log(`   hint: ${entry.hint}`);
  console.log(`   score: ${entry.score}`);
});

function parseArgs(argv) {
  const options = {
    all: false,
    help: false,
    json: false,
    max: 8,
    query: "",
    type: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === "--all") {
      options.all = true;
      continue;
    }

    if (current === "--json") {
      options.json = true;
      continue;
    }

    if (current === "--help" || current === "-h") {
      options.help = true;
      continue;
    }

    if (current === "--max") {
      const nextValue = Number(argv[index + 1]);

      if (!Number.isInteger(nextValue) || nextValue <= 0) {
        throw new Error("`--max` expects a positive integer.");
      }

      options.max = nextValue;
      index += 1;
      continue;
    }

    if (current === "--type") {
      const nextValue = argv[index + 1];

      if (!nextValue) {
        throw new Error("`--type` expects a value.");
      }

      options.type = nextValue;
      index += 1;
      continue;
    }

    options.query = options.query ? `${options.query} ${current}` : current;
  }

  return options;
}

function printUsage() {
  const usage = `
Usage:
  npm run locate -- <query> [--type kind] [--max 12] [--json] [--all]

Examples:
  npm run locate -- button
  npm run locate -- color picker
  npm run locate -- useFocusMode --type hook
  npm run locate -- alert dialog --json

Kinds:
  requirement, primitive, composite, hook, token, test, page, data, config, asset, file
`.trim();

  console.log(usage);
}

async function walk(rootDir, currentDir, output, includeAll) {
  const entries = await readdir(currentDir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = path.relative(rootDir, absolutePath);

    if (entry.isDirectory()) {
      if (!includeAll && DEFAULT_IGNORED_DIRS.has(entry.name)) {
        continue;
      }

      await walk(rootDir, absolutePath, output, includeAll);
      continue;
    }

    output.push(relativePath);
  }
}

function scorePath(relativePath, query) {
  const kind = classifyPath(relativePath);
  const kindRank = kindPriority(kind);
  const route = routeFromPath(relativePath);
  const hint = hintFromKind(kind, route);

  const pathTokens = tokenize(relativePath);
  const pathTokenSet = new Set(pathTokens);
  const pathCompact = compact(relativePath);

  const basename = path.basename(relativePath);
  const basenameStem = basename.replace(/\.[^.]+$/, "");
  const basenameCompact = compact(basenameStem);

  const dirTokens = tokenize(path.dirname(relativePath));
  const queryVariants = makeQueryVariants(query);

  let score = 0;

  for (const variant of queryVariants) {
    if (!variant.compactValue) {
      continue;
    }

    if (basenameCompact === variant.compactValue) {
      score += 120;
    } else if (basenameCompact.startsWith(variant.compactValue)) {
      score += 90;
    } else if (pathCompact.includes(variant.compactValue)) {
      score += 55;
    }

    if (variant.phraseValue && pathToPhrase(relativePath).includes(variant.phraseValue)) {
      score += 35;
    }
  }

  const queryTokens = tokenize(query);
  const matchedTokens = queryTokens.filter((token) => pathTokenSet.has(token));
  const dirMatches = queryTokens.filter((token) => dirTokens.includes(token));

  score += matchedTokens.length * 14;
  score += dirMatches.length * 8;

  if (queryTokens.length > 0 && matchedTokens.length === queryTokens.length) {
    score += 28;
  }

  if (relativePath.endsWith("/index.ts") || relativePath.endsWith("/index.tsx")) {
    score += 10;
  }

  if (
    kind === "page" &&
    route &&
    queryVariants.some((variant) => compact(route) === variant.compactValue)
  ) {
    score += 80;
  }

  if (
    kind === "page" &&
    route &&
    queryVariants.some((variant) => compact(route.split("/").at(-1) ?? "") === variant.compactValue)
  ) {
    score += 70;
  }

  if (kind === "hook" && queryTokens.length > 0 && queryTokens.some((token) => token === "use")) {
    score += 12;
  }

  if (
    kind === "token" &&
    queryTokens.some((token) =>
      [
        "color",
        "colors",
        "spacing",
        "radius",
        "shadow",
        "shadows",
        "theme",
        "themes",
        "zindex",
        "typography",
        "animation",
        "breakpoint",
        "breakpoints",
      ].includes(token),
    )
  ) {
    score += 12;
  }

  if (isCanonicalSourceFile(relativePath, kind, basenameStem)) {
    score += 22;
  }

  if (kind === "requirement" && matchedTokens.length > 0) {
    score += 30;
  }

  return {
    hint,
    kind,
    kindRank,
    relativePath,
    route,
    score,
  };
}

function classifyPath(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");

  if (normalized.startsWith("requirements/") && normalized.endsWith(".md")) {
    return "requirement";
  }

  if (normalized.startsWith("ds/primitives/")) {
    return "primitive";
  }

  if (normalized.startsWith("ds/composites/")) {
    return "composite";
  }

  if (normalized.startsWith("ds/hooks/")) {
    return "hook";
  }

  if (normalized.startsWith("ds/tokens/")) {
    return "token";
  }

  if (normalized.startsWith("ds/__tests__/")) {
    return "test";
  }

  if (normalized.startsWith("app/") && normalized.endsWith("/page.tsx")) {
    return "page";
  }

  if (normalized.startsWith("app/design-system/_data/")) {
    return "data";
  }

  if (
    normalized === "package.json" ||
    normalized.startsWith("tsconfig") ||
    normalized.startsWith("eslint.config") ||
    normalized.startsWith("next.config") ||
    normalized.startsWith("vitest.config") ||
    normalized.startsWith("rollup.config") ||
    normalized.startsWith("postcss.config")
  ) {
    return "config";
  }

  if (normalized.startsWith("public/")) {
    return "asset";
  }

  return "file";
}

function kindPriority(kind) {
  const order = {
    requirement: 0,
    primitive: 1,
    composite: 2,
    hook: 3,
    token: 4,
    page: 5,
    test: 6,
    data: 7,
    config: 8,
    asset: 9,
    file: 10,
  };

  return order[kind] ?? 99;
}

function routeFromPath(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");

  if (!normalized.startsWith("app/") || !normalized.endsWith("/page.tsx")) {
    return "";
  }

  const routeParts = normalized.replace(/^app\//, "").replace(/\/page\.tsx$/, "");
  return routeParts ? `/${routeParts}` : "/";
}

function hintFromKind(kind, route) {
  switch (kind) {
    case "requirement":
      return "feature requirement spec — read before editing related code";
    case "primitive":
      return "design system primitive source";
    case "composite":
      return "design system composite source";
    case "hook":
      return "shared hook source";
    case "token":
      return "design token definition";
    case "test":
      return "test coverage for the concept";
    case "page":
      return route ? `Next route page at ${route}` : "Next route page";
    case "data":
      return "design-system docs data source";
    case "config":
      return "project configuration";
    case "asset":
      return "static asset";
    default:
      return "general project file";
  }
}

function tokenize(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function compact(value) {
  return tokenize(value).join("");
}

function pathToPhrase(value) {
  return tokenize(value).join(" ");
}

function makeQueryVariants(query) {
  const tokens = tokenize(query);
  const base = tokens.join(" ");
  const kebab = tokens.join("-");
  const pascal = tokens.map(capitalize).join("");
  const camel = tokens.length > 0 ? `${tokens[0]}${tokens.slice(1).map(capitalize).join("")}` : "";

  const values = [query, base, kebab, pascal, camel];

  return Array.from(
    new Map(
      values.map((value) => [
        value,
        {
          compactValue: compact(value),
          phraseValue: pathToPhrase(value),
        },
      ]),
    ).values(),
  );
}

function capitalize(value) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : "";
}

function isCanonicalSourceFile(relativePath, kind, basenameStem) {
  const normalized = relativePath.split(path.sep).join("/");
  const parentDir = normalized.split("/").slice(-2, -1)[0] ?? "";

  if (kind === "primitive" || kind === "composite") {
    return basenameStem === parentDir;
  }

  return false;
}
