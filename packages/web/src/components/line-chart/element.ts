/**
 * <jd-line-chart> — 경량 SVG 라인 차트 (v2 composites/LineChart).
 * 다중 시리즈 · 영역 채움 · 부드러운 곡선. 외부 차트 라이브러리 0.
 *
 * 데이터 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. property: `el.series = [{name,data,color?,area?}]`, `el.labels = ["1월",…]`
 *  2. 선언적 슬롯: 자식 `<script type="application/json">{"labels":[…],"series":[…]}</script>`
 *
 * v2 대비 교정:
 *  - 값이 AT에 하나도 가지 않던 문제 → 숨김 데이터 표(core/chart.ts 참조).
 *  - 기본 true 프롭(showGrid/showDots/smooth)은 attribute로 끌 수 없어 부정형으로 뒤집음
 *    (`no-grid`·`no-dots`·`no-smooth`). 프로퍼티 이름도 같이 뒤집힌다.
 *  - v2에 없던 범례를 opt-in(`legend`)으로 추가 — 다중 시리즈가 색으로만 구분되던 문제.
 *  - 데이터가 없을 때 v2는 `Math.max(0, ...[])`로 max=0·min=0을 만들고 빈 SVG를 그렸다.
 *    v3도 같은 폴백이지만 표·범례가 함께 비어 상태가 일관된다.
 */
import {
  JdCategoryChart,
  coord,
  linePath,
  seriesColor,
  svgNode,
  tickText,
} from "../../core/chart.js";
import type { JdChartSeries, JdChartTick, JdPoint } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import lineChartStyles from "./line-chart.css.js";

export interface JdLineSeries extends JdChartSeries {
  /** 선 아래 영역 채움 */
  area?: boolean;
}

/** 시리즈 1개의 화면 기하 — 파생(AreaChart)이 이 계산만 갈아끼운다 */
export interface JdSeriesGeometry {
  color: string;
  points: JdPoint[];
  /** 영역 아래 경계. null이면 플롯 바닥 */
  base: JdPoint[] | null;
  filled: boolean;
}

const TICK_COUNT = 4;

export class JdLineChart extends JdCategoryChart<JdLineSeries> {
  static override tag = "jd-line-chart";
  static override props = {
    ...JdCategoryChart.props,
    /** 점 숨김 (v2 showDots=true의 부정형) */
    noDots: { type: Boolean, reflect: true },
    /** 곡선 보간 해제 (v2 smooth=true의 부정형) */
    noSmooth: { type: Boolean, reflect: true },
    /** 범례 표시 — v2에는 없던 opt-in */
    legend: { type: Boolean, reflect: true },
  };

  declare noDots: boolean;
  declare noSmooth: boolean;
  declare legend: boolean;

  protected override render(): void {
    adoptStyles(lineChartStyles);
    super.render();
  }

  protected override defaultLabel(): string {
    return "라인 차트";
  }

  protected override legendVisible(): boolean {
    return this.legend;
  }

  protected dotsVisible(): boolean {
    return !this.noDots;
  }

  protected get smooth(): boolean {
    return !this.noSmooth;
  }

  /** y 도메인. v2 LineChart는 0을 항상 포함한다(min≤0≤max) */
  protected domain(): { min: number; max: number; range: number } {
    let min = 0;
    let max = 0;
    for (const s of this.series) {
      for (const v of s.data) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return { min, max, range: max - min || 1 };
  }

  protected yFor(value: number, min: number, range: number): number {
    return this.padTop + this.innerHeight - ((value - min) / range) * this.innerHeight;
  }

  protected override yTicks(): JdChartTick[] {
    const { min, range } = this.domain();
    const step = range / TICK_COUNT;
    const ticks: JdChartTick[] = [];
    for (let i = 0; i <= TICK_COUNT; i += 1) {
      const value = min + step * i;
      ticks.push({ pos: this.yFor(value, min, range), text: tickText(value, step) });
    }
    return ticks;
  }

  protected override xTicks(): JdChartTick[] {
    const count = this.categoryCount;
    return this.labels.map((text, i) => ({ pos: this.xAt(i, count), text }));
  }

  /** 시리즈별 화면 기하 — AreaChart가 유일하게 갈아끼우는 지점 */
  protected seriesGeometry(): JdSeriesGeometry[] {
    const { min, range } = this.domain();
    const count = this.categoryCount;
    return this.series.map((s, si) => ({
      color: seriesColor(si, s.color),
      points: s.data.map((v, i) => ({ x: this.xAt(i, count), y: this.yFor(v, min, range) })),
      base: null,
      filled: Boolean(s.area),
    }));
  }

  /** 영역 경로 — base가 없으면 플롯 바닥으로 닫고, 있으면 역방향 경계로 닫는다 */
  protected areaPath(top: string, points: readonly JdPoint[], base: JdPoint[] | null): string {
    if (!top || points.length === 0) return "";
    const first = points[0]!;
    const last = points[points.length - 1]!;
    if (!base || base.length === 0) {
      return `${top} L${coord(last.x)},${coord(this.baseY)} L${coord(first.x)},${coord(
        this.baseY,
      )} Z`;
    }
    const lastBase = base[base.length - 1]!;
    const reversed = linePath([...base].reverse(), this.smooth).replace(/^M/, "L");
    return `${top} L${coord(lastBase.x)},${coord(lastBase.y)} ${reversed} Z`;
  }

  protected override drawPlot(): void {
    const plot = this.plotLayer;
    plot.textContent = "";
    for (const geom of this.seriesGeometry()) {
      const g = this.seriesGroup(geom.color);
      const top = linePath(geom.points, this.smooth);
      if (geom.filled) {
        const d = this.areaPath(top, geom.points, geom.base);
        if (d) {
          const area = svgNode("path", "jd-chart__area");
          area.setAttribute("d", d);
          g.append(area);
        }
      }
      if (top) {
        const line = svgNode("path", "jd-chart__line");
        line.setAttribute("d", top);
        g.append(line);
      }
      if (this.dotsVisible()) {
        for (const p of geom.points) {
          const dot = svgNode("circle", "jd-chart__dot");
          dot.setAttribute("cx", String(coord(p.x)));
          dot.setAttribute("cy", String(coord(p.y)));
          dot.setAttribute("r", "2.5");
          g.append(dot);
        }
      }
      plot.append(g);
    }
    this.syncLegend(this.legendItemsFromSeries());
    this.syncSeriesTable();
  }
}
