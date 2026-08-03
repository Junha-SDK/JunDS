/**
 * JdElement 단위 테스트 (03-web-arch §1·§9) — 반영 규칙, 배칭, 수명주기, 이벤트.
 */
import { describe, expect, test, vi } from "vitest";
import { defineProps, JdElement } from "../src/core/element.js";
import { defineElement } from "../src/core/define.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

class TestEl extends JdElement {
  static tag = "jd-test";
  static props = defineProps({
    variant: { type: String, default: "primary", reflect: true },
    size: { type: String, default: "md" },
    count: { type: Number, default: 3 },
    loading: { type: Boolean, reflect: true },
    fullWidth: { type: Boolean },
    data: { type: String, attribute: false },
  });

  declare variant: string;
  declare size: string;
  declare count: number;
  declare loading: boolean;
  declare fullWidth: boolean;
  declare data: string;

  renderCount = 0;
  updateCount = 0;
  connectedCount = 0;

  addBehavior(b: { destroy(): void }) {
    return this.own(b);
  }
  fire<T>(name: `jd-${string}`, detail?: T, opts?: { cancelable?: boolean }) {
    return this.emit(name, detail, opts);
  }

  protected render(): void {
    this.renderCount += 1;
    this.update();
  }
  protected override update(): void {
    this.updateCount += 1;
  }
  protected connected(): void {
    this.connectedCount += 1;
  }
}
defineElement(TestEl.tag, TestEl);

function mount(html: string): TestEl {
  document.body.innerHTML = html;
  return document.querySelector<TestEl>("jd-test")!;
}

