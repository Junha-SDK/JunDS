/**
 * <jd-radar-chart> — SVG 레이더(스파이더) 차트 (v2 composites/RadarChart).
 * 다축 비교용. 축 라벨 3개 이상 권장.
 *
 * 데이터 2경로: `el.axes = […]` + `el.series = [{name,data,color?}]`,
 * 또는 자식 `<script type="application/json">{"axes":[…],"series":[…]}</script>`.
 *
 * v2 대비 교정:
 *  1. **축이 0개면 NaN 좌표가 나왔다.** `(i / n)`의 n=axes.length가 0이면 전 좌표가
 *     NaN이 되어 SVG가 조용히 비었다 → 축이 없으면 아무것도 그리지 않는다.
 *  2. **max보다 큰 값이 차트 밖으로 튀어나갔다.** 비율을 0~1로 clamp한다.
 *  3. 값이 AT에 가지 않던 문제 → 숨김 데이터 표(core/chart.ts).
 *  4. fillOpacity가 시리즈마다 인라인 속성이었다 → 호스트 `--jd-chart-fill-opacity` 1개.
 */
import {
  JdChartBase,
  coord,
  positive,
  readChartJson,
  seriesColor,
  svgNode,
  toSeriesList,
  upgradeAccessor,
} from "../../core/chart.js";
import type { JdChartSeries, JdLegendItem } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import radarChartStyles from "./radar-chart.css.js";

export class JdRadarChart extends JdChartBase {
  static override tag = "jd-radar-chart";
  static override props = {
    ...JdChartBase.props,
    /** 정사각 크기(px) */
    size: { type: Number, default: 280 },
    /** 스케일 기준 최댓값. 비우면(NaN) 데이터에서 자동 */
    max: { type: Number, default: NaN },
    /** 동심 격자 단계 수 */
    gridSteps: { type: Number, default: 4 },
    /** 영역 투명도 0~1 */
    fillOpacity: { type: Number, default: 0.2 },
    /** 꼭짓점 점 숨김 (v2 showDots=true의 부정형) */
    noDots: { type: Boolean, reflect: true },
    /** 범례 숨김 (v2 showLegend=true의 부정형) */
    noLegend: { type: Boolean, reflect: true },
  };

  declare size: number;
  declare max: number;
  declare gridSteps: number;
  declare fillOpacity: number;
  declare noDots: boolean;
  declare noLegend: boolean;

  #axes: string[] = [];
  #series: JdChartSeries[] = [];
  #svg!: SVGSVGElement;
  #gridLayer!: SVGGElement;
  #axisLayer!: SVGGElement;
  #plotLayer!: SVGGElement;

  get axes(): string[] {
    return this.#axes;
  }
  set axes(v: string[]) {
    this.#axes = Array.isArray(v) ? v.map((s) => String(s)) : [];
    this.requestUpdate();
  }

  get series(): JdChartSeries[] {
    return this.#series;
  }
  set series(v: JdChartSeries[]) {
    this.#series = toSeriesList(v);
    this.requestUpdate();
  }

