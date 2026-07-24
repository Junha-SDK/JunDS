/**
 * <jd-currency-input> — 통화 포맷 금액 입력 (v2 primitives/CurrencyInput).
 *
 * - 포커스 아웃이면 Intl.NumberFormat(style:currency) 표기, 포커스 중이면 원시 숫자.
 *   Intl은 (locale, currency)에 대해 결정적이라 프리렌더 규칙(§3.1-3)과 충돌하지 않는다.
 *   locale 기본값은 navigator가 아니라 상수 "ko-KR" — 환경 의존 렌더 금지.
 * - "값 없음"은 NaN 센티널(jd-number-input과 동일 규약). v2는 입력을 비우면 0을
 *   강제해 필드를 영영 비울 수 없었다 — v3는 빈 값을 빈 값으로 유지한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import currencyInputStyles from "./currency-input.css.js";

/** (locale, currency) 조합당 1회 생성 — 포맷터 생성은 비싸다 */
const formatters = new Map<string, Intl.NumberFormat>();
function formatterFor(locale: string, currency: string): Intl.NumberFormat {
  const key = `${locale}|${currency}`;
  let f = formatters.get(key);
  if (!f) {
    // 소수 자릿수는 Intl의 통화별 기본값에 맡긴다. v2는 `KRW ? 0 : 2` 하드코딩이라
    // 0자리 통화(JPY·VND·CLP…)를 ￥800.00처럼 틀리게 찍었다 — v2가 맞게 다루던
    // KRW(0)·USD(2)는 Intl 기본값과 같으므로 그 두 축의 패리티는 유지된다.
    f = new Intl.NumberFormat(locale, { style: "currency", currency });
    formatters.set(key, f);
  }
  return f;
}

export class JdCurrencyInput extends JdElement {
  static override tag = "jd-currency-input";
  static override props = {
    /** 숫자 값. NaN = 비어 있음 */
    value: { type: Number, default: NaN },
    /** ISO 4217 */
    currency: { type: String, default: "KRW" },
    /** BCP 47 */
    locale: { type: String, default: "ko-KR" },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    error: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    name: { type: String },
    placeholder: { type: String },
    label: { type: String },
  };

  declare value: number;
  declare currency: string;
  declare locale: string;
  declare size: string;
  declare error: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare placeholder: string;
  declare label: string;

  #input!: HTMLInputElement;
  #focused = false;

  /** 표시 문자열 — 포커스 중엔 원시값, 아니면 통화 표기 */
  get formatted(): string {
    if (Number.isNaN(this.value)) return "";
    return this.#focused ? String(this.value) : formatterFor(this.locale, this.currency).format(this.value);
  }

  protected render(): void {
    adoptStyles(currencyInputStyles);
    const existing = this.querySelector<HTMLInputElement>(":scope > input.jd-currency-input__input");
    if (existing) this.#input = existing;
    else this.#build();
    this.update();
  }

  #build(): void {
    this.#input = document.createElement("input");
    this.#input.type = "text"; // number가 아니다 — 통화 기호·천단위 구분자를 담아야 한다
    this.#input.inputMode = "numeric";
    this.#input.className = "jd-currency-input__input";
    this.append(this.#input);
  }

  protected override connected(): void {
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("focus", this.#onFocus);
    this.#input.addEventListener("blur", this.#onBlur);
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("input", this.#onInput);
    this.#input?.removeEventListener("focus", this.#onFocus);
    this.#input?.removeEventListener("blur", this.#onBlur);
  }

  #onInput = (): void => {
    const raw = this.#input.value.replace(/[^\d.-]/g, "");
    const num = parseFloat(raw);
    this.value = Number.isNaN(num) ? NaN : num;
    this.emit("jd-input", { value: this.value });
  };

  /**
   * 표기 전환은 update()가 아니라 여기서 직접 쓴다 — update()의 "같은 수면 두기"
   * 가드가 ₩1,500 → 1500 전환까지 막아버린다(값은 같고 표기만 달라지는 경우).
   */
  #onFocus = (): void => {
    this.#focused = true;
    this.#input.value = this.formatted; // 원시값
  };

  #onBlur = (): void => {
    this.#focused = false;
    this.#input.value = this.formatted; // 통화 표기로 확정
    this.emit("jd-change", { value: this.value });
  };

  protected override update(): void {
    const input = this.#input;
    input.disabled = this.disabled;
    input.required = this.required;
    input.placeholder = this.placeholder;
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");
    if (this.label) input.setAttribute("aria-label", this.label);
    else input.removeAttribute("aria-label");
    input.setAttribute("aria-invalid", this.error ? "true" : "false");

    // 입력 중 되쓰기 금지 — 같은 수로 파싱되는 문자열은 그대로 둔다("1." · "1000" 유지)
    const next = this.formatted;
    if (input.value !== next) {
      const cur = parseFloat(input.value.replace(/[^\d.-]/g, ""));
      const same = Number.isNaN(cur) ? Number.isNaN(this.value) : cur === this.value;
      if (!(this.#focused && same)) input.value = next;
    }
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }
}
