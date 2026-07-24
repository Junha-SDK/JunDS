/**
 * <jd-mini-chart> — 카드 안에 들어가는 스파크라인 (v2 composites/MiniChart).
 *
 * SVG는 **createElementNS**로 만든다(§6-1 네임스페이스 함정): 좌표가 데이터마다
 * 달라 문자열 템플릿 + innerHTML로 밀어 넣기 쉬운데, 그 경로는 HTML 파서를 타고
 * 미지 요소로 앉아 아무것도 그려지지 않는다.
 *
 * 데이터는 property + JSON 슬롯(§1.3 — 배열은 attribute 금지):
 *  1. `data` 프로퍼티 (number[])
 *  2. 자식 `<script type="application/json">[1,2,3]</script>` (jd-metric-card 선례)
 *
 * v2 대비 교정 4건:
 *  1. **bar에서 마지막 막대가 화면 밖이었다.** step을 `width/(n-1)`로 잡고 막대를
 *     `x = i*step`에 그려서, 마지막 막대의 x가 정확히 width — 뷰박스 오른쪽 밖이라
 *     항상 한 개가 사라졌다(선형 차트의 간격 공식을 막대에 그대로 쓴 결과).
 *     막대는 "구간"이므로 step = width/n로 나눈다.
 *  2. **최솟값 막대는 높이 0이라 보이지 않았다.** 5개 중 가장 작은 값이 통째로
 *     사라지면 그건 차트가 아니다. 최소 1px을 보장한다.
 *  3. **장식/정보 구분이 없었다.** v2는 무조건 `aria-hidden`이라 이 그림만으로
 *     정보를 전달하는 화면에서는 대체 수단이 0이었다. `label`을 주면 role="img" +
 *     aria-label로 승격하고, 없으면 v2처럼 장식으로 남긴다(기본값 = v2 동형).
 *  4. **비수치 오염 방어.** NaN/Infinity가 섞이면 좌표가 NaN이 되어 path 전체가
 *     사라진다(에러도 없이). 대입 시점에 걸러낸다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import miniChartStyles from "./mini-chart.css.js";

const NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(NS, tag);
}

/** 부동소수 꼬리를 잘라 프리렌더 스냅샷 diff를 안정화(jd-metric-card·jd-clock 선례) */
const num = (v: number): string => String(Math.round(v * 1000) / 1000);

export type JdMiniChartType = "line" | "bar" | "area";

export class JdMiniChart extends JdElement {
  static override tag = "jd-mini-chart";
  static override props = {
    /** line | bar | area */
    type: { type: String, default: "line", reflect: true },
    width: { type: Number, default: 120 },
    height: { type: Number, default: 32 },
    /** 선/막대 색(CSS 색). 비우면 primary 토큰 */
    color: { type: String },
    /** 접근 이름. 주면 정보 그래픽(role=img), 없으면 장식(v2 동형) */
    label: { type: String },
  };

  declare type: string;
  declare width: number;
  declare height: number;
  declare color: string;
  declare label: string;

  #data: number[] = [];
  #svg: SVGSVGElement | null = null;

  /** 데이터 (§1.3 복합 데이터는 property 전용) */
  get data(): number[] {
    return this.#data;
  }
  set data(v: number[]) {
    this.#data = Array.isArray(v) ? v.filter((n): n is number => Number.isFinite(n)) : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(miniChartStyles);
    this.#readJsonSlot();
    // 입양(§3.3) — 프리렌더·어댑터가 그린 svg가 있으면 재사용한다
    this.#svg = this.querySelector<SVGSVGElement>(":scope > .jd-mini-chart__svg");
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 */
  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) {
        this.#data = parsed.filter((n): n is number => Number.isFinite(n));
      }
    } catch {
      console.warn("[junds] <jd-mini-chart> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    if (this.color) this.style.setProperty("--jd-mini-chart-color", this.color);
    else this.style.removeProperty("--jd-mini-chart-color");

    const pts = this.#data;
    // v2와 같은 조건: 점이 2개 미만이면 추세를 그릴 수 없다
    if (pts.length < 2) {
      this.#svg?.remove();
      this.#svg = null;
      return;
    }

    const w = this.#px(this.width, 120);
    const h = this.#px(this.height, 32);
    const svg = this.#svg ?? this.#build();
    svg.setAttribute("width", num(w));
    svg.setAttribute("height", num(h));
    svg.setAttribute("viewBox", `0 0 ${num(w)} ${num(h)}`);

    // 교정 3 — label이 있으면 정보 그래픽, 없으면 장식
    if (this.label) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", this.label);
      svg.removeAttribute("aria-hidden");
    } else {
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
    }

    svg.replaceChildren(...(this.type === "bar" ? this.#bars(pts, w, h) : this.#curve(pts, w, h)));
  }

  #build(): SVGSVGElement {
    const svg = svgEl("svg");
    svg.setAttribute("class", "jd-mini-chart__svg");
    this.append(svg);
    this.#svg = svg;
    return svg;
  }

  /** line·area — v2 좌표 그대로 */
  #curve(pts: number[], w: number, h: number): SVGElement[] {
    const { min, range } = this.#scale(pts);
    const step = w / (pts.length - 1);
    const y = (v: number): number => h - ((v - min) / range) * (h - 4) - 2;

    const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${num(i * step)},${num(y(v))}`).join(" ");
    const out: SVGElement[] = [];

    if (this.type === "area") {
      const area = svgEl("path");
      area.setAttribute("class", "jd-mini-chart__area");
      area.setAttribute("d", `${d} L${num(w)},${num(h)} L0,${num(h)} Z`);
      out.push(area);
    }

    const line = svgEl("path");
    line.setAttribute("class", "jd-mini-chart__line");
    line.setAttribute("d", d);
    out.push(line);

    const last = pts[pts.length - 1] as number;
    const head = svgEl("circle");
    head.setAttribute("class", "jd-mini-chart__head");
    head.setAttribute("r", "2");
    head.setAttribute("cx", num((pts.length - 1) * step));
    head.setAttribute("cy", num(y(last)));
    out.push(head);
    return out;
  }

  /** bar — 교정 1·2 적용 */
  #bars(pts: number[], w: number, h: number): SVGElement[] {
    const { min, range } = this.#scale(pts);
    const step = w / pts.length; // 교정 1: 막대는 "구간"이다
    const barW = Math.max(1, step - 2); // v2 gap 2px 유지
    return pts.map((v, i) => {
      const barH = Math.max(1, ((v - min) / range) * (h - 4)); // 교정 2
      const rect = svgEl("rect");
      rect.setAttribute("class", "jd-mini-chart__bar");
      rect.setAttribute("x", num(i * step));
      rect.setAttribute("y", num(h - barH - 2));
      rect.setAttribute("width", num(barW));
      rect.setAttribute("height", num(barH));
      rect.setAttribute("rx", "1");
      return rect;
    });
  }

  /** v2 동형: 평평한 데이터(range 0)는 1로 나눠 0선에 눕는다 */
  #scale(pts: number[]): { min: number; range: number } {
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    return { min, range: max - min || 1 };
  }

  #px(v: number, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }
}
