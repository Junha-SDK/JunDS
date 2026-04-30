#!/usr/bin/env node
//
// Captures a screenshot of every showcase route under /design-system/<kind>/<slug>
// and emits `.ai/screenshots.json` — a manifest that agents can consult for
// visual matching ("make it look like X") tasks.
//
// Workflow:
//   1. Start the dev server in another terminal:  npm run dev
//   2. (one-time) install browser binaries:        npx playwright install chromium
//   3. Capture screenshots:                        npm run capture-screenshots
//
// The script:
//   - assumes the dev server is reachable at http://localhost:6100
//   - exits 0 with an explanatory message if browser binaries are missing
//   - exits 0 with an explanatory message if the dev server is not running
//   - is idempotent (re-running overwrites old PNGs)
//
// Output: `.ai/screenshots/<kind>--<slug>.png` and `.ai/screenshots.json`.

import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const showcaseRoot = path.join(repoRoot, "app", "design-system");
const outDir = path.join(repoRoot, ".ai");
const screenshotsDir = path.join(outDir, "screenshots");
const manifestPath = path.join(outDir, "screenshots.json");

const BASE_URL = process.env.JUNDS_DEV_URL ?? "http://localhost:6100";
const VIEWPORT = { width: 1280, height: 720 };
const NAV_TIMEOUT_MS = 15_000;
const SELECTOR_TIMEOUT_MS = 5_000;

// kinds → singular label used in manifest and directory under app/design-system
const KINDS = [
  { dir: "primitives", label: "primitive" },
  { dir: "composites", label: "composite" },
  { dir: "patterns", label: "pattern" },
  { dir: "security", label: "security" },
];

/** prettify a slug like "auto-complete" → "Auto Complete" */
function prettify(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** enumerate showcase routes by walking app/design-system/<kind>/<slug>/page.tsx */
async function discoverRoutes() {
  const routes = [];
  for (const kind of KINDS) {
    const root = path.join(showcaseRoot, kind.dir);
    let entries;
    try {
      entries = await readdir(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const pagePath = path.join(root, entry.name, "page.tsx");
      try {
        const s = await stat(pagePath);
        if (!s.isFile()) continue;
      } catch {
        continue;
      }
      routes.push({
        kind: kind.label,
        kindDir: kind.dir,
        slug: entry.name,
        name: prettify(entry.name),
        route: `/design-system/${kind.dir}/${entry.name}`,
      });
    }
  }
  routes.sort((a, b) =>
    a.kindDir === b.kindDir ? a.slug.localeCompare(b.slug) : a.kindDir.localeCompare(b.kindDir),
  );
  return routes;
}

/** Probe the dev server with a short timeout. Returns true if reachable. */
async function isDevServerUp(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    // Any HTTP response means something is listening — including 404s.
    return res.status >= 200 && res.status < 600;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

function logInstallHint() {
  console.log("");
  console.log("[capture-screenshots] Chromium browser binary is not installed.");
  console.log("[capture-screenshots] Install it once with:");
  console.log("");
  console.log("    npx playwright install chromium");
  console.log("");
  console.log("[capture-screenshots] Skipping screenshot capture; exiting 0.");
}

function logServerHint() {
  console.log("");
  console.log(`[capture-screenshots] Dev server is not reachable at ${BASE_URL}.`);
  console.log("[capture-screenshots] Start it in another terminal with:");
  console.log("");
  console.log("    npm run dev");
  console.log("");
  console.log("[capture-screenshots] Skipping screenshot capture; exiting 0.");
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await mkdir(screenshotsDir, { recursive: true });

  // 1. Probe the dev server.
  if (!(await isDevServerUp(BASE_URL))) {
    logServerHint();
    return;
  }

  // 2. Try to import Playwright. (Always installed as devDep.)
  let chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch (err) {
    console.log("[capture-screenshots] @playwright/test is not installed.");
    console.log("[capture-screenshots] Run `npm install` and retry.");
    console.log(`[capture-screenshots] (${err && err.message ? err.message : err})`);
    return;
  }

  // 3. Try to launch chromium. The browser binary may be missing.
  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    if (
      /Executable doesn't exist/i.test(msg) ||
      /browserType\.launch/i.test(msg) ||
      /please install/i.test(msg)
    ) {
      logInstallHint();
      return;
    }
    console.log("[capture-screenshots] Failed to launch Chromium:");
    console.log(`    ${msg}`);
    console.log("[capture-screenshots] Exiting 0 to avoid breaking CI.");
    return;
  }

  const routes = await discoverRoutes();
  console.log(`[capture-screenshots] Discovered ${routes.length} showcase routes.`);

  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  const screenshots = [];
  const errors = [];

  for (const r of routes) {
    const fileName = `${r.kind}--${r.slug}.png`;
    const filePath = path.join(screenshotsDir, fileName);
    const relImage = path.relative(repoRoot, filePath);
    const url = `${BASE_URL}${r.route}`;
    process.stdout.write(`  [${r.kind}/${r.slug}] `);
    try {
      const resp = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: NAV_TIMEOUT_MS,
      });
      if (!resp || !resp.ok()) {
        const code = resp ? resp.status() : "no response";
        errors.push({ route: r.route, reason: `HTTP ${code}` });
        process.stdout.write(`skip (HTTP ${code})\n`);
        continue;
      }

      // Prefer the stable [data-preview] selector. Fall back to the legacy
      // class signature in case the showcase site is older than this script.
      let target = page.locator("[data-preview]").first();
      let count = 0;
      try {
        await target.waitFor({ state: "visible", timeout: SELECTOR_TIMEOUT_MS });
        count = await page.locator("[data-preview]").count();
      } catch {
        count = 0;
      }
      if (count === 0) {
        target = page.locator('div[class*="border"][class*="radius"]').first();
        try {
          await target.waitFor({ state: "visible", timeout: SELECTOR_TIMEOUT_MS });
        } catch {
          errors.push({ route: r.route, reason: "no Preview block found" });
          process.stdout.write("skip (no preview)\n");
          continue;
        }
      }

      const box = await target.boundingBox();
      await target.screenshot({ path: filePath });
      const w = box ? Math.round(box.width) : VIEWPORT.width;
      const h = box ? Math.round(box.height) : VIEWPORT.height;

      screenshots.push({
        kind: r.kind,
        slug: r.slug,
        name: r.name,
        route: r.route,
        image: relImage,
        width: w,
        height: h,
      });
      process.stdout.write(`ok (${w}x${h})\n`);
    } catch (err) {
      const reason = err && err.message ? err.message.split("\n")[0] : String(err);
      errors.push({ route: r.route, reason });
      process.stdout.write(`error (${reason})\n`);
    }
  }

  await context.close();
  await browser.close();

  const manifest = {
    generatedAt: new Date().toISOString(),
    viewport: VIEWPORT,
    baseUrl: BASE_URL,
    selector: "[data-preview]",
    screenshots,
    errors,
  };

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log("");
  console.log(
    `[capture-screenshots] Captured ${screenshots.length} / ${routes.length} routes` +
      (errors.length ? ` (${errors.length} errors)` : "") +
      ".",
  );
  console.log(`[capture-screenshots] Wrote manifest: ${path.relative(repoRoot, manifestPath)}`);
}

main().catch((err) => {
  // Last-ditch safety net — never crash the parent runner.
  console.log("[capture-screenshots] Unexpected failure:");
  console.log(`    ${err && err.stack ? err.stack : err}`);
  process.exit(0);
});