  protected override render(): void {
    adoptStyles(radarChartStyles);
    upgradeAccessor(this, "axes");
    upgradeAccessor(this, "series");
    const json = readChartJson(this);
    if (json && typeof json === "object" && !Array.isArray(json)) {
      const obj = json as { axes?: unknown; series?: unknown };
      if (this.#axes.length === 0 && Array.isArray(obj.axes)) {
        this.#axes = obj.axes.map((s) => String(s));
      }
      if (this.#series.length === 0 && Array.isArray(obj.series)) {
        this.#series = toSeriesList(obj.series);
      }
    } else if (Array.isArray(json) && this.#series.length === 0) {
      this.#series = toSeriesList(json);
    }

    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-chart__svg");
    if (existing) {
      this.#svg = existing;
      this.#gridLayer = existing.querySelector(".jd-chart__grid")!;
      this.#axisLayer = existing.querySelector(".jd-chart__axis")!;
      this.#plotLayer = existing.querySelector(".jd-chart__plot")!;
    } else {
      this.#svg = svgNode("svg", "jd-chart__svg");
      this.#svg.setAttribute("aria-hidden", "true"); // 값은 데이터 표가 말한다
      this.#gridLayer = svgNode("g", "jd-chart__grid");
      this.#axisLayer = svgNode("g", "jd-chart__axis");
      this.#plotLayer = svgNode("g", "jd-chart__plot");
      this.#svg.append(this.#gridLayer, this.#axisLayer, this.#plotLayer);
      this.prepend(this.#svg);
    }
    super.render();
    this.update();
  }

  protected override defaultLabel(): string {
    return "레이더 차트";
  }

  protected override legendVisible(): boolean {
    return !this.noLegend;
  }

  protected override paint(): void {
    const size = positive(this.size, 280);
    const cx = size / 2;
    const cy = size / 2;
    const r = Math.max(0, size / 2 - 30);
    const n = this.#axes.length;
    const steps = Math.max(1, Math.round(positive(this.gridSteps, 4)));
    const rawOpacity = Number(this.fillOpacity);
    this.style.setProperty(
      "--jd-chart-fill-opacity",
      String(Number.isFinite(rawOpacity) ? Math.min(1, Math.max(0, rawOpacity)) : 0.2),
    );
    this.#svg.setAttribute("width", String(size));
    this.#svg.setAttribute("height", String(size));
    this.#svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

    this.#gridLayer.textContent = "";
    this.#axisLayer.textContent = "";
    this.#plotLayer.textContent = "";

    // 축이 없으면 (i / n)이 NaN 좌표를 만든다 — 아무것도 그리지 않는다
    if (n === 0) {
      this.syncLegend([]);
      this.syncTable([], []);
      return;
    }

    const angleAt = (i: number): number => (i / n) * Math.PI * 2 - Math.PI / 2;
    const auto = this.#autoMax();
    const range = (Number.isFinite(this.max) ? this.max : auto) || 1;

    for (let step = 1; step <= steps; step += 1) {
      const ratio = step / steps;
      const grid = svgNode("polygon", "jd-radar-chart__grid-ring");
      grid.setAttribute("points", this.#ring(cx, cy, r * ratio, angleAt, n));
      this.#gridLayer.append(grid);
    }

    this.#axes.forEach((axisLabel, i) => {
      const a = angleAt(i);
      const line = svgNode("line", "jd-radar-chart__spoke");
      line.setAttribute("x1", String(coord(cx)));
      line.setAttribute("y1", String(coord(cy)));
      line.setAttribute("x2", String(coord(cx + r * Math.cos(a))));
      line.setAttribute("y2", String(coord(cy + r * Math.sin(a))));
      const text = svgNode("text", "jd-chart__tick");
      text.setAttribute("x", String(coord(cx + (r + 14) * Math.cos(a))));
      text.setAttribute("y", String(coord(cy + (r + 14) * Math.sin(a))));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.textContent = axisLabel;
      this.#axisLayer.append(line, text);
    });

    const items: JdLegendItem[] = [];
    this.#series.forEach((s, si) => {
      const color = seriesColor(si, s.color);
      const g = svgNode("g", "jd-chart__series");
      g.style.setProperty("--jd-series-color", color);
      const points: string[] = [];
      for (let i = 0; i < n; i += 1) {
        const ratio = this.#ratio(s.data[i] ?? 0, range);
        const a = angleAt(i);
        const x = coord(cx + r * ratio * Math.cos(a));
        const y = coord(cy + r * ratio * Math.sin(a));
        points.push(`${x},${y}`);
        if (!this.noDots) {
          const dot = svgNode("circle", "jd-chart__dot");
          dot.setAttribute("cx", String(x));
          dot.setAttribute("cy", String(y));
          dot.setAttribute("r", "2.5");
          g.append(dot);
        }
      }
      const polygon = svgNode("polygon", "jd-radar-chart__shape");
      polygon.setAttribute("points", points.join(" "));
      g.prepend(polygon); // 도형이 점 아래
      this.#plotLayer.append(g);
      items.push({ color, name: s.name });
    });

    this.syncLegend(items);
    this.#syncTable();
  }

  /** v2 computedMax: 명시 max가 없으면 전체 최댓값(음수만 있으면 0) */
  #autoMax(): number {
    let max = 0;
    for (const s of this.#series) {
      for (const v of s.data) if (v > max) max = v;
    }
    return max;
  }

  /** 0~1 clamp — max를 넘는 값이 차트 밖으로 튀어나가지 않게 한다 */
  #ratio(value: number, range: number): number {
    return Math.min(1, Math.max(0, value / range));
  }

  #ring(cx: number, cy: number, radius: number, angleAt: (i: number) => number, n: number): string {
    const points: string[] = [];
    for (let i = 0; i < n; i += 1) {
      const a = angleAt(i);
      points.push(`${coord(cx + radius * Math.cos(a))},${coord(cy + radius * Math.sin(a))}`);
    }
    return points.join(" ");
  }

  #syncTable(): void {
    if (this.#axes.length === 0 || this.#series.length === 0) {
      this.syncTable([], []);
      return;
    }
    const head = ["축", ...this.#series.map((s, i) => s.name || `시리즈 ${i + 1}`)];
    const rows = this.#axes.map((axisLabel, i) => [
      axisLabel,
      ...this.#series.map((s) => String(s.data[i] ?? 0)),
    ]);
    this.syncTable(head, rows);
  }
}
