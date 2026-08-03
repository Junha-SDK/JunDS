/**
 * <jd-text-field> — label + 네이티브 <input> 위임 + 에러 메시지 (03-web-arch §1.6-1).
 *
 * - 네이티브 위임 경로: 내부 <input name>이 조상 <form>에 그냥 참여 — value 직렬화·
 *   :invalid·자동완성·IME 전부 브라우저 기본. ElementInternals 불필요.
 * - IME 안전: update()는 input.value가 실제로 다를 때만 되쓴다(조합 중 값 재대입 금지).
 * - 이벤트(§1.5): 네이티브 input/change는 그대로 버블 + jd-input(실시간)/jd-change(확정)를
 *   정규화 detail { value }로 추가 발행.
 * - label/에러 연결은 light DOM id 참조(jd-uid, §8) — aria-describedby/for가 경계 없이 동작.
 */
import { defineProps, JdElement, type PropDefs } from "../../core/element.js";
import { syncAriaIdRefs, syncOwnedAttribute } from "../../core/aria.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import textFieldStyles from "./text-field.css.js";

const ERROR_ICON_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<circle cx="6" cy="6" r="5.5" stroke="currentColor"/>` +
  `<path d="M6 3.5v3M6 8h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;

export type JdTextFieldSize = "sm" | "md" | "lg";

