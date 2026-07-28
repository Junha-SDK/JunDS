/**
 * <jd-metric-card> — 지표 카드 + 스파크라인 (v2 composites/MetricCard) = **StatCard 파생**.
 *
 * v2 MetricCard는 StatCard와 라벨/값/아이콘/카드 크롬이 사실상 같고, 다른 것은
 * (a) 변화량이 값 옆이 아니라 아래 줄이고 changeLabel이 따라붙는다, (b) 스파크라인이
 * 있다 — 둘뿐이다. 그래서 StatCard를 상속하고 이 두 가지만 얹는다(§6 R12).
 *
 * 판단 4건:
 * 1. **스파크라인 SVG는 createElementNS로 만든다.** 좌표가 데이터마다 달라 문자열
 *    템플릿을 innerHTML로 밀어 넣게 되는데, 그 경로는 HTML 파서를 타고 SVG 네임스페이스
 *    함정으로 직결된다. 노드를 재사용하므로 값 갱신 때 DOM 재생성도 없다.
 * 2. **데이터는 property + JSON 슬롯**(§1.3 — 배열은 attribute 금지). 선언적 초기화는
 *    자식 `<script type="application/json">[1,2,3]</script>`로(jd-radio-group 선례).
 * 3. **그라디언트 id는 jdUid**. v2는 `spark-fill-${label}`이라 같은 라벨의 카드가 두 개면
 *    id가 충돌해 한쪽 채우기가 다른 카드를 가리켰다(문서 전역 id 공간). jdUid는 증분
 *    카운터라 Math.random 금지 규칙(§3.1-3)과도 정합하고 프리렌더 스냅샷이 안정하다.
 * 4. **스파크라인은 aria-hidden**. 좌표 20개를 낭독해서 얻을 정보가 없고, 같은 정보를
 *    값과 변화량이 이미 텍스트로 말한다. 대안 텍스트를 지어내는 대신 장식으로 명시했다.
 *
 * v2 결함 승계 안 함 2건:
 * - v2는 `change >= 0`이라 0%도 "↑"였다. jd-stat의 판정(0 → flat)을 그대로 쓴다 —
 *   변동 없음을 상승으로 그리지 않는다.
 * - v2 SVG는 `w-full` + viewBox 200×48에 기본 preserveAspectRatio(meet)라, 카드가
 *   200px보다 넓으면 그림이 가운데 200px에 고정되고 양옆이 비었다(의도와 다른 표시).
 *   `preserveAspectRatio="none"` + non-scaling-stroke로 폭을 채우되 선 굵기는 유지한다.
 */
import { JdStatCard } from "../stat-card/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import metricCardStyles from "./metric-card.css.js";

const NS = "http://www.w3.org/2000/svg";
/** v2 지오메트리 그대로 — viewBox 200×48, 안쪽 여백 4 */
const W = 200;
const H = 48;
const PAD = 4;

/** 부동소수 꼬리를 잘라 프리렌더 스냅샷 diff를 안정화(jd-clock 선례) */
const num = (v: number): string => String(Math.round(v * 1000) / 1000);

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(NS, tag);
}

export class JdMetricCard extends JdStatCard {
  static override tag = "jd-metric-card";
  static override props = {
    ...JdStatCard.props,
    /** 변화량 옆 보조 텍스트 (예: "전월 대비") */
    changeLabel: { type: String },
  };

  declare changeLabel: string;

  #points: number[] = [];
  #svg: SVGSVGElement | null = null;
  #area: SVGPolygonElement | null = null;
  #line: SVGPolylineElement | null = null;
  #head: SVGCircleElement | null = null;
  #gradientId = "";

  /** 스파크라인 데이터 (§1.3 복합 데이터는 property 전용) */
  get sparkline(): number[] {
    return this.#points;
  }
  set sparkline(v: number[]) {
    this.#points = Array.isArray(v) ? v.filter((n) => Number.isFinite(n)) : [];
    this.requestUpdate();
  }

