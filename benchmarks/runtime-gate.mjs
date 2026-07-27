/**
 * @junds/web 실브라우저 런타임 성능 게이트.
 *
 * 전체 CE 등록, 300개 버튼 최초 렌더/갱신, 5,000행 가상 목록, 5,000회
 * 연결·해제와 GC 후 heap 증가를 Chromium에서 측정한다. 번들 크기 게이트가 잡지
 * 못하는 초기화·대량 DOM·리스너 정리 회귀를 보완한다.
 *
 * 전제: npm run build -w @junds/web
 */
import { chromium } from "playwright";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const webDist = join(root, "packages/web/dist");
const bundlePath = join(webDist, "junds.min.js");
const cssPath = join(webDist, "junds.css");
const budgetPath = join(root, "docs-spec/registry/runtime-budgets.json");
const reportPath = join(root, "coverage/runtime/runtime-summary.json");

for (const path of [bundlePath, cssPath]) {
  if (!existsSync(path)) {
    console.error(`[runtime] ${path} 없음 — @junds/web을 먼저 build 하세요.`);
    process.exit(1);
  }
}

const bundle = readFileSync(bundlePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const budgets = JSON.parse(readFileSync(budgetPath, "utf8"));

const browser = await chromium.launch({ headless: true }).catch(() =>
  chromium.launch({ headless: true, channel: "chrome" }),
);

async function nextPaint(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

async function heapUsed(session) {
  await session.send("HeapProfiler.collectGarbage");
  const result = await session.send("Performance.getMetrics");
  return (
    result.metrics.find((metric) => metric.name === "JSHeapUsedSize")?.value ?? 0
  );
}

let metrics;
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const session = await page.context().newCDPSession(page);
  await session.send("Performance.enable");
  await session.send("HeapProfiler.enable");
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body></body></html>`,
  );

  const registrationMs = await page.evaluate((source) => {
    const start = performance.now();
    (0, eval)(source);
    return performance.now() - start;
  }, bundle);
  await nextPaint(page);

  const buttonRenderMs = await page.evaluate(async () => {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 300; index++) {
      const button = document.createElement("jd-button");
      button.textContent = `작업 ${index + 1}`;
      fragment.append(button);
    }
    const start = performance.now();
    document.body.append(fragment);
    await Promise.all(
      [...document.querySelectorAll("jd-button")].map(
        (button) => button.updateComplete,
      ),
    );
    return performance.now() - start;
  });

  const buttonUpdateMs = await page.evaluate(async () => {
    const buttons = [...document.querySelectorAll("jd-button")];
    const start = performance.now();
    for (const [index, button] of buttons.entries()) {
      button.setAttribute("variant", index % 2 ? "outline" : "secondary");
      button.toggleAttribute("loading", index % 17 === 0);
    }
    await Promise.all(buttons.map((button) => button.updateComplete));
    return performance.now() - start;
  });

  const virtualList5000Ms = await page.evaluate(async () => {
    const list = document.createElement("jd-virtual-list");
    list.setAttribute("height", "420");
    list.setAttribute("item-height", "36");
    list.items = Array.from({ length: 5_000 }, (_, index) => `항목 ${index + 1}`);
    const start = performance.now();
    document.body.append(list);
    await list.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const rendered = list.querySelectorAll('[role="listitem"]').length;
    if (rendered <= 0 || rendered >= 100) {
      throw new Error(`가상화 실패: 5,000행 중 DOM ${rendered}행`);
    }
    return performance.now() - start;
  });

  await page.evaluate(() => {
    document.body.textContent = "";
  });
  await nextPaint(page);
  const heapBefore = await heapUsed(session);
  const lifecycle5000Ms = await page.evaluate(async () => {
    const start = performance.now();
    for (let batch = 0; batch < 50; batch++) {
      const fragment = document.createDocumentFragment();
      for (let index = 0; index < 100; index++) {
        const button = document.createElement("jd-button");
        button.textContent = "재연결";
        fragment.append(button);
      }
      const host = document.createElement("div");
      host.append(fragment);
      document.body.append(host);
      await Promise.resolve();
      host.remove();
    }
    await Promise.resolve();
    return performance.now() - start;
  });
  const heapAfter = await heapUsed(session);

  metrics = {
    registrationMs,
    buttonRenderMs,
    buttonUpdateMs,
    virtualList5000Ms,
    lifecycle5000Ms,
    heapGrowthBytes: Math.max(0, heapAfter - heapBefore),
  };
} finally {
  await browser.close();
}

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(
  reportPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: `${process.platform}-${process.arch}`,
      },
      budgets,
      metrics,
    },
    null,
    2,
  ) + "\n",
);

const failures = [];
for (const [name, value] of Object.entries(metrics)) {
  const budget = budgets[name];
  const unit = name.endsWith("Bytes") ? "B" : "ms";
  const shown =
    unit === "B"
      ? `${(value / 1024 / 1024).toFixed(2)}MB`
      : `${value.toFixed(2)}ms`;
  const cap =
    unit === "B"
      ? `${(budget / 1024 / 1024).toFixed(2)}MB`
      : `${budget.toFixed(0)}ms`;
  const ok = value <= budget;
  console.log(`[runtime] ${name}: ${shown} / ${cap} ${ok ? "OK" : "FAIL"}`);
  if (!ok) failures.push(`${name} ${shown} > ${cap}`);
}
console.log(`[runtime] report ${reportPath}`);

if (failures.length > 0) {
  console.error(`\n[runtime] FAIL:\n - ${failures.join("\n - ")}`);
  process.exit(1);
}
console.log("\n[runtime] PASS");
