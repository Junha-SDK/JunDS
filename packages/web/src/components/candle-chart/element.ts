/**
 * <jd-candle-chart> — 금융 캔들 차트 (v2 finance/CandleChart).
 *
 * v2는 1666줄에 지표 20여 종을 한 파일에 몰아넣은 react 컴포넌트였다. 이 이식은
 * **핵심 차트를 온전히** 옮기고(캔들/하이킨아시/라인/에어리어, 거래량+히트맵,
 * 이동평균, 정적·실시간 마커, 이벤트 배지, 현재가 라인, x라벨, 로그 스케일, 비교 라인,
 * 크로스헤어+툴팁), 메인 차트 위 오버레이 중 계산이 가벼운 **볼린저·VWAP**를 켠다.
 *
 * 하단 서브패널 오실레이터(RSI·MACD·Stochastic·Williams%R·CCI·ATR·OBV)와
 * 일목·패턴·피벗·회귀·볼륨프로파일·세션음영은 **미구현으로 남긴다** — 각자 별도 지표
 * 계산 모듈(v2 lib/chartIndicators 635줄)이 필요해 이번 배치 범위를 넘는다. `indicators`
 * 프로퍼티는 전체 표면을 받아두되(후속 배치가 무파괴 확장), 위 목록은 아직 그리지 않는다.
 *
 * v2 대비 교정:
 *  1. **색이 표시 속성 인라인이었다**(fill="var(--bm-up)"). v3는 클래스+data-dir로 옮겨
 *     CSS가 칠한다 — 테마/상태 오버라이드가 열린다(core/chart.ts 철학과 동일).
 *  2. **toLocaleString("ko-KR")**가 축·마커·툴팁에 박혀 프리렌더/방문자 로케일이 갈렸다.
 *     v3는 groupDigits(§3.1-3 결정성)로 대체.
 *  3. **AT에 아무 숫자도 안 갔다**(SVG 하나). v3는 JdChartBase의 숨김 OHLCV 데이터 표를
 *     함께 렌더한다.
 *  4. **세션 음영이 new Date().getHours()**로 런타임 TZ에 의존했다(비결정) — 미구현 목록에 둠.
 */
import { JdChartBase } from "../../core/chart.js";
import {
  coord,
  groupDigits,
  positive,
  setAttrs,
  svgNode,
  upgradeAccessor,
} from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import candleChartStyles from "./candle-chart.css.js";

export interface JdCandle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  /** 시점 라벨/타임스탬프 */
  t: string;
}

export interface JdMarkerLine {
  label: string;
  price: number;
  /** 신뢰 CSS 색 문자열. 없으면 기본 accent */
  color?: string;
  /** 점선 + 맥동 점 — 실시간 체결가 등 */
  live?: boolean;
}

export interface JdEventMarker {
  index: number;
  label: string;
  color?: string;
  title?: string;
}

export interface JdCompareLine {
  values: (number | null)[];
  label: string;
  color?: string;
}

export type JdCandleChartType = "candle" | "heikin" | "line" | "area";

/** 전체 지표 표면 — bollinger·vwap·volumeHeatmap만 렌더(그 외는 후속 배치) */
export interface JdChartIndicators {
  bollinger?: boolean | { period?: number; stdDev?: number };
  vwap?: boolean;
  volumeHeatmap?: boolean;
  rsi?: boolean | { period?: number };
  macd?: boolean | { fast?: number; slow?: number; signal?: number };
  stochastic?: boolean | { period?: number; smooth?: number };
  williamsR?: boolean | { period?: number };
  cci?: boolean | { period?: number };
  atr?: boolean | { period?: number };
  obv?: boolean;
  ichimoku?: boolean;
  patterns?: boolean;
  pivots?: boolean;
  regression?: boolean;
  volumeProfile?: boolean | { bins?: number };
  sessionShading?: boolean;
}

const DEFAULT_MA = [5, 10, 20, 60, 120];

