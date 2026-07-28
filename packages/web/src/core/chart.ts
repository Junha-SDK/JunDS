/**
 * 차트 공용 코어 (§6 R12) — Line·Area·Bar·Scatter·Pie·Radar·Funnel 7종의 공통 골격.
 *
 * v2의 차트 7개는 `PADDING = {top:12,right:12,bottom:28,left:36}` 상수, 5색 팔레트,
 * `buildPath()` 스무딩 함수, 눈금선·축 라벨 SVG, 범례 `<ul>`을 **각자 복사해** 갖고 있었다
 * (LineChart와 AreaChart의 buildPath는 문자 단위로 동일하다). 여기 한 번만 둔다.
 *
 * 계층: JdChartBase(호스트 의미·범례·데이터 표) → JdCartesianChart(SVG 프레임·눈금)
 *       → JdCategoryChart(labels + series 수집). 극좌표계(Pie·Radar)와 DOM 막대(Funnel)는
 *       JdChartBase에서 바로 갈라진다 — 뜻 없는 프로퍼티를 상속시키지 않기 위해서다
 *       (core/grid-picker.ts와 같은 판단).
 *
 * v2 대비 횡단 교정 4건:
 *  1. **AT에 숫자가 하나도 가지 않았다.** v2는 `<svg role="img" aria-label="라인 차트">`가
 *     전부라 스크린리더 사용자는 "라인 차트"라는 단어만 들었다. v3는 SVG를
 *     aria-hidden으로 두고 **시각적으로만 숨긴 데이터 표**를 함께 렌더한다 —
 *     light DOM이라 표가 그냥 문서의 표다(§3-24 shadow 경계 없음의 실리).
 *  2. **색이 SVG 표시 속성에 박혀 있었다.** `fill={color}`는 테마·상태별 CSS 오버라이드를
 *     원천 봉쇄하고, `fill="var(--primary)"`처럼 var()를 표시 속성에 넣는 것은
 *     브라우저별 지원이 갈린다. v3는 시리즈 그룹의 `--jd-series-color` 커스텀
 *     프로퍼티를 경유하고 실제 fill/stroke는 CSS가 건다(progress-ring과 같은 판단).
 *  3. **팔레트가 하드코딩 리터럴이었다.** `--jd-chart-1..7`로 승격해 소비자가 CSS만으로
 *     리브랜딩할 수 있다(§4.4-a).
 *  4. **경로 좌표가 부동소수 전개였다.** `x=123.45600000000002`가 프리렌더 스냅샷에
 *     그대로 실렸다. v3는 소수 2자리로 반올림 — 결정적이고 짧다(§3.1-3).
 *
 * Boolean 표면: v2의 `showGrid/showXAxis/showLegend/showDots/smooth` 기본 true는
 * attribute로 끌 수 없다(Boolean은 존재 여부가 값 §1.3). 레포 관용구대로 부정형
 * (`no-grid`·`no-legend`·`no-dots`·`no-smooth`)으로 뒤집는다 — container[no-center],
 * group[no-wrap], scroll-spy[no-smooth]와 같은 계열.
 */
import { JdElement } from "./element.js";

export const SVG_NS = "http://www.w3.org/2000/svg";

/** 팔레트 슬롯 수 — CSS의 `--jd-chart-1..7`과 짝 */
export const CHART_PALETTE_SLOTS = 7;

export interface JdPoint {
  x: number;
  y: number;
}

/** 축 눈금 하나 — pos는 뷰박스 절대 픽셀 */
export interface JdChartTick {
  pos: number;
  text: string;
}

export interface JdLegendItem {
  color: string;
  name: string;
  /** 이름 뒤 보조 수치(파이 백분율 등). 비우면 미표시 */
  value?: string;
  /** 색 견본 모양. 기본 square */
  shape?: "square" | "dot";
}

/** 값 목록형 데이터 (Pie·Funnel 공용) */
export interface JdValueDatum {
  label: string;
  value: number;
  color?: string;
}

