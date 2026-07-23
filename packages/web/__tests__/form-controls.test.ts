/**
 * B3 폼 코어 — jd-icon-button/label/checkbox/toggle/switch.
 * 네이티브 위임·반영·이벤트·a11y 표면.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/icon-button/index.js";
import "../src/components/label/index.js";
import "../src/components/checkbox/index.js";
import "../src/components/toggle/index.js";
import "../src/components/switch/index.js";
import { JdIconButton } from "../src/components/icon-button/element.js";
import { JdCheckbox } from "../src/components/checkbox/element.js";
import { JdToggle } from "../src/components/toggle/element.js";
import { JdSwitch } from "../src/components/switch/element.js";
import { JdLabel } from "../src/components/label/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-icon-button", () => {
  test("네이티브 button + 아이콘 children 이동 + aria-label", async () => {
    document.body.innerHTML = `<jd-icon-button label="닫기"><svg id="ic"></svg></jd-icon-button>`;
    await tick();
    const el = document.querySelector<JdIconButton>("jd-icon-button")!;
    const btn = el.querySelector<HTMLButtonElement>(":scope > button.jd-icon-button")!;
    expect(btn.getAttribute("aria-label")).toBe("닫기");
    expect(btn.querySelector("#ic")).not.toBeNull();
    expect(btn.type).toBe("button");
  });

  test("variant/size 반영 + disabled 위임 — 네이티브 click 미발행", async () => {
    document.body.innerHTML = `<jd-icon-button label="x" variant="filled" size="lg" disabled></jd-icon-button>`;
    await tick();
    const el = document.querySelector<JdIconButton>("jd-icon-button")!;
    expect(el.variant).toBe("filled");
    const btn = el.querySelector<HTMLButtonElement>("button")!;
    expect(btn.disabled).toBe(true);
    const spy = vi.fn();
    el.addEventListener("click", spy);
    btn.click();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("jd-label", () => {
  test("내부 <label> + htmlFor ↔ for + required 반영", async () => {
    document.body.innerHTML = `<jd-label for="email" required>이메일</jd-label>`;
    await tick();
    const el = document.querySelector<JdLabel>("jd-label")!;
    const label = el.querySelector<HTMLLabelElement>(":scope > label.jd-label")!;
    expect(label.htmlFor).toBe("email");
    expect(label.textContent).toBe("이메일"); // *는 CSS ::after — DOM 노드 없음
    expect(el.required).toBe(true);
    el.htmlFor = "name";
    await tick();
    expect(label.htmlFor).toBe("name");
  });
});

describe("jd-checkbox", () => {
  test("네이티브 checkbox 위임 + label + change → jd-change·checked 반영", async () => {
    document.body.innerHTML = `<jd-checkbox label="동의합니다"></jd-checkbox>`;
    await tick();
    const el = document.querySelector<JdCheckbox>("jd-checkbox")!;
    const input = el.querySelector<HTMLInputElement>("input.jd-checkbox__input")!;
    expect(input.type).toBe("checkbox");
    expect(el.querySelector(".jd-checkbox__label")!.textContent).toBe("동의합니다");
    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    input.click();
    await tick();
    expect(el.checked).toBe(true);
    expect(el.hasAttribute("checked")).toBe(true);
    expect((spy.mock.calls[0]![0] as CustomEvent).detail).toEqual({ checked: true });
  });

  test("indeterminate → 네이티브 프로퍼티, 조작 시 해제", async () => {
    document.body.innerHTML = `<jd-checkbox indeterminate></jd-checkbox>`;
    await tick();
    const el = document.querySelector<JdCheckbox>("jd-checkbox")!;
    const input = el.querySelector<HTMLInputElement>("input")!;
    expect(input.indeterminate).toBe(true);
    input.click();
    await tick();
    expect(el.indeterminate).toBe(false);
    expect(input.indeterminate).toBe(false);
  });

  test("checked 프로퍼티 → input 미러 + name/value 폼 표면", async () => {
    document.body.innerHTML = `<jd-checkbox name="agree" value="yes"></jd-checkbox>`;
    await tick();
    const el = document.querySelector<JdCheckbox>("jd-checkbox")!;
    el.checked = true;
    await tick();
    const input = el.querySelector<HTMLInputElement>("input")!;
    expect(input.checked).toBe(true);
    expect(input.name).toBe("agree");
    expect(input.value).toBe("yes");
  });
});

describe("jd-toggle / jd-switch", () => {
  test("role=switch + aria-checked + 클릭 토글 + jd-change", async () => {
    document.body.innerHTML = `<jd-toggle label="알림"></jd-toggle>`;
    await tick();
    const el = document.querySelector<JdToggle>("jd-toggle")!;
    const btn = el.querySelector<HTMLButtonElement>("button.jd-toggle__track")!;
    expect(btn.getAttribute("role")).toBe("switch");
    expect(btn.getAttribute("aria-checked")).toBe("false");
    expect(btn.getAttribute("aria-label")).toBe("알림");
    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    btn.click();
    await tick();
    expect(el.checked).toBe(true);
    expect(btn.getAttribute("aria-checked")).toBe("true");
    expect((spy.mock.calls[0]![0] as CustomEvent).detail).toEqual({ checked: true });
  });

  test("라벨 없으면 접근성 기본 라벨 (토글/스위치 각자)", async () => {
    document.body.innerHTML = `<jd-toggle></jd-toggle><jd-switch></jd-switch>`;
    await tick();
    expect(document.querySelector("jd-toggle button")!.getAttribute("aria-label")).toBe("토글");
    expect(document.querySelector("jd-switch button")!.getAttribute("aria-label")).toBe("스위치");
  });

  test("jd-switch = Toggle 파생 — 자기 클래스 골격(jd-switch__*)", async () => {
    document.body.innerHTML = `<jd-switch checked size="lg"></jd-switch>`;
    await tick();
    const el = document.querySelector<JdSwitch>("jd-switch")!;
    expect(el).toBeInstanceOf(JdToggle);
    expect(el.querySelector(".jd-switch__thumb")).not.toBeNull();
    expect(el.querySelector(".jd-toggle__thumb")).toBeNull();
    expect(el.getAttribute("size")).toBe("lg");
  });

  test("disabled면 클릭 무시", async () => {
    document.body.innerHTML = `<jd-toggle disabled></jd-toggle>`;
    await tick();
    const el = document.querySelector<JdToggle>("jd-toggle")!;
    el.querySelector<HTMLButtonElement>("button")!.click();
    await tick();
    expect(el.checked).toBe(false);
  });
});
