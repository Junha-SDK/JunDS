/**
 * <jd-number-input> — 네이티브 input[type=number] 위임 + 증감 버튼 (v2 primitives/NumberInput).
 *
 * - 네이티브 위임(§1.6-1): 스피너만 숨기고(appearance) min/max/step·폼 참여·모바일
 *   숫자 키패드는 브라우저 기본. 증감 버튼은 tabIndex=-1(v2 동형) — 키보드는 ↑↓ 네이티브.
 * - "값 없음"은 NaN 센티널: attribute 부재 → NaN → input.value "". 복합 attribute 금지
 *   (WEB-03)라 undefined를 표현할 다른 수단이 없다. min/max 미지정도 같은 규약.
 * - 클램프 시점(§1.5): 입력 중(jd-input)은 원시값 그대로, 확정(change/버튼)에서만 클램프.
 *   v2는 매 키 입력마다 클램프해 min=10 필드에 "5"→"50"을 못 치는 실측 결함이 있었다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import numberInputStyles from "./number-input.css.js";

const MINUS_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M2.5 6h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const PLUS_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M6 2.5v7M2.5 6h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdNumberInput extends JdElement {
  static override tag = "jd-number-input";
  static override props = {
    /** 현재 값. NaN = 비어 있음 */
    value: { type: Number, default: NaN },
    /** 미지정(NaN)이면 하한 없음 */
    min: { type: Number, default: NaN },
    /** 미지정(NaN)이면 상한 없음 */
    max: { type: Number, default: NaN },
    step: { type: Number, default: 1 },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    error: { type: Boolean, reflect: true },
    hideControls: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    name: { type: String },
    placeholder: { type: String },
    /** 입력 자체의 접근 가능한 이름 */
    label: { type: String },
  };

  declare value: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare size: string;
  declare error: boolean;
  declare hideControls: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare placeholder: string;
  declare label: string;

  #input!: HTMLInputElement;
  #dec!: HTMLButtonElement;
  #inc!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(numberInputStyles);
    const existing = this.querySelector<HTMLInputElement>(":scope > input.jd-number-input__input");
    if (existing) {
      this.#input = existing;
      this.#dec = this.querySelector<HTMLButtonElement>(':scope > button[data-dir="-1"]')!;
      this.#inc = this.querySelector<HTMLButtonElement>(':scope > button[data-dir="1"]')!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#dec = this.#stepButton("-1", "감소", MINUS_SVG);
    this.#input = document.createElement("input");
    this.#input.type = "number";
    this.#input.className = "jd-number-input__input";
    this.#inc = this.#stepButton("1", "증가", PLUS_SVG);
    this.append(this.#dec, this.#input, this.#inc);
  }

  #stepButton(dir: string, label: string, svg: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-number-input__step";
    b.dataset.dir = dir;
    b.tabIndex = -1; // 키보드는 input의 ↑↓가 담당 — 탭 순서를 오염시키지 않는다(v2 동형)
    b.setAttribute("aria-label", label);
    b.innerHTML = svg;
    return b;
  }

  protected override connected(): void {
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("change", this.#onChange);
    this.#dec.addEventListener("click", this.#onStep);
    this.#inc.addEventListener("click", this.#onStep);
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("input", this.#onInput);
    this.#input?.removeEventListener("change", this.#onChange);
    this.#dec?.removeEventListener("click", this.#onStep);
    this.#inc?.removeEventListener("click", this.#onStep);
  }

  /** min/max가 지정된 축만 적용 — NaN은 "제한 없음" */
  #clamp(v: number): number {
    if (!Number.isNaN(this.min)) v = Math.max(this.min, v);
    if (!Number.isNaN(this.max)) v = Math.min(this.max, v);
    return v;
  }

  #onInput = (): void => {
    this.value = parseFloat(this.#input.value); // 빈 문자열 → NaN(비어 있음)
    this.emit("jd-input", { value: this.value });
  };

  #onChange = (): void => {
    const raw = parseFloat(this.#input.value);
    this.value = Number.isNaN(raw) ? NaN : this.#clamp(raw);
    this.emit("jd-change", { value: this.value });
  };

  #onStep = (e: Event): void => {
    if (this.disabled) return;
    const dir = Number((e.currentTarget as HTMLButtonElement).dataset.dir);
    const base = Number.isNaN(this.value) ? 0 : this.value;
    this.value = this.#clamp(base + dir * this.step);
    this.emit("jd-change", { value: this.value });
  };

  protected override update(): void {
    const input = this.#input;
    input.disabled = this.disabled;
    input.required = this.required;
    input.placeholder = this.placeholder;
    input.step = String(this.step);
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");
    if (this.label) input.setAttribute("aria-label", this.label);
    else input.removeAttribute("aria-label");
    if (Number.isNaN(this.min)) input.removeAttribute("min");
    else input.min = String(this.min);
    if (Number.isNaN(this.max)) input.removeAttribute("max");
    else input.max = String(this.max);
    input.setAttribute("aria-invalid", this.error ? "true" : "false");

    // 입력 중 되쓰기 금지: 현재 문자열이 같은 수로 파싱되면 그대로 둔다("1." 유지)
    const next = Number.isNaN(this.value) ? "" : String(this.value);
    if (input.value !== next && parseFloat(input.value) !== this.value) input.value = next;

    const v = Number.isNaN(this.value) ? 0 : this.value;
    this.#dec.disabled = this.disabled || (!Number.isNaN(this.min) && v <= this.min);
    this.#inc.disabled = this.disabled || (!Number.isNaN(this.max) && v >= this.max);
    this.#dec.hidden = this.hideControls;
    this.#inc.hidden = this.hideControls;
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }
}
