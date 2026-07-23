/**
 * createFocusTrap Behavior 테스트 (03-web-arch §5.1·§8) —
 * activate/deactivate/destroy 수명주기, Tab 순환, initialFocus, 복귀 포커스, 멱등성.
 */
import { beforeEach, describe, expect, test } from "vitest";
import { createFocusTrap } from "../src/behaviors/focus-trap.js";

function setup(inner: string): HTMLDivElement {
  document.body.innerHTML = `<button id="outside">밖</button><div id="trap">${inner}</div>`;
  return document.querySelector<HTMLDivElement>("#trap")!;
}
const tab = (shiftKey = false) =>
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true, cancelable: true }),
  );

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("activate / initialFocus", () => {
  test("create만으로는 리스너·포커스 없음(지연 시작 §5.1) — activate가 시작점", () => {
    const c = setup(`<button id="a">A</button>`);
    const trap = createFocusTrap(c);
    expect(document.activeElement?.id).not.toBe("a");
    trap.activate();
    expect(document.activeElement?.id).toBe("a");
    trap.destroy();
  });

  test("initialFocus 셀렉터 우선, 미발견 시 첫 focusable", () => {
    const c = setup(`<button id="a">A</button><button id="b" class="init">B</button>`);
    const trap = createFocusTrap(c, { initialFocus: ".init" });
    trap.activate();
    expect(document.activeElement?.id).toBe("b");
    trap.destroy();

    const trap2 = createFocusTrap(c, { initialFocus: ".none" });
    trap2.activate();
    expect(document.activeElement?.id).toBe("a");
    trap2.destroy();
  });

  test("focusable 부재 시 컨테이너 자체에 tabindex=-1 포커스 (감금 기점)", () => {
    const c = setup(`<p>텍스트만</p>`);
    const trap = createFocusTrap(c);
    trap.activate();
    expect(c.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(c);
    trap.destroy();
  });
});

describe("Tab 순환 감금", () => {
  test("마지막에서 Tab → 첫번째, 첫번째에서 Shift+Tab → 마지막", () => {
    const c = setup(`<button id="a">A</button><input id="b"><button id="c">C</button>`);
    const trap = createFocusTrap(c);
    trap.activate();

    document.querySelector<HTMLButtonElement>("#c")!.focus();
    tab();
    expect(document.activeElement?.id).toBe("a");

    tab(true); // 첫번째에서 Shift+Tab
    expect(document.activeElement?.id).toBe("c");
    trap.destroy();
  });

  test("disabled 컨트롤은 순환에서 제외", () => {
    const c = setup(`<button id="a">A</button><button id="b" disabled>B</button>`);
    const trap = createFocusTrap(c);
    trap.activate();
    tab(); // a(마지막 유효)에서 Tab → a로 랩
    expect(document.activeElement?.id).toBe("a");
    trap.destroy();
  });

  test("포커스가 트랩 밖으로 새면 Tab 시 첫 요소로 회수", () => {
    const c = setup(`<button id="a">A</button>`);
    const trap = createFocusTrap(c);
    trap.activate();
    document.querySelector<HTMLButtonElement>("#outside")!.focus();
    tab();
    expect(document.activeElement?.id).toBe("a");
    trap.destroy();
  });
});

describe("deactivate / destroy 수명주기", () => {
  test("deactivate → 복귀 포커스 + 리스너 제거", () => {
    const c = setup(`<button id="a">A</button>`);
    const outside = document.querySelector<HTMLButtonElement>("#outside")!;
    outside.focus();
    const trap = createFocusTrap(c);
    trap.activate();
    expect(document.activeElement?.id).toBe("a");
    trap.deactivate();
    expect(document.activeElement).toBe(outside); // 복귀
    document.querySelector<HTMLButtonElement>("#a")!.focus();
    tab(); // 리스너 없음 — 랩 미발생 (happy-dom은 기본 Tab 이동 없음 → 그대로)
    expect(document.activeElement?.id).toBe("a");
    trap.destroy();
  });

  test("returnFocus: false면 복귀하지 않음", () => {
    const c = setup(`<button id="a">A</button>`);
    const outside = document.querySelector<HTMLButtonElement>("#outside")!;
    outside.focus();
    const trap = createFocusTrap(c, { returnFocus: false });
    trap.activate();
    trap.deactivate();
    expect(document.activeElement?.id).toBe("a");
    trap.destroy();
  });

  test("destroy는 멱등(2회 무해)이며 활성 상태면 deactivate까지 수행, 이후 activate 무시", () => {
    const c = setup(`<button id="a">A</button>`);
    const outside = document.querySelector<HTMLButtonElement>("#outside")!;
    outside.focus();
    const trap = createFocusTrap(c);
    trap.activate();
    trap.destroy();
    expect(document.activeElement).toBe(outside);
    trap.destroy(); // 2회 무해
    trap.activate(); // destroyed — no-op
    expect(document.activeElement).toBe(outside);
  });

  test("update()로 옵션 변경 (재생성 없이)", () => {
    const c = setup(`<button id="a">A</button><button id="b" class="init">B</button>`);
    const trap = createFocusTrap(c);
    trap.update!({ initialFocus: ".init" });
    trap.activate();
    expect(document.activeElement?.id).toBe("b");
    trap.destroy();
  });
});
