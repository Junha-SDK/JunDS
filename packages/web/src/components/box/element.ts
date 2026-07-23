/**
 * <jd-box> — 스타일 프롭 시스템의 원형 컨테이너 (v2 core/Box).
 * 내부 골격 없음: 호스트가 곧 박스다 — children은 그대로 두고 스타일 프롭만 반영한다.
 * v2의 `as` 폴리모피즘은 CE에서 미지원(호스트=요소) — React 어댑터 몫 (DECISIONS B1).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import type { JdStyles } from "../../core/styles.js";
import { STYLE_PROPS, applyStyleProps } from "../../core/style-props.js";
import type { JdStyleProps } from "../../core/style-props.js";
import boxStyles from "./box.css.js";

export class JdBox extends JdElement {
  static override tag = "jd-box";
  static override props = { ...STYLE_PROPS };
  /** 파생 컨테이너(Center/Flex/…)가 자기 시트로 교체한다 */
  static styles: JdStyles = boxStyles;

  protected render(): void {
    adoptStyles((this.constructor as typeof JdBox).styles);
    this.update();
  }

  protected override update(): void {
    applyStyleProps(this);
  }
}

// 스타일 프롭 프로퍼티 타입 — 선언 병합 (접근자는 finalize()가 설치)
export interface JdBox extends JdStyleProps {}
