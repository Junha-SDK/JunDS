/**
 * <jd-wrap> — 줄바꿈 flex 묶음 (v2 layout/Wrap) = Group 별칭 파생 (DECISIONS B2).
 * v2 표면이 Group과 동형(wrap+gap sm+align center, justify는 스타일 프롭이 수용).
 */
import { JdGroup } from "../group/element.js";
import wrapStyles from "./wrap.css.js";

export class JdWrap extends JdGroup {
  static override tag = "jd-wrap";
  static override styles = wrapStyles;
}
