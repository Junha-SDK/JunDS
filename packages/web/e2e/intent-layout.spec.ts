/**
 * 의도 배치 프리미티브의 **실제 꺾임** (DEC-052).
 *
 * ## 왜 e2e인가
 * 단위 테스트는 happy-dom이라 배치를 하지 않는다. 그래서 지금까지 검증한 것은
 * "calc 식이 CSS에 들어 있다"뿐이고, **그 식이 실제로 접히게 하는지**는 확인한 적이 없었다.
 * 이 컴포넌트들의 값어치가 전부 그 동작에 있으므로 그건 검증한 게 아니다.
 *
 * ## 특히 무엇을 보나
 * `jd-switcher`·`jd-sidebar-layout`의 주장은 "뷰포트가 아니라 **자기가 놓인 자리**의 폭을
 * 본다"이다. 그래서 넓은 뷰포트 안에 **좁은 부모**를 두고, 그 안에서 접히는지를 본다 —
 * 미디어 쿼리로 짰다면 여기서 안 접히고 찌그러진다. 이게 이 설계의 결정적 실험이다.
 *
 * 서버를 띄우지 않는다: 빌드 산출물(dist)을 빈 페이지에 주입한다. 쇼케이스 라우트에
 * 의존하면 그 페이지가 바뀔 때마다 같이 깨진다.
 */
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "dist");

const bundle = readFileSync(join(dist, "junds.min.js"), "utf8");
const tokens = readFileSync(join(here, "..", "src/styles/tokens.css"), "utf8");
const componentCss = ["switcher", "sidebar-layout", "split"]
  .map((name) => readFileSync(join(dist, "css", `${name}.css`), "utf8"))
  .join("\n");

async function mount(page: Page, html: string): Promise<void> {
  await page.setContent(`<!doctype html><html><head></head><body>${html}</body></html>`);
  await page.addStyleTag({ content: `${tokens}\n${componentCss}` });
  await page.addScriptTag({ content: bundle });
  // 커스텀 엘리먼트 업그레이드 대기 — 정의 전에 재면 아직 인라인 스타일이 없다
  await page.waitForFunction(() => customElements.get("jd-switcher") !== undefined);
}

/** 자식들이 한 줄에 있는가 (같은 y) */
async function isSingleRow(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const children = [...document.querySelectorAll(`${sel} > *`)] as HTMLElement[];
    if (children.length < 2) return true;
    const first = children[0]!.getBoundingClientRect();
    return children.every((c) => Math.abs(c.getBoundingClientRect().top - first.top) < 1);
  }, selector);
}

const BOX = `<div style="height:40px;background:#ccc"></div>`;

test.describe("jd-switcher", () => {
  test("임계값 이상이면 한 줄, 미만이면 세로로 쌓인다", async ({ page }) => {
    await mount(page, `<jd-switcher threshold="md" id="s">${BOX}${BOX}</jd-switcher>`);

    await page.setViewportSize({ width: 1000, height: 600 });
    expect(await isSingleRow(page, "#s")).toBe(true);

    await page.setViewportSize({ width: 500, height: 600 });
    expect(await isSingleRow(page, "#s")).toBe(false);
  });

  // 이 테스트가 이 설계의 요점이다 — 뷰포트는 넓은데 자리는 좁을 때.
  // 미디어 쿼리로 짰다면 화면이 넓으므로 가로를 유지한 채 찌그러진다.
  test("뷰포트가 아니라 컨테이너 폭을 본다 (좁은 부모 안에서 접힌다)", async ({ page }) => {
    await mount(
      page,
      `<div style="width:300px"><jd-switcher threshold="md" id="s">${BOX}${BOX}</jd-switcher></div>`,
    );
    await page.setViewportSize({ width: 1400, height: 800 });
    expect(await isSingleRow(page, "#s")).toBe(false);
  });

  test("가로일 때 자식이 폭을 균등하게 나눈다", async ({ page }) => {
    await mount(page, `<jd-switcher threshold="sm" id="s">${BOX}${BOX}</jd-switcher>`);
    await page.setViewportSize({ width: 1000, height: 600 });
    const widths = await page.evaluate(() =>
      [...document.querySelectorAll("#s > *")].map((c) => c.getBoundingClientRect().width),
    );
    expect(Math.abs(widths[0]! - widths[1]!)).toBeLessThan(1);
  });

  test("threshold를 바꾸면 꺾이는 지점이 따라온다", async ({ page }) => {
    await mount(page, `<jd-switcher threshold="sm" id="s">${BOX}${BOX}</jd-switcher>`);
    await page.setViewportSize({ width: 800, height: 600 });
    expect(await isSingleRow(page, "#s")).toBe(true); // 800 >= sm(640)

    await page.evaluate(() => document.querySelector("#s")!.setAttribute("threshold", "lg"));
    expect(await isSingleRow(page, "#s")).toBe(false); // 800 < lg(1024)
  });
});

