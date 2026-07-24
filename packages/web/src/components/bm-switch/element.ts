/**
 * <jd-bm-switch> — finance 브랜드 스위치 (v2 finance/BmSwitch) = Toggle 파생.
 *
 * v2 BmSwitch는 `<label><button role="switch"><span thumb/></button><span label/></label>`
 * 구조에 트랙만 다르게 칠한 토글이었다(체크 시 teal 그라디언트, 미체크 시 soft-200).
 * 그 골격·클릭·aria·disabled·label 연결은 전부 JdToggle에서 상속하고(§6 R12),
 * 이 파생은 **자기 시트 하나만** 갈아끼운다 — JdSwitch가 iOS 스위치를 만든 방식과 동일.
 *
 * v2 대비 순증: v2 button은 `role="switch"`만 있고 `aria-checked`를 boolean으로 넘겼으나
 * 라벨 없는 스위치의 접근 이름이 비었다. JdToggle는 label 미지정 시 fallbackAriaLabel로
 * 이름을 보장한다. size는 v2 그대로 sm|md|lg(치수는 CSS가 토큰으로 번역).
 */
import { JdToggle } from "../toggle/element.js";
import bmSwitchStyles from "./bm-switch.css.js";

export class JdBmSwitch extends JdToggle {
  static override tag = "jd-bm-switch";
  static override styles = bmSwitchStyles;

  protected override fallbackAriaLabel = "스위치";
  protected override baseClass = "jd-bm-switch";
}
