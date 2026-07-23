/**
 * <jd-checkbox> — 네이티브 input[type=checkbox] 위임 (v2 primitives/Checkbox).
 * label 래핑으로 텍스트 클릭 토글 공짜, accent-color로 체크 색 위임.
 * indeterminate는 네이티브 프로퍼티(브라우저가 mixed 상태를 AT에 전달 — v2의
 * 수동 aria-checked 불필요). checked 반영은 현재 상태 미러(CSS 훅).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import checkboxStyles from "./checkbox.css.js";

export class JdCheckbox extends JdElement {
  static override tag = "jd-checkbox";
  static override props = {
    label: { type: String },
    checked: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    size: { type: String, default: "md", reflect: true }, // sm | md
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    name: { type: String },
    value: { type: String, default: "on" },
  };

  declare label: string;
  declare checked: boolean;
  declare indeterminate: boolean;
  declare size: string;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare value: string;

  #input!: HTMLInputElement;
  #text!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(checkboxStyles);
    const existing = this.querySelector<HTMLInputElement>("input.jd-checkbox__input");
    if (existing) {
      this.#input = existing;
      this.#text = this.querySelector(".jd-checkbox__label")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const wrap = document.createElement("label");
    wrap.className = "jd-checkbox";
    this.#input = document.createElement("input");
    this.#input.type = "checkbox";
    this.#input.className = "jd-checkbox__input";
    this.#text = document.createElement("span");
    this.#text.className = "jd-checkbox__label";
    wrap.append(this.#input, this.#text);
    this.append(wrap);
  }

  protected override connected(): void {
    this.#input.addEventListener("change", this.#onChange);
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("change", this.#onChange);
  }

  #onChange = (): void => {
    this.checked = this.#input.checked;
    this.indeterminate = false; // 사용자 조작 시 mixed 해제 (네이티브 동작과 정합)
    this.emit("jd-change", { checked: this.#input.checked });
  };

  protected override update(): void {
    const input = this.#input;
    input.checked = this.checked;
    input.indeterminate = this.indeterminate;
    input.disabled = this.disabled;
    input.required = this.required;
    input.value = this.value;
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");

    this.#text.textContent = this.label;
    this.#text.hidden = !this.label;
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }
}
