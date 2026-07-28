/**
 * <jd-sparkline> — 추세 스파크라인 (v2 finance/Sparkline).
 *
 * jd-mini-chart의 자매 컴포넌트다(파생 아님). 겹치는 것은 "폴리라인 + 마지막 점"
 * 골격뿐이고, Sparkline은 프롭 표면이 다르다 — **그라디언트 채움(fill)·기준선
 * (showBaseline)·획 두께(strokeWidth)·명시 색(color)** 을 추가로 받고, bar/area 타입은
 * 없다. mini-chart를 확장하면 쓰지 않을 type 분기를 상속하고 색 모델(currentColor 고정)이
 * 충돌하므로 별도 컴포넌트로 둔다.
 *
 * SVG는 createElementNS로 만든다(§6-1 네임스페이스 함정): 좌표가 데이터마다 달라
 * 문자열 innerHTML로 밀기 쉬운데, 그 경로는 HTML 파서를 타고 미지 요소로 앉아
 * 아무것도 그려지지 않는다.
 *
 * 데이터는 property + JSON 슬롯(§1.3 — 배열은 attribute 금지):
 *  1. `data` 프로퍼티 (number[])
 *  2. 자식 `<script type="application/json">[1,2,3]</script>` (jd-mini-chart 선례)
 *
 * v2 대비 교정 2건:
 *  1. **장식/정보 구분.** v2는 role/label이 아예 없었다. `label`을 주면 role=img +
 *     aria-label로 승격, 없으면 장식(aria-hidden)으로 남긴다.
 *  2. **비수치 오염 방어.** NaN/Infinity가 섞이면 좌표가 NaN이 되어 path 전체가
 *     사라진다(에러도 없이). 대입 시점에 걸러낸다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import sparklineStyles from "./sparkline.css.js";

const NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(NS, tag);
}

/** 부동소수 꼬리를 잘라 프리렌더 스냅샷 diff를 안정화(jd-mini-chart·jd-metric-card 선례) */
const num = (v: number): string => String(Math.round(v * 10) / 10);

export class JdSparkline extends JdElement {
  static override tag = "jd-sparkline";
  static override props = {
    width: { type: Number, default: 80 },
    height: { type: Number, default: 24 },
    /** 선/점 색(CSS 색). 비우면 success 토큰(= v2 --bm-up) */
    color: { type: String },
    /** 채움 그라디언트 기준 색(예: "var(--jd-color-success)"). 주면 면적 채움 */
    fill: { type: String },
    /**
     * 마지막 값의 끝점을 끈다. 기본은 점을 찍는다(= v2 showEndDot 기본 true).
     * Boolean attribute는 존재=true라 default:true를 표현할 수 없어(§1.3) 부정형으로
     * 뒤집는다 — 형제 no-volume/no-arrow 선례. attribute `no-end-dot`(auto-kebab).
     */
    noEndDot: { type: Boolean },
    /** 첫 값 위치에 점선 기준선 (v2 기본 false) */
    showBaseline: { type: Boolean },
    /** 선 두께 (v2 기본 1.6) */
    strokeWidth: { type: Number, default: 1.6 },
    /** 접근 이름. 주면 정보 그래픽(role=img), 없으면 장식(v2 동형) */
    label: { type: String },
  };

  declare width: number;
  declare height: number;
  declare color: string;
  declare fill: string;
  declare noEndDot: boolean;
  declare showBaseline: boolean;
  declare strokeWidth: number;
  declare label: string;

  #data: number[] = [];
  #svg: SVGSVGElement | null = null;
  #gradId = "";

