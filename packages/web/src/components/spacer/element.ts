/**
 * <jd-spacer> — 토큰 간격 스페이서 (v2 layout/Spacer).
 * v2 동형: 수직 = padding-block(양측), 수평 = padding-inline. aria-hidden 고정.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { resolveSpace } from "../../core/style-props.js";
import spacerStyles from "./spacer.css.js";

export class JdSpacer extends JdElement {
  static override tag = "jd-spacer";
  static override props = {
    size: { type: String, default: "4" },
    axis: { type: String, default: "vertical", reflect: true }, // CSS 축 전환 훅
  };

  declare size: string;
  declare axis: string;

  protected render(): void {
    adoptStyles(spacerStyles);
    this.setAttribute("aria-hidden", "true");
    this.update();
  }

  protected override update(): void {
    const v = resolveSpace(String(this.size));
    const horizontal = this.axis === "horizontal";
    if (v && v !== "auto") {
      this.style.setProperty(horizontal ? "padding-inline" : "padding-block", v);
      this.style.removeProperty(horizontal ? "padding-block" : "padding-inline");
    } else {
      this.style.removeProperty("padding-block");
      this.style.removeProperty("padding-inline");
    }
  }
}
