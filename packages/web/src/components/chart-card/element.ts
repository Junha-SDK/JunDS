/**
 * <jd-chart-card> — KPI 카드 + 경량 차트 9종 (v2 patterns/ChartCard).
 * bar · horizontal-bar · stacked-bar · line · area · donut · sparkline · progress · radial.
 *
 * v3 판단:
 *  - v2는 자체 완결형(div 막대 + SVG 라인/도넛)이라 시리즈 기반 <jd-bar-chart>류와 데이터
 *    모델이 다르다(ChartDataPoint = {label,value,color,segments}). 그래서 파생이 아니라
 *    독립 구현으로 v2 외관을 그대로 옮긴다 — 카드 셸은 jd-card 토큰과 같은 값을 쓴다.
 *  - SVG는 전부 createElementNS(core/chart svgNode) — HTML 네임스페이스 함정 회피(§6-1).
 *  - 색은 표시 속성이 아니라 인라인 style(fill/stroke/backgroundColor)로 — var() 토큰이
 *    안정적으로 먹고 소비자 오버라이드가 산다(core/chart 교정 #2와 같은 취지).
 *  - 기본값 true였던 showGrid/showAxis는 부정형 no-grid/no-axis로(Boolean 존재=값 §1.3).
 *    showLegend는 3-상태(auto)라 legend(강제 on)/no-legend(강제 off) 두 스위치로 나눈다.
 *  - 차트 영역은 도넛 SVG에 role=img + aria-label로 최소 접근 이름을 준다.
 *  - 데이터는 property(data) 또는 자식 <script type="application/json">(§1.3 예외).
 *    value/badge/actions/footer는 slot="…" 자식으로 리치 콘텐츠를 넣는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { svgNode, setAttrs, coord, groupDigits } from "../../core/chart.js";
import chartCardStyles from "./chart-card.css.js";

export interface JdChartSegment {
  label: string;
  value: number;
  color?: string;
}

export interface JdChartDataPoint {
  label: string;
  value: number;
  color?: string;
  segments?: JdChartSegment[];
}

export interface JdChartTrend {
  value: string;
  direction?: "up" | "down" | "neutral";
  label?: string;
}

type ChartType =
  | "bar"
  | "horizontal-bar"
  | "stacked-bar"
  | "line"
  | "area"
  | "donut"
  | "sparkline"
  | "progress"
  | "radial";

interface Pt {
  x: number;
  y: number;
}

const SLOT_REGIONS = ["value", "badge", "actions", "footer"] as const;
type SlotRegion = (typeof SLOT_REGIONS)[number];

const TONE: Record<string, string> = {
  default: "var(--jd-color-primary)",
  success: "var(--jd-color-success)",
  warning: "var(--jd-color-warning)",
  danger: "var(--jd-color-danger)",
  info: "var(--jd-color-info)",
};

/** v2 chartPalette를 토큰으로 번역 */
const PALETTE = [
  "var(--jd-color-primary)",
  "var(--jd-color-success)",
  "var(--jd-color-warning)",
  "var(--jd-color-danger)",
  "var(--jd-color-accent)",
  "var(--jd-color-muted)",
  "var(--jd-color-info)",
  "var(--jd-color-danger)",
];

const DEFAULT_HEIGHTS: Record<ChartType, number> = {
  bar: 168,
  "horizontal-bar": 168,
  "stacked-bar": 168,
  line: 176,
  area: 176,
  donut: 156,
  sparkline: 76,
  progress: 160,
  radial: 156,
};

const LEGEND_AUTO = new Set<ChartType>(["donut", "stacked-bar", "radial"]);

export class JdChartCard extends JdElement {
  static override tag = "jd-chart-card";
  static override props = {
    title: { type: String },
    type: { type: String, default: "bar", reflect: true },
    description: { type: String },
    value: { type: String },
    height: { type: Number, default: 0 }, // 0 = type 기본값
    max: { type: Number, default: 0 }, // 0 = 자동
    tone: { type: String, default: "default", reflect: true },
    variant: { type: String, default: "card", reflect: true }, // card | plain
    loading: { type: Boolean, reflect: true },
    emptyMessage: { type: String, default: "표시할 데이터가 없습니다" },
    noGrid: { type: Boolean, reflect: true }, // v2 showGrid=true 부정형
    noAxis: { type: Boolean, reflect: true }, // v2 showAxis=true 부정형
    legend: { type: Boolean }, // 범례 강제 on
    noLegend: { type: Boolean }, // 범례 강제 off (auto/legend를 이긴다)
  };

