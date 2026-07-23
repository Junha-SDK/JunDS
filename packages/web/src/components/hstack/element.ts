/**
 * <jd-hstack> — 가로 스택 (v2 core/HStack = Flex row+gap sm+align center 파생).
 */
import { JdBox } from "../box/element.js";
import hstackStyles from "./hstack.css.js";

export class JdHStack extends JdBox {
  static override tag = "jd-hstack";
  static override styles = hstackStyles;
}
