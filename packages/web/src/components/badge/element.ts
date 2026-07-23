/**
 * <jd-badge> — 상태·카테고리 라벨 (v2 primitives/Badge).
 * dot은 CSS ::before(DOM 0), count 모드는 전용 스팬 — v2처럼 count가 children을
 * 대체한다(병용 금지 문서화, icon 프롭은 React 어댑터 몫 — children에 직접).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import badgeStyles from "./badge.css.js";

export class JdBadge extends JdElement {
  static override tag = "jd-badge";
  static override props = {
    variant: { type: String, default: "default", reflect: true },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    dot: { type: Boolean, reflect: true },
    count: { type: Number, reflect: true }, // attribute 존재 = 카운트 모드
    maxCount: { type: Number, default: 99 }, // attr: max-count
  };

  declare variant: string;
  declare size: string;
  declare dot: boolean;
  declare count: number;
  declare maxCount: number;

  protected render(): void {
    adoptStyles(badgeStyles);
    this.update();
  }

  protected override update(): void {
    const countMode = this.hasAttribute("count");
    this.toggleAttribute("data-count-mode", countMode);
    let span = this.querySelector<HTMLSpanElement>(":scope > .jd-badge__count");
    if (countMode) {
      if (!span) {
        span = document.createElement("span");
        span.className = "jd-badge__count";
        this.append(span);
      }
      span.textContent = this.count > this.maxCount ? `${this.maxCount}+` : String(this.count);
    } else {
      span?.remove();
    }
  }
}
