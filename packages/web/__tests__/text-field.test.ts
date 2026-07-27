/**
 * <jd-text-field> 단위 테스트 — 반영, 네이티브 <input> 위임, jd-input/jd-change,
 * label/aria 연결, IME 안전(값 되쓰기 억제), 입양.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/text-field/index.js";
import { JdTextField } from "../src/components/text-field/element.js";

const tick = () =>
  new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

async function mount(html: string): Promise<JdTextField> {
  document.body.innerHTML = html;
  await tick(); // 최초 render 지연 실행
  return document.querySelector<JdTextField>("jd-text-field")!;
}
const inputOf = (el: JdTextField) =>
  el.querySelector<HTMLInputElement>("input.jd-text-field__input")!;

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-text-field 골격·반영", () => {
  test("label + input + error 골격, label[for] ↔ input[id] 연결 (light DOM §8)", async () => {
    const el = await mount(`<jd-text-field label="이름"></jd-text-field>`);
    const label = el.querySelector<HTMLLabelElement>(
      "label.jd-text-field__label",
    )!;
    const input = inputOf(el);
    expect(label.textContent).toBe("이름");
    expect(label.hidden).toBe(false);
    expect(input.id).not.toBe("");
    expect(label.htmlFor).toBe(input.id);
    expect(
      input.parentElement?.classList.contains("jd-text-field__control"),
    ).toBe(true);
  });

  test("slot=start/end 콘텐츠를 안정된 control 골격으로 이동한다", async () => {
    const el = await mount(
      `<jd-text-field>` +
        `<span slot="start" id="currency">₩</span>` +
        `<button slot="end" id="clear" type="button">지우기</button>` +
        `</jd-text-field>`,
    );
    expect(
      el.querySelector(".jd-text-field__slot--start > #currency")?.textContent,
    ).toBe("₩");
    expect(
      el.querySelector(".jd-text-field__slot--end > #clear"),
    ).not.toBeNull();
    expect(el.querySelectorAll(".jd-text-field__control").length).toBe(1);
  });

  test("label 미지정 시 label 요소 hidden", async () => {
    const el = await mount(`<jd-text-field></jd-text-field>`);
    expect(el.querySelector<HTMLLabelElement>("label")!.hidden).toBe(true);
  });

  test("placeholder/name/type/required가 내부 input에 전파", async () => {
    const el = await mount(
      `<jd-text-field placeholder="이메일" name="email" type="email" required></jd-text-field>`,
    );
    const input = inputOf(el);
    expect(input.placeholder).toBe("이메일");
    expect(input.name).toBe("email");
    expect(input.type).toBe("email");
    expect(input.required).toBe(true);
  });

  test("value attribute는 초기값, property 대입이 덮는다 (§1.3 마지막 쓰기 승리)", async () => {
    const el = await mount(`<jd-text-field value="초기"></jd-text-field>`);
    expect(inputOf(el).value).toBe("초기");
    el.value = "변경";
    await tick();
    expect(inputOf(el).value).toBe("변경");
  });

  test("disabled 전파", async () => {
    const el = await mount(`<jd-text-field disabled></jd-text-field>`);
    expect(inputOf(el).disabled).toBe(true);
    el.disabled = false;
    await tick();
    expect(inputOf(el).disabled).toBe(false);
  });

  test("IME 안전 — 같은 값이면 input.value를 되쓰지 않는다", async () => {
    const el = await mount(`<jd-text-field></jd-text-field>`);
    const input = inputOf(el);
    input.value = "한글조합";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const spy = vi.spyOn(input, "value", "set");
    await tick(); // 배칭된 update() 플러시 — 값 동일 → setter 미호출
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("jd-text-field 에러 표면·ARIA", () => {
  test("error 메시지 → aria-invalid + aria-describedby + 메시지 행", async () => {
    const el = await mount(
      `<jd-text-field error="이름을 입력해주세요"></jd-text-field>`,
    );
    const input = inputOf(el);
    const err = el.querySelector<HTMLParagraphElement>(
      "p.jd-text-field__error",
    )!;
    expect(err.hidden).toBe(false);
    expect(err.textContent).toContain("이름을 입력해주세요");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(err.id);
  });

  test("error 해제 시 aria 원복", async () => {
    const el = await mount(`<jd-text-field error="에러"></jd-text-field>`);
    el.error = "";
    await tick();
    const input = inputOf(el);
    expect(
      el.querySelector<HTMLParagraphElement>("p.jd-text-field__error")!.hidden,
    ).toBe(true);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
  });

  test("invalid는 메시지 없이도 aria-invalid와 시각 훅을 유지한다", async () => {
    const el = await mount(`<jd-text-field invalid></jd-text-field>`);
    const input = inputOf(el);
    expect(el.invalid).toBe(true);
    expect(el.hasAttribute("invalid")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(
      el.querySelector<HTMLParagraphElement>(".jd-text-field__error")!.hidden,
    ).toBe(true);
  });

  test("기존 aria-describedby를 error와 병합하고 error 해제 후에도 보존한다", async () => {
    const el = await mount(
      `<jd-text-field error="필수입니다">` +
        `<label class="jd-text-field__label"></label>` +
        `<input id="field" class="jd-text-field__input" aria-describedby="field-hint">` +
        `<p id="field-error" class="jd-text-field__error"></p>` +
        `<span id="field-hint">힌트</span>` +
        `</jd-text-field>`,
    );
    const input = inputOf(el);
    expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual([
      "field-hint",
      "field-error",
    ]);
    expect(input.getAttribute("aria-errormessage")).toBe("field-error");

    el.error = "";
    await el.updateComplete;
    expect(input.getAttribute("aria-describedby")).toBe("field-hint");
    expect(input.hasAttribute("aria-errormessage")).toBe(false);
  });

  test("기존 aria-invalid 값은 오류가 끝나면 복원한다", async () => {
    const el = await mount(
      `<jd-text-field error="문법을 확인하세요">` +
        `<label class="jd-text-field__label"></label>` +
        `<input id="field" class="jd-text-field__input" aria-invalid="grammar">` +
        `<p id="field-error" class="jd-text-field__error"></p>` +
        `</jd-text-field>`,
    );
    const input = inputOf(el);
    expect(input.getAttribute("aria-invalid")).toBe("true");

    el.error = "";
    await el.updateComplete;
    expect(input.getAttribute("aria-invalid")).toBe("grammar");
  });
});

describe("jd-text-field 이벤트 (§1.5)", () => {
  test("네이티브 input → jd-input { value } + value 프로퍼티 동기화", async () => {
    const el = await mount(`<jd-text-field></jd-text-field>`);
    const spy = vi.fn();
    el.addEventListener("jd-input", spy);
    const input = inputOf(el);
    input.value = "안녕";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect((spy.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      value: "안녕",
    });
    expect(el.value).toBe("안녕");
  });

  test("네이티브 change → jd-change { value } (값 확정)", async () => {
    const el = await mount(`<jd-text-field></jd-text-field>`);
    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    const input = inputOf(el);
    input.value = "확정";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect((spy.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      value: "확정",
    });
  });

  test("jd-* 이벤트는 bubbles=true, composed=false, cancelable=false", async () => {
    const el = await mount(`<jd-text-field></jd-text-field>`);
    let ev: CustomEvent | undefined;
    document.addEventListener("jd-input", (e) => (ev = e as CustomEvent), {
      once: true,
    });
    const input = inputOf(el);
    input.value = "x";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(ev).toBeDefined(); // document까지 버블
    expect(ev!.composed).toBe(false);
    expect(ev!.cancelable).toBe(false);
  });
});

describe("jd-text-field 폼 연동 (네이티브 위임 §1.6-1)", () => {
  test("내부 input[name]이 조상 form에 그냥 참여한다", async () => {
    document.body.innerHTML = `<form><jd-text-field name="nickname" value="준하"></jd-text-field></form>`;
    await tick();
    const form = document.querySelector("form")!;
    const fd = new FormData(form);
    expect(fd.get("nickname")).toBe("준하");
  });

  test("select/validity 메서드와 form 프로퍼티를 내부 input으로 위임한다", async () => {
    document.body.innerHTML = `<form><jd-text-field name="nickname" value="준하" required></jd-text-field></form>`;
    await tick();
    const form = document.querySelector("form")!;
    const el = document.querySelector<JdTextField>("jd-text-field")!;
    const input = inputOf(el);
    el.select();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(2);
    expect(el.form).toBe(form);
    expect(el.validity).toBe(input.validity);

    el.setCustomValidity("확인해주세요");
    expect(el.validationMessage).toBe("확인해주세요");
    expect(el.checkValidity()).toBe(false);
    expect(el.reportValidity()).toBe(false);
  });
});
