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
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import textFieldStyles from "./text-field.css.js";

const ERROR_ICON_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<circle cx="6" cy="6" r="5.5" stroke="currentColor"/>` +
  `<path d="M6 3.5v3M6 8h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;

export class JdTextField extends JdElement {
  static override tag = "jd-text-field";
  static override props = {
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
  };

  declare label: string;
  declare placeholder: string;
  declare value: string;
  declare name: string;
  declare type: string;
  declare size: string;
  declare disabled: boolean;
  declare required: boolean;
  declare error: string;

  #label!: HTMLLabelElement;
  #input!: HTMLInputElement;
  #error!: HTMLParagraphElement;

  protected render(): void {
    adoptStyles(textFieldStyles);
    // 입양 규칙(§3.3)
    const existing = this.querySelector<HTMLInputElement>(":scope > input.jd-text-field__input");
    if (existing) {
      this.#label = this.querySelector<HTMLLabelElement>(":scope > label.jd-text-field__label")!;
      this.#input = existing;
      this.#error = this.querySelector<HTMLParagraphElement>(":scope > p.jd-text-field__error")!;
    } else {
      this.#build();
    }
    this.update();
  }

  /** 리스너는 connected/disconnected 쌍으로 — 재연결 시에도 회수·재부착이 대칭 */
  protected override connected(): void {
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("change", this.#onChange);
  }

  #build(): void {
    const id = jdUid("jd-tf");
    this.#label = document.createElement("label");
    this.#label.className = "jd-text-field__label";
    this.#label.htmlFor = id;
    this.#input = document.createElement("input");
    this.#input.className = "jd-text-field__input";
    this.#input.id = id;
    this.#error = document.createElement("p");
    this.#error.className = "jd-text-field__error";
    this.#error.id = `${id}-error`;
    this.append(this.#label, this.#input, this.#error);
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

    const hasError = Boolean(this.error);
    if (hasError) {
      this.#error.innerHTML = ERROR_ICON_SVG;
      this.#error.append(this.error);
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", this.#error.id);
    } else {
      this.#error.textContent = "";
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
    this.#error.hidden = !hasError;
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
}