  declare title: string;
  declare type: ChartType;
  declare description: string;
  declare value: string;
  declare height: number;
  declare max: number;
  declare tone: string;
  declare variant: string;
  declare loading: boolean;
  declare emptyMessage: string;
  declare noGrid: boolean;
  declare noAxis: boolean;
  declare legend: boolean;
  declare noLegend: boolean;

  #data: JdChartDataPoint[] = [];
  #trend: JdChartTrend | null = null;
  #format: (v: number) => string = defaultFormat;
  #slotted = new Set<SlotRegion>();

  #titleEl!: HTMLElement;
  #descEl!: HTMLElement;
  #kpiRow!: HTMLElement;
  #valueEl!: HTMLElement;
  #trendEl!: HTMLElement;
  #chart!: HTMLElement;
  #regions = new Map<SlotRegion, HTMLElement>();

  get data(): JdChartDataPoint[] {
    return this.#data;
  }
  set data(v: JdChartDataPoint[]) {
    this.#data = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  get trend(): JdChartTrend | null {
    return this.#trend;
  }
  set trend(v: JdChartTrend | null) {
    this.#trend = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  get formatValue(): (v: number) => string {
    return this.#format;
  }
  set formatValue(fn: (v: number) => string) {
    this.#format = typeof fn === "function" ? fn : defaultFormat;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(chartCardStyles);
    this.#readJson();

    // 슬롯 자식 수거(골격 구축 전)
    const slots = new Map<SlotRegion, Element[]>();
    for (const child of Array.from(this.children)) {
      const name = child.getAttribute("slot");
      if (name && (SLOT_REGIONS as readonly string[]).includes(name)) {
        const region = name as SlotRegion;
        slots.set(region, [...(slots.get(region) ?? []), child]);
        this.#slotted.add(region);
      }
    }

    if (!this.hasAttribute("role")) this.setAttribute("role", "group");

    const head = document.createElement("div");
    head.className = "jd-chart-card__head";
    const heading = document.createElement("div");
    heading.className = "jd-chart-card__heading";
    const titleRow = document.createElement("div");
    titleRow.className = "jd-chart-card__title-row";
    this.#titleEl = document.createElement("h3");
    this.#titleEl.className = "jd-chart-card__title";
    const badge = this.#mkRegion("badge");
    titleRow.append(this.#titleEl, badge);
    this.#descEl = document.createElement("p");
    this.#descEl.className = "jd-chart-card__desc";
    heading.append(titleRow, this.#descEl);
    const actions = this.#mkRegion("actions");
    head.append(heading, actions);

    this.#kpiRow = document.createElement("div");
    this.#kpiRow.className = "jd-chart-card__kpi";
    this.#valueEl = this.#mkRegion("value");
    this.#valueEl.classList.add("jd-chart-card__value");
    this.#trendEl = document.createElement("div");
    this.#trendEl.className = "jd-chart-card__trend";
    this.#kpiRow.append(this.#valueEl, this.#trendEl);

    this.#chart = document.createElement("div");
    this.#chart.className = "jd-chart-card__chart";

    const footer = this.#mkRegion("footer");
    footer.classList.add("jd-chart-card__footer");

    this.append(head, this.#kpiRow, this.#chart, footer);

    for (const [region, nodes] of slots) {
      const target = this.#regions.get(region)!;
      target.textContent = "";
      target.append(...nodes);
    }

    this.update();
  }

  #mkRegion(region: SlotRegion): HTMLElement {
    const el = document.createElement("div");
    el.className = `jd-chart-card__${region}`;
    this.#regions.set(region, el);
    return el;
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as
        | JdChartDataPoint[]
        | { data?: JdChartDataPoint[]; trend?: JdChartTrend };
      if (Array.isArray(parsed)) {
        this.#data = parsed;
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.data)) this.#data = parsed.data;
        if (parsed.trend) this.#trend = parsed.trend;
      }
    } catch {
      console.warn("[junds] <jd-chart-card> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #chartType(): ChartType {
    return (DEFAULT_HEIGHTS[this.type as ChartType] ? this.type : "bar") as ChartType;
  }

  #resolvedHeight(type: ChartType): number {
    return this.height > 0 ? this.height : DEFAULT_HEIGHTS[type];
  }

