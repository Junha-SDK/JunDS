/**
 * <jd-quarter-bar-chart> — 분기 실적 짝대 차트 (v2 finance/QuarterBarChart).
 *
 * 분기별로 매출 + (영업이익|순이익) 두 막대를 나란히 그린다. 공용 차트 코어
 * JdCartesianChart를 상속해 SVG 프레임·눈금·축 라벨·숨김 데이터 표를 재사용한다(§6 R12).
 *
 * BarChart(JdCategoryChart)가 아니라 JdCartesianChart를 직접 상속하는 이유:
 *  - JdBarChart는 음수를 0으로 clamp한다("음수 축이 필요하면 LineChart"). 순이익은
 *    적자(음수)일 수 있어 **0 기준선 양옆**으로 그려야 한다 — v2가 하던 대로.
 *  - 두 막대가 서로 다른 고정색(매출 청록 / 이익)을 갖고, 카테고리당 정확히 2개다.
 *    시리즈 일반화(N개)를 태울 필요가 없다.
 *
 * v2 대비 교정:
 *  - **범례가 SVG 안 좌상단**이었다 → 공용 HTML 범례(JdChartBase)로 옮겨 스크린리더가
 *    읽고 소비자가 CSS로 옮길 수 있다.
 *  - **toLocaleString("ko-KR")**로 축 숫자를 찍어 프리렌더/방문자 로케일이 갈렸다 →
 *    groupDigits(§3.1-3 결정성).
 *  - **AT에 숫자 0** → 숨김 실적 표(분기·매출·영업이익·순이익).
 *  - 색이 fill 표시 속성 리터럴이었다 → 시리즈 그룹 `--jd-series-color` 경유(테마 오버라이드).
 */
import { JdCartesianChart, coord, groupDigits, svgNode, upgradeAccessor } from "../../core/chart.js";
import type { JdChartTick, JdLegendItem } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import quarterBarChartStyles from "./quarter-bar-chart.css.js";

export interface JdQuarterRow {
  label: string;
  revenue: number;
  operatingIncome: number;
  netIncome: number;
  eps?: number;
}

type Metric = "revenue-op" | "revenue-net";

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** v2 niceStep — 눈금 간격을 1·2·5·10 계열로 반올림 */
function niceStep(raw: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(Math.max(0.001, raw))));
  const f = raw / exp;
  const nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nf * exp;
}

export class JdQuarterBarChart extends JdCartesianChart {
  static override tag = "jd-quarter-bar-chart";
  static override props = {
    ...JdCartesianChart.props,
    width: { type: Number, default: 380 },
    height: { type: Number, default: 220 },
    /** revenue-op(영업이익) | revenue-net(순이익) — v2 metric */
    metric: { type: String, default: "revenue-op", reflect: true },
  };

  declare metric: string;

  // v2 PADDING: { L:38, R:8, T:12, B:26 }
  protected override padLeft = 38;
  protected override padRight = 8;
  protected override padTop = 12;
  protected override padBottom = 26;

  #data: JdQuarterRow[] = [];

  /** 복합 데이터 — property 전용(§1.3) */
  get data(): JdQuarterRow[] {
    return this.#data;
  }
  set data(v: JdQuarterRow[]) {
    this.#data = Array.isArray(v)
      ? v.filter((d): d is JdQuarterRow => d != null && typeof d === "object")
      : [];
    this.requestUpdate();
  }

  protected override render(): void {
    adoptStyles(quarterBarChartStyles);
    upgradeAccessor(this, "data"); // 정의 전 el.data=[…] 회수(§ core/chart upgradeAccessor)
    super.render();
  }

  protected override defaultLabel(): string {
    return "분기 실적 차트";
  }

  protected override legendVisible(): boolean {
    return true;
  }

