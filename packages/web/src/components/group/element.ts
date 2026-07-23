/**
 * <jd-group> — 줄바꿈 허용 가로 묶음 (v2 core/Group = Flex row+wrap+gap sm 파생).
 * `no-wrap`이면 줄바꿈 금지 (attr 셀렉터가 처리).
 */
import { STYLE_PROPS } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import groupStyles from "./group.css.js";

export class JdGroup extends JdBox {
  static override tag = "jd-group";
  static override styles = groupStyles;
  static override props = {
    ...STYLE_PROPS,
    noWrap: { type: Boolean, reflect: true }, // attr: no-wrap
  };

  declare noWrap: boolean;
}
