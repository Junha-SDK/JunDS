/**
 * <jd-date-input> — 네이티브 <input type="date"> 위임 + 값 지우기 버튼 (v2 composites/DateInput).
 *
 * 네이티브 위임(§1.6-1): 달력 UI·키보드 편집·로케일 표기·폼 참여·자동완성이 전부
 * 브라우저 기본이다. 자체 달력을 그리는 것은 <jd-date-range-picker>의 몫이고,
 * 단일 날짜 입력은 네이티브가 이긴다 — v2도 같은 판단이었다.
 *
 * v2 대비 보정 2건:
 *  - `onClear` 콜백이 있어야만 보이던 지우기 버튼을 `clearable` 옵트인으로 바꿨다.
 *    v2 버튼은 접근 이름이 없어 스크린리더에 "button"으로만 읽혔다 — aria-label 부여.
 *  - `error`가 border 색만 바꿨다(시각 단독 신호). aria-invalid를 함께 세운다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import dateInputStyles from "./date-input.css.js";

const CLEAR_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdDateInput extends JdElement {
  static override tag = "jd-date-input";
  static override props = {
    /** "YYYY-MM-DD" — 네이티브 date 입력의 값 형식 그대로 */
    value: { type: String },
    label: { type: String },
    name: { type: String },
    min: { type: String },
    max: { type: String },
    step: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    error: { type: Boolean, reflect: true },
    /** 값이 있을 때 지우기 버튼 노출 */
    clearable: { type: Boolean, reflect: true },
    clearLabel: { type: String, default: "날짜 지우기" },
  };

  declare value: string;
  declare label: string;
  declare name: string;
  declare min: string;
  declare max: string;
  declare step: string;
  declare disabled: boolean;
  declare required: boolean;
  declare error: boolean;
  declare clearable: boolean;
  declare clearLabel: string;

  #label!: HTMLLabelElement;
  #input!: HTMLInputElement;
  #clear!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(dateInputStyles);
    // 입양 규칙(§3.3)
    const existing = this.querySelector<HTMLInputElement>(":scope > input.jd-date-input__input");
    if (existing) {
      this.#input = existing;
      this.#label = this.querySelector<HTMLLabelElement>(":scope > label.jd-date-input__label")!;
      this.#clear = this.querySelector<HTMLButtonElement>(":scope > button.jd-date-input__clear")!;
    } else {
      this.#build();
    }
    this.#clear.addEventListener("click", this.#onClear);
    this.update();
  }

  #build(): void {
    const id = jdUid("jd-date");
    this.#label = document.createElement("label");
    this.#label.className = "jd-date-input__label";
    this.#label.htmlFor = id;
    this.#input = document.createElement("input");
    this.#input.type = "date";
    this.#input.id = id;
    this.#input.className = "jd-date-input__input";
    this.#clear = document.createElement("button");
    this.#clear.type = "button";
    this.#clear.className = "jd-date-input__clear";
    this.#clear.innerHTML = CLEAR_SVG;
    this.append(this.#label, this.#input, this.#clear);
  }

  protected override connected(): void {
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("change", this.#onChange);
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("input", this.#onInput);
    this.#input?.removeEventListener("change", this.#onChange);
  }

  protected override update(): void {
    const input = this.#input;
    input.disabled = this.disabled;
    input.required = this.required;
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");
    for (const attr of ["min", "max", "step"] as const) {
      const v = this[attr];
      if (v) input.setAttribute(attr, v);
      else input.removeAttribute(attr);
    }
    // 값 되쓰기는 실제로 다를 때만 — 편집 중 캐럿·부분 입력 상태를 깨지 않는다
    if (input.value !== this.value) input.value = this.value;

    this.#label.textContent = this.label;
    this.#label.hidden = !this.label;
    // 보이는 라벨이 없으면 호스트의 aria-label을 실제 컨트롤로 내린다
    const hostAria = this.getAttribute("aria-label");
    if (!this.label && hostAria) input.setAttribute("aria-label", hostAria);
    else input.removeAttribute("aria-label");

    if (this.error) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");

    const showClear = this.clearable && Boolean(this.value) && !this.disabled;
    this.#clear.hidden = !showClear;
    this.#clear.disabled = !showClear;
    this.#clear.setAttribute("aria-label", this.clearLabel);
  }

  #onInput = (): void => {
    this.value = this.#input.value;
    this.emit("jd-input", { value: this.#input.value });
  };

  #onChange = (): void => {
    this.emit("jd-change", { value: this.#input.value });
  };

  /** 지우기 — 값 비운 뒤 확정 통지, 포커스는 입력으로 돌려준다 */
  #onClear = (): void => {
    if (!this.value) return;
    this.value = "";
    this.#input.value = "";
    this.#input.focus();
    this.emit("jd-input", { value: "" });
    this.emit("jd-change", { value: "" });
  };

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }
}