/** name + number[] 시리즈 (Line·Area·Bar 공용) */
export interface JdChartSeries {
  name: string;
  data: number[];
  color?: string;
}

/* ── SVG 유틸 ─────────────────────────────────────────────── */

/**
 * SVG 노드 생성. `document.createElement("circle")`은 HTML 네임스페이스의 미지 요소가
 * 되어 **에러 없이 아무것도 그려지지 않는다** — 전 차트가 이 함수만 쓴다.
 */
export function svgNode<K extends keyof SVGElementTagNameMap>(
  name: K,
  className?: string,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, name);
  if (className) el.setAttribute("class", className);
  return el;
}

export function setAttrs(el: Element, attrs: Record<string, string | number>): void {
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
}

/** 좌표 반올림(소수 2자리) — 프리렌더 스냅샷 안정 + 경로 문자열 축소 */
export function coord(v: number): number {
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
}

/** 시리즈 색 — 명시색이 없으면 팔레트 슬롯(CSS 변수)을 돌려준다 */
export function seriesColor(index: number, explicit?: string): string {
  if (explicit) return explicit;
  return `var(--jd-chart-${(index % CHART_PALETTE_SLOTS) + 1})`;
}

/**
 * 꺾은선 경로. smooth면 Catmull-Rom 유사 3차 베지어 — v2 Line/AreaChart의
 * buildPath()와 수식이 같다(제어점 (p2-p0)/6, (p3-p1)/6).
 */
