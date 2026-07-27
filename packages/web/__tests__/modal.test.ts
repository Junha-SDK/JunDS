/**
 * <jd-modal> 단위 테스트 — open/showModal/close, jd-request-close(cancelable) 게이트,
 * ESC/백드롭 닫기, 스크롤 락, 사후 jd-open/jd-close, ARIA, 입양.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/modal/index.js";
import { JdModal } from "../src/components/modal/element.js";

const tick = () =>
  new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

async function mount(
  inner = `<button id="ok">확인</button>`,
): Promise<JdModal> {
  document.body.innerHTML = `<jd-modal>${inner}</jd-modal>`;
  await tick(); // 최초 render 지연 실행
  return document.querySelector<JdModal>("jd-modal")!;
}
const esc = () =>
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );

beforeEach(() => {
  document.body.innerHTML = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
});

describe("jd-modal 골격·ARIA", () => {
  test("backdrop + panel(role=dialog, aria-modal) 골격, children은 패널로 이동", async () => {
    const el = await mount(`<p>내용</p>`);
    const panel = el.querySelector<HTMLDivElement>(
      ":scope > .jd-modal__panel",
    )!;
    expect(el.querySelector(":scope > .jd-modal__backdrop")).not.toBeNull();
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.querySelector("p")!.textContent).toBe("내용");
  });

  test("size 디폴트는 attribute 미반영(base CSS 담당), 명시 set만 reflect", async () => {
    const el = await mount();
    expect(el.getAttribute("size")).toBeNull(); // §1.3 — reflect는 set 시점
    el.size = "lg";
    await tick();
    expect(el.getAttribute("size")).toBe("lg");
  });

  test("호스트의 aria-label/labelledby/describedby를 내부 dialog panel로 전달한다", async () => {
    const el = await mount(
      `<h2 id="title">제목</h2><p id="description">설명</p>`,
    );
    el.setAttribute("aria-labelledby", "title");
    el.setAttribute("aria-describedby", "description");
    await el.updateComplete;
    const panel = el.querySelector(".jd-modal__panel")!;
    expect(panel.getAttribute("aria-labelledby")).toBe("title");
    expect(panel.getAttribute("aria-describedby")).toBe("description");

    el.ariaLabel = "직접 이름";
    await el.updateComplete;
    expect(panel.getAttribute("aria-label")).toBe("직접 이름");
  });
});

describe("jd-modal 열림/닫힘 상태", () => {
  test("showModal() → open=true + [open] 반영 + jd-open(사후, non-cancelable)", async () => {
    const el = await mount();
    const spy = vi.fn();
    el.addEventListener("jd-open", spy);
    el.showModal();
    await tick();
    expect(el.open).toBe(true);
    expect(el.hasAttribute("open")).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect((spy.mock.calls[0]![0] as CustomEvent).cancelable).toBe(false);
  });

  test("close() → jd-request-close(reason: close) → jd-close", async () => {
    const el = await mount();
    const reqSpy = vi.fn();
    const closeSpy = vi.fn();
    el.addEventListener("jd-request-close", reqSpy);
    el.addEventListener("jd-close", closeSpy);
    el.showModal();
    await tick();
    el.close();
    await tick();
    expect(el.open).toBe(false);
    expect((reqSpy.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      reason: "close",
    });
    expect((reqSpy.mock.calls[0]![0] as CustomEvent).cancelable).toBe(true);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  test("jd-request-close preventDefault → 상태 변화 중단 (§1.5 요청형)", async () => {
    const el = await mount();
    el.addEventListener("jd-request-close", (e) => e.preventDefault());
    el.showModal();
    await tick();
    el.close();
    await tick();
    expect(el.open).toBe(true);
  });

  test("ESC → jd-request-close(reason: escape) 후 닫힘", async () => {
    const el = await mount();
    const reqSpy = vi.fn();
    el.addEventListener("jd-request-close", reqSpy);
    el.showModal();
    await tick();
    esc();
    await tick();
    expect(el.open).toBe(false);
    expect((reqSpy.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      reason: "escape",
    });
  });

  test("백드롭 클릭 → 닫힘 / persistent면 무시 (ESC는 항상 동작)", async () => {
    const el = await mount();
    el.showModal();
    await tick();
    el.querySelector<HTMLDivElement>(".jd-modal__backdrop")!.click();
    await tick();
    expect(el.open).toBe(false);

    el.persistent = true;
    el.showModal();
    await tick();
    el.querySelector<HTMLDivElement>(".jd-modal__backdrop")!.click();
    await tick();
    expect(el.open).toBe(true); // 백드롭 무시
    esc();
    await tick();
    expect(el.open).toBe(false); // ESC는 동작
  });

  test("닫힌 상태에선 ESC 리스너 없음 — close() no-op", async () => {
    const el = await mount();
    const reqSpy = vi.fn();
    el.addEventListener("jd-request-close", reqSpy);
    esc();
    el.close();
    await tick();
    expect(reqSpy).not.toHaveBeenCalled();
  });
});

describe("jd-modal 스크롤 락", () => {
  test("열림 → body overflow hidden, 닫힘 → 이전 값 복원", async () => {
    document.body.style.overflow = "auto";
    const el = await mount();
    el.showModal();
    await tick();
    expect(document.body.style.overflow).toBe("hidden");
    el.close();
    await tick();
    expect(document.body.style.overflow).toBe("auto");
  });

  test("중첩 모달은 마지막 모달이 닫힐 때까지 body 잠금을 유지한다", async () => {
    document.body.innerHTML =
      `<jd-modal id="first"><button>첫 번째</button></jd-modal>` +
      `<jd-modal id="second"><button>두 번째</button></jd-modal>`;
    await tick();
    const first = document.querySelector<JdModal>("#first")!;
    const second = document.querySelector<JdModal>("#second")!;

    first.showModal();
    second.showModal();
    await tick();
    expect(document.body.style.overflow).toBe("hidden");

    second.close();
    await tick();
    expect(document.body.style.overflow).toBe("hidden");

    first.close();
    await tick();
    expect(document.body.style.overflow).toBe("");
  });

  test("중첩 모달에서 Escape는 가장 위 모달만 닫는다", async () => {
    document.body.innerHTML =
      `<jd-modal id="first"><button>첫 번째</button></jd-modal>` +
      `<jd-modal id="second"><button>두 번째</button></jd-modal>`;
    await tick();
    const first = document.querySelector<JdModal>("#first")!;
    const second = document.querySelector<JdModal>("#second")!;
    first.showModal();
    second.showModal();
    await tick();

    esc();
    await tick();
    expect(second.open).toBe(false);
    expect(first.open).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    esc();
    await tick();
    expect(first.open).toBe(false);
  });
});

describe("jd-modal 포커스 트랩 연동", () => {
  test("열림 시 패널 내 첫 focusable로 포커스, 닫힘 시 이전 포커스 복귀", async () => {
    document.body.innerHTML =
      `<button id="opener">열기</button>` +
      `<jd-modal><button id="inner">확인</button></jd-modal>`;
    await tick();
    const opener = document.querySelector<HTMLButtonElement>("#opener")!;
    const el = document.querySelector<JdModal>("jd-modal")!;
    opener.focus();
    el.showModal();
    await tick();
    expect(document.activeElement?.id).toBe("inner");
    el.close();
    await tick();
    expect(document.activeElement).toBe(opener);
  });

  test("data-autofocus가 initialFocus 우선", async () => {
    document.body.innerHTML = `<jd-modal><button id="a">A</button><button id="b" data-autofocus>B</button></jd-modal>`;
    await tick();
    const el = document.querySelector<JdModal>("jd-modal")!;
    el.showModal();
    await tick();
    expect(document.activeElement?.id).toBe("b");
  });

  test("열림 중 Tab 순환 감금 (마지막 → 첫번째 랩)", async () => {
    document.body.innerHTML = `<jd-modal><button id="a">A</button><button id="b">B</button></jd-modal>`;
    await tick();
    const el = document.querySelector<JdModal>("jd-modal")!;
    el.showModal();
    await tick();
    document.querySelector<HTMLButtonElement>("#b")!.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement?.id).toBe("a");
  });
});

describe("jd-modal 입양·재연결 (§3.3)", () => {
  test("재연결 시 골격 재구축 없음 + 열림 상태 부수효과 복원", async () => {
    const el = await mount();
    el.showModal();
    await tick();
    const panel = el.querySelector(".jd-modal__panel")!;
    el.remove();
    expect(document.body.style.overflow).toBe(""); // disconnect가 락 회수
    document.body.append(el);
    await tick();
    expect(el.querySelector(".jd-modal__panel")).toBe(panel);
    expect(el.querySelectorAll(".jd-modal__panel").length).toBe(1);
    expect(document.body.style.overflow).toBe("hidden"); // 재연결이 락 복원
  });
});
