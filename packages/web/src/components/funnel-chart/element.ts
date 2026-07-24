/**
 * <jd-funnel-chart> — 단계별 전환율 퍼널 (v2 composites/FunnelChart).
 * 유일하게 SVG가 아닌 차트다 — 막대가 그냥 DOM 박스라 텍스트가 선택·복사되고
 * 값이 별도 대체 표 없이 그대로 접근성 트리에 있다(그래서 숨김 데이터 표를 만들지 않는다).
 *
 * 데이터 2경로: `el.data = [{label,value,color?}]` 또는
 * 자식 `<script type="application/json">[…]</script>`.
 *
 * v2 대비 교정:
 *  1. **모든 값이 0이면 폭이 `NaN%`였다.** `value/maxVal`의 0/0 — 분모를 1로 폴백한다.
 *  2. **이전 단계가 0이면 전환율이 `Infinity%`였다.** 0 나눗셈이면 전환율을 숨긴다.
 *  3. **`toLocaleString()`이 환경 로케일에 따라 달랐다.** 프리렌더 HTML과 방문자
 *     렌더가 어긋난다(§3.1-3) → 결정적 천 단위 구분자.
 *  4. 목록이 의미 없는 div 더미였다 → `<ol>`/`<li>`(순서 있는 단계).
 *  5. 단계가 0개면 v2는 컴포넌트 자체를 null로 지웠다 → v3는 호스트를 유지하고
 *     목록만 비운다(레이아웃이 튀지 않는다).
 */
import {
  JdChartBase,
  groupDigits,
  positive,
  readChartJson,
  seriesColor,
  toValueList,
  upgradeAccessor,
} from "../../core/chart.js";
import type { JdValueDatum } from "../../core/chart.js";
import { adoptStyles } from "../../core/styles.js";
import funnelChartStyles from "./funnel-chart.css.js";

export class JdFunnelChart extends JdChartBase {
  static override tag = "jd-funnel-chart";
  static override props = {
    ...JdChartBase.props,
    /** 전체 높이(px) — 단계 수로 나눠 각 행 높이가 된다 */
    height: { type: Number, default: 300 },
  };

  declare height: number;

  #data: JdValueDatum[] = [];
  #list!: HTMLOListElement;

  get data(): JdValueDatum[] {
    return this.#data;
  }
  set data(v: JdValueDatum[]) {
    this.#data = toValueList(v);
    this.requestUpdate();
  }

  protected override render(): void {
    adoptStyles(funnelChartStyles);
    upgradeAccessor(this, "data");
    if (this.#data.length === 0) {
      const json = readChartJson(this);
      this.#data = toValueList(Array.isArray(json) ? json : (json as { data?: unknown })?.data);
    }
    const existing = this.querySelector<HTMLOListElement>(":scope > .jd-funnel-chart__steps");
    if (existing) {
      this.#list = existing;
    } else {
      this.#list = document.createElement("ol");
      this.#list.className = "jd-funnel-chart__steps";
      this.prepend(this.#list);
    }
    super.render();
    this.update();
  }

  protected override defaultLabel(): string {
    return "퍼널 차트";
  }

  protected override paint(): void {
    const data = this.#data;
    const list = this.#list;
    if (list.children.length !== data.length) {
      list.textContent = "";
      for (let i = 0; i < data.length; i += 1) list.append(this.#buildStep());
    }
    if (data.length === 0) {
      this.syncTable([], []);
      return;
    }

    const height = positive(this.height, 300);
    const stepH = height / data.length;
    let max = 0;
    for (const d of data) if (d.value > max) max = d.value;
    const range = max || 1; // v2는 0/0 → NaN%

    data.forEach((d, i) => {
      const li = list.children[i] as HTMLLIElement;
      const bar = li.querySelector<HTMLElement>(".jd-funnel-chart__bar")!;
      const label = li.querySelector<HTMLElement>(".jd-funnel-chart__label")!;
      const rate = li.querySelector<HTMLElement>(".jd-funnel-chart__rate")!;
      li.style.height = `${stepH}px`;
      bar.style.height = `${Math.max(0, stepH - 4)}px`;
      bar.style.width = `${Math.min(100, Math.max(0, (d.value / range) * 100))}%`;
      bar.style.setProperty("--jd-series-color", seriesColor(i, d.color));
      bar.textContent = groupDigits(d.value);
      label.textContent = d.label;
      const prev = data[i - 1]?.value ?? 0;
      const converted = i > 0 && prev > 0;
      rate.textContent = converted ? `전환: ${((d.value / prev) * 100).toFixed(1)}%` : "";
      rate.hidden = !converted;
    });

    // 보이는 DOM이 이미 단계·값·전환율을 말한다 — 숨김 표를 겹쳐 읽히지 않게 비운다
    this.syncTable([], []);
  }

  #buildStep(): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-funnel-chart__step";
    const track = document.createElement("div");
    track.className = "jd-funnel-chart__track";
    const bar = document.createElement("div");
    bar.className = "jd-funnel-chart__bar";
    track.append(bar);
    const meta = document.createElement("div");
    meta.className = "jd-funnel-chart__meta";
    const label = document.createElement("p");
    label.className = "jd-funnel-chart__label";
    const rate = document.createElement("p");
    rate.className = "jd-funnel-chart__rate";
    meta.append(label, rate);
    li.append(track, meta);
    return li;
  }
}
