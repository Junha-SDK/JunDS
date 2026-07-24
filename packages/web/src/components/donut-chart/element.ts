/**
 * <jd-donut-chart> — 스트로크 링 도넛 차트 (v2 finance/DonutChart).
 *
 * jd-pie-chart(채워진 웨지)와 **시각 모델이 다르다**: v2 DonutChart는 배경 트랙 위에
 * `stroke-width=thickness`의 호를 얹는 링이고, 가운데에 라벨·값 2줄을 둔다. 그래서
 * 파이를 파생하지 않고 JdChartBase에서 바로 갈라진다(pie가 JdChartBase에서 갈라지는
 * 것과 같은 판단 — 뜻 없는 프로퍼티 innerRatio/noLegend를 상속시키지 않는다).
 *
 * 데이터 2경로: `el.data = [{label,value,color}]` 또는 자식 JSON 슬롯.
 *
 * v2 대비 교정:
 *  1. **100% 한 조각이 사라졌다.** 시작·끝 각이 같은 호는 길이 0으로 접힌다 — v3는
 *     전체 원이면 `<circle>` 스트로크로 그린다.
 *  2. **값이 AT에 가지 않았다.** SVG는 aria-hidden, 숨김 데이터 표가 값을 말한다.
 *  3. 조각 색이 stroke 속성에 박혀 테마 오버라이드가 막혀 있었다 → `--jd-series-color`.
 */
import {
  JdChartBase,
  coord,
  positive,
  readChartJson,
  seriesColor,
  svgNode,
  toValueList,
  upgradeAccessor,
} from "../../core/chart.js";
import type { JdLegendItem, JdValueDatum } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import donutChartStyles from "./donut-chart.css.js";

/** 원 전체로 볼 각도 임계 — 부동소수 누적 오차 여유 */
const FULL_TURN = Math.PI * 2 - 1e-9;

/** 스트로크 링 한 조각의 바깥 호 경로 (fill 없음 — 링은 stroke가 그린다) */
function ringArc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = coord(cx + r * Math.cos(a0));
  const y0 = coord(cy + r * Math.sin(a0));
  const x1 = coord(cx + r * Math.cos(a1));
  const y1 = coord(cy + r * Math.sin(a1));
  const rr = coord(r);
  return `M${x0},${y0} A${rr},${rr} 0 ${large} 1 ${x1},${y1}`;
}

export class JdDonutChart extends JdChartBase {
  static override tag = "jd-donut-chart";
  static override props = {
    ...JdChartBase.props,
    /** 정사각 지름(px) */
    size: { type: Number, default: 220 },
    /** 링 두께(px) */
    thickness: { type: Number, default: 28 },
    /** 가운데 위 작은 라벨 */
    centerLabel: { type: String },
    /** 가운데 큰 값 */
    centerValue: { type: String },
    /** 범례 표시 — v2는 없었다(기본 숨김). 존재하면 켠다 */
    legend: { type: Boolean, reflect: true },
  };

  declare size: number;
  declare thickness: number;
  declare centerLabel: string;
  declare centerValue: string;
  declare legend: boolean;

  #data: JdValueDatum[] = [];
  #svg!: SVGSVGElement;
  #track!: SVGCircleElement;
  #segs!: SVGGElement;
  #label!: SVGTextElement;
  #value!: SVGTextElement;

  get data(): JdValueDatum[] {
    return this.#data;
  }
  set data(v: JdValueDatum[]) {
    this.#data = toValueList(v);
    this.requestUpdate();
  }

