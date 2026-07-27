/**
 * Patterns와 고위험 동작의 실브라우저 안정성 계약.
 *
 * 재연결 시 이벤트 중복, 키보드 조작, 대용량 DOM 폭증은 happy-dom만으로
 * 놓치기 쉬우므로 실제 엔진에서 고정한다.
 */
import { expect, test } from "@playwright/test";
import { mount } from "./helpers.js";

test("jd-filter-bar: 재부모화 후 입력 이벤트가 정확히 한 번만 난다", async ({
  page,
}) => {
  await mount(
    page,
    `<div id="before"><jd-filter-bar id="filter" active-count="2"></jd-filter-bar></div>
     <div id="after"></div>`,
  );
  await page.evaluate(() => {
    const filter = document.querySelector("#filter")!;
    document.querySelector("#after")!.append(filter);
    (window as unknown as { inputCount: number }).inputCount = 0;
    filter.addEventListener("jd-input", () => {
      (window as unknown as { inputCount: number }).inputCount++;
    });
  });
  await page.locator("#filter input[type=search]").fill("접근성");
  expect(
    await page.evaluate(
      () => (window as unknown as { inputCount: number }).inputCount,
    ),
  ).toBe(1);
});

test("jd-tabs: 재연결 뒤에도 화살표 키가 비활성 탭을 건너뛴다", async ({
  page,
}) => {
  await mount(
    page,
    `<div id="before">
       <jd-tabs id="tabs" label="업무 상태" value="todo">
         <script type="application/json">[
           {"value":"todo","label":"할 일"},
           {"value":"blocked","label":"차단됨","disabled":true},
           {"value":"done","label":"완료"}
         ]</script>
       </jd-tabs>
     </div><div id="after"></div>`,
  );
  await page.evaluate(() =>
    document.querySelector("#after")!.append(document.querySelector("#tabs")!),
  );
  const first = page.getByRole("tab", { name: "할 일" });
  await first.focus();
  await first.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "완료" })).toBeFocused();
  await expect(page.locator("#tabs")).toHaveAttribute("value", "done");
});

test("jd-kanban: 재연결 뒤 키보드 카드 이동과 이벤트가 한 번만 성립한다", async ({
  page,
}) => {
  await mount(
    page,
    `<div id="before"><jd-kanban id="board">
      <script type="application/json">[
        {"id":"todo","title":"할 일","items":[{"id":"a","title":"접근성 점검"}]},
        {"id":"done","title":"완료","items":[]}
      ]</script>
    </jd-kanban></div><div id="after"></div>`,
  );
  await page.evaluate(() => {
    const board = document.querySelector("#board")!;
    document.querySelector("#after")!.append(board);
    (window as unknown as { moveCount: number }).moveCount = 0;
    board.addEventListener("jd-move", () => {
      (window as unknown as { moveCount: number }).moveCount++;
    });
  });
  const card = page.locator('[data-card="a"]');
  await card.focus();
  await card.press("Control+ArrowRight");
  await expect(page.locator('[data-column="done"] [data-card="a"]')).toBeFocused();
  expect(
    await page.evaluate(
      () => (window as unknown as { moveCount: number }).moveCount,
    ),
  ).toBe(1);
});

test("jd-virtual-list: 5천 항목도 화면 근처 행만 DOM에 둔다", async ({
  page,
}) => {
  await mount(page, `<jd-virtual-list id="list" height="240" item-height="32"></jd-virtual-list>`);
  await page.evaluate(() => {
    const list = document.querySelector("#list") as HTMLElement & {
      items: string[];
      range: { start: number; end: number };
    };
    list.items = Array.from({ length: 5_000 }, (_, index) => `항목 ${index + 1}`);
  });
  await expect
    .poll(() => page.locator(".jd-virtual-scroll__item").count())
    .toBeGreaterThan(0);
  const initialCount = await page.locator(".jd-virtual-scroll__item").count();
  expect(initialCount).toBeLessThan(30);

  await page.locator("#list").evaluate((element) => {
    element.scrollTop = 32 * 4_000;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect(page.locator(".jd-virtual-scroll__item").first()).toHaveAttribute(
    "aria-posinset",
    /399[0-9]|400[0-9]/,
  );
  expect(await page.locator(".jd-virtual-scroll__item").count()).toBeLessThan(30);
});
