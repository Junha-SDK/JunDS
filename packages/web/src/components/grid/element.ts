/**
 * <jd-grid> — v2 layout/Grid = GridLayout 별칭 파생 (R12 단일 구현, DECISIONS B2).
 * v2 기본 gap 4(16px)는 GridLayout의 "md"(16px)와 동값 — CSS도 동형.
 */
import { JdGridLayout } from "../grid-layout/element.js";
import gridStyles from "./grid.css.js";

export class JdGrid extends JdGridLayout {
  static override tag = "jd-grid";
  static override styles = gridStyles;
}
