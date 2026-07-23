/**
 * <jd-simple-grid> — v2 layout/SimpleGrid = GridLayout 별칭 파생 (R12, DECISIONS B2).
 * min-child-width가 있으면 repeat(auto-fill, minmax(Npx, 1fr)) — 기반 클래스가 처리.
 */
import { JdGridLayout } from "../grid-layout/element.js";
import simpleGridStyles from "./simple-grid.css.js";

export class JdSimpleGrid extends JdGridLayout {
  static override tag = "jd-simple-grid";
  static override styles = simpleGridStyles;
}
