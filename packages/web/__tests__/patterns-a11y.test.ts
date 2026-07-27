/**
 * Patterns 접근성 회귀 — 실제 axe 감사에서 발견된 구조/키보드 결함을 고정한다.
 */
import { beforeEach, describe, expect, test } from "vitest";
import "../src/components/calendar/index.js";
import "../src/components/virtual-list/index.js";
import type { JdCalendar } from "../src/components/calendar/element.js";
import type { JdVirtualList } from "../src/components/virtual-list/element.js";

const tick = () =>
  new Promise<void>((resolve) => queueMicrotask(() => queueMicrotask(resolve)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-calendar ARIA grid", () => {
  test("gridcell은 7칸짜리 row 안에 있고 달력 이름과 크기를 제공한다", async () => {
    document.body.innerHTML = `<jd-calendar></jd-calendar>`;
    await tick();
    const calendar = document.querySelector<JdCalendar>("jd-calendar")!;
    const grid = calendar.querySelector<HTMLElement>('[role="grid"]')!;
    const rows = Array.from(
      grid.querySelectorAll<HTMLElement>(":scope > [role=row]"),
    );

    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(grid.getAttribute("aria-label")).toMatch(/^\d{4}년 \d{1,2}월 달력$/);
    expect(grid.getAttribute("aria-colcount")).toBe("7");
    expect(grid.getAttribute("aria-rowcount")).toBe(String(rows.length));
    for (const row of rows) {
      expect(row.children).toHaveLength(7);
      for (const cell of row.querySelectorAll('[role="gridcell"]')) {
        expect(cell.parentElement).toBe(row);
      }
    }
  });

  test("사용자 이벤트 색은 장식 힌트일 뿐 텍스트 색을 덮지 않는다", async () => {
    const calendar = document.createElement("jd-calendar") as JdCalendar;
    calendar.events = [
      {
        id: "release",
        date: new Date().toISOString().slice(0, 10),
        label: "릴리스",
        color: "#8b5cf6",
      },
    ];
    document.body.append(calendar);
    await tick();

    const chip = calendar.querySelector<HTMLElement>(".jd-cal__chip")!;
    expect(chip.style.color).toBe("");
    expect(chip.style.getPropertyValue("--_jd-cal-event-color")).toBe(
      "#8b5cf6",
    );
  });
});

describe("jd-virtual-list 키보드 스크롤", () => {
  test("tabindex 미지정이면 탭스톱을 제공한다", async () => {
    document.body.innerHTML =
      `<jd-virtual-list height="120"><script type="application/json">["A","B"]</script></jd-virtual-list>`;
    await tick();
    expect(
      document.querySelector<JdVirtualList>("jd-virtual-list")!.tabIndex,
    ).toBe(0);
  });

  test("소비자가 지정한 tabindex는 재연결에서도 보존한다", async () => {
    const list = document.createElement("jd-virtual-list") as JdVirtualList;
    list.tabIndex = -1;
    document.body.append(list);
    await tick();
    list.remove();
    document.body.append(list);
    await tick();
    expect(list.tabIndex).toBe(-1);
  });
});
