/**
 * <jd-show> / <jd-hide> — 브레이크포인트 조건 표시 (v2 layout/Show·Hide).
 *
 * v2는 innerWidth 리스너 + 조건부 렌더였으나 v3는 **CSS 전용**으로 강등:
 * display:contents(레이아웃 무개입 — v2의 래퍼 없는 렌더와 등가) + attr별 미디어 규칙.
 * JS 상태가 없어 SSR/프리렌더에서 항상 안전하고, above+below 병용은 규칙 합성으로
 * v2 의미론(w>=above && w<below)을 그대로 재현한다 (DECISIONS B2).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import showStyles from "./show.css.js";

export class JdShow extends JdElement {
  static override tag = "jd-show";
  static override props = {
    above: { type: String, reflect: true }, // sm | md | lg | xl | 2xl
    below: { type: String, reflect: true },
  };

  declare above: string;
  declare below: string;

  protected render(): void {
    adoptStyles(showStyles); // 표시 전환은 전부 CSS — JS 상태 없음
  }
}

export class JdHide extends JdShow {
  static override tag = "jd-hide";
}
