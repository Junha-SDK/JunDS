/**
 * <jd-visually-hidden> — 시각적으로만 숨기고 AT에는 남기는 래퍼 (v2 primitives/VisuallyHidden).
 * 골격 0 · JS 0 — 호스트에 CSS만 얹는다. `display:none`이나 `hidden`은 접근성 트리에서도
 * 지우므로 쓰면 안 된다는 것이 이 컴포넌트의 존재 이유다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import visuallyHiddenStyles from "./visually-hidden.css.js";

export class JdVisuallyHidden extends JdElement {
  static override tag = "jd-visually-hidden";

  protected render(): void {
    adoptStyles(visuallyHiddenStyles);
  }
}
