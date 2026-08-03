#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");
const TEMPLATES_ROOT = path.join(PKG_ROOT, "templates");

const BOLD = "\u001b[1m";
const DIM = "\u001b[2m";
const CYAN = "\u001b[36m";
const GREEN = "\u001b[32m";
const RED = "\u001b[31m";
const YELLOW = "\u001b[33m";
const RESET = "\u001b[0m";

const log = {
  info: (msg) => console.log(`${CYAN}${msg}${RESET}`),
  ok: (msg) => console.log(`${GREEN}${msg}${RESET}`),
  warn: (msg) => console.log(`${YELLOW}${msg}${RESET}`),
  err: (msg) => console.error(`${RED}${msg}${RESET}`),
  head: (msg) => console.log(`\n${BOLD}${msg}${RESET}`),
  dim: (msg) => console.log(`${DIM}${msg}${RESET}`),
};

const HELP = `${BOLD}create-junds${RESET} — bootstrap a Next.js app powered by @junds/ui

${BOLD}Usage:${RESET}
  npx create-junds <name> [options]
  npm create junds <name> -- [options]

${BOLD}Arguments:${RESET}
  name                Project name (also used as the directory name)

${BOLD}Options:${RESET}
  --target <path>     Parent directory in which the project folder is created
                      (default: current working directory)
  --template <name>   Template to use (default: "default")
  --force             Overwrite the target directory if it is non-empty
  -h, --help          Show this message

${BOLD}Examples:${RESET}
  npx create-junds my-app
  npx create-junds my-app --target ~/projects
  npx create-junds dashboard --template default --force
`;

function parseArgs(argv) {
  const args = { _: [], target: null, template: "default", force: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (t === "-h" || t === "--help") {
      args.help = true;
    } else if (t === "--target") {
      args.target = argv[++i];
    } else if (t === "--template") {
      args.template = argv[++i];
    } else if (t === "--force") {
      args.force = true;
    } else if (t.startsWith("--")) {
      throw new Error(`Unknown option: ${t}`);
    } else {
      args._.push(t);
    }
  }
  return args;
}

const NPM_NAME_REGEX = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

function validateProjectName(name) {
  if (!name) return "name is required";
  if (name.length > 214) return "name must be ≤ 214 chars";
  if (name.startsWith(".") || name.startsWith("_")) return "name cannot start with '.' or '_'";
  if (!NPM_NAME_REGEX.test(name))
    return "name must be lowercase, may contain a-z 0-9 - _ . ~ and an optional @scope/ prefix";
  return null;
}

function expandTilde(p) {
  if (!p) return p;
  if (p === "~") return process.env.HOME ?? p;
  if (p.startsWith("~/")) return path.join(process.env.HOME ?? "", p.slice(2));
  return p;
}

function isEmptyDir(dir) {
  if (!fs.existsSync(dir)) return true;
  const entries = fs.readdirSync(dir);
  return entries.length === 0;
}

function copyDir(src, dst, replace) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const targetName = entry.name === "_gitignore" ? ".gitignore" : entry.name;
    const dstPath = path.join(dst, targetName);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath, replace);
    } else if (entry.isFile()) {
      const buf = fs.readFileSync(srcPath);
      const isText = isProbablyText(entry.name);
      if (isText) {
        const rendered = applyReplacements(buf.toString("utf8"), replace);
        fs.writeFileSync(dstPath, rendered);
      } else {
        fs.writeFileSync(dstPath, buf);
      }
    }
  }
}

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".html",
  ".yml",
  ".yaml",
  ".gitignore",
]);

function isProbablyText(filename) {
  if (filename === "_gitignore") return true;
  const ext = path.extname(filename).toLowerCase();
  return TEXT_EXT.has(ext);
}

function applyReplacements(content, replace) {
  let out = content;
  for (const [token, value] of Object.entries(replace)) {
    out = out.split(token).join(value);
  }
  return out;
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    log.err(e.message);
    console.log(HELP);
    process.exit(1);
  }

  if (args.help) {
    console.log(HELP);
    return;
  }

  const name = args._[0];
  const nameError = validateProjectName(name);
  if (nameError) {
    log.err(`Invalid project name: ${nameError}`);
    console.log(HELP);
    process.exit(1);
  }

  const templateDir = path.join(TEMPLATES_ROOT, args.template);
  if (!fs.existsSync(templateDir)) {
    log.err(`Template not found: ${args.template}`);
    log.dim(`  Looked in: ${templateDir}`);
    process.exit(1);
  }

  const parent = path.resolve(expandTilde(args.target ?? process.cwd()));
  if (!fs.existsSync(parent)) {
    log.err(`Target parent directory does not exist: ${parent}`);
    process.exit(1);
  }

  const dirName = name.includes("/") ? name.split("/").pop() : name;
  const projectDir = path.join(parent, dirName);

  if (fs.existsSync(projectDir) && !isEmptyDir(projectDir)) {
    if (!args.force) {
      log.err(`Target directory is not empty: ${projectDir}`);
      log.dim(`  Re-run with --force to overwrite.`);
      process.exit(1);
    }
    log.warn(`Overwriting non-empty directory (--force): ${projectDir}`);
  }

  log.head(`Creating ${BOLD}${name}${RESET} in ${projectDir}`);

  const replace = {
    "{{NAME}}": name,
    "{{DIR}}": dirName,
  };

  copyDir(templateDir, projectDir, replace);

  log.ok(`\n✓ Project created`);
  log.head("Next steps:");
  console.log(`  cd ${path.relative(process.cwd(), projectDir) || dirName}`);
  console.log(`  npm install`);
  console.log(`  npm run dev`);
  log.dim(`\nNote: @junds/ui must be reachable. If it's not yet on npm,`);
  log.dim(`update package.json's "@junds/ui" entry to a git or file path.`);
}

main();