  #legendOn(type: ChartType): boolean {
    if (this.noLegend) return false;
    if (this.legend) return true;
    return LEGEND_AUTO.has(type);
  }

  #resolvedMax(): number | undefined {
    return this.max > 0 ? this.max : undefined;
  }

  protected override update(): void {
    // 헤더
    if (!this.#slotted.has("value")) this.#valueEl.textContent = this.value;
    this.#titleEl.textContent = this.title;
    this.#descEl.textContent = this.description;
    this.#descEl.hidden = !this.description;

    this.toggleAttribute("aria-busy", this.loading);

    // KPI 행 — value(텍스트/슬롯) 또는 trend가 있을 때만
    const hasValue = this.#slotted.has("value") || Boolean(this.value);
    this.#valueEl.hidden = !hasValue;
    this.#renderTrend();
    this.#kpiRow.hidden = !hasValue && !this.#trend;

    // 차트 영역
    const type = this.#chartType();
    const height = this.#resolvedHeight(type);
    this.#chart.textContent = "";
    if (this.loading) {
      this.#chart.append(this.#skeleton(height));
    } else if (this.#data.length > 0) {
      this.#drawChart(type, height);
    } else {
      this.#chart.append(this.#empty(height));
    }
  }

  #renderTrend(): void {
    const t = this.#trend;
    this.#trendEl.textContent = "";
    this.#trendEl.hidden = !t;
    if (!t) return;
    const dir = t.direction ?? "neutral";
    this.#trendEl.setAttribute("data-direction", dir);
    this.#trendEl.append(trendIcon(dir));
    const val = document.createElement("span");
    val.className = "jd-chart-card__trend-value";
    val.textContent = t.value;
    this.#trendEl.append(val);
    if (t.label) {
      const label = document.createElement("span");
      label.className = "jd-chart-card__trend-label";
      label.textContent = t.label;
      this.#trendEl.append(label);
    }
  }

  /* ── 차트 디스패치 ─────────────────────────────────────── */

  #drawChart(type: ChartType, height: number): void {
    const fmt = this.#format;
    switch (type) {
      case "bar":
        return this.#chart.append(this.#bar(height, fmt));
      case "horizontal-bar":
        return this.#chart.append(this.#hbar(height, fmt));
      case "stacked-bar":
        return this.#chart.append(this.#stacked(height, fmt));
      case "line":
        return this.#chart.append(this.#line(height, fmt, false));
      case "area":
        return this.#chart.append(this.#line(height, fmt, true));
      case "donut":
        return this.#chart.append(this.#donut(height, fmt));
      case "sparkline":
        return this.#chart.append(this.#sparkline(height, fmt));
      case "progress":
        return this.#chart.append(this.#progress(height, fmt));
      case "radial":
        return this.#chart.append(this.#radial(height, fmt));
    }
  }

  #paletteColor(index: number, point?: JdChartDataPoint | JdChartSegment): string {
    if (point?.color) return point.color;
    if (index === 0) return TONE[this.tone] ?? TONE.default!;
    return PALETTE[index % PALETTE.length]!;
  }

  /* ── bar (세로 막대) ───────────────────────────────────── */
  #bar(height: number, fmt: (v: number) => string): HTMLElement {
    const root = document.createElement("div");
    root.className = "jd-chart-card__bar-wrap";
    root.style.height = `${height}px`;
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", `${this.title} 막대 차트`);
    const max = this.#resolvedMax() ?? Math.max(...this.#data.map((p) => p.value), 1);
    if (!this.noGrid) root.append(gridLines());
    const bars = document.createElement("div");
    bars.className = "jd-chart-card__bars";
    this.#data.forEach((point, i) => {
      const pct = toPercent(point.value, max);
      const col = document.createElement("div");
      col.className = "jd-chart-card__bar-col";
      const val = document.createElement("span");
      val.className = "jd-chart-card__bar-val";
      val.textContent = fmt(point.value);
      const track = document.createElement("div");
      track.className = "jd-chart-card__bar-track";
      const bar = document.createElement("div");
      bar.className = "jd-chart-card__bar";
      bar.style.height = `${pct}%`;
      bar.style.minHeight = point.value > 0 ? "4px" : "0";
      bar.style.backgroundColor = this.#paletteColor(i, point);
      track.append(bar);
      col.append(val, track);
      if (!this.noAxis) {
        const label = document.createElement("span");
        label.className = "jd-chart-card__bar-label";
        label.textContent = point.label;
        col.append(label);
      }
      bars.append(col);
    });
    root.append(bars);
    return root;
  }

  /* ── horizontal-bar ───────────────────────────────────── */
  #hbar(height: number, fmt: (v: number) => string): HTMLElement {
    const root = document.createElement("div");
    root.className = "jd-chart-card__hbars";
    root.style.minHeight = `${height}px`;
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", `${this.title} 가로 막대 차트`);
    const max = this.#resolvedMax() ?? Math.max(...this.#data.map((p) => p.value), 1);
    this.#data.forEach((point, i) => {
      const pct = toPercent(point.value, max);
      const row = document.createElement("div");
      row.className = "jd-chart-card__hrow";
      const label = document.createElement("span");
      label.className = "jd-chart-card__hlabel";
      label.textContent = point.label;
      const track = document.createElement("div");
      track.className = "jd-chart-card__htrack";
      const fill = document.createElement("div");
      fill.className = "jd-chart-card__hfill";
      fill.style.width = `${pct}%`;
      fill.style.backgroundColor = this.#paletteColor(i, point);
      track.append(fill);
      row.append(label, track);
      if (!this.noAxis) {
        const val = document.createElement("span");
        val.className = "jd-chart-card__hval";
        val.textContent = fmt(point.value);
        row.append(val);
      }
      root.append(row);
    });
    return root;
  }

  /* ── stacked-bar ──────────────────────────────────────── */
  #stacked(height: number, fmt: (v: number) => string): HTMLElement {
    const root = document.createElement("div");
    root.className = "jd-chart-card__stacked";
    root.style.minHeight = `${height}px`;
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", `${this.title} 누적 막대 차트`);
    const rows = this.#data.map((point) => {
      const segments =
        point.segments && point.segments.length
          ? point.segments
          : [{ label: point.label, value: point.value, color: point.color }];
      const total = segments.reduce((s, seg) => s + seg.value, 0);
      return { point, segments, total };
    });
    const max = this.#resolvedMax() ?? Math.max(...rows.map((r) => r.total), 1);
    const list = document.createElement("div");
    list.className = "jd-chart-card__srows";
    for (const row of rows) {
      const r = document.createElement("div");
      r.className = "jd-chart-card__srow";
      const label = document.createElement("span");
      label.className = "jd-chart-card__slabel";
      label.textContent = row.point.label;
      const track = document.createElement("div");
      track.className = "jd-chart-card__strack";
      row.segments.forEach((seg, i) => {
        const s = document.createElement("div");
        s.className = "jd-chart-card__sseg";
        s.style.width = `${toPercent(seg.value, max)}%`;
        s.style.backgroundColor = this.#paletteColor(i, seg);
        s.title = `${seg.label}: ${fmt(seg.value)}`;
        track.append(s);
      });
      const total = document.createElement("span");
      total.className = "jd-chart-card__stotal";
      total.textContent = fmt(row.total);
      r.append(label, track, total);
      list.append(r);
    }
    root.append(list);
    if (this.#legendOn("stacked-bar")) {
      root.append(this.#legend(stackedLegendItems(rows.map((r) => r.segments))));
    }
    return root;
  }

  /* ── line / area ──────────────────────────────────────── */
  #line(height: number, fmt: (v: number) => string, area: boolean): HTMLElement {
    const root = document.createElement("div");
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", `${this.title} ${area ? "영역" : "라인"} 차트`);
    const width = 320;
    const pad = { top: 12, right: 8, bottom: this.noAxis ? 8 : 28, left: 8 };
    const points = buildPoints(this.#data, width, height, pad);
    const path = pointsToPath(points);
    const bottomY = height - pad.bottom;
    const stroke = TONE[this.tone] ?? TONE.default!;

    const svg = svgNode("svg", "jd-chart-card__svg");
    setAttrs(svg, { width: "100%", height, viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" });

    if (!this.noGrid) svg.append(svgGrid(width, height, pad.bottom));
    if (area && points.length) {
      const areaPath = `${path} L${coord(points[points.length - 1]!.x)},${coord(bottomY)} L${coord(points[0]!.x)},${coord(bottomY)} Z`;
      const fill = svgNode("path", "jd-chart-card__area");
      fill.setAttribute("d", areaPath);
      fill.style.fill = stroke;
      svg.append(fill);
    }
    if (path) {
      const line = svgNode("path", "jd-chart-card__line");
      line.setAttribute("d", path);
      line.style.stroke = stroke;
      svg.append(line);
    }
    points.forEach((p, i) => {
      const dot = svgNode("circle", "jd-chart-card__dot");
      setAttrs(dot, { cx: coord(p.x), cy: coord(p.y), r: i === points.length - 1 ? 4 : 2.5 });
      dot.style.stroke = this.#data[i]?.color || stroke;
      svg.append(dot);
    });
    root.append(svg);
    if (!this.noAxis) root.append(this.#axisRow(fmt));
    return root;
  }

  #axisRow(fmt: (v: number) => string): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-chart-card__axis";
    const first = this.#data[0];
    const last = this.#data[this.#data.length - 1];
    const max = Math.max(...this.#data.map((p) => p.value));
    const a = document.createElement("span");
    a.textContent = first?.label ?? "";
    const b = document.createElement("span");
    b.className = "jd-chart-card__axis-max";
    b.textContent = fmt(max);
    const c = document.createElement("span");
    c.textContent = last?.label ?? "";
    row.append(a, b, c);
    return row;
  }

  /* ── donut ────────────────────────────────────────────── */
  #donut(height: number, fmt: (v: number) => string): HTMLElement {
    const root = document.createElement("div");
    root.className = "jd-chart-card__donut";
    root.style.minHeight = `${height}px`;
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", `${this.title} 도넛 차트`);
    const total = this.#data.reduce((s, p) => s + p.value, 0) || 1;
    const svg = svgNode("svg", "jd-chart-card__ring");
    setAttrs(svg, { width: 118, height: 118, viewBox: "0 0 36 36" });
    const bg = svgNode("circle", "jd-chart-card__ring-bg");
    setAttrs(bg, { cx: 18, cy: 18, r: 14, fill: "none", "stroke-width": 4 });
    svg.append(bg);
    let offset = 0;
    this.#data.forEach((point, i) => {
      const pct = (point.value / total) * 100;
      const arc = svgNode("circle", "jd-chart-card__arc");
      setAttrs(arc, {
        cx: 18,
        cy: 18,
        r: 14,
        fill: "none",
        "stroke-width": 4,
        "stroke-dasharray": `${coord(pct)} ${coord(100 - pct)}`,
        "stroke-dashoffset": coord(-offset),
        "stroke-linecap": "round",
        pathLength: 100,
      });
      arc.style.stroke = this.#paletteColor(i, point);
      svg.append(arc);
      offset += pct;
    });
    const t1 = svgNode("text", "jd-chart-card__ring-total");
    setAttrs(t1, { x: 18, y: 16, "text-anchor": "middle" });
    t1.textContent = fmt(total);
    const t2 = svgNode("text", "jd-chart-card__ring-sub");
    setAttrs(t2, { x: 18, y: 22, "text-anchor": "middle" });
    t2.textContent = "total";
    svg.append(t1, t2);
    root.append(svg);
    if (this.#legendOn("donut")) {
      const items = this.#data.map((p, i) => ({
        label: p.label,
        value: fmt(p.value),
        color: this.#paletteColor(i, p),
      }));
      const legend = this.#legend(items);
      legend.classList.add("jd-chart-card__legend--flex");
      root.append(legend);
    }
    return root;
  }

  /* ── sparkline ────────────────────────────────────────── */
  #sparkline(height: number, fmt: (v: number) => string): HTMLElement {
    const root = document.createElement("div");
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", `${this.title} 스파크라인`);
    const width = 260;
    const pad = { top: 6, right: 4, bottom: 6, left: 4 };
    const points = buildPoints(this.#data, width, height, pad);
    const path = pointsToPath(points);
    const bottomY = height - pad.bottom;
    const stroke = TONE[this.tone] ?? TONE.default!;
    const svg = svgNode("svg", "jd-chart-card__svg");
    setAttrs(svg, { width: "100%", height, viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" });
    if (points.length) {
      const areaPath = `${path} L${coord(points[points.length - 1]!.x)},${coord(bottomY)} L${coord(points[0]!.x)},${coord(bottomY)} Z`;
      const fill = svgNode("path", "jd-chart-card__area");
      fill.setAttribute("d", areaPath);
      fill.style.fill = stroke;
      svg.append(fill);
    }
    if (path) {
      const line = svgNode("path", "jd-chart-card__line");
      line.setAttribute("d", path);
      line.style.stroke = stroke;
      svg.append(line);
    }
    if (points.length) {
      const end = svgNode("circle", "jd-chart-card__spark-end");
      const last = points[points.length - 1]!;
      setAttrs(end, { cx: coord(last.x), cy: coord(last.y), r: 3.5 });
      end.style.fill = stroke;
      svg.append(end);
    }
    root.append(svg);
    const meta = document.createElement("div");
    meta.className = "jd-chart-card__spark-meta";
    const first = document.createElement("span");
    first.textContent = this.#data[0]?.label ?? "";
    const last = this.#data[this.#data.length - 1];
    const mid = document.createElement("span");
    mid.className = "jd-chart-card__spark-val";
    mid.textContent = last ? fmt(last.value) : "";
    const end = document.createElement("span");
    end.textContent = last?.label ?? "";
    meta.append(first, mid, end);
    root.append(meta);
    return root;
  }

  /* ── progress ─────────────────────────────────────────── */
  #progress(height: number, fmt: (v: number) => string): HTMLElement {
    const root = document.createElement("div");
    root.className = "jd-chart-card__progress";
    root.style.minHeight = `${height}px`;
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", `${this.title} 진행률 차트`);
    const max = this.#resolvedMax() ?? 100;
    this.#data.forEach((point, i) => {
      const pct = toPercent(point.value, max);
      const item = document.createElement("div");
      item.className = "jd-chart-card__prog-item";
      const head = document.createElement("div");
      head.className = "jd-chart-card__prog-head";
      const label = document.createElement("span");
      label.className = "jd-chart-card__prog-label";
      label.textContent = point.label;
      const val = document.createElement("span");
      val.className = "jd-chart-card__prog-val";
      val.textContent = fmt(point.value);
      head.append(label, val);
      const track = document.createElement("div");
      track.className = "jd-chart-card__prog-track";
      const fill = document.createElement("div");
      fill.className = "jd-chart-card__prog-fill";
      fill.style.width = `${pct}%`;
      fill.style.backgroundColor = this.#paletteColor(i, point);
      track.append(fill);
      item.append(head, track);
      root.append(item);
    });
    return root;
  }

  /* ── radial ───────────────────────────────────────────── */
  #radial(height: number, fmt: (v: number) => string): HTMLElement {
    const root = document.createElement("div");
    root.className = "jd-chart-card__radial";
    root.style.minHeight = `${height}px`;
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", `${this.title} 방사형 차트`);
    const point = this.#data[0]!;
    const max = this.#resolvedMax() ?? 100;
    const pct = toPercent(point.value, max);
    const stroke = point.color || TONE[this.tone] || TONE.default!;
    const svg = svgNode("svg", "jd-chart-card__ring");
    setAttrs(svg, { width: 118, height: 118, viewBox: "0 0 36 36" });
    const bg = svgNode("circle", "jd-chart-card__ring-bg");
    setAttrs(bg, { cx: 18, cy: 18, r: 14, fill: "none", "stroke-width": 4 });
    const arc = svgNode("circle", "jd-chart-card__arc");
    setAttrs(arc, {
      cx: 18,
      cy: 18,
      r: 14,
      fill: "none",
      "stroke-width": 4,
      "stroke-dasharray": `${coord(pct)} ${coord(100 - pct)}`,
      "stroke-linecap": "round",
      pathLength: 100,
    });
    arc.style.stroke = stroke;
    const t1 = svgNode("text", "jd-chart-card__ring-total");
    setAttrs(t1, { x: 18, y: 16.5, "text-anchor": "middle" });
    t1.textContent = `${Math.round(pct)}%`;
    const t2 = svgNode("text", "jd-chart-card__ring-sub");
    setAttrs(t2, { x: 18, y: 22.5, "text-anchor": "middle" });
    t2.textContent = fmt(point.value);
    svg.append(bg, arc, t1, t2);
    root.append(svg);
    if (this.#legendOn("radial")) {
      const detail = document.createElement("div");
      detail.className = "jd-chart-card__radial-detail";
      const name = document.createElement("div");
      name.className = "jd-chart-card__radial-name";
      name.textContent = point.label;
      const sub = document.createElement("div");
      sub.className = "jd-chart-card__radial-sub";
      sub.textContent = `목표 ${fmt(max)} 중 ${fmt(point.value)}`;
      const track = document.createElement("div");
      track.className = "jd-chart-card__radial-track";
      const fill = document.createElement("div");
      fill.className = "jd-chart-card__radial-fill";
      fill.style.width = `${pct}%`;
      fill.style.backgroundColor = stroke;
      track.append(fill);
      detail.append(name, sub, track);
      root.append(detail);
    }
    return root;
  }

  /* ── 공용 조각 ────────────────────────────────────────── */
  #legend(items: { label: string; value?: string; color: string }[]): HTMLElement {
    const list = document.createElement("ul");
    list.className = "jd-chart-card__legend";
    for (const item of items) {
      const li = document.createElement("li");
      li.className = "jd-chart-card__legend-item";
      const swatch = document.createElement("span");
      swatch.className = "jd-chart-card__legend-swatch";
      swatch.setAttribute("aria-hidden", "true");
      swatch.style.backgroundColor = item.color;
      const label = document.createElement("span");
      label.className = "jd-chart-card__legend-label";
      label.textContent = item.label;
      li.append(swatch, label);
      if (item.value) {
        const val = document.createElement("span");
        val.className = "jd-chart-card__legend-val";
        val.textContent = item.value;
        li.append(val);
      }
      list.append(li);
    }
    return list;
  }

  #skeleton(height: number): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "jd-chart-card__skeleton";
    wrap.style.height = `${height}px`;
    wrap.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 7; i++) {
      const bar = document.createElement("div");
      bar.className = "jd-chart-card__skeleton-bar";
      bar.style.height = `${32 + ((i * 17) % 52)}%`;
      wrap.append(bar);
    }
    return wrap;
  }

  #empty(height: number): HTMLElement {
    const el = document.createElement("div");
    el.className = "jd-chart-card__empty";
    el.style.minHeight = `${height}px`;
    el.textContent = this.emptyMessage;
    return el;
  }
}