  protected override render(): void {
    adoptStyles(donutChartStyles);
    upgradeAccessor(this, "data");
    if (this.#data.length === 0) {
      const json = readChartJson(this);
      this.#data = toValueList(Array.isArray(json) ? json : (json as { data?: unknown })?.data);
    }
    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-chart__svg");
    if (existing) {
      this.#svg = existing;
      this.#track = existing.querySelector(".jd-donut-chart__track")!;
      this.#segs = existing.querySelector(".jd-donut-chart__segs")!;
      this.#label = existing.querySelector(".jd-donut-chart__center-label")!;
      this.#value = existing.querySelector(".jd-donut-chart__center-value")!;
    } else {
      this.#svg = svgNode("svg", "jd-chart__svg");
      this.#svg.setAttribute("aria-hidden", "true"); // 값은 데이터 표가 말한다
      this.#track = svgNode("circle", "jd-donut-chart__track");
      this.#segs = svgNode("g", "jd-donut-chart__segs");
      this.#label = svgNode("text", "jd-donut-chart__center-label");
      this.#value = svgNode("text", "jd-donut-chart__center-value");
      this.#label.setAttribute("text-anchor", "middle");
      this.#value.setAttribute("text-anchor", "middle");
      this.#svg.append(this.#track, this.#segs, this.#label, this.#value);
      this.prepend(this.#svg);
    }
    super.render();
    this.update();
  }

  protected override defaultLabel(): string {
    return "도넛 차트";
  }

  protected override legendVisible(): boolean {
    return this.legend;
  }

  protected override paint(): void {
    const size = positive(this.size, 220);
    const thickness = Math.min(size / 2, positive(this.thickness, 28));
    const cx = size / 2;
    const cy = size / 2;
    const r = Math.max(0, size / 2 - thickness / 2);

    this.#svg.setAttribute("width", String(size));
    this.#svg.setAttribute("height", String(size));
    this.#svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

    this.#track.setAttribute("cx", String(coord(cx)));
    this.#track.setAttribute("cy", String(coord(cy)));
    this.#track.setAttribute("r", String(coord(r)));
    this.#track.setAttribute("stroke-width", String(coord(thickness)));

    let total = 0;
    for (const d of this.#data) total += Math.max(0, d.value);
    const sum = total || 1;

    this.#segs.textContent = "";
    const items: JdLegendItem[] = [];
    const rows: string[][] = [];
    let cursor = -Math.PI / 2; // 12시 시작 (v2 동형)

    this.#data.forEach((d, i) => {
      const value = Math.max(0, d.value);
      const percent = (value / sum) * 100;
      const angle = (value / sum) * Math.PI * 2;
      const color = seriesColor(i, d.color);
      let node: SVGElement;
      if (angle >= FULL_TURN) {
        // 전체 원 — 호 하나로는 그릴 수 없어 원소로 그린다(v2는 이 경우 비어 보였다)
        const circle = svgNode("circle", "jd-donut-chart__seg");
        circle.setAttribute("cx", String(coord(cx)));
        circle.setAttribute("cy", String(coord(cy)));
        circle.setAttribute("r", String(coord(r)));
        node = circle;
      } else {
        const path = svgNode("path", "jd-donut-chart__seg");
        path.setAttribute("d", ringArc(cx, cy, r, cursor, cursor + angle));
        node = path;
      }
      node.setAttribute("stroke-width", String(coord(thickness)));
      node.style.setProperty("--jd-series-color", color);
      const title = svgNode("title");
      title.textContent = `${d.label}: ${percent.toFixed(1)}%`;
      node.append(title);
      this.#segs.append(node);
      cursor += angle;
      items.push({ color, name: d.label, value: `${percent.toFixed(1)}%`, shape: "dot" });
      rows.push([d.label, String(d.value), `${percent.toFixed(1)}%`]);
    });

    const hasLabel = Boolean(this.centerLabel);
    const hasValue = Boolean(this.centerValue);
    this.#label.textContent = hasLabel ? this.centerLabel : "";
    this.#label.setAttribute("x", String(coord(cx)));
    this.#label.setAttribute("y", String(coord(cy - (hasValue ? size * 0.03 : -size * 0.02))));
    this.#label.setAttribute("font-size", String(coord(size * 0.048)));
    this.#value.textContent = hasValue ? this.centerValue : "";
    this.#value.setAttribute("x", String(coord(cx)));
    this.#value.setAttribute("y", String(coord(cy + (hasLabel ? size * 0.055 : size * 0.03))));
    this.#value.setAttribute("font-size", String(coord(size * 0.082)));

    this.syncLegend(items);
    this.syncTable(rows.length > 0 ? ["항목", "값", "비율"] : [], rows);
  }
}