describe("attribute ↔ property 반영 (§1.3)", () => {
  test("선언 default가 프로퍼티 초기값", () => {
    const el = mount(`<jd-test></jd-test>`);
    expect(el.variant).toBe("primary");
    expect(el.size).toBe("md");
    expect(el.count).toBe(3);
    expect(el.loading).toBe(false);
    expect(el.fullWidth).toBe(false);
  });

  test("업그레이드 시점 attribute가 초기값 — kebab→camel 자동 변환", () => {
    const el = mount(`<jd-test variant="danger" count="7" full-width></jd-test>`);
    expect(el.variant).toBe("danger");
    expect(el.count).toBe(7);
    expect(el.fullWidth).toBe(true);
  });

  test("Boolean은 존재 여부가 값 — 빈 문자열도 true, 제거 시 false", () => {
    const el = mount(`<jd-test loading=""></jd-test>`);
    expect(el.loading).toBe(true);
    el.removeAttribute("loading");
    expect(el.loading).toBe(false);
  });

  test("Number NaN이면 default로 폴백", () => {
    const el = mount(`<jd-test count="abc"></jd-test>`);
    expect(el.count).toBe(3);
  });

  test("reflect: true 프로퍼티 대입이 attribute로 되쓰기", () => {
    const el = mount(`<jd-test></jd-test>`);
    el.variant = "ghost";
    expect(el.getAttribute("variant")).toBe("ghost");
    el.loading = true;
    expect(el.hasAttribute("loading")).toBe(true);
    el.loading = false;
    expect(el.hasAttribute("loading")).toBe(false);
  });

  test("reflect 없는 프로퍼티는 attribute 미기록", () => {
    const el = mount(`<jd-test></jd-test>`);
    el.size = "lg";
    expect(el.hasAttribute("size")).toBe(false);
  });

  test("attribute: false는 observedAttributes에서 제외 (property 전용)", () => {
    expect(TestEl.observedAttributes).toEqual([
      "variant",
      "size",
      "count",
      "loading",
      "full-width",
    ]);
  });

  test("마지막 쓰기 승리 — property 후 attribute 변경도 반영", () => {
    const el = mount(`<jd-test></jd-test>`);
    el.variant = "ghost";
    el.setAttribute("variant", "danger");
    expect(el.variant).toBe("danger");
  });

  test("업그레이드 전 대입된 own property 회수 (#upgradeProps)", async () => {
    // happy-dom은 define 시점의 기존 엘리먼트 늦은 업그레이드를 지원하지 않으므로
    // (실브라우저 경로는 Playwright 층 몫 — 03-web-arch §9.1), 접근자를 가리는
    // own property를 직접 만들어 최초 connectedCallback의 회수 경로만 검증한다.
    const el = document.createElement("jd-test") as TestEl;
    Object.defineProperty(el, "count", {
      value: 42,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    expect(Object.prototype.hasOwnProperty.call(el, "count")).toBe(true);
    document.body.append(el);
    await tick(); // 지연 render 후 upgradeProps 수행
    expect(el.count).toBe(42); // setter 경유로 재대입되어 값 보존
    expect(Object.prototype.hasOwnProperty.call(el, "count")).toBe(false);
  });
});

describe("라이프사이클 (§1.4)", () => {
  test("updateComplete는 최초 render와 현재 배칭 update 완료를 기다린다", async () => {
    const el = mount(`<jd-test></jd-test>`);
    await el.updateComplete;
    expect(el.renderCount).toBe(1);

    const before = el.updateCount;
    el.size = "lg";
    el.count = 8;
    await el.updateComplete;
    expect(el.updateCount).toBe(before + 1);
  });

  test("같은 값을 다시 대입하면 불필요한 update를 예약하지 않는다", async () => {
    const el = mount(`<jd-test></jd-test>`);
    await el.updateComplete;
    el.size = "lg";
    await el.updateComplete;
    const before = el.updateCount;
    el.size = "lg";
    await tick();
    expect(el.updateCount).toBe(before);
  });

  test("render()는 최초 연결 1회 — 재연결 시 connected()만", async () => {
    const el = mount(`<jd-test></jd-test>`);
    await tick(); // 최초 render는 지연 실행(스트리밍 파서 안전 — DECISIONS G1 항목)
    expect(el.renderCount).toBe(1);
    expect(el.connectedCount).toBe(1);
    el.remove();
    document.body.append(el);
    expect(el.renderCount).toBe(1);
    expect(el.connectedCount).toBe(2);
  });

  test("마이크로태스크 배칭 — 같은 태스크의 다중 변경은 update() 1회", async () => {
    const el = mount(`<jd-test></jd-test>`);
    await tick();
    const before = el.updateCount;
    el.variant = "ghost";
    el.size = "lg";
    el.count = 9;
    el.setAttribute("count", "11");
    await tick();
    expect(el.updateCount).toBe(before + 1);
    expect(el.count).toBe(11);
  });

  test("own() 등록 Behavior는 disconnected 시 전부 destroy (멱등 회수)", () => {
    const el = mount(`<jd-test></jd-test>`);
    const destroy = vi.fn();
    el.addBehavior({ destroy });
    el.remove();
    expect(destroy).toHaveBeenCalledTimes(1);
    document.body.append(el);
    el.remove();
    expect(destroy).toHaveBeenCalledTimes(1); // 재등록 없으면 재호출 없음
  });
});

describe("이벤트 규약 (§1.5)", () => {
  test("emit: jd-* CustomEvent, bubbles=true, composed=false, cancelable 기본 false", () => {
    const el = mount(`<div id="wrap"><jd-test></jd-test></div>`)!;
    const target = document.querySelector<TestEl>("jd-test")!;
    let seen: CustomEvent | undefined;
    document
      .getElementById("wrap")!
      .addEventListener("jd-change", (e) => (seen = e as CustomEvent));
    const notCanceled = target.fire("jd-change", { value: 1 });
    expect(seen).toBeTruthy();
    expect(seen!.detail).toEqual({ value: 1 });
    expect(seen!.bubbles).toBe(true);
    expect(seen!.composed).toBe(false);
    expect(seen!.cancelable).toBe(false);
    expect(notCanceled).toBe(true);
  });

  test("요청형만 cancelable — preventDefault 시 emit이 false 반환", () => {
    const el = mount(`<jd-test></jd-test>`);
    el.addEventListener("jd-request-close", (e) => e.preventDefault());
    expect(el.fire("jd-request-close", undefined, { cancelable: true })).toBe(false);
  });
});

describe("등록 가드 (§2)", () => {
  test("선등록 승리 + 경고 — 재정의 throw 없음", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    class Other extends JdElement {
      protected render(): void {}
    }
    expect(() => defineElement("jd-test", Other)).not.toThrow();
    expect(customElements.get("jd-test")).toBe(TestEl);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  test("동일 클래스 재등록은 조용히 무시", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    defineElement("jd-test", TestEl);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
