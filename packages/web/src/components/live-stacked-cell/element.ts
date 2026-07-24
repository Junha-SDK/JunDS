/**
 * <jd-live-stacked-cell> — 현재가(위) + 등락률(아래)을 색까지 칠해 세로로 쌓은 우측정렬
 * 셀(v2 finance/LiveCell `LiveStackedCell`). 테이블 종목 셀 관용구다.
 *
 * v2 훅 구독은 DS로 옮길 수 없어(의존성 0) name→price/change로 값을 주입받는다. 포맷·
 * 색 관용구는 형제(jd-live-price-text/jd-live-pct-badge)와 겹치지만, 이 컴포넌트는 두 값을
 * **한 색으로 묶어** 두 줄로 쌓는 별도 골격이라 상속이 아닌 독립 구현이 맞다.
 *
 * v2 판정 보존: `up = c >= 0` — 0%도 상승(초록)으로 본다(jd-live-pct-badge의 flat 임계와
 * 다르다, 원본 규칙 그대로). 색은 판정 결과(data-trend)만으로 호스트→자식에 흐른다.
 *
 * v2 대비 교정: decimals가 하드코딩(가격 로케일 기본·등락률 2자리)이었다 → 프롭으로
 * 열되 기본값은 v2와 동일. 부호(+/-)를 텍스트로 남겨 방향이 색뿐 아니라 낭독에도 실린다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import styles from "./live-stacked-cell.css.js";

const EM_DASH = "—";

function el(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

export class JdLiveStackedCell extends JdElement {
  static override tag = "jd-live-stacked-cell";
  static override props = {
    price: { type: Number },
    change: { type: Number },
    /** 시드 전 폴백 (보통 mock seed) */
    priceFallback: { type: Number },
    pctFallback: { type: Number },
    priceDecimals: { type: Number, default: 0 },
    pctDecimals: { type: Number, default: 2 },
    locale: { type: String, default: "ko-KR" },
  };

  declare price: number;
  declare change: number;
  declare priceFallback: number;
  declare pctFallback: number;
  declare priceDecimals: number;
  declare pctDecimals: number;
  declare locale: string;

  #price!: HTMLElement;
  #pct!: HTMLElement;
  #fmt: Intl.NumberFormat | null = null;
  #fmtKey = "";

  #safe(dec: number, max: number, fallback: number): number {
    const d = Math.trunc(dec);
    return Number.isFinite(d) ? Math.min(max, Math.max(0, d)) : fallback;
  }

  #resolve(primary: number, fallback: number, gate: (n: number) => boolean): number {
    if (Number.isFinite(primary) && gate(primary)) return primary;
    return Number.isFinite(fallback) ? fallback : 0;
  }

  #formatPrice(n: number): string {
    const dec = this.#safe(this.priceDecimals, 20, 0);
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
    const found = this.querySelector<HTMLElement>(":scope > .jd-live-stacked-cell__price");
    if (found) {
      this.#price = found;
      this.#pct = this.querySelector<HTMLElement>(":scope > .jd-live-stacked-cell__pct")!;
    } else {
      this.#price = el("div", "jd-live-stacked-cell__price");
      this.#pct = el("div", "jd-live-stacked-cell__pct");
      this.replaceChildren(this.#price, this.#pct);
    }
    this.update();
  }

  protected override update(): void {
    // 가격: price>0면 실값, 아니면 priceFallback (v2 `price > 0 ? price : fallback`)
    const p = this.#resolve(this.price, this.priceFallback, (n) => n > 0);
    // 등락률: change!==0이면 실값, 0이면 pctFallback (v2 분기)
    const c = this.#resolve(this.change, this.pctFallback, (n) => n !== 0);
    const up = c >= 0; // v2: 0%도 상승

    this.setAttribute("data-trend", up ? "up" : "down");
    this.#price.textContent = p > 0 ? this.#formatPrice(p) : EM_DASH;
    this.#pct.textContent = `${up ? "+" : ""}${c.toFixed(this.#safe(this.pctDecimals, 100, 2))}%`;
  }
}
