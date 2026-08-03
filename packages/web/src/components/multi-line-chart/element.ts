/**
 * <jd-multi-line-chart> — 다중 시리즈 비교 라인 차트 (v2 finance/MultiLineChart).
 *
 * 여러 종목/지수를 **첫 점=0% 기준으로 정규화**해 겹쳐 그리는 비교 차트다. 골격(SVG 프레임·
 * 격자·y축·범례·숨김 데이터 표·JSON 슬롯)은 차트 공용 코어 JdCategoryChart에서 상속하고
 * (§6 R12), 이 클래스는 세 가지만 답한다: 정규화 도메인/눈금(yTicks), 무엇을 그릴지
 * (drawPlot — 기준선 + 라인 + 끝점), 그리고 hover 크로스헤어+툴팁.
 *
 * v2 대비 교정:
 *  1. **AT에 숫자가 하나도 안 갔다**(SVG role=img 하나). JdChartBase의 숨김 데이터 표를
 *     함께 렌더한다(원본 값 기준 — 정규화 이전이 더 유용).
 *  2. **색이 표시 속성 인라인**(stroke={color})이었다 → 시리즈 그룹 --jd-series-color 경유,
 *     실제 stroke/fill은 CSS(core/chart.styles.ts 철학).
 *  3. **범례가 SVG 안 하드코딩 가로배치**(90px 고정 간격이라 이름이 길면 겹쳤다) →
 *     JdChartBase의 시맨틱 HTML 범례로.
 *  4. **normalize=true 기본**은 Boolean attribute로 끌 수 없다(존재=값) → `no-normalize`,
 *     showLegend=true 기본 → `no-legend` (레포 부정형 관용구).
 */
import {
  JdCategoryChart,
  coord,
  linePath,
  seriesColor,
  setAttrs,
  svgNode,
} from "../../core/chart.js";
import type { JdChartSeries, JdChartTick, JdPoint } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import multiLineChartStyles from "./multi-line-chart.css.js";

const TIP_LINE_H = 14;
const TIP_PAD_X = 8;

/** v2 niceStep — 1/2/5/10 눈금 간격 */
function niceStep(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  const nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nf * exp;
}

interface Transformed {
  name: string;
  color: string;
  data: number[];
}

interface Geometry {
  series: Transformed[];
  min: number;
  max: number;
  range: number;
  longest: number;
}

export class JdMultiLineChart extends JdCategoryChart<JdChartSeries> {
  static override tag = "jd-multi-line-chart";
  static override props = {
    ...JdCategoryChart.props,
    width: { type: Number, default: 380 },
    height: { type: Number, default: 220 },
    /** 정규화 해제 (v2 normalize=true의 부정형) — 켜지면 각 시리즈 첫 점=0% 기준 */
    noNormalize: { type: Boolean, reflect: true, attribute: "no-normalize" },
    /** 눈금·툴팁 값 접미 단위 */
    unit: { type: String, default: "%" },
    /** 범례 숨김 (v2 showLegend=true의 부정형) */
    noLegend: { type: Boolean, reflect: true, attribute: "no-legend" },
  };

  declare noNormalize: boolean;
  declare unit: string;
  declare noLegend: boolean;

  // v2 PADDING (padL 42 / padR 14 / padT 12 / padB 22)
  protected override padLeft = 42;
  protected override padRight = 14;
  protected override padTop = 12;
  protected override padBottom = 22;

  #hover: SVGGElement | null = null;
  #hoverIdx = -1;

  protected override render(): void {
    adoptStyles(multiLineChartStyles);
    super.render();
    this.#ensureHover();
  }

  #ensureHover(): void {
    const existing = this.svg.querySelector<SVGGElement>(".jd-mlc__hover");
    this.#hover = existing ?? svgNode("g", "jd-mlc__hover");
    if (!existing) this.svg.append(this.#hover);
  }

