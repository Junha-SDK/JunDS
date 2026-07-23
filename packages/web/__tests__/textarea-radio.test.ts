/**
 * B3 — jd-textarea(autoResize·showCount·IME 안전) + jd-radio-group(JSON 슬롯·네이티브 위임).
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/textarea/index.js";
import "../src/components/radio-group/index.js";
import { JdTextarea } from "../src/components/textarea/element.js";
import { JdRadioGroup } from "../src/components/radio-group/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-textarea", () => {
  test("네이티브 textarea 위임 + placeholder/name/maxlength", async () => {
    document.body.innerHTML = `<jd-textarea placeholder="설명" name="desc" maxlength="100"></jd-textarea>`;
    await tick();
    const el = document.querySelector<JdTextarea>("jd-textarea")!;
    const ta = el.querySelector<HTMLTextAreaElement>("textarea.jd-textarea__input")!;
    expect(ta.placeholder).toBe("설명");
    expect(ta.name).toBe("desc");
    expect(ta.maxLength).toBe(100);
  });

  test("입력 → jd-input + value 동기화 (IME 안전 — 동일 값 재대입 없음)", async () => {
    document.body.innerHTML = `<jd-textarea></jd-textarea>`;
    await tick();
    const el = document.querySelector<JdTextarea>("jd-textarea")!;
    const ta = el.querySelector<HTMLTextAreaElement>("textarea")!;
    const spy = vi.fn();
    el.addEventListener("jd-input", spy);
    ta.value = "안녕";
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await tick();
    expect(el.value).toBe("안녕");
    expect((spy.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: "안녕" });
  });

  test("show-count + maxlength → 카운터 갱신", async () => {
    document.body.innerHTML = `<jd-textarea show-count maxlength="10" value="가나다"></jd-textarea>`;
    await tick();
    const el = document.querySelector<JdTextarea>("jd-textarea")!;
    const count = el.querySelector<HTMLElement>(".jd-textarea__count")!;
    expect(count.hidden).toBe(false);
    expect(count.textContent).toBe("3/10");
    const ta = el.querySelector<HTMLTextAreaElement>("textarea")!;
    ta.value = "가나다라마";
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await tick();
    expect(count.textContent).toBe("5/10");
  });

  test("maxlength 없으면 카운터 숨김 (v2 동형)", async () => {
    document.body.innerHTML = `<jd-textarea show-count></jd-textarea>`;
    await tick();
    expect(document.querySelector<HTMLElement>(".jd-textarea__count")!.hidden).toBe(true);
  });

  test("error/auto-resize 반영 (CSS 훅)", async () => {
    document.body.innerHTML = `<jd-textarea error auto-resize></jd-textarea>`;
    await tick();
    const el = document.querySelector<JdTextarea>("jd-textarea")!;
    expect(el.error).toBe(true);
    expect(el.autoResize).toBe(true);
  });
});

describe("jd-radio-group", () => {
  const JSON_SLOT =
    `<jd-radio-group name="pri" value="1">` +
    `<script type="application/json">[{"value":"0","label":"긴급"},{"value":"1","label":"높음"},{"value":"2","label":"보통","disabled":true}]</script>` +
    `</jd-radio-group>`;

  test("JSON 슬롯 → 네이티브 radio 행 + role=radiogroup + 초기 선택", async () => {
    document.body.innerHTML = JSON_SLOT;
    await tick();
    const el = document.querySelector<JdRadioGroup>("jd-radio-group")!;
    expect(el.getAttribute("role")).toBe("radiogroup");
    expect(el.querySelector("script")).toBeNull(); // 슬롯 1회 소비
    const inputs = el.querySelectorAll<HTMLInputElement>("input[type=radio]");
    expect(inputs.length).toBe(3);
    expect([...inputs].every((i) => i.name === "pri")).toBe(true); // 네이티브 그룹핑
    expect(inputs[1]!.checked).toBe(true);
    expect(inputs[2]!.disabled).toBe(true); // 옵션 disabled
    expect(el.querySelectorAll(".jd-radio-group__label")[0]!.textContent).toBe("긴급");
  });

  test("선택 변경 → value 반영 + jd-change", async () => {
    document.body.innerHTML = JSON_SLOT;
    await tick();
    const el = document.querySelector<JdRadioGroup>("jd-radio-group")!;
    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    el.querySelectorAll<HTMLInputElement>("input")[0]!.click();
    await tick();
    expect(el.value).toBe("0");
    expect(el.getAttribute("value")).toBe("0");
    expect((spy.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: "0" });
  });

  test("options 프로퍼티 재대입 → 행 재구축", async () => {
    document.body.innerHTML = `<jd-radio-group name="g"></jd-radio-group>`;
    await tick();
    const el = document.querySelector<JdRadioGroup>("jd-radio-group")!;
    el.options = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ];
    await tick();
    expect(el.querySelectorAll("input").length).toBe(2);
    el.options = [{ value: "c", label: "C" }];
    await tick();
    expect(el.querySelectorAll("input").length).toBe(1);
    expect(el.querySelector(".jd-radio-group__label")!.textContent).toBe("C");
  });

  test("그룹 disabled → 전 행 비활성", async () => {
    document.body.innerHTML = JSON_SLOT;
    await tick();
    const el = document.querySelector<JdRadioGroup>("jd-radio-group")!;
    el.disabled = true;
    await tick();
    const inputs = el.querySelectorAll<HTMLInputElement>("input");
    expect([...inputs].every((i) => i.disabled)).toBe(true);
  });

  test("name 미지정 시 자동 발급 — 문서 내 유일 그룹", async () => {
    document.body.innerHTML =
      `<jd-radio-group id="a"><script type="application/json">[{"value":"1","label":"x"}]</script></jd-radio-group>` +
      `<jd-radio-group id="b"><script type="application/json">[{"value":"1","label":"y"}]</script></jd-radio-group>`;
    await tick();
    const nameA = document.querySelector("#a input")!.getAttribute("name");
    const nameB = document.querySelector("#b input")!.getAttribute("name");
    expect(nameA).toBeTruthy();
    expect(nameA).not.toBe(nameB);
  });
});
