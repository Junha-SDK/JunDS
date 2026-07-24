/**
 * <jd-real-candle-chart> — 소스 배지 + 신선도가 붙은 캔들 차트 래퍼 (v2 finance/RealCandleChart).
 *
 * 내부에 <jd-candle-chart>를 합성하고, 그 위에 데이터 출처(Yahoo/샘플)·봉 수·마지막
 * 갱신 시각 배지와 "Yahoo에서 보기" 링크를 얹는다(§6 R12: 차트를 상속이 아니라 합성).
 *
 * DEC-003: v2는 `/api/candles`를 **폴링해서** 그렸다. v3는 캔들·출처·시각을 property로
 * **받는다** — fetch·폴링·마켓상태 판정은 호출부(앱)가 한다. 컴포넌트는 표시만.
 *
 * SSG 결정성(§3.1-3): 신선도의 "N초 전"은 Date.now()에 의존하므로 render()/update()에서
 * 계산하지 않는다. connected() 이후 인터벌 타이머가 label을 채운다(Clock 관용구). 프리렌더
 * 시점엔 as-of가 0이라 타이머가 no-op → 스냅샷에 시간 문자열이 실리지 않는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInterval } from "../../behaviors/timing.js";
import type { JdCandle, JdCandleChart, JdMarkerLine } from "../candle-chart/element.js";
import realCandleChartStyles from "./real-candle-chart.css.js";

const EXTERNAL_SVG =
  `<svg class="jd-real-candle-chart__ext" width="11" height="11" viewBox="0 0 24 24" ` +
  `fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ` +
  `stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M15 3h6v6"/><path d="M10 14 21 3"/>` +
  `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`;

const LIVE_STATUSES = new Set(["장중", "프리장", "애프터장"]);

/** v2 pollMsFor — 인트라데이 간격만 신선도 배지를 켠다 */
function pollMsFor(interval: string): number {
  if (interval === "5m" || interval === "15m") return 20_000;
  if (interval === "30m") return 30_000;
  if (interval === "1h") return 45_000;
  return 0;
}

export class JdRealCandleChart extends JdElement {
  static override tag = "jd-real-candle-chart";
  static override props = {
    symbol: { type: String },
    range: { type: String, default: "3mo" },
    interval: { type: String, default: "1d" },
    /** yahoo | mock (빈 값이면 로딩 중 표시) */
    source: { type: String, reflect: true },
    loading: { type: Boolean, reflect: true },
    /** 마지막 갱신 시각(epoch ms). 0이면 신선도 배지 숨김 (attr: as-of) */
    asOf: { type: Number, attribute: "as-of" },
    /** 장중/프리장/애프터장/장마감/휴장 (attr: market-status) */
    marketStatus: { type: String, attribute: "market-status" },
    width: { type: Number, default: 1280 },
    height: { type: Number, default: 540 },
  };

  declare symbol: string;
  declare range: string;
  declare interval: string;
  declare source: string;
  declare loading: boolean;
  declare asOf: number;
  declare marketStatus: string;
  declare width: number;
  declare height: number;

  #candles: JdCandle[] = [];
  #markers: JdMarkerLine[] = [];

  #chart!: JdCandleChart;
  #badge!: HTMLElement;
  #badgeDot!: HTMLElement;
  #badgeText!: HTMLElement;
  #countEl!: HTMLElement;
  #freshEl!: HTMLElement;
  #freshDot!: HTMLElement;
  #freshText!: HTMLElement;
  #yahooLink!: HTMLAnchorElement;