  protected override connected(): void {
    this.svg.addEventListener("pointermove", this.#onMove);
    this.svg.addEventListener("pointerleave", this.#onLeave);
  }

  protected override disconnected(): void {
    this.svg.removeEventListener("pointermove", this.#onMove);
    this.svg.removeEventListener("pointerleave", this.#onLeave);
  }

  protected override defaultLabel(): string {
    return "비교 라인 차트";
  }

  protected override legendVisible(): boolean {
    return !this.noLegend;
  }

  /** 시리즈를 정규화(첫 점=0%) — base 0/빈 시리즈는 원본 유지(v2 동형) */
  #transform(): Transformed[] {
    const norm = !this.noNormalize;
    return this.series.map((s, i) => {
      const color = seriesColor(i, s.color);
      if (!norm || s.data.length === 0) return { name: s.name, color, data: s.data.slice() };
      const base = s.data[0];
      if (!base) return { name: s.name, color, data: s.data.slice() };
      return { name: s.name, color, data: s.data.map((v) => ((v - base) / base) * 100) };
    });
  }

  #geometry(): Geometry {
    const series = this.#transform();
    let min = Infinity;
    let max = -Infinity;
    for (const s of series) {
      for (const v of s.data) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = 0;
      max = 1;
    }
    const pad = (max - min) * 0.1 || 1;
    min -= pad;
    max += pad;
    let longest = 1;
    for (const s of series) longest = Math.max(longest, s.data.length);
    return { series, min, max, range: max - min || 1, longest };
  }

  #yFor(value: number, max: number, range: number): number {
    return this.padTop + ((max - value) / range) * this.innerHeight;
  }

  protected override yTicks(): JdChartTick[] {
    const { min, max, range } = this.#geometry();
    const step = niceStep(range / 4);
    const ticks: JdChartTick[] = [];
    let t = Math.ceil(min / step) * step;
    for (let guard = 0; t < max && guard < 100; guard += 1) {
      ticks.push({
        pos: this.#yFor(t, max, range),
        text: `${t >= 0 ? "+" : ""}${t.toFixed(0)}${this.unit}`,
      });
      t += step;
    }
    return ticks;
  }

  /** v2는 x축 라벨을 그리지 않는다(라벨은 툴팁에서만 쓴다) */
  protected override xTicks(): JdChartTick[] {
    return [];
  }

  protected override drawPlot(): void {
    const plot = this.plotLayer;
    plot.textContent = "";
    const { series, min, max, range, longest } = this.#geometry();

    // 0% 기준선 — 도메인이 0을 품을 때만
    if (min <= 0 && max >= 0) {
      const zy = coord(this.#yFor(0, max, range));
      const zero = svgNode("line", "jd-mlc__zero");
      setAttrs(zero, { x1: this.padLeft, x2: this.frameWidth - this.padRight, y1: zy, y2: zy });
      plot.append(zero);
    }

    for (const s of series) {
      const g = this.seriesGroup(s.color);
      const pts: JdPoint[] = s.data.map((v, i) => ({
        x: this.xAt(i, longest),
        y: this.#yFor(v, max, range),
      }));
      const d = linePath(pts, false); // v2 직선 보간
      if (d) {
        const line = svgNode("path", "jd-chart__line");
        line.setAttribute("d", d);
        g.append(line);
      }
      const last = pts[pts.length - 1];
      if (last) {
        const head = svgNode("circle", "jd-mlc__head");
        setAttrs(head, { cx: coord(last.x), cy: coord(last.y), r: 3.5 });
        g.append(head);
      }
      plot.append(g);
    }

    this.syncLegend(this.legendItemsFromSeries());
    this.syncSeriesTable();
    this.#drawHover();
  }

  /** clientX → svg 로컬 x (CSS 스케일 보정) */
  #localX(clientX: number): number {
    const rect = this.svg.getBoundingClientRect();
    const w = this.frameWidth;
    if (rect.width === 0) return 0;
    return (clientX - rect.left) * (w / rect.width);
  }

  #onMove = (e: PointerEvent): void => {
    const { longest } = this.#geometry();
    const stepX = this.innerWidth / Math.max(1, longest - 1);
    const x = this.#localX(e.clientX);
    const idx = Math.max(0, Math.min(longest - 1, Math.round((x - this.padLeft) / stepX)));
    if (idx === this.#hoverIdx) return;
    this.#hoverIdx = idx;
    this.#drawHover();
  };

  #onLeave = (): void => {
    if (this.#hoverIdx === -1) return;
    this.#hoverIdx = -1;
    this.#drawHover();
  };

  #drawHover(): void {
    const hover = this.#hover;
    if (!hover) return;
    hover.textContent = "";
    const idx = this.#hoverIdx;
    if (idx < 0) return;
    const { series, max, range, longest } = this.#geometry();
    if (series.length === 0 || idx >= longest) return;

    const hx = this.xAt(idx, longest);

    const cross = svgNode("line", "jd-mlc__crosshair");
    setAttrs(cross, {
      x1: coord(hx),
      x2: coord(hx),
      y1: this.padTop,
      y2: this.padTop + this.innerHeight,
    });
    hover.append(cross);

    for (const s of series) {
      const v = s.data[idx];
      if (v == null) continue;
      const dot = svgNode("circle", "jd-mlc__hoverdot");
      dot.style.setProperty("--jd-series-color", s.color);
      setAttrs(dot, { cx: coord(hx), cy: coord(this.#yFor(v, max, range)), r: 3.5 });
      hover.append(dot);
    }

    this.#drawTooltip(series, idx, hx);
  }

  #drawTooltip(series: Transformed[], idx: number, hx: number): void {
    const hover = this.#hover!;
    const label = this.labels[idx];
    const hasLabel = Boolean(label);
    let maxNameLen = 2;
    for (const s of series) maxNameLen = Math.max(maxNameLen, s.name.length);
    const tipW = Math.min(180, 60 + maxNameLen * 6);
    const tipH = (series.length + (hasLabel ? 1 : 0)) * TIP_LINE_H + 12;
    const w = this.frameWidth;
    const tipX = Math.min(w - tipW - 4, Math.max(4, hx + 10));
    const tipY = 6;

    const box = svgNode("g", "jd-mlc__tip");
    box.setAttribute("transform", `translate(${coord(tipX)}, ${tipY})`);
    const bg = svgNode("rect", "jd-mlc__tip-bg");
    setAttrs(bg, { width: coord(tipW), height: coord(tipH), rx: 6 });
    box.append(bg);

    if (hasLabel) {
      const head = svgNode("text", "jd-mlc__tip-label");
      setAttrs(head, { x: TIP_PAD_X, y: TIP_LINE_H - 1 });
      head.textContent = label!;
      box.append(head);
    }

    series.forEach((s, i) => {
      const v = s.data[idx];
      const yPos = (hasLabel ? TIP_LINE_H : 0) + (i + 1) * TIP_LINE_H;
      const dot = svgNode("circle", "jd-mlc__tip-dot");
      dot.style.setProperty("--jd-series-color", s.color);
      setAttrs(dot, { cx: TIP_PAD_X + 4, cy: yPos - 4, r: 3 });
      box.append(dot);
      const name = svgNode("text", "jd-mlc__tip-name");
      setAttrs(name, { x: TIP_PAD_X + 12, y: yPos });
      name.textContent = s.name;
      box.append(name);
      const val = svgNode("text", "jd-mlc__tip-val");
      setAttrs(val, { x: coord(tipW - TIP_PAD_X), y: yPos });
      val.textContent = v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}${this.unit}`;
      box.append(val);
    });

    hover.append(box);
  }
}