export function linePath(points: readonly JdPoint[], smooth: boolean): string {
  if (points.length === 0) return "";
  if (!smooth || points.length < 3) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${coord(p.x)},${coord(p.y)}`).join(" ");
  }
  const head = points[0]!;
  let d = `M${coord(head.x)},${coord(head.y)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p0 = points[i - 1] ?? p1;
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${coord(c1x)},${coord(c1y)} ${coord(c2x)},${coord(c2y)} ${coord(p2.x)},${coord(p2.y)}`;
  }
  return d;
}

/**
 * 눈금 텍스트. v2는 전부 `Math.round()`라 0~1 구간 데이터의 눈금이 "0 0 1 1 1"로
 * 뭉갰다 — 눈금 간격이 1 미만이면 자릿수를 늘린다(정수 데이터에서는 v2와 동일).
 */
export function tickText(value: number, step: number): string {
  if (!Number.isFinite(value)) return "";
  const gap = Math.abs(step);
  if (!Number.isFinite(gap) || gap === 0 || gap >= 1) return String(Math.round(value));
  return value.toFixed(gap >= 0.1 ? 1 : 2);
}

/**
 * 천 단위 구분 — `toLocaleString()`은 실행 환경 로케일에 따라 결과가 달라져
 * 프리렌더 HTML과 방문자 렌더가 어긋난다(§3.1-3). 직접 끊는다.
 */
export function groupDigits(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const neg = value < 0;
  const [int = "0", frac] = Math.abs(value).toString().split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}

/**
 * 선언적 초기화 슬롯 — 자식 `<script type="application/json">` 1회 소비
 * (§1.3의 명시 예외: 복합 데이터는 attribute 금지, `<jd-chart>`류는 슬롯 허용).
 */
export function readChartJson(host: Element): unknown {
  const script = host.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
  if (!script) return null;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(script.textContent || "null");
  } catch {
    console.warn(`[junds] <${host.localName}> JSON 슬롯 파싱 실패 — 무시합니다.`);
  }
  script.remove();
  return parsed;
}

/** 임의 입력 → 유한 수 배열 */
export function toNumbers(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  return v.map((n) => (typeof n === "number" && Number.isFinite(n) ? n : 0));
}

/** 임의 입력 → {label,value,color} 목록 */
export function toValueList(v: unknown): JdValueDatum[] {
  if (!Array.isArray(v)) return [];
  const out: JdValueDatum[] = [];
  for (const raw of v as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    const value = typeof raw.value === "number" && Number.isFinite(raw.value) ? raw.value : 0;
    out.push({
      label: typeof raw.label === "string" ? raw.label : "",
      value,
      color: typeof raw.color === "string" ? raw.color : undefined,
    });
  }
  return out;
}

/**
 * 임의 입력 → 시리즈 목록. name/data/color만 정규화하고 **나머지 키는 보존한다**
 * (LineChart의 `area` 같은 파생 고유 필드가 JSON 슬롯 경로에서도 살아남아야 한다).
 */
export function toSeriesList(v: unknown): JdChartSeries[] {
  if (!Array.isArray(v)) return [];
  const out: JdChartSeries[] = [];
  for (const raw of v as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    out.push({
      ...raw,
      name: typeof raw.name === "string" ? raw.name : "",
      data: toNumbers(raw.data),
      color: typeof raw.color === "string" ? raw.color : undefined,
    });
  }
  return out;
}

/** 양수 치수 강제 — 0·음수·NaN이면 폴백 (SVG는 음수 치수를 통째로 무시한다) */
export function positive(v: number, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * 업그레이드 전 프로퍼티 회수 — static props 밖의 **접근자 전용 데이터 표면**용.
 *
 * 베이스의 #upgradeProps()는 static props에 선언된 이름만 훑는다(§1.3). 배열 데이터는
 * property 전용이라 그 목록에 없어서, 정의 이전에 `el.series = [...]`가 실행되면 인스턴스
 * own 데이터 프로퍼티가 프로토타입 접근자를 영구히 가린다(표준 CE 함정). render()에서
 * 1회 회수한다.
 */
export function upgradeAccessor(host: object, name: string): void {
  if (!Object.prototype.hasOwnProperty.call(host, name)) return;
  const target = host as Record<string, unknown>;
  const value = target[name];
  delete target[name];
  target[name] = value;
}

/* ── JdChartBase ──────────────────────────────────────────── */

/**
 * 전 차트 공통: 호스트 의미(role=figure + 이름), 범례, 시각적으로만 숨긴 데이터 표.
 * 그리기는 파생의 paint()가 한다.
 */
export abstract class JdChartBase extends JdElement {
  static override props = {
    /** 접근 이름. 비우면 파생의 기본 이름 */
    label: { type: String },
  };

  declare label: string;

  protected legendEl!: HTMLUListElement;
  /** 숨김 데이터 표. 숨김 규칙은 래퍼가 쓴다(chart.styles.ts 주석) */
  protected tableEl!: HTMLTableElement;
  #tableWrap!: HTMLElement;
  #head!: HTMLTableSectionElement;
  #body!: HTMLTableSectionElement;
  /** 소비자가 마크업에 직접 쓴 aria-label — 자동 이름이 덮지 않는다 */
  #authoredLabel = "";

  /** 파생 기본 접근 이름 — "라인 차트" 등 */
  protected abstract defaultLabel(): string;
  /** 상태 반영 본체 — update()가 이름 갱신 후 호출한다 */
  protected abstract paint(): void;
  /** 범례 표시 여부. 기본 숨김 (v2에서 범례가 있던 차트만 켠다) */
  protected legendVisible(): boolean {
    return false;
  }

  protected render(): void {
    this.#authoredLabel = this.getAttribute("aria-label") ?? "";
    this.setAttribute("data-jd-chart", "");
    // role=img로 감싸면 안쪽 데이터 표까지 통째로 지워진다 — figure는 자식을 남긴다
    if (!this.hasAttribute("role")) this.setAttribute("role", "figure");

    // 입양(§3.3): 프리렌더/어댑터가 그린 골격이 있으면 재사용
    const legend = this.querySelector<HTMLUListElement>(":scope > .jd-chart__legend");
    if (legend) {
      this.legendEl = legend;
    } else {
      this.legendEl = document.createElement("ul");
      this.legendEl.className = "jd-chart__legend";
      this.legendEl.hidden = true;
      this.append(this.legendEl);
    }

    const wrap = this.querySelector<HTMLElement>(":scope > .jd-chart__data");
    if (wrap) {
      this.#tableWrap = wrap;
    } else {
      this.#tableWrap = document.createElement("div");
      this.#tableWrap.className = "jd-chart__data";
      this.append(this.#tableWrap);
    }
    const table = this.#tableWrap.querySelector("table");
    if (table) {
      this.tableEl = table;
    } else {
      this.tableEl = document.createElement("table");
      this.#tableWrap.append(this.tableEl);
    }
    this.#head = this.tableEl.tHead ?? this.tableEl.createTHead();
    this.#body = this.tableEl.tBodies[0] ?? this.tableEl.createTBody();
  }

  protected override update(): void {
    // 우선순위: label 프로퍼티 > 마크업의 aria-label > 파생 기본 이름
    const name = this.label || this.#authoredLabel || this.defaultLabel();
    this.setAttribute("aria-label", name);
    this.tableEl.setAttribute("aria-label", `${name} 데이터`);
    this.paint();
  }

  /** 범례 동기화 — 항목 수가 같으면 노드를 재사용한다 */
  protected syncLegend(items: readonly JdLegendItem[]): void {
    const list = this.legendEl;
    const visible = this.legendVisible() && items.length > 0;
    list.hidden = !visible;
    if (!visible) {
      list.textContent = "";
      return;
    }
    while (list.children.length > items.length) list.lastElementChild!.remove();
    while (list.children.length < items.length) {
      const li = document.createElement("li");
      li.className = "jd-chart__legend-item";
      const swatch = document.createElement("span");
      swatch.className = "jd-chart__swatch";
      swatch.setAttribute("aria-hidden", "true");
      const name = document.createElement("span");
      name.className = "jd-chart__legend-name";
      const value = document.createElement("span");
      value.className = "jd-chart__legend-value";
      li.append(swatch, name, value);
      list.append(li);
    }
    items.forEach((item, i) => {
      const li = list.children[i] as HTMLLIElement;
      li.style.setProperty("--jd-series-color", item.color);
      li.toggleAttribute("data-dot", item.shape === "dot");
      li.querySelector(".jd-chart__legend-name")!.textContent = item.name;
      const value = li.querySelector<HTMLElement>(".jd-chart__legend-value")!;
      value.textContent = item.value ?? "";
      value.hidden = !item.value;
    });
  }

  /**
   * 데이터 표 동기화. 첫 열은 행 머리(`th scope=row`)다 —
   * 표 내비게이션에서 "1월 · 매출 · 120"으로 읽히려면 행/열 머리가 둘 다 있어야 한다.
   */
  protected syncTable(head: readonly string[], rows: readonly (readonly string[])[]): void {
    this.#head.textContent = "";
    this.#body.textContent = "";
    // 빈 표는 접근성 트리에서도 지운다 — 보이는 DOM이 이미 값을 말하는 차트(Funnel)도 있다
    this.#tableWrap.hidden = head.length === 0 || rows.length === 0;
    if (this.#tableWrap.hidden) return;
    const hr = document.createElement("tr");
    for (const text of head) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = text;
      hr.append(th);
    }
    this.#head.append(hr);
    for (const row of rows) {
      const tr = document.createElement("tr");
      row.forEach((cell, i) => {
        if (i === 0) {
          const th = document.createElement("th");
          th.scope = "row";
          th.textContent = cell;
          tr.append(th);
        } else {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.append(td);
        }
      });
      this.#body.append(tr);
    }
  }
}

/* ── JdCartesianChart ─────────────────────────────────────── */

/**
 * 직교좌표 프레임 — SVG 3계층(격자·축·플롯), 눈금선, 축 라벨.
 * 파생은 눈금이 무엇인지(xTicks/yTicks)와 무엇을 그릴지(drawPlot)만 답한다.
 */
export abstract class JdCartesianChart extends JdChartBase {
  static override props = {
    ...JdChartBase.props,
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    /** 격자선 숨김 (v2 showGrid=true의 부정형) */
    noGrid: { type: Boolean, reflect: true },
    noXAxis: { type: Boolean, reflect: true, attribute: "no-x-axis" },
    noYAxis: { type: Boolean, reflect: true, attribute: "no-y-axis" },
  };

  declare width: number;
  declare height: number;
  declare noGrid: boolean;
  declare noXAxis: boolean;
  declare noYAxis: boolean;

  /** v2 PADDING 상수와 동일 */
  protected padTop = 12;
  protected padRight = 12;
  protected padBottom = 28;
  protected padLeft = 36;

  protected svg!: SVGSVGElement;
  protected gridLayer!: SVGGElement;
  protected axisLayer!: SVGGElement;
  protected plotLayer!: SVGGElement;

  protected get frameWidth(): number {
    return positive(this.width, 480);
  }
  protected get frameHeight(): number {
    return positive(this.height, 240);
  }
  protected get innerWidth(): number {
    return Math.max(0, this.frameWidth - this.padLeft - this.padRight);
  }
  protected get innerHeight(): number {
    return Math.max(0, this.frameHeight - this.padTop - this.padBottom);
  }
  /** 플롯 영역 바닥 y */
  protected get baseY(): number {
    return this.padTop + this.innerHeight;
  }

  protected abstract yTicks(): JdChartTick[];
  protected abstract xTicks(): JdChartTick[];
  protected abstract drawPlot(): void;
  /** 어느 축의 눈금이 격자선을 그리는가. 기본 = 가로선(y 눈금)만 */
  protected gridAxes(): { x: boolean; y: boolean } {
    return { x: false, y: true };
  }

  protected override render(): void {
    this.#buildFrame();
    super.render();
    this.update();
  }

  #buildFrame(): void {
    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-chart__svg");
    if (existing) {
      this.svg = existing;
      this.gridLayer = existing.querySelector(".jd-chart__grid")!;
      this.axisLayer = existing.querySelector(".jd-chart__axis")!;
      this.plotLayer = existing.querySelector(".jd-chart__plot")!;
      return;
    }
    this.svg = svgNode("svg", "jd-chart__svg");
    // 값은 데이터 표가 말한다 — SVG는 장식으로 둔다
    this.svg.setAttribute("aria-hidden", "true");
    this.gridLayer = svgNode("g", "jd-chart__grid");
    this.axisLayer = svgNode("g", "jd-chart__axis");
    this.plotLayer = svgNode("g", "jd-chart__plot");
    this.svg.append(this.gridLayer, this.axisLayer, this.plotLayer);
    this.prepend(this.svg);
  }

  protected override paint(): void {
    const w = this.frameWidth;
    const h = this.frameHeight;
    setAttrs(this.svg, { width: w, height: h, viewBox: `0 0 ${w} ${h}` });
    this.#paintFrame();
    this.drawPlot();
  }

  #paintFrame(): void {
    const grid = this.gridLayer;
    const axis = this.axisLayer;
    grid.textContent = "";
    axis.textContent = "";
    const ys = this.yTicks();
    const xs = this.xTicks();
    const axes = this.gridAxes();
    const right = this.frameWidth - this.padRight;

    if (!this.noGrid && axes.y) {
      for (const t of ys) {
        const line = svgNode("line", "jd-chart__gridline");
        setAttrs(line, { x1: this.padLeft, y1: coord(t.pos), x2: right, y2: coord(t.pos) });
        grid.append(line);
      }
    }
    if (!this.noGrid && axes.x) {
      for (const t of xs) {
        const line = svgNode("line", "jd-chart__gridline");
        setAttrs(line, {
          x1: coord(t.pos),
          y1: this.padTop,
          x2: coord(t.pos),
          y2: this.baseY,
        });
        grid.append(line);
      }
    }
    if (!this.noYAxis) {
      for (const t of ys) {
        if (!t.text) continue;
        const text = svgNode("text", "jd-chart__tick");
        setAttrs(text, { x: this.padLeft - 6, y: coord(t.pos + 3), "text-anchor": "end" });
        text.textContent = t.text;
        axis.append(text);
      }
    }
    if (!this.noXAxis) {
      for (const t of xs) {
        if (!t.text) continue;
        const text = svgNode("text", "jd-chart__tick");
        setAttrs(text, {
          x: coord(t.pos),
          y: this.frameHeight - 8,
          "text-anchor": "middle",
        });
        text.textContent = t.text;
        axis.append(text);
      }
    }
  }

  /** 시리즈 그룹 1개 — 색은 커스텀 프로퍼티로만 전달한다 */
  protected seriesGroup(color: string): SVGGElement {
    const g = svgNode("g", "jd-chart__series");
    g.style.setProperty("--jd-series-color", color);
    return g;
  }
}

/* ── JdCategoryChart ──────────────────────────────────────── */

/**
 * 카테고리 축 + 다중 시리즈 데이터 수집 (Line·Area·Bar 공용).
 * 복합 데이터는 property 전용(§1.3) + 선언적 초기화용 JSON 슬롯 1회 소비.
 */
export abstract class JdCategoryChart<
  S extends JdChartSeries = JdChartSeries,
> extends JdCartesianChart {
  #labels: string[] = [];
  #series: S[] = [];

  get labels(): string[] {
    return this.#labels;
  }
  set labels(v: string[]) {
    this.#labels = Array.isArray(v) ? v.map((s) => String(s)) : [];
    this.requestUpdate();
  }

  /** 파생이 시리즈 타입을 좁힌다(LineChart는 area 필드를 더한다) */
  get series(): S[] {
    return this.#series;
  }
  set series(v: S[]) {
    this.#series = toSeriesList(v) as S[];
    this.requestUpdate();
  }

  protected override render(): void {
    upgradeAccessor(this, "labels");
    upgradeAccessor(this, "series");
    // JSON 슬롯은 골격 구축 전에 1회 소비 — `[{…}]`(시리즈) 또는 `{labels, series}`.
    // 슬롯은 **초기값**이므로 이미 대입된 프로퍼티를 덮지 않는다(§1.3 마지막 쓰기 승리).
    const json = readChartJson(this);
    if (Array.isArray(json)) {
      if (this.#series.length === 0) this.#series = toSeriesList(json) as S[];
    } else if (json && typeof json === "object") {
      const obj = json as { labels?: unknown; series?: unknown };
      if (this.#labels.length === 0 && Array.isArray(obj.labels)) {
        this.#labels = obj.labels.map((s) => String(s));
      }
      if (this.#series.length === 0 && Array.isArray(obj.series)) {
        this.#series = toSeriesList(obj.series) as S[];
      }
    }
    super.render();
  }

  /** 카테고리 개수 — 라벨 수와 시리즈 최장 길이 중 큰 쪽 */
  protected get categoryCount(): number {
    let n = this.#labels.length;
    for (const s of this.#series) n = Math.max(n, s.data.length);
    return n;
  }

  /** i번째 카테고리의 x — 1개뿐이면 가운데(v2 xCount===1 분기와 동일) */
  protected xAt(index: number, count: number): number {
    if (count <= 1) return this.padLeft + this.innerWidth / 2;
    return this.padLeft + (index / (count - 1)) * this.innerWidth;
  }

  protected categoryLabel(index: number): string {
    return this.#labels[index] ?? "";
  }

  protected legendItemsFromSeries(): JdLegendItem[] {
    return this.#series.map((s, i) => ({ color: seriesColor(i, s.color), name: s.name }));
  }

  /** 데이터 표: 행=카테고리, 열=시리즈 */
  protected syncSeriesTable(): void {
    const count = this.categoryCount;
    if (count === 0 || this.#series.length === 0) {
      this.syncTable([], []);
      return;
    }
    const head = ["구분", ...this.#series.map((s, i) => s.name || `시리즈 ${i + 1}`)];
    const rows: string[][] = [];
    for (let i = 0; i < count; i += 1) {
      rows.push([
        this.categoryLabel(i) || String(i + 1),
        ...this.#series.map((s) => String(s.data[i] ?? 0)),
      ]);
    }
    this.syncTable(head, rows);
  }
}
