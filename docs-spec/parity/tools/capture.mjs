#!/usr/bin/env node
/**
 * docs-spec/parity/tools/capture.mjs
 * v2 storybook-static 스토리를 라이트/다크로 캡처해 파일명 규칙
 * baseline/<ledger-id>/<variant>-<theme>.png 으로 저장한다.
 *
 * 사용: node capture.mjs --base http://127.0.0.1:6106 [--only <storyId,...>] [--limit N]
 * 의존성: 레포 node_modules의 playwright (설치 상태 그대로 사용, 추가 설치 없음)
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARITY = path.resolve(__dirname, "..");
const REPO = path.resolve(PARITY, "../..");
const OUT = path.join(PARITY, "baseline");

const args = process.argv.slice(2);
const arg = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const BASE = arg("--base", "http://127.0.0.1:6107");
// v3 HEAD 에서 갓 빌드한 storybook(스크래치패드) — 구 storybook-static 은 CSS 가
// 트리셰이킹으로 빠져 무스타일이라 기준으로 쓸 수 없음(→ DECISIONS 기록)
const SB_STATIC = arg(
  "--sb",
  "/private/tmp/claude-501/-Users-junha-develop-jjunhaa-MySelf/d6d5dffc-74e2-40f5-8ab1-ffbf96defeb3/scratchpad/sb-v3",
);
// 같은 이유로 별도 컴파일한 앱 CSS 를 각 스토리에 주입한다(build-css.mjs 산출)
const CSS_PATH = arg(
  "--css",
  "/private/tmp/claude-501/-Users-junha-develop-jjunhaa-MySelf/d6d5dffc-74e2-40f5-8ab1-ffbf96defeb3/scratchpad/globals.compiled.css",
);
const ONLY = arg("--only", "").split(",").filter(Boolean);
const LIMIT = Number(arg("--limit", "0"));
const CONCURRENCY = Number(arg("--concurrency", "6"));

// ── 스토리 → ledger id 매핑 ────────────────────────────────
// 원칙: title 의 컴포넌트 세그먼트가 ledger id 와 정확 일치.
// 예외(별칭)는 스토리 파일을 열어 실제 컴포넌트를 확인해 확정했다.
const TITLE_ALIAS = {
  Progress: "ProgressBar", // Progress.stories.tsx → ProgressBar
  Toast: "DsToastProvider", // Toast.stories.tsx → DsToastProvider
};
// title 별칭보다 우선하는 스토리 단위 재배정 — Progress/Steps 는 ProgressSteps 데모
const STORY_REASSIGN = {
  "composites-progress--steps": "ProgressSteps",
};

const kebab = (s) =>
  s
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

// ── 잡 목록 구성 ───────────────────────────────────────────
const index = JSON.parse(readFileSync(path.join(SB_STATIC, "index.json"), "utf8"));
const ledger = JSON.parse(readFileSync(path.join(REPO, "docs-spec/registry/ledger.json"), "utf8"));
const ledgerIds = new Set(ledger.rows.map((r) => r.id));

let stories = Object.values(index.entries).filter((e) => e.type === "story");
if (ONLY.length) stories = stories.filter((e) => ONLY.includes(e.id));
if (LIMIT) stories = stories.slice(0, LIMIT);

const jobs = stories.map((e) => {
  const comp = e.title.split("/").slice(1).join("/");
  const ledgerId = STORY_REASSIGN[e.id] ?? TITLE_ALIAS[comp] ?? comp;
  return {
    storyId: e.id,
    title: e.title,
    name: e.name,
    ledgerId,
    inLedger: ledgerIds.has(ledgerId),
    variant: kebab(e.name),
  };
});

// ── 캡처 조건(결정성) ──────────────────────────────────────
const FIXED_DATE_ISO = "2026-04-29T12:00:00+09:00"; // 빌드 시점 근처로 고정
const VIEWPORT = { width: 1280, height: 800 };
const DSF = 2;
const MAX_VIEWPORT_H = 2400; // 세로로 긴 스토리 대응 상한

const INIT_SCRIPT = `
  // 시간 고정 — Clock/Countdown/MonthPicker 류 결정성
  (() => {
    const FIXED = new Date(${JSON.stringify(FIXED_DATE_ISO)}).getTime();
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...a) { a.length ? super(...a) : super(FIXED); }
      static now() { return FIXED; }
    }
    FixedDate.parse = RealDate.parse;
    FixedDate.UTC = RealDate.UTC;
    window.Date = FixedDate;
    // Math.random 시드 고정(LCG) — sparkline/랜덤 데모 결정성
    let seed = 20260429;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  })();
`;

const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
  }
`;

const settle = async (page, extraMs) => {
  await page.evaluate(
    () =>
      new Promise((r) => {
        requestAnimationFrame(() => requestAnimationFrame(r));
      }),
  );
  await page.waitForTimeout(extraMs);
};

// body 하위 실제 렌더 노드들의 유니온 bbox (포털 포함)
const measure = async (page) =>
  page.evaluate(() => {
    const skip = new Set(["SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT"]);
    const boxes = [];
    const collect = (el) => {
      for (const c of el.children) {
        if (skip.has(c.tagName)) continue;
        if (c.id === "storybook-root") {
          // 루트는 컨테이너(centered 레이아웃) — 자식 기준으로 잰다
          collect(c);
          continue;
        }
        const r = c.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) boxes.push([r.x, r.y, r.right, r.bottom]);
      }
    };
    collect(document.body);
    if (!boxes.length) return null;
    const x = Math.min(...boxes.map((b) => b[0]));
    const y = Math.min(...boxes.map((b) => b[1]));
    const right = Math.max(...boxes.map((b) => b[2]));
    const bottom = Math.max(...boxes.map((b) => b[3]));
    return {
      x,
      y,
      w: right - x,
      h: bottom - y,
      doc: {
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight,
      },
      error:
        document.body.classList.contains("sb-show-errordisplay") ||
        !!document.querySelector("#error-message")?.textContent?.trim(),
      empty: !document.querySelector("#storybook-root")?.childElementCount,
    };
  });

const shoot = async (page, file) => {
  const m = await measure(page);
  if (!m) return { skip: "no-render" };
  if (m.error) return { skip: "story-error" };
  if (m.empty) return { skip: "empty-root" };

  // 세로로 긴 스토리 → 뷰포트 확장 후 재측정
  if (m.doc.h > VIEWPORT.height && m.doc.h <= MAX_VIEWPORT_H) {
    await page.setViewportSize({
      width: VIEWPORT.width,
      height: Math.min(MAX_VIEWPORT_H, Math.ceil(m.doc.h / 100) * 100),
    });
    await settle(page, 80);
  }
  const m2 = await measure(page);
  const vp = page.viewportSize();
  const PAD = 16;
  let clip = {
    x: Math.max(0, m2.x - PAD),
    y: Math.max(0, m2.y - PAD),
    width: m2.w + PAD * 2,
    height: m2.h + PAD * 2,
  };
  clip.width = Math.min(clip.width, vp.width - clip.x);
  clip.height = Math.min(clip.height, vp.height - clip.y);
  // 극소/과대 클립 보정
  if (
    clip.width < 40 ||
    clip.height < 24 ||
    clip.width * clip.height > vp.width * vp.height * 0.85
  ) {
    clip = { x: 0, y: 0, width: vp.width, height: vp.height };
  }
  clip = {
    x: Math.round(clip.x),
    y: Math.round(clip.y),
    width: Math.max(1, Math.round(clip.width)),
    height: Math.max(1, Math.round(clip.height)),
  };
  await page.screenshot({ path: file, clip });
  return { clip };
};

// ── 실행 ───────────────────────────────────────────────────
const results = [];
const t0 = Date.now();

// 캐시된 playwright 브라우저 리비전 불일치 → 시스템 Chrome 사용
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const ctx = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: DSF,
  reducedMotion: "reduce",
  colorScheme: "light",
  locale: "ko-KR",
  timezoneId: "Asia/Seoul",
});
await ctx.addInitScript(INIT_SCRIPT);

let cursor = 0;
const worker = async () => {
  const page = await ctx.newPage();
  for (;;) {
    const i = cursor++;
    if (i >= jobs.length) break;
    const job = jobs[i];
    const rec = { ...job, captures: [], failures: [] };
    try {
      await page.setViewportSize(VIEWPORT);
      await page.goto(`${BASE}/iframe.html?id=${job.storyId}&viewMode=story`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      await page.addStyleTag({ path: CSS_PATH }); // 앱 CSS 주입(빌드 누락 보정)
      await page.addStyleTag({ content: FREEZE_CSS });
      // 렌더 대기: 루트 채워지거나 에러 표시
      await page
        .waitForFunction(
          () =>
            document.querySelector("#storybook-root")?.childElementCount > 0 ||
            document.body.classList.contains("sb-show-errordisplay"),
          { timeout: 15000 },
        )
        .catch(() => {});
      await page.evaluate(() => document.fonts?.ready);
      // 이미지 로드 대기(외부 URL 스토리 포함) — 라이트 샷이 로드 레이스로 빈 렌더가 되는 것 방지
      await page
        .evaluate(() =>
          Promise.race([
            Promise.all(
              [...document.images].map(
                (img) =>
                  img.complete ||
                  new Promise((r) => {
                    img.onload = img.onerror = r;
                  }),
              ),
            ),
            new Promise((r) => setTimeout(r, 8000)), // 상한 8s
          ]),
        )
        .catch(() => {});
      await settle(page, 180);

      for (const theme of ["light", "dark"]) {
        await page.evaluate((t) => {
          if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
          else document.documentElement.removeAttribute("data-theme");
        }, theme);
        await settle(page, 90);
        const dir = path.join(OUT, job.ledgerId);
        mkdirSync(dir, { recursive: true });
        const file = path.join(dir, `${job.variant}-${theme}.png`);
        const r = await shoot(page, file);
        if (r.skip) rec.failures.push({ theme, reason: r.skip });
        else rec.captures.push({ theme, file: path.relative(PARITY, file), clip: r.clip });
      }
    } catch (e) {
      rec.failures.push({ theme: "both", reason: String(e).slice(0, 200) });
    }
    results.push(rec);
    if (results.length % 25 === 0)
      console.log(
        `[capture] ${results.length}/${jobs.length} (${Math.round((Date.now() - t0) / 1000)}s)`,
      );
  }
  await page.close();
};

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();

// 전 스토리 실패(빈 렌더) 컴포넌트의 빈 디렉토리 정리
const { readdirSync, rmdirSync } = await import("node:fs");
for (const d of readdirSync(OUT)) {
  const p = path.join(OUT, d);
  if (!readdirSync(p).length) rmdirSync(p);
}

// --only 재실행 시 기존 raw 와 병합(해당 storyId 만 교체)
const RAW_PATH = path.join(PARITY, "tools", ".capture-raw.json");
let merged = results;
if (ONLY.length) {
  try {
    const prev = JSON.parse(readFileSync(RAW_PATH, "utf8")).results;
    const redone = new Set(results.map((r) => r.storyId));
    merged = [...prev.filter((r) => !redone.has(r.storyId)), ...results];
  } catch {}
}
writeFileSync(
  RAW_PATH,
  JSON.stringify(
    { base: BASE, fixedDate: FIXED_DATE_ISO, viewport: VIEWPORT, dsf: DSF, results: merged },
    null,
    2,
  ),
);
const shot = results.reduce((n, r) => n + r.captures.length, 0);
const failed = results.filter((r) => r.failures.length);
console.log(
  `[capture] done: ${shot} captures, ${failed.length} stories with failures, ${Math.round(
    (Date.now() - t0) / 1000,
  )}s`,
);
if (failed.length)
  for (const f of failed.slice(0, 15))
    console.log("  fail:", f.storyId, f.failures.map((x) => x.reason).join("|"));
