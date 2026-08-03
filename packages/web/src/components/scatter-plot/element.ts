/**
 * <jd-scatter-plot> — SVG 산점도 / 버블 차트 (v2 composites/ScatterPlot).
 * 점에 `size`를 주면 버블(반투명)로 렌더된다.
 *
 * 데이터 2경로: `el.series = [{name, data:[{x,y,size?,label?}], color?}]`
 * 또는 자식 `<script type="application/json">[…]</script>`.
 *
 * 도메인 표면 변경: v2의 `xDomain?: [number, number]` 튜플은 attribute로 실을 수 없다
 * (§1.3 복합 데이터 금지). 숫자 4개(`x-min`/`x-max`/`y-min`/`y-max`)로 펼쳐서
 * 마크업만으로도 축 고정이 가능하게 했다 — 비우면(NaN) v2와 같은 자동 도메인.
 *
 * v2 대비 교정:
 *  - 값이 AT에 가지 않던 문제 → 숨김 데이터 표(core/chart.ts).
 *  - `r`이 음수인 점(size: -3)은 SVG가 통째로 지웠다 → 0으로 clamp.
 *  - 격자·축 라벨을 각각 끌 수 있다(v2는 showGrid 하나에 x·y 격자가 묶여 있었다).
 */
import {
  JdCartesianChart,
  coord,
  readChartJson,
  seriesColor,
  svgNode,
  tickText,
  upgradeAccessor,
} from "../../core/chart.js";
import type { JdChartTick, JdLegendItem } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import scatterPlotStyles from "./scatter-plot.css.js";

export interface JdScatterPoint {
  x: number;
  y: number;
  /** 반지름(px). 주면 버블 모드 — 반투명으로 그린다 */
  size?: number;
  /** 마우스 툴팁 + 데이터 표 행 이름 */
  label?: string;
}

export interface JdScatterSeries {
  name: string;
  data: JdScatterPoint[];
  color?: string;
}

const TICK_COUNT = 4;

function toPoints(v: unknown): JdScatterPoint[] {
  if (!Array.isArray(v)) return [];
  const out: JdScatterPoint[] = [];
  for (const raw of v as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    out.push({
      x: typeof raw.x === "number" && Number.isFinite(raw.x) ? raw.x : 0,
      y: typeof raw.y === "number" && Number.isFinite(raw.y) ? raw.y : 0,
      size: typeof raw.size === "number" && Number.isFinite(raw.size) ? raw.size : undefined,
      label: typeof raw.label === "string" ? raw.label : undefined,
    });
  }
  return out;
}

function toScatterSeries(v: unknown): JdScatterSeries[] {
  if (!Array.isArray(v)) return [];
  const out: JdScatterSeries[] = [];
  for (const raw of v as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    out.push({
      name: typeof raw.name === "string" ? raw.name : "",
      data: toPoints(raw.data),
      color: typeof raw.color === "string" ? raw.color : undefined,
    });
  }
  return out;
}

export class JdScatterPlot extends JdCartesianChart {
  static override tag = "jd-scatter-plot";
  static override props = {
    ...JdCartesianChart.props,
    height: { type: Number, default: 280 }, // v2 ScatterPlot만 280
    /** 축 고정. 비우면(NaN) 데이터에서 자동 유도 */
    xMin: { type: Number, default: NaN },
    xMax: { type: Number, default: NaN },
    yMin: { type: Number, default: NaN },
    yMax: { type: Number, default: NaN },
    /** size 없는 점의 기본 반지름 (v2 defaultPointSize) */
    pointSize: { type: Number, default: 4 },
    /** 범례 숨김 (v2 showLegend=true의 부정형) */
    noLegend: { type: Boolean, reflect: true },
  };

  declare xMin: number;
  declare xMax: number;
  declare yMin: number;
  declare yMax: number;
  declare pointSize: number;
  declare noLegend: boolean;

  #series: JdScatterSeries[] = [];

  get series(): JdScatterSeries[] {
    return this.#series;
  }
  set series(v: JdScatterSeries[]) {
    this.#series = toScatterSeries(v);
    this.requestUpdate();
  }

