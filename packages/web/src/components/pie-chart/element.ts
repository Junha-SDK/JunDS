/**
 * <jd-pie-chart> — 경량 SVG 파이/도넛 차트 (v2 composites/PieChart).
 *
 * 데이터 2경로: `el.data = [{label,value,color?}]` 또는
 * 자식 `<script type="application/json">[…]</script>`.
 *
 * v2 대비 교정:
 *  1. **100% 한 조각이 사라졌다.** 조각이 원 전체(2π)면 시작점과 끝점이 같은 좌표라
 *     `A` 호가 길이 0으로 접힌다 — 데이터가 하나뿐인 파이가 빈 원으로 렌더됐다.
 *     v3는 그 경우 반원 2개(도넛이면 안쪽 원까지, fill-rule=evenodd)로 그린다.
 *  2. **값이 AT에 가지 않았다.** `<title>`은 마우스 툴팁일 뿐이다 → 숨김 데이터 표.
 *  3. 조각 색이 `fill` 속성에 박혀 테마 오버라이드가 막혀 있었다 → `--jd-series-color`.
 */
import {
  JdChartBase,
  coord,
  readChartJson,
  seriesColor,
  svgNode,
  toValueList,
  positive,
  upgradeAccessor,
} from "../../core/chart.js";
import type { JdLegendItem, JdValueDatum } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import pieChartStyles from "./pie-chart.css.js";

/** 원 전체로 볼 각도 임계 — 부동소수 누적 오차 여유 */
const FULL_TURN = Math.PI * 2 - 1e-9;

function arcPath(
  cx: number,
  cy: number,
  r: number,
  ir: number,
  startAngle: number,
  endAngle: number,
): string {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const x0 = coord(cx + r * Math.cos(startAngle));
  const y0 = coord(cy + r * Math.sin(startAngle));
  const x1 = coord(cx + r * Math.cos(endAngle));
  const y1 = coord(cy + r * Math.sin(endAngle));
  const rr = coord(r);
  if (ir > 0) {
    const ri = coord(ir);
    const x2 = coord(cx + ir * Math.cos(endAngle));
    const y2 = coord(cy + ir * Math.sin(endAngle));
    const x3 = coord(cx + ir * Math.cos(startAngle));
    const y3 = coord(cy + ir * Math.sin(startAngle));
    return `M${x0},${y0} A${rr},${rr} 0 ${largeArc} 1 ${x1},${y1} L${x2},${y2} A${ri},${ri} 0 ${largeArc} 0 ${x3},${y3} Z`;
  }
  return `M${coord(cx)},${coord(cy)} L${x0},${y0} A${rr},${rr} 0 ${largeArc} 1 ${x1},${y1} Z`;
}

/** 원 전체 — 호 하나로는 그릴 수 없어 반원 2개로 닫는다 */
function fullCirclePath(cx: number, cy: number, r: number, ir: number): string {
  const y = coord(cy);
  const outer =
    `M${coord(cx - r)},${y} A${coord(r)},${coord(r)} 0 1 1 ${coord(cx + r)},${y} ` +
    `A${coord(r)},${coord(r)} 0 1 1 ${coord(cx - r)},${y} Z`;
  if (ir <= 0) return outer;
  // 안쪽 원은 반대 방향으로 — fill-rule: evenodd가 구멍을 뚫는다
  const inner =
    `M${coord(cx - ir)},${y} A${coord(ir)},${coord(ir)} 0 1 0 ${coord(cx + ir)},${y} ` +
    `A${coord(ir)},${coord(ir)} 0 1 0 ${coord(cx - ir)},${y} Z`;
  return `${outer} ${inner}`;
}

export class JdPieChart extends JdChartBase {
  static override tag = "jd-pie-chart";
  static override props = {
    ...JdChartBase.props,
    /** 정사각 지름(px) */
    size: { type: Number, default: 200 },
    /** 도넛 안쪽 비율 0~1. 0이면 파이 */
    innerRatio: { type: Number, default: 0 },
    /** 가운데 라벨 — innerRatio > 0일 때만 표시(v2 동형) */
    centerLabel: { type: String },
    /** 범례 숨김 (v2 showLegend=true의 부정형) */
    noLegend: { type: Boolean, reflect: true },
  };

