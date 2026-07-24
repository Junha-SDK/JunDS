/**
 * <jd-scroll-area> — 커스텀 스크롤바 영역 (v2 primitives/ScrollArea).
 *
 * - 호스트 자체가 스크롤 컨테이너다 — v2의 래퍼 div가 하던 일을 노드 추가 없이 한다.
 *   골격 0(children 그대로) — 이 배치에서 유일하게 DOM을 만들지 않는 컴포넌트.
 * - WAI-ARIA 스크롤 영역 패턴: role=region + tabIndex 0이라야 PageUp/PageDown·화살표로
 *   스크롤된다(v2 주석과 동일 근거). 이름 없는 region은 의미가 없으므로 aria-label 기본값.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import scrollAreaStyles from "./scroll-area.css.js";

export class JdScrollArea extends JdElement {
  static override tag = "jd-scroll-area";
  static override props = {
    orientation: { type: String, default: "vertical", reflect: true }, // vertical|horizontal|both
    /** CSS 길이. 수치만 주면 px로 해석(v2 number 수용 동형) */
    maxHeight: { type: String },
    label: { type: String, default: "스크롤 영역" },
  };

  declare orientation: string;
  declare maxHeight: string;
  declare label: string;

  protected render(): void {
    adoptStyles(scrollAreaStyles);
    this.setAttribute("role", "region");
    this.tabIndex = 0;
    this.update();
  }

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
    const h = this.maxHeight;
    if (h) this.style.setProperty("max-height", /^\d+(\.\d+)?$/.test(h) ? `${h}px` : h);
    else this.style.removeProperty("max-height");
  }
}
