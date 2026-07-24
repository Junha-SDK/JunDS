/**
 * <jd-live-pct-text> — 등락률을 부호·퍼센트 붙여 텍스트로 그리는 리프(v2 finance/LiveCell
 * `LivePctText`). **등락률 렌더 계열의 골격 정본** — jd-live-pct-badge가 이 클래스를 상속해
 * 색만 얹는다(§6 R12).
 *
 * v2 훅 구독은 DS로 옮길 수 없어(의존성 0) name→change로 값을 주입받는다
 * (jd-live-price-text와 같은 판단).
 *
 * v2 boolean 프롭 2개는 CE 관용상 기본 true를 attribute로 끌 수 없어 역표현한다
 * (jd-price-display hideDiscount 선례):
 *  - v2 showSign=true   → hide-sign  (있으면 양수 "+" 숨김)
 *  - v2 withPercent=true → hide-percent (있으면 "%" 접미 숨김)
 * 기본 노출은 그대로 유지된다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import styles from "./live-pct-text.css.js";

export class JdLivePctText extends JdElement {
  static override tag = "jd-live-pct-text";
  static override props = {
    /** 등락률(%). 0은 시드 전 신호로 보고 fallback으로 폴백 (v2 `change !== 0`) */
    change: { type: Number },
    fallback: { type: Number },
    decimals: { type: Number, default: 2 },
    /** v2 showSign=true의 역표현 — 있으면 양수 앞 "+"를 숨긴다 */
    hideSign: { type: Boolean, reflect: true },
    /** v2 withPercent=true의 역표현 — 있으면 "%" 접미를 숨긴다 */
    hidePercent: { type: Boolean, reflect: true },
  };

  declare change: number;
  declare fallback: number;
  declare decimals: number;
  declare hideSign: boolean;
  declare hidePercent: boolean;

  #node!: Text;

  /** toFixed(0~100) 안전 범위로 접는다 */
  protected get safeDecimals(): number {
    const d = Math.trunc(this.decimals);
    return Number.isFinite(d) ? Math.min(100, Math.max(0, d)) : 2;
  }

  /** 표시값 — change가 0이 아니면 실값, 0이면 fallback (v2 분기) */
  protected get resolvedValue(): number {
    const c = this.change;
    if (Number.isFinite(c) && c !== 0) return c;
    const f = this.fallback;
    return Number.isFinite(f) ? f : 0;
  }

  /** 확정 표시 문자열 — 파생·소비자 공용 */
  get formatted(): string {
    const v = this.resolvedValue;
    const prefix = !this.hideSign && v > 0 ? "+" : "";
    return `${prefix}${v.toFixed(this.safeDecimals)}${this.hidePercent ? "" : "%"}`;
  }

  protected render(): void {
    adoptStyles(styles);
    const existing = this.firstChild;
    this.#node = existing instanceof Text ? existing : this.ownerDocument.createTextNode("");
    if (this.#node.parentNode !== this) this.replaceChildren(this.#node);
    this.update();
  }

  protected override update(): void {
    const text = this.formatted;
    if (this.#node.data !== text) this.#node.data = text;
  }
}
