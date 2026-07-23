/**
 * <jd-overlay> — 부모 절대 덮개 (v2 layout/Overlay).
 * v2 center 기본 true → no-center 반전(DEC-012-4 동형), blur는 backdrop-filter 4px.
 */
import { STYLE_PROPS } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import overlayStyles from "./overlay.css.js";

export class JdOverlay extends JdBox {
  static override tag = "jd-overlay";
  static override styles = overlayStyles;
  static override props = {
    ...STYLE_PROPS,
    noCenter: { type: Boolean, reflect: true }, // attr: no-center
    // 프로퍼티명 blur는 HTMLElement.blur() 메서드와 충돌 — blurred로 두고 attr만 blur
    blurred: { type: Boolean, reflect: true, attribute: "blur" },
  };

  declare noCenter: boolean;
  declare blurred: boolean;
}
