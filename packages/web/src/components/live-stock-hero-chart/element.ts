/**
 * <jd-live-stock-hero-chart> — 종목 상세 메인 캔들 차트 + LIVE 배지 (v2 finance/LiveStockHeroChart).
 *
 * v2는 KIS 일봉 60거래일을 fetch하고, 장중엔 마지막 캔들 종가를 useLivePrice로 갱신하며,
 * strategyFor로 가격 라더 마커를 계산한 뒤 CandleChart를 감쌌다. DS는 세 관심사를 나눈다:
 *  - **차트 렌더는 jd-candle-chart에 위임**한다(§6 재사용, createElementNS·마커·현재가 라인이
 *    이미 풀려 있다). 이 컴포넌트는 candles/markers/width/height를 그대로 넘긴다.
 *  - **데이터·전략 계산은 앱**의 몫(DEC-003) — 라이브 갱신된 candles와 매수/목표 markers를
 *    프로퍼티(또는 JSON 슬롯)로 받는다.
 *  - **더하는 것은 v2와 같이 LIVE 배지 오버레이뿐**이다(jd-live-status-dot 컴포즈).
 *
 * v2 기본 형태 이식: showVolume=false(→ 거래량 패널 숨김, `show-volume`로 opt-in),
 * showCurrent=true(현재가 라인 노출) — 안쪽 차트에 프로퍼티로 지시한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import heroStyles from "./live-stock-hero-chart.css.js";
import type { JdCandle, JdMarkerLine } from "../candle-chart/element.js";

/** 안쪽 jd-candle-chart가 노출하는 프로퍼티 표면(런타임 의존 없이 타입만) */
interface CandleChartLike extends HTMLElement {
  width: number;
  height: number;
  noVolume: boolean;
  candles: JdCandle[];
  markers: JdMarkerLine[];
  label: string;
}

export class JdLiveStockHeroChart extends JdElement {
  static override tag = "jd-live-stock-hero-chart";
  static override props = {
    width: { type: Number, default: 1100 },
    height: { type: Number, default: 380 },
    /** 라이브 세션 여부 — 배지 상태 (v2 isOpen) */
    live: { type: Boolean, reflect: true },
    /** 배지 상태 텍스트 override */
    label: { type: String },
    /** 배지 옆 출처 표기 (예: "KIS") */
    source: { type: String },
    /** v2 showVolume=false의 opt-in — 켜면 거래량 패널을 보인다 */
    showVolume: { type: Boolean, reflect: true, attribute: "show-volume" },
    /** 안쪽 차트 접근 이름 override */
    chartLabel: { type: String, attribute: "chart-label" },
    // candles/markers(배열)는 복합 데이터 — property 전용(§1.3).
  };

  declare width: number;
  declare height: number;
  declare live: boolean;
  declare label: string;
  declare source: string;
  declare showVolume: boolean;
  declare chartLabel: string;

  #candles: JdCandle[] = [];
  #markers: JdMarkerLine[] = [];

  #chart!: CandleChartLike;
  #dot!: HTMLElement;
  #source!: HTMLElement;

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
    adoptStyles(heroStyles);
    this.#readJsonSlot();

    const badge = document.createElement("div");
    badge.className = "jd-lshc__badge";
    this.#dot = document.createElement("jd-live-status-dot");
    this.#source = document.createElement("span");
    this.#source.className = "jd-lshc__source";
    badge.append(this.#dot, this.#source);

    this.#chart = document.createElement("jd-candle-chart") as CandleChartLike;
    this.#chart.className = "jd-lshc__chart";

    this.replaceChildren(badge, this.#chart);
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "null") as {
        candles?: unknown;
        markers?: unknown;
      } | null;
      // 슬롯은 초기값 — 이미 대입된 candles/markers 프로퍼티를 덮지 않는다(§1.3)
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.candles) && this.#candles.length === 0) {
          this.#candles = parsed.candles as JdCandle[];
        }
        if (Array.isArray(parsed.markers) && this.#markers.length === 0) {
          this.#markers = parsed.markers as JdMarkerLine[];
        }
      }
    } catch {
      console.warn("[junds] <jd-live-stock-hero-chart> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    (this.#dot as unknown as { live: boolean }).live = this.live;
    (this.#dot as unknown as { label: string }).label =
      this.label || (this.live ? "LIVE" : "장마감");
    this.#source.textContent = this.source || "";
    this.#source.hidden = !this.source;

    // 안쪽 차트로 표면을 위임한다 — 거래량은 v2처럼 기본 숨김, 현재가 라인은 노출(기본)
    this.#chart.width = this.width;
    this.#chart.height = this.height;
    this.#chart.noVolume = !this.showVolume;
    if (this.chartLabel) this.#chart.label = this.chartLabel;
    this.#chart.candles = this.#candles;
    this.#chart.markers = this.#markers;
  }
}