  /** 데이터 (§1.3 복합 데이터는 property 전용) */
  get data(): number[] {
    return this.#data;
  }
  set data(v: number[]) {
    this.#data = Array.isArray(v) ? v.filter((n): n is number => Number.isFinite(n)) : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(sparklineStyles);
    if (!this.#gradId) this.#gradId = jdUid("jd-spark-grad"); // 결정적 카운터(§3.1 — Math.random 금지)
    this.#readJsonSlot();
    // 입양(§3.3): 프리렌더·어댑터가 그린 svg가 있으면 재사용한다
    this.#svg = this.querySelector<SVGSVGElement>(":scope > .jd-sparkline__svg");
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
      if (Array.isArray(parsed)) {
        this.#data = parsed.filter((n): n is number => Number.isFinite(n));
      }
    } catch {
      console.warn("[junds] <jd-sparkline> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    if (this.color) this.style.setProperty("--jd-sparkline-color", this.color);
    else this.style.removeProperty("--jd-sparkline-color");

    const data = this.#data;
    if (data.length < 1) {
      this.#svg?.remove();
      this.#svg = null;
      return;
    }

    const w = this.#px(this.width, 80);
    const h = this.#px(this.height, 24);
    const svg = this.#svg ?? this.#build();
    svg.setAttribute("width", num(w));
    svg.setAttribute("height", num(h));
    svg.setAttribute("viewBox", `0 0 ${num(w)} ${num(h)}`);
    svg.setAttribute("preserveAspectRatio", "none");

    if (this.label) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", this.label);
      svg.removeAttribute("aria-hidden");
    } else {
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
    }

    svg.replaceChildren(...this.#draw(data, w, h));
  }

  #build(): SVGSVGElement {
    const svg = svgEl("svg");
    svg.setAttribute("class", "jd-sparkline__svg");
    this.append(svg);
    this.#svg = svg;
    return svg;
  }

  #draw(data: number[], w: number, h: number): SVGElement[] {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // v2: 평평한 데이터는 1로 나눠 눕힌다
    const stepX = data.length === 1 ? 0 : w / (data.length - 1);
    const pts = data.map((v, i) => ({
      x: i * stepX,
      y: h - ((v - min) / range) * (h - 2) - 1,
    }));

    const out: SVGElement[] = [];
    const strokeW = this.#px(this.strokeWidth, 1.6);

    // 면적 채움 — 그라디언트 defs + path
    if (this.fill) {
      const defs = svgEl("defs");
      const grad = svgEl("linearGradient");
      grad.setAttribute("id", this.#gradId);
      grad.setAttribute("x1", "0");
      grad.setAttribute("x2", "0");
      grad.setAttribute("y1", "0");
      grad.setAttribute("y2", "1");
      const s0 = svgEl("stop");
      s0.setAttribute("offset", "0%");
      s0.setAttribute("stop-color", this.fill);
      s0.setAttribute("stop-opacity", "0.45");
      const s1 = svgEl("stop");
      s1.setAttribute("offset", "100%");
      s1.setAttribute("stop-color", this.fill);
      s1.setAttribute("stop-opacity", "0.02");
      grad.append(s0, s1);
      defs.append(grad);
      out.push(defs);

      const area = svgEl("path");
      area.setAttribute("class", "jd-sparkline__fill");
      const body = pts.map((p) => `${num(p.x)},${num(p.y)}`).join(" L");
      area.setAttribute("d", `M0,${num(h)} L${body} L${num(w)},${num(h)} Z`);
      area.setAttribute("fill", `url(#${this.#gradId})`);
      out.push(area);
    }

    // 기준선 — 첫 값 높이의 점선
    if (this.showBaseline) {
      const baseY = pts[0]?.y ?? 0;
      const line = svgEl("line");
      line.setAttribute("class", "jd-sparkline__baseline");
      line.setAttribute("x1", "0");
      line.setAttribute("x2", num(w));
      line.setAttribute("y1", num(baseY));
      line.setAttribute("y2", num(baseY));
      line.setAttribute("stroke-dasharray", "2 2");
      line.setAttribute("stroke-width", "1");
      line.setAttribute("vector-effect", "non-scaling-stroke");
      out.push(line);
    }

    // 추세선
    const poly = svgEl("polyline");
    poly.setAttribute("class", "jd-sparkline__line");
    poly.setAttribute("points", pts.map((p) => `${num(p.x)},${num(p.y)}`).join(" "));
    poly.setAttribute("stroke-width", num(strokeW));
    poly.setAttribute("vector-effect", "non-scaling-stroke");
    out.push(poly);

    // 마지막 점 — 후광 + 코어 (v2 동형)
    const last = pts[pts.length - 1];
    if (!this.noEndDot && last) {
      const halo = svgEl("circle");
      halo.setAttribute("class", "jd-sparkline__dot-halo");
      halo.setAttribute("cx", num(last.x));
      halo.setAttribute("cy", num(last.y));
      halo.setAttribute("r", "3.4");
      const core = svgEl("circle");
      core.setAttribute("class", "jd-sparkline__dot");
      core.setAttribute("cx", num(last.x));
      core.setAttribute("cy", num(last.y));
      core.setAttribute("r", "1.8");
      out.push(halo, core);
    }
    return out;
  }

  #px(v: number, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }
}