  declare size: number;
  declare innerRatio: number;
  declare centerLabel: string;
  declare noLegend: boolean;

  #data: JdValueDatum[] = [];
  #svg!: SVGSVGElement;
  #slices!: SVGGElement;
  #center!: SVGTextElement;

  get data(): JdValueDatum[] {
    return this.#data;
  }
  set data(v: JdValueDatum[]) {
    this.#data = toValueList(v);
    this.requestUpdate();
  }

  protected override render(): void {
    adoptStyles(pieChartStyles);
    upgradeAccessor(this, "data");
    if (this.#data.length === 0) {
      const json = readChartJson(this);
      this.#data = toValueList(Array.isArray(json) ? json : (json as { data?: unknown })?.data);
    }
    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-chart__svg");
    if (existing) {
      this.#svg = existing;
      this.#slices = existing.querySelector(".jd-pie-chart__slices")!;
      this.#center = existing.querySelector(".jd-pie-chart__center")!;
    } else {
      this.#svg = svgNode("svg", "jd-chart__svg");
      this.#svg.setAttribute("aria-hidden", "true"); // 값은 데이터 표가 말한다
      this.#slices = svgNode("g", "jd-pie-chart__slices");
      this.#center = svgNode("text", "jd-pie-chart__center");
      this.#center.setAttribute("text-anchor", "middle");
      this.#svg.append(this.#slices, this.#center);
      this.prepend(this.#svg);
    }
    super.render();
    this.update();
  }

  protected override defaultLabel(): string {
    return "파이 차트";
  }

  protected override legendVisible(): boolean {
    return !this.noLegend;
  }

  protected override paint(): void {
    const size = positive(this.size, 200);
    const cx = size / 2;
    const cy = size / 2;
    const r = Math.max(0, size / 2 - 4);
    const ratio = Math.min(1, Math.max(0, Number(this.innerRatio) || 0));
    const ir = r * ratio;
    this.#svg.setAttribute("width", String(size));
    this.#svg.setAttribute("height", String(size));
    this.#svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

    let total = 0;
    for (const d of this.#data) total += Math.max(0, d.value);
    const sum = total || 1;

    this.#slices.textContent = "";
    const items: JdLegendItem[] = [];
    const rows: string[][] = [];
    let cursor = -Math.PI / 2; // 12시 시작 (v2 동형)

    this.#data.forEach((d, i) => {
      const value = Math.max(0, d.value);
      const percent = (value / sum) * 100;
      const angle = (value / sum) * Math.PI * 2;
      const color = seriesColor(i, d.color);
      const path = svgNode("path", "jd-pie-chart__slice");
      path.style.setProperty("--jd-series-color", color);
      path.setAttribute(
        "d",
        angle >= FULL_TURN
          ? fullCirclePath(cx, cy, r, ir)
          : arcPath(cx, cy, r, ir, cursor, cursor + angle),
      );
      const title = svgNode("title");
      title.textContent = `${d.label}: ${percent.toFixed(1)}%`;
      path.append(title);
      this.#slices.append(path);
      cursor += angle;
      items.push({ color, name: d.label, value: `${percent.toFixed(1)}%` });
      rows.push([d.label, String(d.value), `${percent.toFixed(1)}%`]);
    });

    const showCenter = Boolean(this.centerLabel) && ratio > 0;
    this.#center.textContent = showCenter ? this.centerLabel : "";
    this.#center.setAttribute("x", String(coord(cx)));
    this.#center.setAttribute("y", String(coord(cy + 4)));
    this.#center.setAttribute("font-size", String(coord(size * 0.12)));

    this.syncLegend(items);
    this.syncTable(rows.length > 0 ? ["항목", "값", "비율"] : [], rows);
  }
}
