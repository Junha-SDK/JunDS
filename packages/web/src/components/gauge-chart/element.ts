/**
 * <jd-gauge-chart> — 반원(240°) 게이지 (v2 composites/GaugeChart).
 *
 * SVG는 **createElementNS**로 만든다(§6-1). 호(arc) d 문자열은 값마다 달라지므로
 * innerHTML 유혹이 큰 자리지만, 그 경로는 네임스페이스 함정으로 직결된다.
 *
 * 구간(segments)은 property + JSON 슬롯(§1.3 — 배열은 attribute 금지).
 *
 * v2 대비 교정 4건:
 *  1. **바늘이 정반대를 가리켰다.** `polarToCartesian(needleAngle - 180 + 360)`은
 *     결국 `needleAngle + 180`이다 — 0%에서 바늘이 오른쪽 위(값 100% 쪽 너머)를,
 *     100%에서 왼쪽 위를 가리켰다. 게이지에서 바늘이 값을 안 가리키면 그건 눈금이
 *     아니라 오독 유발 장치다. `needleAngle` 그대로 쓴다.
 *  2. **뷰박스와 표시 크기의 비율이 어긋나 그림이 85%로 줄어 있었다.**
 *     `width=size height=size*0.7`인데 viewBox는 `size × (size*0.7+20)` —
 *     preserveAspectRatio 기본값(meet)이 세로에 맞춰 전체를 84.8%로 축소하고
 *     좌우에 12px씩 빈 띠를 남겼다. 표시 높이를 뷰박스와 같게 맞춘다(1:1 매핑).
 *  3. **의미가 0이었다.** div+svg뿐이라 AT에는 "72"라는 숫자 하나만 있었고 그것이
 *     무엇의, 어느 범위 안의 값인지는 전달되지 않았다. 호스트가 role="meter"
 *     (valuemin/valuemax/valuenow + 이름)를 맡고 svg는 aria-hidden 장식이 된다.
 *     progressbar가 아니라 meter인 이유: 진행이 아니라 순간 측정값이다.
 *  4. **min ≥ max, 비수치 입력에서 NaN 좌표가 나왔다.** 좌표가 NaN이면 SVG는
 *     경고 없이 통째로 사라진다. 범위가 무효면 0%로 떨어뜨린다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import gaugeChartStyles from "./gauge-chart.css.js";

const NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(NS, tag);
}

/** 부동소수 꼬리를 잘라 프리렌더 스냅샷 diff를 안정화 */
const num = (v: number): string => String(Math.round(v * 1000) / 1000);

/** v2 지오메트리 — 7시 방향(-210°)에서 시작해 시계방향 240° */
const START_ANGLE = -210;
const TOTAL_ANGLE = 240;

export interface JdGaugeSegment {
  /** CSS 색 */
  color: string;
  /** 구간 시작(백분율 0~100) */
  from: number;
  /** 구간 끝(백분율 0~100) */
  to: number;
}

/** v2 기본 3구간 — Tailwind var(--danger|warning|success) → jd 토큰 */
const DEFAULT_SEGMENTS: readonly JdGaugeSegment[] = [
  { color: "var(--jd-color-danger)", from: 0, to: 33 },
  { color: "var(--jd-color-warning)", from: 33, to: 66 },
  { color: "var(--jd-color-success)", from: 66, to: 100 },
];

export class JdGaugeChart extends JdElement {
  static override tag = "jd-gauge-chart";
  static override props = {
    value: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    /** 중앙 아래 라벨 겸 접근 이름 */
    label: { type: String },
    /** 차트 가로 크기(px) */
    size: { type: Number, default: 160 },
  };

  declare value: number;
  declare min: number;
  declare max: number;
  declare label: string;
  declare size: number;

  #segments: readonly JdGaugeSegment[] = DEFAULT_SEGMENTS;
  #svg!: SVGSVGElement;
  #track!: SVGGElement;
  #arc!: SVGPathElement;
  #needle!: SVGLineElement;
  #pivot!: SVGCircleElement;
  #valueText!: SVGTextElement;
  #labelText!: SVGTextElement;

  /** 구간 색 정의 (§1.3 복합 데이터는 property 전용) */
  get segments(): readonly JdGaugeSegment[] {
    return this.#segments;
  }
  set segments(v: readonly JdGaugeSegment[]) {
    this.#segments = Array.isArray(v) && v.length > 0 ? v : DEFAULT_SEGMENTS;
    this.requestUpdate();
  }