  get candles(): JdCandle[] {
    return this.#candles;
  }
  set candles(v: JdCandle[]) {
    this.#candles = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }
  get markers(): JdMarkerLine[] {
    return this.#markers;
  }
  set markers(v: JdMarkerLine[]) {
    this.#markers = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(realCandleChartStyles);
    for (const name of ["candles", "markers"]) {
      if (!Object.prototype.hasOwnProperty.call(this, name)) continue;
      const self = this as Record<string, unknown>;
      const v = self[name];
      delete self[name];
      self[name] = v;
    }
    if (!this.querySelector(":scope > .jd-real-candle-chart__header")) this.#build();
    else this.#collect();
    this.update();
  }

  #build(): void {
    const header = document.createElement("div");
    header.className = "jd-real-candle-chart__header";

    const meta = document.createElement("div");
    meta.className = "jd-real-candle-chart__meta";

    this.#badge = document.createElement("span");
    this.#badge.className = "jd-real-candle-chart__badge";
    this.#badgeDot = document.createElement("span");
    this.#badgeDot.className = "jd-real-candle-chart__dot";
    this.#badgeDot.setAttribute("aria-hidden", "true");
    this.#badgeText = document.createElement("span");
    this.#badgeText.className = "jd-real-candle-chart__badge-text";
    this.#badge.append(this.#badgeDot, this.#badgeText);

    this.#countEl = document.createElement("span");
    this.#countEl.className = "jd-real-candle-chart__count";
    this.#countEl.hidden = true;

    this.#freshEl = document.createElement("span");
    this.#freshEl.className = "jd-real-candle-chart__freshness";
    this.#freshEl.hidden = true;
    this.#freshDot = document.createElement("span");
    this.#freshDot.className = "jd-real-candle-chart__fresh-dot";
    this.#freshDot.setAttribute("aria-hidden", "true");
    this.#freshText = document.createElement("span");
    this.#freshText.className = "jd-real-candle-chart__fresh-text";
    this.#freshEl.append(this.#freshDot, this.#freshText);

    meta.append(this.#badge, this.#countEl, this.#freshEl);

    this.#yahooLink = document.createElement("a");
    this.#yahooLink.className = "jd-real-candle-chart__yahoo";
    this.#yahooLink.target = "_blank";
    this.#yahooLink.rel = "noopener noreferrer";
    this.#yahooLink.hidden = true;
    this.#yahooLink.append(document.createTextNode("Yahoo에서 보기 "));
    this.#yahooLink.insertAdjacentHTML("beforeend", EXTERNAL_SVG);

    header.append(meta, this.#yahooLink);

    this.#chart = document.createElement("jd-candle-chart") as JdCandleChart;
    this.#chart.className = "jd-real-candle-chart__chart";

    this.append(header, this.#chart);
  }

  #collect(): void {
    this.#badge = this.querySelector(".jd-real-candle-chart__badge")!;
    this.#badgeDot = this.querySelector(".jd-real-candle-chart__dot")!;
    this.#badgeText = this.querySelector(".jd-real-candle-chart__badge-text")!;
    this.#countEl = this.querySelector(".jd-real-candle-chart__count")!;
    this.#freshEl = this.querySelector(".jd-real-candle-chart__freshness")!;
    this.#freshDot = this.querySelector(".jd-real-candle-chart__fresh-dot")!;
    this.#freshText = this.querySelector(".jd-real-candle-chart__fresh-text")!;
    this.#yahooLink = this.querySelector(".jd-real-candle-chart__yahoo")!;
    this.#chart = this.querySelector(".jd-real-candle-chart__chart") as JdCandleChart;
  }

  /** 신선도 label은 타이머만 갱신한다(§3.1-3 결정성). 1초 간격이면 첫 표시 지연이 눈에 안 띈다. */
  protected override connected(): void {
    this.own(createInterval(this.#tick, 1000));
  }

  #tick = (): void => {
    if (!this.#freshnessVisible()) return;
    const sec = Math.max(0, Math.floor((Date.now() - this.asOf) / 1000));
    const label = sec < 5 ? "방금" : sec < 60 ? `${sec}초 전` : `${Math.floor(sec / 60)}분 전`;
    this.#freshText.textContent = `${label} 갱신`;
  };

  #freshnessVisible(): boolean {
    return this.asOf > 0 && pollMsFor(this.interval) > 0;
  }

  protected override update(): void {
    // 내부 차트로 전달 — property 대입(복합 데이터 §1.3)
    this.#chart.width = this.width;
    this.#chart.height = this.height;
    this.#chart.candles = this.#candles;
    this.#chart.markers = this.#markers;

    const yahoo = this.source === "yahoo";

    // 소스 배지
    this.#badge.dataset.source = yahoo ? "yahoo" : "mock";
    this.#badgeText.textContent = yahoo
      ? "Yahoo Finance · 실시간"
      : this.loading
        ? "데이터 불러오는 중…"
        : "샘플 데이터";

    // 봉 수 — Yahoo일 때만
    this.#countEl.hidden = !yahoo;
    if (yahoo) this.#countEl.textContent = `${this.#candles.length}봉 · ${this.range} ${this.interval}`;

    // 신선도 배지 — 인트라데이 + asOf 있을 때만. label은 타이머가 채운다.
    const fresh = this.#freshnessVisible();
    this.#freshEl.hidden = !fresh;
    this.#freshDot.dataset.live = String(LIVE_STATUSES.has(this.marketStatus));

    // Yahoo 링크
    this.#yahooLink.hidden = !yahoo;
    if (yahoo) {
      this.#yahooLink.href = `https://finance.yahoo.com/quote/${encodeURIComponent(this.symbol ?? "")}`;
    }
  }
}
