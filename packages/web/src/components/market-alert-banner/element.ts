/**
 * <jd-market-alert-banner> — 상승률 1위 종목 알림 배너 (v2 finance/MarketAlertBanner).
 *
 * v2는 useLivePrices(KIS 시뮬레이터)로 상승률 1위를 런타임에 골라 넣었다 — 데이터
 * 수집은 DS 밖의 일이라 이식에서 걷어내고, `symbol`·`pct`를 **표시 프로퍼티**로 받는다.
 * 자동 헤드라인(급등/보합/급락)은 pct에서 순수 파생하므로 그대로 옮긴다.
 *
 * v2 대비 교정:
 *  1. **시각(HH:MM)을 render 중 `new Date()`로 읽었다** — 프리렌더/방문자 시각이 갈리는
 *     비결정 렌더(§3.1). `time`을 프로퍼티로 두고, 미지정 시 connected()(이펙트)에서
 *     한 번 채운다 → render()는 문자 단위 결정적으로 유지된다.
 *  2. 통째로 클릭되던 카드가 이제 `<a>` 하나다 — 링크 의미가 명확하고 키보드 포커스가 선다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import bannerStyles from "./market-alert-banner.css.js";

const FLAME =
  `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" ` +
  `stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 ` +
  `4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;

/** v2 autoHeadline — pct 구간별 문안. 순수 함수라 그대로 승계 */
function autoHeadline(pct: number): string {
  if (pct >= 25) return "상한가 근접 — 거래 폭주";
  if (pct >= 15) return "급등세 지속";
  if (pct >= 8) return "강한 매수세 진입";
  if (pct >= 3) return "상승세";
  if (pct > 0) return "소폭 상승";
  if (pct > -3) return "보합권";
  if (pct > -8) return "하락세";
  return "급락 — 손절선 점검 필요";
}

function signedPct(n: number, decimals = 1): string {
  const value = Number.isFinite(n) ? n : 0;
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

const pad2 = (n: number): string => String(n).padStart(2, "0");

export class JdMarketAlertBanner extends JdElement {
  static override tag = "jd-market-alert-banner";
  static override props = {
    /** 종목명(표시 + 링크 경로) */
    symbol: { type: String, default: "—", reflect: true },
    /** 등락률(%). 부호·헤드라인·색을 결정 */
    pct: { type: Number, default: 0, reflect: true },
    /** HH:MM. 비우면 connected()에서 현재 시각으로 채운다 */
    time: { type: String },
    /** 좌측 강조 라벨 */
    label: { type: String, default: "실시간 상승률 1위" },
    /** 링크 목적지. 비우면 /stock/{symbol} */
    href: { type: String },
  };

  declare symbol: string;
  declare pct: number;
  declare time: string;
  declare label: string;
  declare href: string;

  #link!: HTMLAnchorElement;
  #time!: HTMLElement;
  #label!: HTMLElement;
  #symbol!: HTMLElement;
  #phrase!: HTMLElement;
  #pct!: HTMLElement;

  protected render(): void {
    adoptStyles(bannerStyles);
    // 입양(§3.3): 프리렌더/어댑터 골격이 있으면 재사용
    const existing = this.querySelector<HTMLAnchorElement>(":scope > .jd-mab");
    if (existing) {
      this.#link = existing;
      this.#time = existing.querySelector(".jd-mab__time")!;
      this.#label = existing.querySelector(".jd-mab__label")!;
      this.#symbol = existing.querySelector(".jd-mab__symbol")!;
      this.#phrase = existing.querySelector(".jd-mab__phrase")!;
      this.#pct = existing.querySelector(".jd-mab__pct")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const link = document.createElement("a");
    link.className = "jd-mab";

    const icon = document.createElement("span");
    icon.className = "jd-mab__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = FLAME;

    const body = document.createElement("div");
    body.className = "jd-mab__body";

    const meta = document.createElement("div");
    meta.className = "jd-mab__meta";
    this.#time = document.createElement("span");
    this.#time.className = "jd-mab__time";
    this.#label = document.createElement("span");
    this.#label.className = "jd-mab__label";
    meta.append(this.#time, this.#label);

    const headline = document.createElement("p");
    headline.className = "jd-mab__headline";
    this.#symbol = document.createElement("span");
    this.#symbol.className = "jd-mab__symbol";
    const dot = document.createElement("span");
    dot.className = "jd-mab__dot";
    dot.setAttribute("aria-hidden", "true");
    dot.textContent = "·";
    this.#phrase = document.createElement("span");
    this.#phrase.className = "jd-mab__phrase";
    headline.append(this.#symbol, dot, this.#phrase);

    body.append(meta, headline);

    this.#pct = document.createElement("span");
    this.#pct.className = "jd-mab__pct";

    link.append(icon, body, this.#pct);
    this.append(link);
    this.#link = link;
  }

  protected override connected(): void {
    if (!this.time) {
      const d = new Date();
      this.time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    }
  }

  protected override update(): void {
    const up = this.pct >= 0;
    this.#link.href = this.href || `/stock/${encodeURIComponent(this.symbol)}`;
    this.#time.textContent = this.time;
    this.#time.hidden = !this.time;
    this.#label.textContent = this.label;
    this.#symbol.textContent = this.symbol;
    this.#phrase.textContent = autoHeadline(this.pct);
    this.#pct.textContent = `${up ? "▲" : "▼"} ${signedPct(this.pct, 1)}`;
    this.#pct.dataset.dir = up ? "up" : "down";
    this.setAttribute("data-dir", up ? "up" : "down");
  }
}
