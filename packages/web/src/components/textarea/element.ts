/**
 * <jd-textarea> — 네이티브 <textarea> 위임 (v2 primitives/Textarea).
 * - autoResize: 입력마다 height=auto→scrollHeight (v2 동형), CSS는 resize·overflow 차단
 * - showCount: maxLength 기준 글자수 배지 — update()가 텍스트 갱신
 * - error는 v2 그대로 boolean(TextField의 메시지 문자열과 표면이 다름 — v2 실태)
 * - IME 안전: 값이 실제로 다를 때만 되쓰기 (jd-text-field 동형)
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import textareaStyles from "./textarea.css.js";

export class JdTextarea extends JdElement {
  static override tag = "jd-textarea";
  static override props = {
    value: { type: String },
    placeholder: { type: String },
    name: { type: String },
    rows: { type: Number, default: 0 }, // 0 = 네이티브 기본
    maxLength: { type: Number, default: 0, attribute: "maxlength" }, // 네이티브 표기 계승
    error: { type: Boolean, reflect: true },
    autoResize: { type: Boolean, reflect: true }, // attr: auto-resize
    showCount: { type: Boolean, reflect: true },  // attr: show-count
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare placeholder: string;
  declare name: string;
  declare rows: number;
  declare maxLength: number;
  declare error: boolean;
  declare autoResize: boolean;
  declare showCount: boolean;
  declare disabled: boolean;
  declare required: boolean;

  #ta!: HTMLTextAreaElement;
  #count!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(textareaStyles);
    const existing = this.querySelector<HTMLTextAreaElement>(":scope > textarea.jd-textarea__input");
    if (existing) {
      this.#ta = existing;
      this.#count = this.querySelector(":scope > .jd-textarea__count")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#ta = document.createElement("textarea");
    this.#ta.className = "jd-textarea__input";
    this.#count = document.createElement("span");
    this.#count.className = "jd-textarea__count";
    this.#count.setAttribute("aria-hidden", "true"); // 시각 배지 — 값은 maxlength가 전달
    this.append(this.#ta, this.#count);
  }

  protected override connected(): void {
    this.#ta.addEventListener("input", this.#onInput);
    this.#ta.addEventListener("change", this.#onChange);
    this.#resize();
  }

  protected override disconnected(): void {
    this.#ta?.removeEventListener("input", this.#onInput);
    this.#ta?.removeEventListener("change", this.#onChange);
  }

  #onInput = (): void => {
    this.value = this.#ta.value;
    this.#resize();
    this.emit("jd-input", { value: this.#ta.value });
  };

  #onChange = (): void => {
    this.emit("jd-change", { value: this.#ta.value });
  };

  /** v2 동형: height=auto로 접었다가 scrollHeight로 확장 */
  #resize(): void {
    if (!this.autoResize) return;
    this.#ta.style.height = "auto";
    this.#ta.style.height = `${this.#ta.scrollHeight}px`;
  }

  protected override update(): void {
    const ta = this.#ta;
    ta.placeholder = this.placeholder;
    ta.disabled = this.disabled;
    ta.required = this.required;
    if (this.name) ta.name = this.name;
    else ta.removeAttribute("name");
    if (this.rows > 0) ta.rows = this.rows;
    if (this.maxLength > 0) ta.maxLength = this.maxLength;
    else ta.removeAttribute("maxlength");
    if (ta.value !== this.value) {
      ta.value = this.value; // IME 안전 — 동일 값 재대입 금지
      this.#resize();
    }

    const showCount = this.showCount && this.maxLength > 0;
    this.#count.hidden = !showCount;
    if (showCount) this.#count.textContent = `${this.value.length}/${this.maxLength}`;
  }

  override focus(options?: FocusOptions): void {
    this.#ta?.focus(options);
  }
}
