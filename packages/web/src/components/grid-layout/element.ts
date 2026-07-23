/**
 * <jd-grid-layout> — grid 컨테이너 (v2 core/GridLayout). 기본 cols 1 · gap md는 base CSS.
 * layout 계층 Grid와의 삼중복 단일화(R12)는 B2에서 별칭으로 확정한다.
 */
import { JdBox } from "../box/element.js";
import gridLayoutStyles from "./grid-layout.css.js";

export class JdGridLayout extends JdBox {
  static override tag = "jd-grid-layout";
  static override styles = gridLayoutStyles;
}