  #metric(): Metric {
    return this.metric === "revenue-net" ? "revenue-net" : "revenue-op";
  }
  #bKey(): "operatingIncome" | "netIncome" {
    return this.#metric() === "revenue-net" ? "netIncome" : "operatingIncome";
  }
  #bLabel(): string {
    return this.#metric() === "revenue-net" ? "순이익" : "영업이익";
  }
  #aColor = "var(--jd-qbar-revenue, #5cdcd0)";
  #bColor(): string {
    return this.#metric() === "revenue-net" ? "var(--jd-qbar-net, #a855f7)" : "var(--jd-qbar-op, #0f766e)";
  }

  /** v2 스케일: max=매출/이익 최댓값, min=min(0, 이익들), yOf 선형 사상 */
  #scale(): { max: number; min: number; range: number; yOf: (v: number) => number } {
    const data = this.#data;
    const bKey = this.#bKey();
    let max: number;
    let min: number;
    if (data.length) {
      const vals: number[] = [];
      for (const d of data) vals.push(num(d.revenue), num(d[bKey]));
      max = Math.max(...vals);
      min = Math.min(0, ...data.map((d) => num(d[bKey])));
    } else {
      max = 1;
      min = 0;
    }
    const range = max - min || 1;
    const innerH = this.innerHeight;
    const yOf = (v: number): number => this.padTop + ((max - v) / range) * innerH;
    return { max, min, range, yOf };
  }

  #geom(): { slot: number; barWidth: number } {
    const slot = this.innerWidth / Math.max(1, this.#data.length);
    return { slot, barWidth: slot * 0.32 };
  }

  protected override yTicks(): JdChartTick[] {
    const { max, min, range, yOf } = this.#scale();
    const step = niceStep(range / 4) || 1;
    const ticks: JdChartTick[] = [];
    let t = Math.ceil(min / step) * step;
    for (let guard = 0; t <= max + 1e-6 && guard < 64; guard += 1, t += step) {
      ticks.push({ pos: yOf(t), text: groupDigits(Math.round(t)) });
    }
    return ticks;
  }

  protected override xTicks(): JdChartTick[] {
    const { slot } = this.#geom();
    return this.#data.map((d, i) => ({
      pos: this.padLeft + i * slot + slot / 2,
      text: String(d.label ?? ""),
    }));
  }

  protected override gridAxes(): { x: boolean; y: boolean } {
    return { x: false, y: true };
  }

  protected override drawPlot(): void {
    const plot = this.plotLayer;
    plot.textContent = "";
    const bKey = this.#bKey();
    const { yOf } = this.#scale();
    const { slot, barWidth } = this.#geom();
    const y0 = yOf(0);

    const groupA = this.seriesGroup(this.#aColor);
    const groupB = this.seriesGroup(this.#bColor());

    this.#data.forEach((d, i) => {
      const cx = this.padLeft + i * slot + slot / 2;
      const yA = yOf(num(d.revenue));
      const yB = yOf(num(d[bKey]));
      groupA.append(bar(cx - barWidth - 2, Math.min(yA, y0), barWidth, Math.max(1, Math.abs(yA - y0))));
      groupB.append(bar(cx + 2, Math.min(yB, y0), barWidth, Math.max(1, Math.abs(yB - y0))));
    });
    plot.append(groupA, groupB);

    this.syncLegend(this.#legendItems());
    this.#syncTable();
  }

  #legendItems(): JdLegendItem[] {
    return [
      { color: this.#aColor, name: "매출" },
      { color: this.#bColor(), name: this.#bLabel() },
    ];
  }

  #syncTable(): void {
    const rows = this.#data.map((d) => [
      String(d.label ?? ""),
      String(num(d.revenue)),
      String(num(d.operatingIncome)),
      String(num(d.netIncome)),
    ]);
    this.syncTable(["분기", "매출", "영업이익", "순이익"], rows);
  }
}

function bar(x: number, y: number, w: number, h: number): SVGRectElement {
  const rect = svgNode("rect", "jd-chart__bar");
  rect.setAttribute("x", String(coord(x)));
  rect.setAttribute("y", String(coord(y)));
  rect.setAttribute("width", String(coord(w)));
  rect.setAttribute("height", String(coord(h)));
  rect.setAttribute("rx", "2");
  return rect;
}