  /** 0~1로 정규화된 현재 값 */
  get progress(): number {
    const min = Number(this.min);
    const max = Number(this.max);
    const value = Number(this.value);
    if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(value)) return 0;
    if (max <= min) return 0; // 교정 4 — 무효 범위는 0%
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
  }

  protected render(): void {
    adoptStyles(gaugeChartStyles);
    this.#readJsonSlot();

    // 입양(§3.3) — 프리렌더·어댑터가 그린 골격이 있으면 재사용
    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-gauge-chart__svg");
    this.#svg = existing ?? this.#build();
    this.#track = this.#svg.querySelector<SVGGElement>(".jd-gauge-chart__track")!;
    this.#arc = this.#svg.querySelector<SVGPathElement>(".jd-gauge-chart__value-arc")!;
    this.#needle = this.#svg.querySelector<SVGLineElement>(".jd-gauge-chart__needle")!;
    this.#pivot = this.#svg.querySelector<SVGCircleElement>(".jd-gauge-chart__pivot")!;
    this.#valueText = this.#svg.querySelector<SVGTextElement>(".jd-gauge-chart__value-text")!;
    this.#labelText = this.#svg.querySelector<SVGTextElement>(".jd-gauge-chart__label-text")!;

    this.setAttribute("role", "meter"); // 교정 3 — 진행이 아니라 측정값
    this.setAttribute("aria-valuemin", "0");
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 */
  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.#segments = parsed as JdGaugeSegment[];
      }
    } catch {
      console.warn("[junds] <jd-gauge-chart> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): SVGSVGElement {
    const svg = svgEl("svg");
    svg.setAttribute("class", "jd-gauge-chart__svg");
    svg.setAttribute("aria-hidden", "true"); // 값은 호스트 role=meter가 말한다

    const track = svgEl("g");
    track.setAttribute("class", "jd-gauge-chart__track");

    const arc = svgEl("path");
    arc.setAttribute("class", "jd-gauge-chart__value-arc");

    const needle = svgEl("line");
    needle.setAttribute("class", "jd-gauge-chart__needle");

    const pivot = svgEl("circle");
    pivot.setAttribute("class", "jd-gauge-chart__pivot");
    pivot.setAttribute("r", "4");

    const valueText = svgEl("text");
    valueText.setAttribute("class", "jd-gauge-chart__value-text");
    valueText.setAttribute("text-anchor", "middle");

    const labelText = svgEl("text");
    labelText.setAttribute("class", "jd-gauge-chart__label-text");
    labelText.setAttribute("text-anchor", "middle");

    svg.append(track, arc, needle, pivot, valueText, labelText);
    this.append(svg);
    return svg;
  }

  protected override update(): void {
    const size = this.#px(this.size, 160);
    const boxH = size * 0.7 + 20; // v2 viewBox 높이
    const r = Math.max(0, size / 2 - 12);
    const cx = size / 2;
    const cy = size / 2 + 10;
    const pct = this.progress;

    // 교정 2 — 표시 크기 = 뷰박스 크기(축소·여백 없음)
    this.#svg.setAttribute("width", num(size));
    this.#svg.setAttribute("height", num(boxH));
    this.#svg.setAttribute("viewBox", `0 0 ${num(size)} ${num(boxH)}`);

    // 구간 호 — 개수가 같으면 만들지 않고 좌표만 갱신(입양)
    const segs = this.#segments;
    const paths = Array.from(this.#track.children) as SVGPathElement[];
    if (paths.length !== segs.length) {
      this.#track.replaceChildren(
        ...segs.map(() => {
          const p = svgEl("path");
          p.setAttribute("class", "jd-gauge-chart__segment");
          return p;
        }),
      );
    }
    const segEls = Array.from(this.#track.children) as SVGPathElement[];
    segs.forEach((seg, i) => {
      const el = segEls[i];
      if (!el) return;
      el.setAttribute("d", this.#arcPath(this.#pctOf(seg.from), this.#pctOf(seg.to), r, cx, cy));
      el.style.setProperty("--jd-gauge-chart-segment", seg.color);
    });

    // 값 호 + 활성 구간 색
    this.#arc.setAttribute("d", this.#arcPath(0, pct, r, cx, cy));
    const active = segs.find((s) => pct * 100 >= s.from && pct * 100 <= s.to);
    if (active) this.#arc.style.setProperty("--jd-gauge-chart-active", active.color);
    else this.#arc.style.removeProperty("--jd-gauge-chart-active");

    // 교정 1 — 바늘은 값을 가리킨다
    const tip = this.#polar(START_ANGLE + pct * TOTAL_ANGLE, r, cx, cy);
    this.#needle.setAttribute("x1", num(cx));
    this.#needle.setAttribute("y1", num(cy));
    this.#needle.setAttribute("x2", num(tip.x));
    this.#needle.setAttribute("y2", num(tip.y));
    this.#pivot.setAttribute("cx", num(cx));
    this.#pivot.setAttribute("cy", num(cy));

    const value = Number.isFinite(Number(this.value)) ? Number(this.value) : 0;
    this.#valueText.setAttribute("x", num(cx));
    this.#valueText.setAttribute("y", num(cy + 24));
    this.#valueText.textContent = String(value);

    this.#labelText.setAttribute("x", num(cx));
    this.#labelText.setAttribute("y", num(cy + 38));
    this.#labelText.textContent = this.label;
    this.#labelText.toggleAttribute("hidden", !this.label);

    const min = Number.isFinite(Number(this.min)) ? Number(this.min) : 0;
    const max = Number.isFinite(Number(this.max)) ? Number(this.max) : 100;
    this.setAttribute("aria-valuemin", num(min));
    this.setAttribute("aria-valuemax", num(max));
    this.setAttribute("aria-valuenow", num(Math.min(Math.max(value, min), Math.max(min, max))));
    this.setAttribute("aria-label", this.label || "게이지");
  }

  /** 백분율(0~100) → 0~1 비율. 뒤집힌 구간·범위 밖 값도 잘라낸다 */
  #pctOf(v: number): number {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.min(1, Math.max(0, n / 100));
  }

  #polar(angle: number, r: number, cx: number, cy: number): { x: number; y: number } {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  /** from·to는 0~1 비율 */
  #arcPath(from: number, to: number, r: number, cx: number, cy: number): string {
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    const start = this.#polar(START_ANGLE + lo * TOTAL_ANGLE, r, cx, cy);
    const end = this.#polar(START_ANGLE + hi * TOTAL_ANGLE, r, cx, cy);
    const largeArc = (hi - lo) * TOTAL_ANGLE > 180 ? 1 : 0;
    return `M ${num(start.x)} ${num(start.y)} A ${num(r)} ${num(r)} 0 ${largeArc} 1 ${num(
      end.x,
    )} ${num(end.y)}`;
  }

  #px(v: number, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }
}
