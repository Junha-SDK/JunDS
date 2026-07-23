/**
 * <jd-center> — 양축 중앙 정렬 컨테이너 (v2 core/Center = Box flex+center 파생).
 * 기본 정렬은 base CSS가 담당(디폴트 미반영 원칙 — DEC-012-2), 프롭은 인라인으로 이긴다.
 */
import { JdBox } from "../box/element.js";
import centerStyles from "./center.css.js";

export class JdCenter extends JdBox {
  static override tag = "jd-center";
  static override styles = centerStyles;
}
