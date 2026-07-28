/**
 * <jd-bar-chart> — 경량 SVG 막대 차트 (v2 composites/BarChart).
 * vertical/horizontal × grouped/stacked 4조합.
 *
 * 데이터 2경로는 LineChart와 동일(property 또는 자식 JSON 슬롯).
 *
 * v2 대비 교정:
 *  - **음수 값이 막대를 지웠다.** `height={ratio*innerH}`가 음수가 되면 SVG는 rect를
 *    통째로 무시한다(에러도 없다). v3는 0으로 clamp한다 — 음수 축이 필요하면 LineChart다.
 *  - **축 라벨이 격자에 묶여 있었다.** v2는 showGrid=false면 눈금 숫자까지 사라졌다.
 *    v3는 `no-grid`(선)와 `no-y-axis`/`no-x-axis`(숫자)가 독립이다.
 *  - **labels보다 긴 데이터는 조용히 버려졌다.** v3는 카테고리 수를 라벨 수와 시리즈
 *    최장 길이의 큰 쪽으로 잡아 데이터가 사라지지 않는다.
 *  - 값이 AT에 가지 않던 문제 → 숨김 데이터 표(core/chart.ts).
 */
import { JdCategoryChart, coord, seriesColor, svgNode, tickText } from "../../core/chart.js";
import type { JdChartTick } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import barChartStyles from "./bar-chart.css.js";

/** v2 격자 비율 [0, .25, .5, .75, 1] */
const GRID_RATIOS = [0, 0.25, 0.5, 0.75, 1] as const;

export class JdBarChart extends JdCategoryChart {
  static override tag = "jd-bar-chart";
  static override props = {
    ...JdCategoryChart.props,
    /** vertical | horizontal */
    orientation: { type: String, default: "vertical", reflect: true },
    /** grouped | stacked */
    mode: { type: String, default: "grouped", reflect: true },
    /** 막대 끝 값 라벨 (v2 showValues, 기본 꺼짐) */
    showValues: { type: Boolean, reflect: true },
    /** 범례 표시 — v2에는 없던 opt-in */
    legend: { type: Boolean, reflect: true },
  };

  declare orientation: string;
  declare mode: string;
  declare showValues: boolean;
  declare legend: boolean;

  /** 시리즈별 그라데이션 id 접두사 — 인스턴스마다 유일해야 한다(#seriesGradient 주석) */
  #gradBase = "";

  protected override render(): void {
    adoptStyles(barChartStyles);
    // 페인트 서버 id는 문서 전역이다 — 같은 페이지에 막대 차트가 둘이면 뒤엣것의
    // url(#…)이 앞엣것의 그라데이션에 붙는다(candle-chart와 같은 함정).
    if (!this.#gradBase) this.#gradBase = jdUid("jd-bar-grad");
    super.render();
  }

  protected override defaultLabel(): string {
    return "막대 차트";
  }

  protected override legendVisible(): boolean {
    return this.legend;
  }

  protected get vertical(): boolean {
    return this.orientation !== "horizontal";
  }

  protected get stacked(): boolean {
    return this.mode === "stacked";
  }

  /** v2 max: stacked면 카테고리 합의 최댓값, 아니면 전체 최댓값. 항상 0 이상 */
  protected get maxValue(): number {
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
    return max;
  }

  /** 한 카테고리가 차지하는 축 길이 */
  protected get groupSize(): number {
    const span = this.vertical ? this.innerWidth : this.innerHeight;
    return span / Math.max(1, this.categoryCount);
  }

  /** 막대 1개의 두께 슬롯 — v2: groupSize / (barsPerGroup + 1) */
  protected get barSize(): number {
    const barsPerGroup = this.stacked ? 1 : Math.max(1, this.series.length);
    return this.groupSize / (barsPerGroup + 1);
  }

  /** 카테고리 축의 눈금 — 그룹 중앙 */
  #categoryTicks(): JdChartTick[] {
    const start = this.vertical ? this.padLeft : this.padTop;
    const size = this.groupSize;
    const ticks: JdChartTick[] = [];
    for (let i = 0; i < this.categoryCount; i += 1) {
      ticks.push({ pos: start + i * size + size / 2, text: this.categoryLabel(i) });
    }
    return ticks;
  }