  protected override render(): void {
    // 순서가 계약이다: JSON 슬롯은 골격 이동(§10.1) 전에 소비해야 값 노드로 끌려가지
    // 않고, 스파크라인 입양은 super.render()가 부르는 update() **전에** 끝나야
    // 이미 그려진 SVG 옆에 두 번째를 만들지 않는다.
    this.#readJsonSlot();
    this.#adoptSpark();
    super.render();
    adoptStyles(metricCardStyles);
  }

  /** 입양 규칙(§3.3) — 프리렌더·어댑터가 그린 SVG가 있으면 노드를 재사용한다 */
  #adoptSpark(): void {
    const svg = this.querySelector<SVGSVGElement>(":scope > .jd-metric-card__spark");
    if (!svg) return;
    this.#svg = svg;
    this.#area = svg.querySelector("polygon");
    this.#line = svg.querySelector("polyline");
    this.#head = svg.querySelector("circle");
    this.#gradientId = svg.querySelector("linearGradient")?.id ?? "";
  }

  protected override changeLabelText(): string {
    return this.changeLabel;
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed))
        this.#points = parsed.filter((n): n is number => Number.isFinite(n));
    } catch {
      console.warn("[junds] <jd-metric-card> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    super.update();
    this.#paintSpark();
  }

  #paintSpark(): void {
    const pts = this.#points;
    // v2와 같은 조건: 점이 2개 미만이면 선을 그릴 수 없다
    if (pts.length < 2) {
      this.#svg?.remove();
      this.#svg = this.#area = this.#line = this.#head = null;
      return;
    }
    if (!this.#svg) this.#buildSpark();

    const max = Math.max(...pts);
    const min = Math.min(...pts);
    const range = max - min || 1; // 평평한 데이터는 1로 나눠 중앙선(v2 동형)
    const step = (W - PAD * 2) / (pts.length - 1);
    const y = (v: number): number => H - PAD - ((v - min) / range) * (H - PAD * 2);

    const line = pts.map((v, i) => `${num(PAD + i * step)},${num(y(v))}`).join(" ");
    const lastX = PAD + (pts.length - 1) * step;
    this.#line?.setAttribute("points", line);
    this.#area?.setAttribute(
      "points",
      `${num(PAD)},${num(H - PAD)} ${line} ${num(lastX)},${num(H - PAD)}`,
    );
    this.#head?.setAttribute("cx", num(lastX));
    this.#head?.setAttribute("cy", num(y(pts[pts.length - 1] as number)));
  }

  #buildSpark(): void {
    const svg = svgEl("svg");
    svg.setAttribute("class", "jd-metric-card__spark");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true"); // 판단 4 — 값·변화량이 이미 말한다

    if (!this.#gradientId) this.#gradientId = jdUid("jd-spark");
    const defs = svgEl("defs");
    const grad = svgEl("linearGradient");
    grad.id = this.#gradientId;
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    const top = svgEl("stop");
    top.setAttribute("offset", "0%");
    top.setAttribute("stop-color", "currentColor");
    top.setAttribute("stop-opacity", "0.15");
    const bottom = svgEl("stop");
    bottom.setAttribute("offset", "100%");
    bottom.setAttribute("stop-color", "currentColor");
    bottom.setAttribute("stop-opacity", "0");
    grad.append(top, bottom);
    defs.append(grad);

    const area = svgEl("polygon");
    area.setAttribute("fill", `url(#${this.#gradientId})`);
    const line = svgEl("polyline");
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "currentColor");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    line.setAttribute("vector-effect", "non-scaling-stroke"); // 가로로 늘려도 선 굵기 유지
    const head = svgEl("circle");
    head.setAttribute("r", "3");
    head.setAttribute("fill", "currentColor");

    svg.append(defs, area, line, head);
    this.append(svg);
    this.#svg = svg;
    this.#area = area;
    this.#line = line;
    this.#head = head;
  }
}
