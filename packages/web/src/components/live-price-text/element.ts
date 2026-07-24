/**
 * <jd-live-price-text> — 종목 현재가를 로케일 포맷 텍스트로 그리는 리프(v2 finance/LiveCell
 * `LivePriceText`). **가격 렌더 계열의 골격 정본**이다 — jd-live-price가 이 클래스를 상속해
 * 색/크기/플래시만 얹는다(§6 R12, jd-stat→jd-stat-card 선례).
 *
 * v2는 `useLivePrice(name)` 훅으로 시뮬레이터를 구독했다. DS는 의존성 0이라 그 구독을
 * 옮겨올 수 없다 — **표현부만 이식하고 값은 property로 주입받는다**(jd-animated-counter·
 * jd-price-display와 같은 판단: "라이브"는 앱의 몫, 반응형 표시는 DS의 몫). name 프롭이
 * 사라진 자리에 price(현재가)·fallback(시드 전 mock seed)이 들어온다.
 *
 * v2 대비 교정 2건:
 *  1. locale이 "ko-KR" 하드코딩이었다 → prop(기본값 동일). jd-animated-counter와 같은 판단.
 *  2. Intl(0~20) 밖 decimals가 RangeError로 앱을 죽였다 → 클램프.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import styles from "./live-price-text.css.js";

const EM_DASH = "—";

export class JdLivePriceText extends JdElement {
  static override tag = "jd-live-price-text";
  static override props = {
    /** 현재가. 0 이하면 fallback으로 폴백, 둘 다 없으면 "—" */
    price: { type: Number },
    /** SSR/시드 전 폴백값 (보통 mock seed price) */
    fallback: { type: Number },
    decimals: { type: Number, default: 0 },
    /** v2 하드코딩 해제 — 기본값은 v2와 동일 */
    locale: { type: String, default: "ko-KR" },
  };

  declare price: number;
  declare fallback: number;
  declare decimals: number;
  declare locale: string;

  #node!: Text;
  #fmt: Intl.NumberFormat | null = null;
  #fmtKey = "";

  /** Intl(0~20) 안전 범위로 접는다 (jd-animated-counter 선례) */
  protected get safeDecimals(): number {
    const d = Math.trunc(this.decimals);
    return Number.isFinite(d) ? Math.min(20, Math.max(0, d)) : 0;
  }

  /** 표시값 — price>0이면 실값, 아니면 fallback (v2 `price > 0 ? price : fallback`) */
  protected get resolvedValue(): number {
    const p = this.price;
    if (Number.isFinite(p) && p > 0) return p;
    const f = this.fallback;
    return Number.isFinite(f) ? f : 0;
  }

  /** 확정 표시 문자열 ("—" 또는 로케일 포맷) — 파생·소비자 공용 */
  get formatted(): string {
    const v = this.resolvedValue;
    return v > 0 ? this.#format(v) : EM_DASH;
  }

  #format(n: number): string {
    const dec = this.safeDecimals;
    const key = `${this.locale} ${dec}`;
    if (!this.#fmt || this.#fmtKey !== key) {
      this.#fmtKey = key;
      this.#fmt = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      });
    }
    return this.#fmt.format(n);
  }

  protected render(): void {
    adoptStyles(styles);
    // 리프 텍스트 — 소유 텍스트 노드 하나로 골격을 고정(입양·멱등, §3.3)
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
