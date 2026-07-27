/**
 * <jd-button> 단위 테스트 (03-web-arch §9.3 규범 형태) —
 * 반영·네이티브 위임·loading/aria·이벤트·입양 멱등성.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/button/index.js";
import { JdButton } from "../src/components/button/element.js";

const tick = () =>
  new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

async function mount(html: string): Promise<JdButton> {
  document.body.innerHTML = html;
  await tick(); // 최초 render는 지연 실행(스트리밍 파서 안전) — DECISIONS G1 항목
  return document.querySelector<JdButton>("jd-button")!;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-button 골격·반영", () => {
  test("네이티브 <button class=jd-button>을 렌더하고 children을 이동한다", async () => {
    const el = await mount(`<jd-button>저장</jd-button>`);
    const btn = el.querySelector<HTMLButtonElement>(
      ":scope > button.jd-button",
    );
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toBe("저장");
    expect(el.childElementCount).toBe(1);
  });

  test("variant/size 기본값이 reflect된다 (스타일 훅 §4.3)", async () => {
    const el = await mount(`<jd-button>저장</jd-button>`);
    el.variant = "danger";
    el.size = "lg";
    await tick();
    expect(el.getAttribute("variant")).toBe("danger");
    expect(el.getAttribute("size")).toBe("lg");
  });

  test("attribute → property 강제 (variant enum)", async () => {
    const el = await mount(
      `<jd-button variant="ghost" size="xs">x</jd-button>`,
    );
    expect(el.variant).toBe("ghost");
    expect(el.size).toBe("xs");
  });

  test("disabled면 내부 button이 disabled (네이티브 위임 §1.6-1)", async () => {
    const el = await mount(`<jd-button disabled>저장</jd-button>`);
    const btn = el.querySelector<HTMLButtonElement>("button.jd-button")!;
    expect(btn.disabled).toBe(true);
    el.disabled = false;
    await tick();
    expect(btn.disabled).toBe(false);
  });

  test("loading이면 내부 button이 disabled + aria-busy + 스피너", async () => {
    const el = await mount(`<jd-button loading>저장</jd-button>`);
    const btn = el.querySelector<HTMLButtonElement>("button.jd-button")!;
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute("aria-busy")).toBe("true");
    expect(btn.querySelector(".jd-button__spinner")).not.toBeNull();
    el.loading = false;
    await tick();
    expect(btn.disabled).toBe(false);
    expect(btn.hasAttribute("aria-busy")).toBe(false);
    expect(btn.querySelector(".jd-button__spinner")).toBeNull();
  });

  test("type이 내부 button에 전파된다 (폼 제출 위임)", async () => {
    const el = await mount(`<jd-button type="submit">제출</jd-button>`);
    const btn = el.querySelector<HTMLButtonElement>("button.jd-button")!;
    expect(btn.type).toBe("submit");
  });

  test("지원하지 않는 type 값은 안전한 button으로 정규화한다", async () => {
    const el = await mount(`<jd-button type="menu">메뉴</jd-button>`);
    expect(el.querySelector<HTMLButtonElement>("button.jd-button")!.type).toBe(
      "button",
    );
  });

  test("fullWidth ↔ full-width kebab 반영", async () => {
    const el = await mount(`<jd-button full-width>x</jd-button>`);
    expect(el.fullWidth).toBe(true);
    el.fullWidth = false;
    await tick();
    expect(el.hasAttribute("full-width")).toBe(false);
  });
});

describe("jd-button 이벤트·키보드", () => {
  test("click은 네이티브 버블 그대로 — jd-click 재발명 없음(§1.5)", async () => {
    const el = await mount(`<jd-button>저장</jd-button>`);
    const spy = vi.fn();
    el.addEventListener("click", spy);
    el.querySelector<HTMLButtonElement>("button.jd-button")!.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("disabled면 네이티브 click 미발행 (공짜 §10 주해)", async () => {
    const el = await mount(`<jd-button disabled>저장</jd-button>`);
    const spy = vi.fn();
    el.addEventListener("click", spy);
    el.querySelector<HTMLButtonElement>("button.jd-button")!.click();
    expect(spy).not.toHaveBeenCalled();
  });

  test("내부 button이 키보드 포커스 대상 (네이티브 위임 — tabindex 재구현 없음)", async () => {
    const el = await mount(`<jd-button>저장</jd-button>`);
    const btn = el.querySelector<HTMLButtonElement>("button.jd-button")!;
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  test("호스트 focus()/click()이 내부 네이티브 button으로 위임된다", async () => {
    const el = await mount(`<jd-button>저장</jd-button>`);
    const btn = el.querySelector<HTMLButtonElement>("button.jd-button")!;
    const spy = vi.fn();
    btn.addEventListener("click", spy);
    el.focus();
    expect(document.activeElement).toBe(btn);
    el.click();
    expect(spy).toHaveBeenCalledOnce();
  });
});

describe("jd-button 렌더 멱등·입양 (§3.3)", () => {
  test("기존 골격을 입양하고 재구축하지 않는다", async () => {
    document.body.innerHTML = `<jd-button variant="primary"><button class="jd-button" type="button">SSR</button></jd-button>`;
    const el = document.querySelector<JdButton>("jd-button")!;
    await tick();
    const btn = el.querySelector("button.jd-button")!;
    // 재연결해도 render()는 1회 — DOM 동일 참조 유지
    el.remove();
    document.body.append(el);
    expect(el.querySelector("button.jd-button")).toBe(btn);
    expect(el.querySelectorAll("button").length).toBe(1);
  });
});
