/**
 * <jd-switch> — iOS 스타일 스위치 (v2 primitives/Switch) = Toggle 로직 재사용.
 * 표면 차: size에 lg 추가, 썸 수직 중앙(top 50%)·left 3px·shadow-md·호버 brightness.
 * v2의 i18n 기본 라벨(t("ariaSwitch"))은 문자열 상수로 — i18n Behavior는 후속 배치.
 */
import { JdToggle } from "../toggle/element.js";
import switchStyles from "./switch.css.js";

export class JdSwitch extends JdToggle {
  static override tag = "jd-switch";
  static override styles = switchStyles;

  protected override fallbackAriaLabel = "스위치";
  protected override baseClass = "jd-switch";
}