export class JdTextField extends JdElement {
  static override tag = "jd-text-field";
  static override props: PropDefs = defineProps({
    label: { type: String },
    placeholder: { type: String },
    value: { type: String }, // attribute는 초기값, 이후 property/입력이 덮음(§1.3 마지막 쓰기 승리)
    name: { type: String },
    type: { type: String, default: "text" },
    size: { type: String, default: "md", reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    /** 에러 메시지. 빈 문자열이 아니면 에러 상태(aria-invalid + 메시지 행) */
    error: { type: String, reflect: true },
    /** 메시지와 독립적인 유효성 실패 상태 */
    invalid: { type: Boolean, reflect: true },
  });

  declare label: string;
  declare placeholder: string;
  declare value: string;
  declare name: string;
  declare type: string;
  declare size: JdTextFieldSize;
  declare disabled: boolean;
  declare required: boolean;
  declare error: string;
  declare invalid: boolean;

  #label!: HTMLLabelElement;
  #control!: HTMLDivElement;
  #start!: HTMLSpanElement;
  #input!: HTMLInputElement;
  #end!: HTMLSpanElement;
  #error!: HTMLParagraphElement;

  protected render(): void {
    adoptStyles(textFieldStyles);
    // 입양 규칙(§3.3): 새 5-part 골격과 이전 3형제 골격을 모두 안전하게 정규화한다.
    const existing = this.querySelector<HTMLInputElement>("input.jd-text-field__input");
    if (existing) this.#adopt(existing);
    else this.#build();
    this.update();
  }

  /** 리스너는 connected/disconnected 쌍으로 — 재연결 시에도 회수·재부착이 대칭 */
  protected override connected(): void {
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("change", this.#onChange);
  }

  #build(): void {
    const id = jdUid("jd-tf");
    const startNodes = [...this.querySelectorAll<HTMLElement>(':scope > [slot="start"]')];
    const endNodes = [...this.querySelectorAll<HTMLElement>(':scope > [slot="end"]')];
    this.#label = document.createElement("label");
    this.#label.className = "jd-text-field__label";
    this.#label.htmlFor = id;
    this.#control = document.createElement("div");
    this.#control.className = "jd-text-field__control";
    this.#start = this.#createSlot("start");
    this.#input = document.createElement("input");
    this.#input.className = "jd-text-field__input";
    this.#input.id = id;
    this.#end = this.#createSlot("end");
    this.#error = document.createElement("p");
    this.#error.className = "jd-text-field__error";
    this.#error.id = `${id}-error`;
    this.#start.append(...startNodes);
    this.#end.append(...endNodes);
    this.#control.append(this.#start, this.#input, this.#end);
    this.append(this.#label, this.#control, this.#error);
  }

  #adopt(input: HTMLInputElement): void {
    const id = input.id || jdUid("jd-tf");
    input.id = id;
    this.#input = input;

    this.#label =
      this.querySelector<HTMLLabelElement>(":scope > label.jd-text-field__label") ??
      document.createElement("label");
    this.#label.classList.add("jd-text-field__label");
    this.#label.htmlFor = id;

    this.#control =
      this.querySelector<HTMLDivElement>(":scope > .jd-text-field__control") ??
      document.createElement("div");
    this.#control.classList.add("jd-text-field__control");

    this.#start =
      this.#control.querySelector<HTMLSpanElement>(":scope > .jd-text-field__slot--start") ??
      this.#createSlot("start");
    this.#end =
      this.#control.querySelector<HTMLSpanElement>(":scope > .jd-text-field__slot--end") ??
      this.#createSlot("end");

    const directStart = [...this.querySelectorAll<HTMLElement>(':scope > [slot="start"]')];
    const directEnd = [...this.querySelectorAll<HTMLElement>(':scope > [slot="end"]')];
    this.#start.append(...directStart);
    this.#end.append(...directEnd);

    if (!this.#control.isConnected) input.before(this.#control);
    this.#control.append(this.#start, input, this.#end);

    this.#error =
      this.querySelector<HTMLParagraphElement>(":scope > p.jd-text-field__error") ??
      document.createElement("p");
    this.#error.classList.add("jd-text-field__error");
    this.#error.id ||= `${id}-error`;

    if (!this.#label.isConnected) this.prepend(this.#label);
    if (!this.#error.isConnected) this.append(this.#error);
  }

  #createSlot(side: "start" | "end"): HTMLSpanElement {
    const slot = document.createElement("span");
    slot.className = `jd-text-field__slot jd-text-field__slot--${side}`;
    return slot;
  }

  protected override update(): void {
    const input = this.#input;
    input.type = this.type;
    input.placeholder = this.placeholder;
    input.disabled = this.disabled;
    input.required = this.required;
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");
    // IME 안전: 실제로 다를 때만 되쓰기 — 조합 중 미러링 재대입이 조합을 끊는다
    if (input.value !== this.value) input.value = this.value;

    this.#label.textContent = this.label;
    this.#label.hidden = !this.label;

    const hasErrorMessage = Boolean(this.error);
    const isInvalid = this.invalid || hasErrorMessage;

    if (hasErrorMessage) {
      this.#error.innerHTML = ERROR_ICON_SVG;
      this.#error.append(this.error);
    } else {
      this.#error.textContent = "";
    }
    syncOwnedAttribute(input, "aria-invalid", isInvalid ? "true" : null);
    syncAriaIdRefs(input, "aria-describedby", hasErrorMessage ? this.#error.id : null);
    syncAriaIdRefs(input, "aria-errormessage", hasErrorMessage ? this.#error.id : null);
    this.#error.hidden = !hasErrorMessage;
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("input", this.#onInput);
    this.#input?.removeEventListener("change", this.#onChange);
  }

  #onInput = (): void => {
    this.value = this.#input.value; // 내부 상태 동기화 — update()는 값 동일로 no-op
    this.emit("jd-input", { value: this.#input.value });
  };

  #onChange = (): void => {
    this.emit("jd-change", { value: this.#input.value });
  };

  /** 네이티브 위임 표면 — 포커스 편의 */
  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }

  /** 내부 네이티브 input의 현재 텍스트를 선택한다. */
  select(): void {
    this.#input?.select();
  }

  get form(): HTMLFormElement | null {
    return this.#input?.form ?? null;
  }

  get validity(): ValidityState {
    return this.#input.validity;
  }

  get validationMessage(): string {
    return this.#input.validationMessage;
  }

  checkValidity(): boolean {
    return this.#input?.checkValidity() ?? true;
  }

  reportValidity(): boolean {
    return this.#input?.reportValidity() ?? true;
  }

  setCustomValidity(message: string): void {
    this.#input?.setCustomValidity(message);
  }
}