  protected override render(): void {
    adoptStyles(scatterPlotStyles);
    upgradeAccessor(this, "series");
    const json = readChartJson(this);
    if (this.#series.length === 0) {
      if (Array.isArray(json)) this.#series = toScatterSeries(json);
      else if (json && typeof json === "object") {
        this.#series = toScatterSeries((json as { series?: unknown }).series);
      }
    }
    super.render();
  }

  protected override defaultLabel(): string {
    return "산점도";
  }

  protected override legendVisible(): boolean {
    return !this.noLegend;
  }

  protected override gridAxes(): { x: boolean; y: boolean } {
    return { x: true, y: true };
  }

  /** v2 자동 도메인: x는 min(0,…)~max(1,…), y도 동형 */
  #domain(): { xMin: number; xMax: number; yMin: number; yMax: number } {
    let xMin = 0;
    let xMax = 1;
    let yMin = 0;
    let yMax = 1;
    for (const s of this.#series) {
      for (const p of s.data) {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
      }
    }
    return {
      xMin: Number.isFinite(this.xMin) ? this.xMin : xMin,
      xMax: Number.isFinite(this.xMax) ? this.xMax : xMax,
      yMin: Number.isFinite(this.yMin) ? this.yMin : yMin,
      yMax: Number.isFinite(this.yMax) ? this.yMax : yMax,
    };
  }

  protected override xTicks(): JdChartTick[] {
    const d = this.#domain();
    const range = d.xMax - d.xMin || 1;
    const step = range / TICK_COUNT;
    const ticks: JdChartTick[] = [];
    for (let i = 0; i <= TICK_COUNT; i += 1) {
      const value = d.xMin + step * i;
      ticks.push({
        pos: this.padLeft + ((value - d.xMin) / range) * this.innerWidth,
        text: tickText(value, step),
      });
    }
    return ticks;
  }

  protected override yTicks(): JdChartTick[] {
    const d = this.#domain();
    const range = d.yMax - d.yMin || 1;
    const step = range / TICK_COUNT;
    const ticks: JdChartTick[] = [];
    for (let i = 0; i <= TICK_COUNT; i += 1) {
      const value = d.yMin + step * i;
      ticks.push({
        pos: this.baseY - ((value - d.yMin) / range) * this.innerHeight,
        text: tickText(value, step),
      });
    }
    return ticks;
  }

  protected override drawPlot(): void {
    const plot = this.plotLayer;
    plot.textContent = "";
    const d = this.#domain();
    const xRange = d.xMax - d.xMin || 1;
    const yRange = d.yMax - d.yMin || 1;
    const fallbackR = Math.max(0, Number(this.pointSize) || 0);

    this.#series.forEach((s, si) => {
      const g = this.seriesGroup(seriesColor(si, s.color));
      for (const p of s.data) {
        const dot = svgNode("circle", "jd-chart__point");
        const bubble = p.size !== undefined;
        dot.setAttribute(
          "cx",
          String(coord(this.padLeft + ((p.x - d.xMin) / xRange) * this.innerWidth)),
        );
        dot.setAttribute(
          "cy",
          String(coord(this.baseY - ((p.y - d.yMin) / yRange) * this.innerHeight)),
        );
        // 음수 r은 SVG가 원을 통째로 지운다 — clamp
        dot.setAttribute("r", String(coord(Math.max(0, bubble ? p.size! : fallbackR))));
        if (bubble) dot.setAttribute("data-bubble", "");
        if (p.label) {
          const title = svgNode("title");
          title.textContent = p.label;
          dot.append(title);
        }
        g.append(dot);
      }
      plot.append(g);
    });

    const items: JdLegendItem[] = this.#series.map((s, i) => ({
      color: seriesColor(i, s.color),
      name: s.name,
      shape: "dot",
    }));
    this.syncLegend(items);
    this.#syncTable();
  }

  #syncTable(): void {
    const rows: string[][] = [];
    for (const s of this.#series) {
      s.data.forEach((p, i) => {
        rows.push([p.label || `${s.name || "시리즈"} ${i + 1}`, String(p.x), String(p.y)]);
      });
    }
    this.syncTable(rows.length > 0 ? ["점", "X", "Y"] : [], rows);
  }
}