test.describe("jd-sidebar-layout", () => {
  test("본문이 최소 폭을 못 지키면 쌓인다", async ({ page }) => {
    await mount(
      page,
      `<jd-sidebar-layout id="s" side-width="240px" content-min="320px">
         ${BOX}${BOX}
       </jd-sidebar-layout>`,
    );

    await page.setViewportSize({ width: 1000, height: 600 });
    expect(await isSingleRow(page, "#s")).toBe(true);

    await page.setViewportSize({ width: 420, height: 600 });
    expect(await isSingleRow(page, "#s")).toBe(false);
  });

  // 꺾이는 폭을 따로 관리하지 않는다는 주장의 실물 확인 —
  // side-width만 키워도 같은 뷰포트에서 쌓여야 한다.
  test("side-width를 키우면 임계값이 따라온다", async ({ page }) => {
    await mount(
      page,
      `<jd-sidebar-layout id="s" side-width="200px" content-min="320px">
         ${BOX}${BOX}
       </jd-sidebar-layout>`,
    );
    await page.setViewportSize({ width: 620, height: 600 });
    expect(await isSingleRow(page, "#s")).toBe(true);

    await page.evaluate(() => document.querySelector("#s")!.setAttribute("side-width", "400px"));
    expect(await isSingleRow(page, "#s")).toBe(false);
  });

  test("side=end는 시각 순서만 뒤집고 DOM 순서는 유지한다", async ({ page }) => {
    await mount(
      page,
      `<jd-sidebar-layout id="s" side="end" side-width="200px">
         <nav id="side" style="height:40px;background:#aaa"></nav>
         <article id="main" style="height:40px;background:#ddd"></article>
       </jd-sidebar-layout>`,
    );
    await page.setViewportSize({ width: 1000, height: 600 });

    const { sideX, mainX, domOrder } = await page.evaluate(() => ({
      sideX: document.querySelector("#side")!.getBoundingClientRect().left,
      mainX: document.querySelector("#main")!.getBoundingClientRect().left,
      domOrder: [...document.querySelectorAll("#s > *")].map((c) => c.id),
    }));
    expect(sideX).toBeGreaterThan(mainX); // 시각적으로 오른쪽
    expect(domOrder).toEqual(["side", "main"]); // 탭·리더 순서는 그대로
  });
});

test.describe("jd-split", () => {
  test("두 덩어리를 양끝으로 민다", async ({ page }) => {
    await mount(
      page,
      `<jd-split id="s" style="width:600px">
         <div id="a" style="width:80px;height:24px;background:#aaa"></div>
         <div id="b" style="width:80px;height:24px;background:#ddd"></div>
       </jd-split>`,
    );
    const { left, right, container } = await page.evaluate(() => ({
      left: document.querySelector("#a")!.getBoundingClientRect(),
      right: document.querySelector("#b")!.getBoundingClientRect(),
      container: document.querySelector("#s")!.getBoundingClientRect(),
    }));
    expect(left.left - container.left).toBeLessThan(1);
    expect(container.right - right.right).toBeLessThan(1);
  });

  test("좁아지면 겹치는 대신 줄바꿈한다", async ({ page }) => {
    await mount(
      page,
      `<jd-split id="s" style="width:150px">
         <div style="width:100px;height:24px;background:#aaa"></div>
         <div style="width:100px;height:24px;background:#ddd"></div>
       </jd-split>`,
    );
    expect(await isSingleRow(page, "#s")).toBe(false);
  });
});
