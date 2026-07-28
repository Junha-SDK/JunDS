/**
 * @junds/web 전체 배럴 — 부수효과 없음 (03-web-arch §6.2).
 * 컴포넌트 자동 define은 각 컴포넌트의 index.ts / define.ts / cdn.ts 몫.
 * 컴포넌트 클래스 재수출은 components.generated.ts(생성물)가 단일 소스 — 수기 금지(P1-1).
 */
export { defineProps, JdElement } from "./core/element.js";
export type { PropDef, PropDefs, PropType } from "./core/element.js";
export {
  contentText,
  isContentEmpty,
  isUnsafeHtml,
  setContent,
  unsafeHtml,
} from "./core/content.js";
export type { JdContent, UnsafeHtml } from "./core/content.js";
export { defineElement } from "./core/define.js";
export { css, adoptStyles } from "./core/styles.js";
export type { JdStyles } from "./core/styles.js";
export { jdUid } from "./core/uid.js";
export { applyStyleProps, resolveColor, resolveSpace } from "./core/style-props.js";
export type { ApplyOptions, JdStyleProps, StylePropKey } from "./core/style-props.js";
export type { JdButtonSize, JdButtonType, JdButtonVariant } from "./components/button/element.js";
export type { JdTextFieldSize } from "./components/text-field/element.js";
export type { JdModalSize } from "./components/modal/element.js";

// 컴포넌트 클래스 전량 (부작용 0 — element.ts만 참조, 생성물)
export * from "./components.generated.js";

// Behaviors (부작용 0)
export type { Behavior, BehaviorFactory } from "./behaviors/types.js";
export { createFocusTrap } from "./behaviors/focus-trap.js";
export type { FocusTrap, FocusTrapOptions } from "./behaviors/focus-trap.js";
