/**
 * <jd-price-display> — 통화 포맷 + 할인 원가 + 할인율 자동 계산 (v2 composites/PriceDisplay).
 *
 * - value/original은 String 프로퍼티다: 순수 숫자 문자열(또는 number 대입)이면 Intl로
 *   포맷하고, 그 외 문자열은 "이미 포맷된 값"으로 보고 그대로 노출한다 — v2 `typeof v`
 *   분기를 attribute-안전하게 재현한 것이다(WEB-03 JSON-in-attribute 금지 하에서 number|string
 *   표면 보존). Intl.NumberFormat은 (locale, currency)에 결정적이라 프리렌더 규칙(§3.1-3)과
 *   충돌하지 않는다 — locale 기본값도 navigator가 아닌 상수 "ko-KR"(jd-number-formatter 동형).
 * - size/layout은 reflect된 호스트 속성 → CSS가 처리(§4.3). update()에서 JS 분기 없음.
 *
 * v2 대비 표면 교정:
 *  1. showDiscount(기본 true)는 CE Boolean 관용상 부재=false로만 표현 가능하므로 역표현
 *     `hide-discount`로 낸다(jd-number-input hideControls 선례). 기본 노출은 그대로 유지.
 *  2. 원가를 `<s>`(취소선 의미)로, 할인율에 aria-label("N% 할인")을 달아 시각(line-through)
 *     뿐이던 정보를 접근성 트리에도 싣는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import priceDisplayStyles from "./price-display.css.js";

const NUMERIC = /^-?\d+(\.\d+)?$/;

/** number 또는 "순수 숫자 문자열"만 숫자로 본다. 그 외("₩29,000")는 null(이미 포맷됨) */
function asNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s === "" || !NUMERIC.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function fmt(raw: unknown, currency: string, locale: string): string {
  const n = asNumber(raw);
  if (n === null) return raw == null ? "" : String(raw);
  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  }
  return new Intl.NumberFormat(locale).format(n);
}

export class JdPriceDisplay extends JdElement {
  static override tag = "jd-price-display";
  static override props = {
    value: { type: String },
    original: { type: String },
    /** Intl 통화 코드 — value가 순수 숫자일 때만 사용 */
    currency: { type: String },
    locale: { type: String, default: "ko-KR" },
    /** 단위 접미사 (예: "/월") */
    suffix: { type: String },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg | xl
    layout: { type: String, default: "inline", reflect: true }, // inline | stacked
    /** v2 showDiscount=true의 CE 역표현 — 존재하면 할인율 배지를 숨긴다 */
    hideDiscount: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare original: string;
  declare currency: string;
  declare locale: string;
  declare suffix: string;
  declare size: string;
  declare layout: string;
  declare hideDiscount: boolean;

  #discount!: HTMLElement;
  #current!: HTMLElement;
  #value!: HTMLElement;
  #suffix!: HTMLElement;
  #original!: HTMLElement;

  protected render(): void {
    adoptStyles(priceDisplayStyles);
    // 입양(§3.3)
    const existing = this.querySelector<HTMLElement>(":scope > .jd-price-display__current");
    if (existing) {
      this.#current = existing;
      this.#value = existing.querySelector<HTMLElement>(".jd-price-display__value")!;
      this.#suffix = existing.querySelector<HTMLElement>(".jd-price-display__suffix")!;
      this.#discount = this.querySelector<HTMLElement>(".jd-price-display__discount")!;
      this.#original = this.querySelector<HTMLElement>(".jd-price-display__original")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const doc = this.ownerDocument;
    this.#discount = doc.createElement("span");
    this.#discount.className = "jd-price-display__discount";
    this.#value = doc.createElement("span");
    this.#value.className = "jd-price-display__value";
    this.#suffix = doc.createElement("span");
    this.#suffix.className = "jd-price-display__suffix";
    this.#current = doc.createElement("span");
    this.#current.className = "jd-price-display__current";
    this.#current.append(this.#value, this.#suffix);
    this.#original = doc.createElement("s"); // 취소선 의미 — 시각+접근성 일치
    this.#original.className = "jd-price-display__original";
    // DOM 순서 = 시각 순서 [할인율][현재가][원가]
    this.append(this.#discount, this.#current, this.#original);
  }

  protected override update(): void {
    this.#value.textContent = fmt(this.value, this.currency, this.locale);

    const hasSuffix = Boolean(this.suffix);
    this.#suffix.textContent = hasSuffix ? this.suffix : "";
    this.#suffix.hidden = !hasSuffix;

    const orig = this.original ? fmt(this.original, this.currency, this.locale) : "";
    this.#original.textContent = orig;
    this.#original.hidden = !orig;

    const nv = asNumber(this.value);
    const no = asNumber(this.original);
    const pct = nv !== null && no !== null && no > 0 ? Math.round(((no - nv) / no) * 100) : 0;
    const showPct = !this.hideDiscount && pct > 0;
    this.#discount.textContent = showPct ? `${pct}%` : "";
    this.#discount.hidden = !showPct;
    if (showPct) this.#discount.setAttribute("aria-label", `${pct}% 할인`);
    else this.#discount.removeAttribute("aria-label");
  }
}
