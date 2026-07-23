/**
 * <jd-flex> — flex 컨테이너 (v2 core/Flex). `inline`이면 inline-flex (attr 셀렉터가 처리).
 */
import { STYLE_PROPS } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import flexStyles from "./flex.css.js";

export class JdFlex extends JdBox {
  static override tag = "jd-flex";
  static override styles = flexStyles;
  static override props = {
    ...STYLE_PROPS,
    inline: { type: Boolean, reflect: true },
  };

  declare inline: boolean;
}