/** v2 MA_PALETTE(--bm-cat-*)를 finance 카테고리 토큰으로 번역 */
const MA_COLOR: Record<number, string> = {
  5: "var(--jd-fin-cat-2, #22c55e)",
  10: "var(--jd-fin-cat-1, #f59e0b)",
  20: "var(--jd-fin-cat-4, #ef4444)",
  60: "var(--jd-fin-cat-6, #a855f7)",
  120: "var(--jd-fin-cat-7, #ec4899)",
};

interface Layout {
  padL: number;
  padR: number;
  padT: number;
  padB: number;
  slot: number;
  bodyW: number;
  candleH: number;
  volH: number;
  volTop: number;
  volBottom: number;
  maxVol: number;
  min: number;
  max: number;
  useLog: boolean;
  yPrice: (p: number) => number;
  yPriceClamped: (p: number) => number;
}

/** v2 niceStep */
function niceStep(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  const nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nf * exp;
}

/** 하이킨아시 변환(v2 toHeikinAshi) */
function toHeikinAshi(bars: readonly JdCandle[]): JdCandle[] {
  const out: JdCandle[] = [];
  for (let i = 0; i < bars.length; i += 1) {
    const b = bars[i]!;
    const close = (b.o + b.h + b.l + b.c) / 4;
    const open = i === 0 ? (b.o + b.c) / 2 : (out[i - 1]!.o + out[i - 1]!.c) / 2;
    const high = Math.max(b.h, open, close);
    const low = Math.min(b.l, open, close);
    out.push({ ...b, o: open, h: high, l: low, c: close });
  }
  return out;
}

/** SMA */
function sma(values: readonly number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i]!;
    if (i >= period) sum -= values[i - period]!;
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

interface BollingerBands {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

function bollinger(closes: readonly number[], period: number, stdDev: number): BollingerBands {
  const middle = sma(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < closes.length; i += 1) {
    const m = middle[i];
    if (m == null) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    let variance = 0;
    for (let j = i - period + 1; j <= i; j += 1) variance += (closes[j]! - m) ** 2;
    const sd = Math.sqrt(variance / period);
    upper.push(m + stdDev * sd);
    lower.push(m - stdDev * sd);
  }
  return { upper, middle, lower };
}

/** VWAP — 누적 (typical×vol)/vol */
function vwap(candles: readonly JdCandle[]): number[] {
  const out: number[] = [];
  let cumPV = 0;
  let cumV = 0;
  for (const c of candles) {
    const typical = (c.h + c.l + c.c) / 3;
    cumPV += typical * c.v;
    cumV += c.v;
    out.push(cumV > 0 ? cumPV / cumV : typical);
  }
  return out;
}

function ma(candles: readonly JdCandle[], period: number): (number | null)[] {
  return sma(
    candles.map((c) => c.c),
    period,
  );
}

export class JdCandleChart extends JdChartBase {
  static override tag = "jd-candle-chart";
  static override props = {
    ...JdChartBase.props,
    width: { type: Number, default: 380 },
    height: { type: Number, default: 380 },
    /** candle | heikin | line | area */
    chartType: { type: String, default: "candle", reflect: true, attribute: "chart-type" },
    logScale: { type: Boolean, reflect: true, attribute: "log-scale" },
    /** 거래량 패널 숨김(v2 showVolume=true의 부정형) */
    noVolume: { type: Boolean, reflect: true, attribute: "no-volume" },
    /** 현재가 라인 숨김(v2 showCurrent=true의 부정형) */
    noCurrent: { type: Boolean, reflect: true, attribute: "no-current" },
    /** 구분선 위치(캔들 index). 음수면 없음 */
    separatorIndex: { type: Number, default: -1, attribute: "separator-index" },
  };

  declare width: number;
  declare height: number;
  declare chartType: string;
  declare logScale: boolean;
  declare noVolume: boolean;
  declare noCurrent: boolean;
  declare separatorIndex: number;

  #candles: JdCandle[] = [];
  #markers: JdMarkerLine[] = [];
  #events: JdEventMarker[] = [];
  #xLabels: { index: number; label: string; bold?: boolean }[] = [];
  #movingAverages: number[] = DEFAULT_MA;
  #indicators: JdChartIndicators = {};
  #compareLine: JdCompareLine | null = null;

