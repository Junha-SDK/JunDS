/**
 * <jd-container> — 중앙 정렬 폭 제한 컨테이너 (v2 layout/Container).
 * size 프리셋(xs 512~2xl 1536/full, 기본 lg)·기본 px {base:4, sm:6}은 base CSS.
 * v2 center 기본 true는 boolean attribute로 표현 불가(존재=값) → no-center로 반전
 * (DEC-012-4 persistent 반전과 동형).
 */
import { STYLE_PROPS } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import containerStyles from "./container.css.js";

export class JdContainer extends JdBox {
  static override tag = "jd-container";
  static override styles = containerStyles;
  static override props = {
    ...STYLE_PROPS,
    size: { type: String, default: "lg", reflect: true }, // max-width 프리셋 CSS 훅
    noCenter: { type: Boolean, reflect: true }, // attr: no-center
  };

  declare size: string;
  declare noCenter: boolean;
}
