/**
 * <jd-vstack> — 세로 스택 (v2 core/VStack = Flex column+gap md 파생).
 */
import { JdBox } from "../box/element.js";
import vstackStyles from "./vstack.css.js";

export class JdVStack extends JdBox {
  static override tag = "jd-vstack";
  static override styles = vstackStyles;
}