  /** 값 축의 눈금 — v2와 같은 5등분 */
  #valueTicks(): JdChartTick[] {
    const max = this.maxValue;
    const step = max / 4;
    return GRID_RATIOS.map((t) => ({
      pos: this.vertical
        ? this.padTop + this.innerHeight - t * this.innerHeight
        : this.padLeft + t * this.innerWidth,
      text: tickText(t * max, step),
    }));
  }

  protected override yTicks(): JdChartTick[] {
    return this.vertical ? this.#valueTicks() : this.#categoryTicks();
  }

  protected override xTicks(): JdChartTick[] {
    return this.vertical ? this.#categoryTicks() : this.#valueTicks();
  }

  protected override gridAxes(): { x: boolean; y: boolean } {
    return { x: !this.vertical, y: this.vertical };
  }

  protected override drawPlot(): void {
    const plot = this.plotLayer;
    plot.textContent = "";
    const range = this.maxValue || 1;
    const count = this.categoryCount;
    const groupSize = this.groupSize;
    const barSize = this.barSize;
    const stacked = this.stacked;
    const vertical = this.vertical;
    /** 카테고리별 누적 비율 — 시리즈를 바깥 루프로 돌려도 v2와 쌓임 순서가 같다 */
    const acc = new Array<number>(count).fill(0);

    this.series.forEach((s, si) => {
      const g = this.seriesGroup(seriesColor(si, s.color));
      g.append(this.#seriesGradient(si));
      g.style.setProperty("--jd-bar-fill", `url(#${this.#gradBase}-${si})`);
      for (let gi = 0; gi < count; gi += 1) {
        const value = s.data[gi] ?? 0;
        // 음수는 SVG 치수로 쓸 수 없다(rect가 통째로 사라진다) — 0으로 clamp
        const ratio = Math.max(0, value / range);
        const offset = gi * groupSize;
        const stackAcc = acc[gi] ?? 0;
        const lane = stacked ? barSize / 2 : barSize / 2 + si * barSize;
        const rect = svgNode("rect", "jd-chart__bar");
        rect.setAttribute("rx", "2");

        if (vertical) {
          const x = this.padLeft + offset + lane;
          const h = ratio * this.innerHeight;
          const y = stacked ? this.baseY - (stackAcc + ratio) * this.innerHeight : this.baseY - h;
          rect.setAttribute("x", String(coord(x)));
          rect.setAttribute("y", String(coord(y)));
          rect.setAttribute("width", String(coord(barSize * 0.8)));
          rect.setAttribute("height", String(coord(h)));
          g.append(rect);
          if (this.showValues) {
            const text = svgNode("text", "jd-chart__value");
            text.setAttribute("x", String(coord(x + barSize * 0.4)));
            text.setAttribute("y", String(coord(y - 4)));
            text.setAttribute("text-anchor", "middle");
            text.textContent = String(value);
            g.append(text);
          }
        } else {
          const y = this.padTop + offset + lane;
          const w = ratio * this.innerWidth;
          const x = stacked ? this.padLeft + stackAcc * this.innerWidth : this.padLeft;
          rect.setAttribute("x", String(coord(x)));
          rect.setAttribute("y", String(coord(y)));
          rect.setAttribute("width", String(coord(w)));
          rect.setAttribute("height", String(coord(barSize * 0.8)));
          g.append(rect);
          if (this.showValues) {
            const text = svgNode("text", "jd-chart__value");
            text.setAttribute("x", String(coord(x + w + 4)));
            text.setAttribute("y", String(coord(y + barSize * 0.5)));
            g.append(text);
          }
        }
        if (stacked) acc[gi] = stackAcc + ratio;
      }
      plot.append(g);
    });

    this.syncLegend(this.legendItemsFromSeries());
    this.syncSeriesTable();
  }

  /**
   * 시리즈 그룹 **안**에 두는 세로 그라데이션 — 채움만 있는 막대는 색종이로 읽힌다
   * (VISUAL-BAR §2). SVG의 fill은 CSS 그라디언트를 받지 못하고 페인트 서버는 문서
   * 안에 있어야 해서, 이 한 조각만 DOM으로 만든다.
   *
   * 그룹 밖에 두면 안 된다: 페인트 서버는 **참조하는 요소가 아니라 자기 자리에서**
   * 상속을 받으므로, 밖에 있으면 stop-color가 그 시리즈의 --jd-series-color를 못 본다.
   * 색 자체는 여전히 CSS만 안다 — .jd-chart__bar-stop-* 규칙이 계열색에서 파생시킨다.
   */
  #seriesGradient(index: number): SVGDefsElement {
    const defs = svgNode("defs");
    const grad = svgNode("linearGradient");
    grad.setAttribute("id", `${this.#gradBase}-${index}`);
    // 기본 objectBoundingBox — 막대마다 제 높이에 맞춰 위에서 빛이 떨어진다
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    const top = svgNode("stop", "jd-chart__bar-stop-top");
    top.setAttribute("offset", "0%");
    const bottom = svgNode("stop", "jd-chart__bar-stop-bottom");
    bottom.setAttribute("offset", "100%");
    grad.append(top, bottom);
    defs.append(grad);
    return defs;
  }
}
