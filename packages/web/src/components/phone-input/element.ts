/**
 * <jd-phone-input> — 국가 코드 + 전화번호 입력 (v2 primitives/PhoneInput).
 *
 * - 국가 선택은 네이티브 <select> 위임(§1.6-1): v2의 수제 드롭다운은 키보드 조작·
 *   role·외부 클릭 닫기가 전혀 없었다. 네이티브는 화살표 순회·타이핑 점프·모바일
 *   네이티브 피커·폼 참여가 전부 공짜다. 열린 목록의 외관만 플랫폼 기본을 따른다.
 * - value는 숫자만 보관(v2 동형), 표시만 000-0000-0000으로 포맷. 이벤트 detail은
 *   { value, fullNumber, country } — v2 onChange(digits, fullNumber)의 정규화 형태.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import phoneInputStyles from "./phone-input.css.js";

export interface JdCountry {
  code: string;
  dial: string;
  flag: string;
}

/** v2 COUNTRIES 5종 그대로. v2의 `format` 필드는 어디서도 쓰이지 않아 승계하지 않는다 */
export const JD_COUNTRIES: readonly JdCountry[] = [
  { code: "KR", dial: "+82", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "US", dial: "+1", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "JP", dial: "+81", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "CN", dial: "+86", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "GB", dial: "+44", flag: "\u{1F1EC}\u{1F1E7}" },
];

const CARET_SVG =
  `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">` +
  `<path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

/** v2 formatPhone — 국가와 무관한 KR 표기(3-4-4). v2 실태 승계 */
function formatPhone(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export class JdPhoneInput extends JdElement {
  static override tag = "jd-phone-input";
  static override props = {
    /** 숫자만 (하이픈 없음) */
    value: { type: String },
    /** 선택 국가 코드 */
    country: { type: String, default: "KR", reflect: true },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    error: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    name: { type: String },
    label: { type: String },
  };

  declare value: string;
  declare country: string;
  declare size: string;
  declare error: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare label: string;

  #select!: HTMLSelectElement;
  #input!: HTMLInputElement;

  get #country(): JdCountry {
    return JD_COUNTRIES.find((c) => c.code === this.country) ?? JD_COUNTRIES[0]!;
  }

  /** 국가번호가 붙은 전체 번호 */
  get fullNumber(): string {
    return `${this.#country.dial}${this.value}`;
  }

  protected render(): void {
    adoptStyles(phoneInputStyles);
    const existing = this.querySelector<HTMLInputElement>("input.jd-phone-input__input");
    if (existing) {
      this.#input = existing;
      this.#select = this.querySelector("select.jd-phone-input__select")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const wrap = document.createElement("span");
    wrap.className = "jd-phone-input__country";
    this.#select = document.createElement("select");
    this.#select.className = "jd-phone-input__select";
    this.#select.setAttribute("aria-label", "국가 선택");
    for (const c of JD_COUNTRIES) {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = `${c.flag} ${c.dial}`;
      this.#select.append(opt);
    }
    const caret = document.createElement("span");
    caret.className = "jd-phone-input__caret";
    caret.innerHTML = CARET_SVG;
    wrap.append(this.#select, caret);

    this.#input = document.createElement("input");
    this.#input.type = "tel";
    this.#input.className = "jd-phone-input__input";
    this.append(wrap, this.#input);
  }

  protected override connected(): void {
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("change", this.#onChange);
    this.#select.addEventListener("change", this.#onCountry);
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("input", this.#onInput);
    this.#input?.removeEventListener("change", this.#onChange);
    this.#select?.removeEventListener("change", this.#onCountry);
  }

  #detail(): { value: string; fullNumber: string; country: string } {
    return { value: this.value, fullNumber: this.fullNumber, country: this.country };
  }

  #onInput = (): void => {
    this.value = this.#input.value.replace(/\D/g, "").slice(0, 11);
    this.emit("jd-input", this.#detail());
  };

  #onChange = (): void => {
    this.emit("jd-change", this.#detail());
  };

  #onCountry = (): void => {
    this.country = this.#select.value;
    this.emit("jd-change", this.#detail());
  };

  protected override update(): void {
    const input = this.#input;
    input.disabled = this.disabled;
    input.required = this.required;
    this.#select.disabled = this.disabled;
    if (this.#select.value !== this.country) this.#select.value = this.country;
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");
    input.setAttribute("aria-label", this.label || "전화번호");
    input.setAttribute("aria-invalid", this.error ? "true" : "false");

    const next = formatPhone(this.value);
    if (input.value !== next) input.value = next;
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }
}
