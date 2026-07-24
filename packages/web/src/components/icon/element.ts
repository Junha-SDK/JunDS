/**
 * <jd-icon> — SVG 아이콘 표준 래퍼 (v2 primitives/Icon).
 *
 * - children(path·g 등)을 내부 <svg>로 옮긴다. v2와 동일하게 **아이콘 이름 레지스트리는
 *   갖지 않는다** — @junds/icons(77종)를 여기서 import하면 컴포넌트 하나가 전 세트를
 *   끌고 들어와 사이즈 게이트를 깨고, 스프라이트 <use> 방식은 URL 베이스가 앱 설정이다.
 *   이름 해석은 아이콘 패키지 소비 경로의 몫으로 남긴다.
 * - label이 있으면 role=img + aria-label, 없으면 장식으로 간주해 접근성 트리에서 제거.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import iconStyles from "./icon.css.js";

const SIZE_PX: Record<string, number> = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 };

export class JdIcon extends JdElement {
  static override tag = "jd-icon";
  static override props = {
    /** xs|sm|md|lg|xl 또는 px 수치 문자열 */
    size: { type: String, default: "md", reflect: true },
    color: { type: String },
    /** 접근 이름. 없으면 장식 아이콘 */
    label: { type: String },
    viewBox: { type: String, default: "0 0 24 24" },
    /** 획 두께 — v2 기본 2 */
    strokeWidth: { type: String, default: "2" },
  };

  declare size: string;
  declare color: string;
  declare label: string;
  declare viewBox: string;
  declare strokeWidth: string;

  #svg!: SVGSVGElement;

  protected render(): void {
    adoptStyles(iconStyles);
    const existing = this.querySelector<SVGSVGElement>(":scope > svg.jd-icon");
    if (existing) {
      this.#svg = existing;
    } else {
      // HTML 파서가 만든 <path>는 **HTML 네임스페이스**다 — 그대로 <svg> 안으로 옮기면
      // 노드는 들어가지만 아무것도 그려지지 않는다(CE+SVG의 고전 함정, 실측으로 발견).
      // svg 요소의 innerHTML로 다시 파싱해야 SVG 네임스페이스로 생성된다.
      const content = this.innerHTML.trim();
      this.#svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.#svg.setAttribute("class", "jd-icon");
      this.#svg.setAttribute("fill", "none");
      this.#svg.setAttribute("stroke-linecap", "round");
      this.#svg.setAttribute("stroke-linejoin", "round");
      this.textContent = "";
      if (content) this.#svg.innerHTML = content;
      this.append(this.#svg);
    }
    this.update();
  }

  protected override update(): void {
    const svg = this.#svg;
    // 토큰 이름 → px, 아니면 수치 문자열, 둘 다 아니면 md
    const px = SIZE_PX[this.size] ?? (Number(this.size) || SIZE_PX.md!);
    svg.setAttribute("width", String(px));
    svg.setAttribute("height", String(px));
    svg.setAttribute("viewBox", this.viewBox);
    svg.setAttribute("stroke", this.color || "currentColor");
    svg.setAttribute("stroke-width", this.strokeWidth);
    if (this.label) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", this.label);
      svg.removeAttribute("aria-hidden");
    } else {
      svg.setAttribute("role", "presentation");
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("aria-label");
    }
  }
}
