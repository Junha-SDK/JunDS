/**
 * 코어 전용 배럴 — size-gate W1 계측 엔트리 (05-perf §3.1).
 * "코어 = JdElement + define + styles + uid + style-props + behaviors(포커스트랩 포함)"
 * 의 게이트 정의를 실체화한다. 공개 배럴(src/index.ts)은 컴포넌트 클래스까지
 * 재수출하므로 W1 계측에 쓰지 않는다 (DECISIONS B1).
 */
export { JdElement } from "./element.js";
export type { PropDef, PropType } from "./element.js";
export { defineElement } from "./define.js";
export { css, adoptStyles } from "./styles.js";
export type { JdStyles } from "./styles.js";
export { jdUid } from "./uid.js";
export {
  STYLE_PROPS,
  STYLE_PROP_KEYS,
  BREAKPOINTS,
  applyStyleProps,
  resolveColor,
  resolveSpace,
} from "./style-props.js";
export type { ApplyOptions, JdStyleProps, StylePropKey } from "./style-props.js";

export type { Behavior, BehaviorFactory } from "../behaviors/types.js";
export { createFocusTrap } from "../behaviors/focus-trap.js";
export type { FocusTrap, FocusTrapOptions } from "../behaviors/focus-trap.js";
