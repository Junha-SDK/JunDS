/**
 * <jd-price-badge> — 등락률 + 추세 화살표 배지 (v2 finance/PriceBadge).
 *
 * v2: 부호 붙은 % + up/flat/down 색 + (양·음일 때) 추세 아이콘. flat(정확히 0)은 회색·
 * 화살표 없음. size sm(12)/md(14), bold 기본.
 *
 * jd-live-pct-badge와 겹쳐 보이나 판정 규칙이 다르다 — 여기 flat은 **정확히 0**(v2
 * `pct === 0`)이고 live-pct-badge는 |v|<0.005다. 화살표까지 다르므로 상속하지 않고
 * 독립 구현한다(§6 R12는 관용구가 같을 때만).
 *
 * 화살표는 lucide TrendingUp/Down을 **createElementNS**로 그린다(§6-1 — innerHTML로 SVG를
 * 밀면 HTML 네임스페이스 미지 요소가 되어 아무것도 안 그려진다). 노드는 재사용하고 추세가
 * 바뀔 때 points만 바꾼다.
 *
 * Boolean 표면: v2 showArrow=true·bold=true는 CE 관용상 attribute로 끌 수 없어 역표현한다
 * (`no-arrow`·`no-bold`, jd-price-display hideDiscount 선례). 기본 노출은 유지.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import priceBadgeStyles from "./price-badge.css.js";

const NS = "http://www.w3.org/2000/svg";
const svgEl = <K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] =>
  document.createElementNS(NS, tag);

/** lucide TrendingUp / TrendingDown — 두 폴리라인 좌표 */
const ARROW = {
  up: ["22 7 13.5 15.5 8.5 10.5 2 17", "16 7 22 7 22 13"],
  down: ["22 17 13.5 8.5 8.5 13.5 2 7", "16 17 22 17 22 11"],
} as const;

type Trend = "up" | "flat" | "down";

export class JdPriceBadge extends JdElement {
  static override tag = "jd-price-badge";
  static override props = {
    /** 등락률(%) */
    pct: { type: Number },
    /** sm | md */
    size: { type: String, default: "md", reflect: true },
    /** v2 showArrow=true의 역표현 — 있으면 화살표를 숨긴다 */
    noArrow: { type: Boolean, reflect: true, attribute: "no-arrow" },
    /** v2 bold=true의 역표현 — 있으면 굵기를 낮춘다(500) */
    noBold: { type: Boolean, reflect: true, attribute: "no-bold" },
  };

  declare pct: number;
  declare size: string;
  declare noArrow: boolean;
  declare noBold: boolean;

  #arrow!: SVGSVGElement;
  #line1!: SVGPolylineElement;
  #line2!: SVGPolylineElement;
  #value!: Text;

  protected render(): void {
    adoptStyles(priceBadgeStyles);

    // 입양(§3.3)
    const arrow = this.querySelector<SVGSVGElement>(":scope > .jd-price-badge__arrow");
    if (arrow) {
      this.#arrow = arrow;
      const lines = arrow.querySelectorAll<SVGPolylineElement>("polyline");
      this.#line1 = lines[0]!;
      this.#line2 = lines[1]!;
      const valueEl = this.querySelector<HTMLElement>(":scope > .jd-price-badge__value");
      this.#value = valueEl?.firstChild instanceof Text ? valueEl.firstChild : this.#buildValue();
    } else {
      this.#buildArrow();
      this.#buildValue();
    }
    this.update();
  }

  #buildArrow(): void {
    this.#arrow = svgEl("svg");
    this.#arrow.setAttribute("class", "jd-price-badge__arrow");
    this.#arrow.setAttribute("viewBox", "0 0 24 24");
    this.#arrow.setAttribute("fill", "none");
    this.#arrow.setAttribute("aria-hidden", "true");
    this.#line1 = svgEl("polyline");
    this.#line2 = svgEl("polyline");
    for (const pl of [this.#line1, this.#line2]) {
      pl.setAttribute("stroke", "currentColor");
      pl.setAttribute("stroke-width", "2.4");
      pl.setAttribute("stroke-linecap", "round");
      pl.setAttribute("stroke-linejoin", "round");
    }
    this.#arrow.append(this.#line1, this.#line2);
    this.append(this.#arrow);
  }

  #buildValue(): Text {
    const span = this.ownerDocument.createElement("span");
    span.className = "jd-price-badge__value";
    this.#value = this.ownerDocument.createTextNode("");
    span.append(this.#value);
    this.append(span);
    return this.#value;
  }

  protected override update(): void {
    const pct = Number.isFinite(this.pct) ? this.pct : 0;
    const trend: Trend = pct > 0 ? "up" : pct === 0 ? "flat" : "down";
    this.setAttribute("data-trend", trend);

    const showArrow = !this.noArrow && trend !== "flat";
    this.#arrow.classList.toggle("jd-price-badge__arrow--hidden", !showArrow);
    if (showArrow) {
      const [p1, p2] = ARROW[trend === "up" ? "up" : "down"];
      this.#line1.setAttribute("points", p1);
      this.#line2.setAttribute("points", p2);
    }

    const text = `${pct > 0 ? "+" : ""}${pct.toFixed(2)}%`;
    if (this.#value.data !== text) this.#value.data = text;
  }
}