  #svg!: SVGSVGElement;
  #layers: Record<string, SVGGElement> = {};
  #layout: Layout | null = null;
  #display: JdCandle[] = [];
  #hoverIdx = -1;
  #gradId = "";

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
  get events(): JdEventMarker[] {
    return this.#events;
  }
  set events(v: JdEventMarker[]) {
    this.#events = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }
  get xLabels(): { index: number; label: string; bold?: boolean }[] {
    return this.#xLabels;
  }
  set xLabels(v: { index: number; label: string; bold?: boolean }[]) {
    this.#xLabels = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }
  get movingAverages(): number[] {
    return this.#movingAverages;
  }
  set movingAverages(v: number[]) {
    this.#movingAverages = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }
  get indicators(): JdChartIndicators {
    return this.#indicators;
  }
  set indicators(v: JdChartIndicators) {
    this.#indicators = v && typeof v === "object" ? v : {};
    this.requestUpdate();
  }
  get compareLine(): JdCompareLine | null {
    return this.#compareLine;
  }
  set compareLine(v: JdCompareLine | null) {
    this.#compareLine = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  protected override defaultLabel(): string {
    return "캔들 차트";
  }

  protected override render(): void {
    adoptStyles(candleChartStyles);
    for (const name of [
      "candles",
      "markers",
      "events",
      "xLabels",
      "movingAverages",
      "indicators",
      "compareLine",
    ]) {
      upgradeAccessor(this, name);
    }
    this.#buildFrame();
    super.render(); // JdChartBase: role=figure, 범례, 숨김 데이터 표
  }

  #buildFrame(): void {
    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-candle-chart__svg");
    if (existing) {
      this.#svg = existing;
      this.#gradId = existing.querySelector("linearGradient")?.id ?? "";
      for (const key of Object.keys(this.#layerOrder())) {
        this.#layers[key] = existing.querySelector(`.jd-candle-chart__${key}`)!;
      }
      return;
    }
    this.#svg = svgNode("svg", "jd-candle-chart__svg");
    this.#svg.setAttribute("aria-hidden", "true"); // 값은 데이터 표가 말한다

    // area 그라디언트 defs — id는 인스턴스별 유일(중복 id면 url(#id)가 첫 노드로 붙는다)
    this.#gradId = jdUid("jd-candle-grad");
    const defs = svgNode("defs");
    const grad = svgNode("linearGradient");
    grad.setAttribute("id", this.#gradId);
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    const s0 = svgNode("stop");
    s0.setAttribute("offset", "0%");
    s0.setAttribute("class", "jd-candle-chart__area-stop0");
    const s1 = svgNode("stop");
    s1.setAttribute("offset", "100%");
    s1.setAttribute("class", "jd-candle-chart__area-stop1");
    grad.append(s0, s1);
    defs.append(grad);
    this.#svg.append(defs);

    for (const key of Object.keys(this.#layerOrder())) {
      const g = svgNode("g", `jd-candle-chart__${key}`);
      this.#layers[key] = g;
      this.#svg.append(g);
    }
    this.prepend(this.#svg);
  }

  /** 그리기 순서(뒤 → 앞) */
  #layerOrder(): Record<string, true> {
    return {
      grid: true,
      overlay: true, // separator, bollinger, vwap
      plot: true, // 캔들 또는 라인/에어리어
      ma: true,
      volume: true,
      markers: true,
      events: true,
      current: true,
      xlabels: true,
      crosshair: true,
    };
  }

  protected override connected(): void {
    this.#svg.addEventListener("pointermove", this.#onPointerMove);
    this.#svg.addEventListener("pointerleave", this.#onPointerLeave);
  }

  protected override disconnected(): void {
    this.#svg.removeEventListener("pointermove", this.#onPointerMove);
    this.#svg.removeEventListener("pointerleave", this.#onPointerLeave);
  }

  /** JdChartBase.update()가 이름 갱신 후 호출 */
  protected override paint(): void {
    const w = positive(this.width, 380);
    const h = positive(this.height, 380);
    setAttrs(this.#svg, { width: w, height: h, viewBox: `0 0 ${w} ${h}` });

    this.#display =
      this.chartType === "heikin"
        ? toHeikinAshi(this.#candles).map((b, i) => ({ ...this.#candles[i]!, ...b }))
        : this.#candles.slice();

    const layout = this.#computeLayout(w, h);
    this.#layout = layout;

    this.#drawGrid(layout, w);
    this.#drawOverlay(layout);
    this.#drawPlot(layout, w);
    this.#drawMA(layout);
    this.#drawVolume(layout);
    this.#drawMarkers(layout, w);
    this.#drawEvents(layout);
    this.#drawCurrent(layout, w);
    this.#drawXLabels(h);
    this.#drawCrosshair(); // hover 상태 유지 시 갱신

    this.#syncDataTable();
  }

  #bollingerData(): BollingerBands | null {
    const bb = this.#indicators.bollinger;
    if (!bb) return null;
    const period = typeof bb === "object" ? (bb.period ?? 20) : 20;
    const stdDev = typeof bb === "object" ? (bb.stdDev ?? 2) : 2;
    return bollinger(
      this.#display.map((c) => c.c),
      period,
      stdDev,
    );
  }

  #computeLayout(w: number, h: number): Layout {
    const padL = 8;
    const padR = 64;
    const padT = 6;
    const padB = 22;
    const volH = this.noVolume ? 0 : 70;
    const candleH = Math.max(10, h - padT - padB - volH);
    const innerW = Math.max(1, w - padL - padR);
    const slot = innerW / Math.max(1, this.#display.length);
    const bodyW = Math.max(2, slot * 0.7);

    let min = Infinity;
    let max = -Infinity;
    for (const c of this.#display) {
      if (c.l < min) min = c.l;
      if (c.h > max) max = c.h;
    }
    for (const m of this.#markers) {
      if (m.live) continue;
      if (m.price < min) min = m.price;
      if (m.price > max) max = m.price;
    }
    const bb = this.#bollingerData();
    if (bb) {
      for (const v of bb.upper) if (v != null && v > max) max = v;
      for (const v of bb.lower) if (v != null && v < min) min = v;
    }
    if (this.#compareLine) {
      for (const v of this.#compareLine.values) {
        if (v == null) continue;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = 0;
      max = 1;
    }
    const padPrice = (max - min) * 0.04 || 1;
    min -= padPrice;
    max += padPrice;

    const useLog = this.logScale && min > 0;
    const logMin = useLog ? Math.log10(min) : min;
    const logMax = useLog ? Math.log10(max) : max;
    const yPrice = (p: number): number => {
      const v = useLog && p > 0 ? Math.log10(p) : useLog ? logMin : p;
      return padT + ((logMax - v) / (logMax - logMin || 1)) * candleH;
    };
    const yPriceClamped = (p: number): number => {
      const top = padT + 10;
      const bottom = padT + candleH - 10;
      return Math.max(top, Math.min(bottom, yPrice(p)));
    };

    const maxVol = Math.max(1, ...this.#candles.map((c) => c.v));
    const volTop = padT + candleH + 6;
    const volBottom = volTop + volH;

    return {
      padL,
      padR,
      padT,
      padB,
      slot,
      bodyW,
      candleH,
      volH,
      volTop,
      volBottom,
      maxVol,
      min,
      max,
      useLog,
      yPrice,
      yPriceClamped,
    };
  }

  #cx(i: number, l: Layout): number {
    return l.padL + i * l.slot + l.slot / 2;
  }

  #ticks(l: Layout): number[] {
    const t: number[] = [];
    if (l.useLog) {
      const minExp = Math.floor(Math.log10(Math.max(1e-6, l.min)));
      const maxExp = Math.ceil(Math.log10(Math.max(1e-6, l.max)));
      for (let exp = minExp; exp <= maxExp; exp += 1) {
        for (const m of [1, 2, 5]) {
          const v = m * Math.pow(10, exp);
          if (v >= l.min && v <= l.max) t.push(v);
        }
      }
    } else {
      const step = niceStep((l.max - l.min) / 6);
      let v = Math.ceil(l.min / step) * step;
      while (v < l.max) {
        t.push(v);
        v += step;
      }
    }
    return t;
  }

  #drawGrid(l: Layout, w: number): void {
    const g = this.#layers.grid!;
    g.textContent = "";
    const right = w - l.padR;
    for (const t of this.#ticks(l)) {
      const y = coord(l.yPrice(t));
      const line = svgNode("line", "jd-candle-chart__gridline");
      setAttrs(line, { x1: l.padL, x2: right, y1: y, y2: y });
      g.append(line);
      const label = svgNode("text", "jd-candle-chart__axis-label");
      setAttrs(label, { x: right + 6, y: coord(l.yPrice(t) + 3) });
      label.textContent = t >= 1000 ? groupDigits(Math.round(t)) : t.toFixed(2);
      g.append(label);
    }
  }

  #polyline(
    values: readonly (number | null)[],
    l: Layout,
    className: string,
  ): SVGPolylineElement | null {
    const pts: string[] = [];
    for (let i = 0; i < values.length; i += 1) {
      const v = values[i];
      if (v == null) continue;
      pts.push(`${coord(this.#cx(i, l))},${coord(l.yPrice(v))}`);
    }
    if (pts.length < 2) return null;
    const pl = svgNode("polyline", className);
    pl.setAttribute("points", pts.join(" "));
    return pl;
  }

  #drawOverlay(l: Layout): void {
    const g = this.#layers.overlay!;
    g.textContent = "";

    if (this.separatorIndex >= 0 && this.separatorIndex < this.#display.length) {
      const x = coord(l.padL + this.separatorIndex * l.slot);
      const line = svgNode("line", "jd-candle-chart__separator");
      setAttrs(line, { x1: x, x2: x, y1: l.padT, y2: l.padT + l.candleH + l.volH + 6 });
      g.append(line);
    }

    const bb = this.#bollingerData();
    if (bb) {
      const up = this.#polyline(bb.upper, l, "jd-candle-chart__bb jd-candle-chart__bb--band");
      const mid = this.#polyline(bb.middle, l, "jd-candle-chart__bb jd-candle-chart__bb--mid");
      const low = this.#polyline(bb.lower, l, "jd-candle-chart__bb jd-candle-chart__bb--band");
      for (const p of [up, mid, low]) if (p) g.append(p);
    }

    if (this.#indicators.vwap) {
      const vw = this.#polyline(vwap(this.#display), l, "jd-candle-chart__vwap");
      if (vw) g.append(vw);
    }

    // 비교 라인
    if (this.#compareLine) {
      const cl = this.#polyline(this.#compareLine.values, l, "jd-candle-chart__compare");
      if (cl) {
        if (this.#compareLine.color) cl.style.setProperty("--_line", this.#compareLine.color);
        g.append(cl);
      }
    }
  }

  #drawPlot(l: Layout, w: number): void {
    const g = this.#layers.plot!;
    g.textContent = "";

    if (this.chartType === "line" || this.chartType === "area") {
      if (this.chartType === "area") {
        const pts = this.#display.map((c, i) => `${coord(this.#cx(i, l))},${coord(l.yPrice(c.c))}`);
        if (pts.length >= 2) {
          const base = coord(l.padT + l.candleH);
          const path = svgNode("path", "jd-candle-chart__area");
          const d = `M${coord(l.padL)},${base} L${pts.join(" L")} L${coord(w - l.padR)},${base} Z`;
          path.setAttribute("d", d);
          path.setAttribute("fill", `url(#${this.#gradId})`);
          g.append(path);
        }
      }
      const line = this.#polyline(
        this.#display.map((c) => c.c),
        l,
        "jd-candle-chart__price-line",
      );
      if (line) g.append(line);
      return;
    }

    const heatmap = Boolean(this.#indicators.volumeHeatmap);
    const avgVol = heatmap
      ? this.#display.reduce((s, x) => s + x.v, 0) / Math.max(1, this.#display.length)
      : 0;
    const lastIdx = this.#display.length - 1;
    for (let i = 0; i < this.#display.length; i += 1) {
      const c = this.#display[i]!;
      const cx = coord(this.#cx(i, l));
      const up = c.c >= c.o;
      const yOpen = l.yPrice(c.o);
      const yClose = l.yPrice(c.c);
      const top = Math.min(yOpen, yClose);
      const bottom = Math.max(yOpen, yClose);
      const isLast = i === lastIdx;

      const group = svgNode("g", "jd-candle-chart__candle");
      group.dataset.dir = up ? "up" : "down";
      if (isLast) group.dataset.last = "";
      let op = isLast ? 1 : 0.92;
      if (heatmap && avgVol > 0) {
        const ratio = c.v / avgVol;
        op = Math.max(0.3, Math.min(1, 0.35 + 0.45 * Math.tanh(ratio - 0.5)));
        if (isLast) op = Math.max(op, 0.95);
      }
      if (op !== 1) group.setAttribute("opacity", String(coord(op)));

      const wick = svgNode("line", "jd-candle-chart__wick");
      setAttrs(wick, { x1: cx, x2: cx, y1: coord(l.yPrice(c.h)), y2: coord(l.yPrice(c.l)) });
      const body = svgNode("rect", "jd-candle-chart__body");
      setAttrs(body, {
        x: coord(cx - l.bodyW / 2),
        y: coord(top),
        width: coord(l.bodyW),
        height: coord(Math.max(1, bottom - top)),
      });
      group.append(wick, body);
      g.append(group);
    }
  }

  #drawMA(l: Layout): void {
    const g = this.#layers.ma!;
    g.textContent = "";
    for (const period of this.#movingAverages) {
      if (period <= 1 || period >= this.#display.length) continue;
      const line = this.#polyline(ma(this.#display, period), l, "jd-candle-chart__ma");
      if (!line) continue;
      line.style.setProperty("--_ma", MA_COLOR[period] ?? "var(--jd-fin-muted, #94a3b8)");
      g.append(line);
    }
  }

  #drawVolume(l: Layout): void {
    const g = this.#layers.volume!;
    g.textContent = "";
    if (this.noVolume) return;
    for (let i = 0; i < this.#candles.length; i += 1) {
      const c = this.#candles[i]!;
      const up = c.c >= c.o;
      const barH = Math.max(1, Math.floor((c.v / l.maxVol) * (l.volH - 8)));
      const rect = svgNode("rect", "jd-candle-chart__vol");
      rect.dataset.dir = up ? "up" : "down";
      setAttrs(rect, {
        x: coord(this.#cx(i, l) - l.bodyW / 2),
        y: coord(l.volBottom - barH),
        width: coord(l.bodyW),
        height: coord(barH),
      });
      g.append(rect);
    }
  }

  #drawMarkers(l: Layout, w: number): void {
    const g = this.#layers.markers!;
    g.textContent = "";
    const right = w - l.padR;
    for (const m of this.#markers) {
      const rawY = l.yPrice(m.price);
      const y = m.live ? l.yPriceClamped(m.price) : rawY;
      const offTop = m.live && rawY < l.padT + 10;
      const offBottom = m.live && rawY > l.padT + l.candleH - 10;
      const offRange = offTop || offBottom;

      const group = svgNode("g", "jd-candle-chart__marker");
      if (m.live) group.dataset.live = "";
      if (m.color) group.style.setProperty("--_mk", m.color);

      if (!offRange) {
        const line = svgNode("line", "jd-candle-chart__marker-line");
        setAttrs(line, { x1: l.padL, x2: right, y1: coord(y), y2: coord(y) });
        group.append(line);
      }
      if (m.live && !offRange) {
        const pulse = svgNode("circle", "jd-candle-chart__marker-pulse");
        setAttrs(pulse, { cx: right, cy: coord(y), r: 5 });
        const a1 = svgNode("animate");
        setAttrs(a1, {
          attributeName: "r",
          values: "4;9;4",
          dur: "1.8s",
          repeatCount: "indefinite",
        });
        const a2 = svgNode("animate");
        setAttrs(a2, {
          attributeName: "opacity",
          values: "0.35;0;0.35",
          dur: "1.8s",
          repeatCount: "indefinite",
        });
        pulse.append(a1, a2);
        const dot = svgNode("circle", "jd-candle-chart__marker-dot");
        setAttrs(dot, { cx: right, cy: coord(y), r: 3.2 });
        group.append(pulse, dot);
      }
      if (!(m.live && offRange)) {
        const badge = svgNode("rect", "jd-candle-chart__marker-badge");
        setAttrs(badge, { x: right - 36, y: coord(y - 9), width: 32, height: 18, rx: 4 });
        const text = svgNode("text", "jd-candle-chart__marker-label");
        setAttrs(text, { x: right - 20, y: coord(y + 4) });
        text.textContent = m.label;
        group.append(badge, text);
      }
      // 우측 가격 배지
      const priceBadge = svgNode("rect", "jd-candle-chart__marker-price-bg");
      setAttrs(priceBadge, { x: right + 2, y: coord(y - 9), width: l.padR - 6, height: 18, rx: 4 });
      const priceText = svgNode("text", "jd-candle-chart__marker-price");
      setAttrs(priceText, { x: w - 6, y: coord(y + 4) });
      priceText.textContent = groupDigits(Math.round(m.price));
      group.append(priceBadge, priceText);
      g.append(group);
    }
  }

  #drawEvents(l: Layout): void {
    const g = this.#layers.events!;
    g.textContent = "";
    for (const ev of this.#events) {
      if (ev.index < 0 || ev.index >= this.#display.length) continue;
      const cx = coord(this.#cx(ev.index, l));
      const group = svgNode("g", "jd-candle-chart__event");
      if (ev.color) group.style.setProperty("--_ev", ev.color);
      const line = svgNode("line", "jd-candle-chart__event-line");
      setAttrs(line, { x1: cx, x2: cx, y1: l.padT, y2: l.padT + l.candleH });
      const dot = svgNode("circle", "jd-candle-chart__event-dot");
      setAttrs(dot, { cx, cy: l.padT + 4, r: 7 });
      const text = svgNode("text", "jd-candle-chart__event-label");
      setAttrs(text, { x: cx, y: l.padT + 7.5 });
      text.textContent = ev.label;
      group.append(line, dot, text);
      if (ev.title) {
        const title = svgNode("title");
        title.textContent = ev.title;
        group.append(title);
      }
      g.append(group);
    }
  }

  #drawCurrent(l: Layout, w: number): void {
    const g = this.#layers.current!;
    g.textContent = "";
    const last = this.#display[this.#display.length - 1];
    if (this.noCurrent || !last) return;
    const y = l.yPrice(last.c);
    const up = last.c >= last.o;
    const group = svgNode("g", "jd-candle-chart__current");
    group.dataset.dir = up ? "up" : "down";
    const line = svgNode("line", "jd-candle-chart__current-line");
    setAttrs(line, { x1: l.padL, x2: w - l.padR, y1: coord(y), y2: coord(y) });
    const bg = svgNode("rect", "jd-candle-chart__current-bg");
    setAttrs(bg, { x: w - l.padR + 2, y: coord(y - 9), width: l.padR - 6, height: 18, rx: 4 });
    const text = svgNode("text", "jd-candle-chart__current-text");
    setAttrs(text, { x: w - 6, y: coord(y + 4) });
    text.textContent = groupDigits(Math.round(last.c));
    group.append(line, bg, text);
    g.append(group);
  }

  #drawXLabels(h: number): void {
    const g = this.#layers.xlabels!;
    g.textContent = "";
    const l = this.#layout;
    if (!l) return;
    for (const lab of this.#xLabels) {
      const text = svgNode("text", "jd-candle-chart__xlabel");
      if (lab.bold) text.dataset.bold = "";
      setAttrs(text, { x: coord(l.padL + lab.index * l.slot), y: h - 6 });
      text.textContent = lab.label;
      g.append(text);
    }
  }

  /** clientX → svg 로컬 x (CSS 스케일 보정) */
  #localX(clientX: number): number {
    const rect = this.#svg.getBoundingClientRect();
    const w = positive(this.width, 380);
    if (rect.width === 0) return 0;
    return (clientX - rect.left) * (w / rect.width);
  }

  #onPointerMove = (e: PointerEvent): void => {
    const l = this.#layout;
    if (!l || this.#display.length === 0) return;
    const w = positive(this.width, 380);
    const x = this.#localX(e.clientX);
    if (x < l.padL || x > w - l.padR) {
      if (this.#hoverIdx !== -1) {
        this.#hoverIdx = -1;
        this.#drawCrosshair();
      }
      return;
    }
    const idx = Math.max(0, Math.min(this.#display.length - 1, Math.round((x - l.padL) / l.slot - 0.5)));
    if (idx === this.#hoverIdx) return;
    this.#hoverIdx = idx;
    this.#drawCrosshair();
  };

  #onPointerLeave = (): void => {
    if (this.#hoverIdx === -1) return;
    this.#hoverIdx = -1;
    this.#drawCrosshair();
  };

  #drawCrosshair(): void {
    const g = this.#layers.crosshair!;
    g.textContent = "";
    const l = this.#layout;
    const c = this.#hoverIdx >= 0 ? this.#display[this.#hoverIdx] : null;
    if (!l || !c) return;
    const w = positive(this.width, 380);
    const h = positive(this.height, 380);
    const hx = this.#cx(this.#hoverIdx, l);

    const line = svgNode("line", "jd-candle-chart__crosshair-line");
    setAttrs(line, { x1: coord(hx), x2: coord(hx), y1: l.padT, y2: h - l.padB });
    g.append(line);

    const lines: { label: string; value: string; tone?: string }[] = [
      { label: "시", value: groupDigits(Math.round(c.o)) },
      { label: "고", value: groupDigits(Math.round(c.h)), tone: "up" },
      { label: "저", value: groupDigits(Math.round(c.l)), tone: "down" },
      { label: "종", value: groupDigits(Math.round(c.c)), tone: c.c >= c.o ? "up" : "down" },
      { label: "거래량", value: groupDigits(c.v) },
    ];
    const bb = this.#bollingerData();
    if (bb) {
      const u = bb.upper[this.#hoverIdx];
      const lo = bb.lower[this.#hoverIdx];
      if (u != null) lines.push({ label: "BB↑", value: groupDigits(Math.round(u)) });
      if (lo != null) lines.push({ label: "BB↓", value: groupDigits(Math.round(lo)) });
    }

    const tooltipW = 170;
    const tooltipH = 26 + lines.length * 15;
    let tx = hx + 10;
    if (tx + tooltipW > w - l.padR) tx = hx - tooltipW - 10;
    const ty = l.padT + 6;
    const up = c.c >= c.o;

    const box = svgNode("g", "jd-candle-chart__tooltip");
    box.dataset.dir = up ? "up" : "down";
    box.setAttribute("transform", `translate(${coord(tx)}, ${coord(ty)})`);
    const bg = svgNode("rect", "jd-candle-chart__tooltip-bg");
    setAttrs(bg, { width: tooltipW, height: tooltipH, rx: 8 });
    box.append(bg);
    const idxText = svgNode("text", "jd-candle-chart__tooltip-idx");
    setAttrs(idxText, { x: 10, y: 16 });
    idxText.textContent = `#${this.#hoverIdx}`;
    box.append(idxText);
    const pct = svgNode("text", "jd-candle-chart__tooltip-pct");
    setAttrs(pct, { x: tooltipW - 10, y: 16 });
    pct.textContent = `${(((c.c - c.o) / Math.max(1, c.o)) * 100).toFixed(2)}%`;
    box.append(pct);
    lines.forEach((row, i) => {
      const rowG = svgNode("g", "jd-candle-chart__tooltip-row");
      if (row.tone) rowG.dataset.tone = row.tone;
      rowG.setAttribute("transform", `translate(0, ${26 + i * 15})`);
      const lbl = svgNode("text", "jd-candle-chart__tooltip-key");
      setAttrs(lbl, { x: 10, y: 0 });
      lbl.textContent = row.label;
      const val = svgNode("text", "jd-candle-chart__tooltip-val");
      setAttrs(val, { x: tooltipW - 10, y: 0 });
      val.textContent = row.value;
      rowG.append(lbl, val);
      box.append(rowG);
    });
    g.append(box);
  }

  #syncDataTable(): void {
    const rows = this.#candles.map((c) => [
      c.t,
      String(c.o),
      String(c.h),
      String(c.l),
      String(c.c),
      String(c.v),
    ]);
    this.syncTable(["시점", "시가", "고가", "저가", "종가", "거래량"], rows);
  }
}