/* ── 순수 헬퍼 ──────────────────────────────────────────── */

function defaultFormat(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return groupDigits(Math.round(value * 10) / 10);
}

function toPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function buildPoints(
  data: JdChartDataPoint[],
  width: number,
  height: number,
  pad: { top: number; right: number; bottom: number; left: number },
): Pt[] {
  const values = data.map((p) => p.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const iw = width - pad.left - pad.right;
  const ih = height - pad.top - pad.bottom;
  return data.map((p, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * iw,
    y: pad.top + ih - ((p.value - min) / range) * ih,
  }));
}

function pointsToPath(points: Pt[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${coord(p.x)},${coord(p.y)}`).join(" ");
}

function gridLines(): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "jd-chart-card__grid";
  grid.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 4; i++) {
    const line = document.createElement("span");
    line.className = "jd-chart-card__gridline";
    grid.append(line);
  }
  return grid;
}

function svgGrid(width: number, height: number, bottom: number): SVGGElement {
  const g = svgNode("g", "jd-chart-card__svg-grid");
  g.setAttribute("aria-hidden", "true");
  const rows = 4;
  for (let i = 0; i < rows; i++) {
    const y = 12 + (i / (rows - 1)) * (height - bottom - 12);
    const line = svgNode("line", "jd-chart-card__svg-gridline");
    setAttrs(line, { x1: 0, x2: width, y1: coord(y), y2: coord(y) });
    g.append(line);
  }
  return g;
}

function stackedLegendItems(rowsSegments: JdChartSegment[][]): { label: string; color: string }[] {
  const map = new Map<string, { label: string; color: string }>();
  rowsSegments.forEach((segments) => {
    segments.forEach((seg, i) => {
      if (!map.has(seg.label)) {
        map.set(seg.label, {
          label: seg.label,
          color: seg.color || PALETTE[i % PALETTE.length]!,
        });
      }
    });
  });
  return Array.from(map.values());
}

function trendIcon(direction: "up" | "down" | "neutral"): SVGSVGElement {
  const svg = svgNode("svg", "jd-chart-card__trend-icon");
  setAttrs(svg, { width: 12, height: 12, viewBox: "0 0 12 12", fill: "none", "aria-hidden": "true" });
  const path = svgNode("path");
  if (direction === "neutral") {
    setAttrs(path, { d: "M2.5 6h7", stroke: "currentColor", "stroke-width": 1.5, "stroke-linecap": "round" });
  } else {
    setAttrs(path, {
      d: "M3 7.5 6 4.5l3 3",
      stroke: "currentColor",
      "stroke-width": 1.5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    if (direction === "down") svg.setAttribute("data-flip", "");
  }
  svg.append(path);
  return svg;
}
