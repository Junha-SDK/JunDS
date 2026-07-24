/**
 * <jd-area-chart> — SVG 영역 차트 (v2 composites/AreaChart) = **LineChart 파생**(§6 R12).
 *
 * v2의 AreaChart는 LineChart를 통째로 복사한 파일이었다 — PADDING 상수·팔레트·
 * buildPath()·격자·축 라벨이 문자 단위로 같고, 다른 것은 세 가지뿐이다:
 *   (1) y 도메인이 항상 0에서 시작한다(음수 미지원), (2) 영역이 항상 채워진다(점 없음),
 *   (3) stacked 모드에서 영역 아래 경계가 이전 시리즈의 누적선이다.
 * v3는 그 셋만 재정의한다.
 *
 * 데이터 표면·JSON 슬롯·범례는 LineChart와 동일.
 */
import { JdLineChart } from "../line-chart/element.js";
import type { JdSeriesGeometry } from "../line-chart/element.js";
import { seriesColor } from "../../core/chart.js";
import type { JdPoint } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import areaChartStyles from "./area-chart.css.js";

export class JdAreaChart extends JdLineChart {
  static override tag = "jd-area-chart";
  static override props = {
    // 파생은 베이스 props를 좁힐 수 없다(정적 측 호환 — TS2417). `no-dots`는 상속되지만
    // 영역 차트는 점을 그리지 않으므로(dotsVisible=false) 동작이 없는 속성이다.
    ...JdLineChart.props,
    /** overlap | stacked */
    mode: { type: String, default: "overlap", reflect: true },
    /** 영역 투명도 0~1 (v2 fillOpacity, 기본 0.25) */
    fillOpacity: { type: Number, default: 0.25 },
  };

  declare mode: string;
  declare fillOpacity: number;

  protected override render(): void {
    adoptStyles(areaChartStyles);
    super.render();
  }

  protected override defaultLabel(): string {
    return "영역 차트";
  }

  /** 영역 차트에 점은 없다 — v2 외관 유지 */
  protected override dotsVisible(): boolean {
    return false;
  }

  protected get stacked(): boolean {
    return this.mode === "stacked";
  }

  /** v2와 동일하게 0을 바닥으로 고정한다(LineChart는 음수까지 도메인에 넣는다) */
  protected override domain(): { min: number; max: number; range: number } {
    let max = 0;
    if (this.stacked) {
      const count = this.categoryCount;
      for (let i = 0; i < count; i += 1) {
        let sum = 0;
        for (const s of this.series) sum += s.data[i] ?? 0;
        if (sum > max) max = sum;
      }
    } else {
      for (const s of this.series) {
        for (const v of s.data) if (v > max) max = v;
      }
    }
    return { min: 0, max, range: max || 1 };
  }

  protected override seriesGeometry(): JdSeriesGeometry[] {
    const { min, range } = this.domain();
    const count = this.categoryCount;
    const offsets = this.stacked ? new Array<number>(count).fill(0) : null;
    return this.series.map((s, si) => {
      const points: JdPoint[] = [];
      const base: JdPoint[] | null = offsets ? [] : null;
      for (let i = 0; i < s.data.length; i += 1) {
        const value = s.data[i] ?? 0;
        const bottom = offsets?.[i] ?? 0;
        const x = this.xAt(i, count);
        points.push({ x, y: this.yFor(bottom + value, min, range) });
        // v2는 아래 경계를 offsets 전체 길이로 만들어, 시리즈가 짧으면 영역이
        // 엉뚱한 x까지 닫혔다. 이 시리즈의 데이터 길이만큼만 만든다.
        base?.push({ x, y: this.yFor(bottom, min, range) });
      }
      if (offsets) {
        for (let i = 0; i < s.data.length; i += 1) offsets[i] = (offsets[i] ?? 0) + (s.data[i] ?? 0);
      }
      return { color: seriesColor(si, s.color), points, base, filled: true };
    });
  }

  protected override drawPlot(): void {
    const raw = Number(this.fillOpacity);
    const opacity = Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : 0.25;
    this.style.setProperty("--jd-chart-fill-opacity", String(opacity));
    super.drawPlot();
  }
}
