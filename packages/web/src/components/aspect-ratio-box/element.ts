/**
 * <jd-aspect-ratio-box> — 비율 고정 박스 (v2 layout/AspectRatioBox, 기본 16/9).
 * ratio는 CSS aspect-ratio 문법 원문 수용("1.5"·"16/9" — v2 number의 상위집합).
 * primitives AspectRatio(B6)와의 단일화는 R12에 따라 해당 배치에서 별칭 심의.
 */
import { STYLE_PROPS } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import aspectRatioBoxStyles from "./aspect-ratio-box.css.js";

export class JdAspectRatioBox extends JdBox {
  static override tag = "jd-aspect-ratio-box";
  static override styles = aspectRatioBoxStyles;
  static override props = {
    ...STYLE_PROPS,
    ratio: { type: String }, // CSS aspect-ratio 값 — 기본 16/9는 base CSS
  };

  declare ratio: string;

  protected override update(): void {
    super.update();
    if (this.ratio) this.style.setProperty("aspect-ratio", this.ratio);
    else this.style.removeProperty("aspect-ratio");
  }
}
