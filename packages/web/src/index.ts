/**
 * @junds/web 전체 배럴 — 부수효과 없음 (03-web-arch §6.2).
 * 컴포넌트 자동 define은 각 컴포넌트의 index.ts / define.ts / cdn.ts 몫.
 */
export { JdElement } from "./core/element.js";
export type { PropDef, PropType } from "./core/element.js";
export { defineElement } from "./core/define.js";
export { css, adoptStyles } from "./core/styles.js";
export type { JdStyles } from "./core/styles.js";
export { jdUid } from "./core/uid.js";
export { applyStyleProps, resolveColor, resolveSpace } from "./core/style-props.js";
export type { ApplyOptions, JdStyleProps, StylePropKey } from "./core/style-props.js";

// 컴포넌트 클래스 (부작용 0 — element.ts만 참조)
export { JdButton } from "./components/button/element.js";
export { JdTextField } from "./components/text-field/element.js";
export { JdModal } from "./components/modal/element.js";
// B1 core
export { JdBox } from "./components/box/element.js";
export { JdCenter } from "./components/center/element.js";
export { JdDivider } from "./components/divider/element.js";
export { JdFlex } from "./components/flex/element.js";
export { JdGridLayout } from "./components/grid-layout/element.js";
export { JdGroup } from "./components/group/element.js";
export { JdHStack } from "./components/hstack/element.js";
export { JdHeading } from "./components/heading/element.js";
export { JdPage, JdPageBody, JdPageHeader } from "./components/page/element.js";
export { JdSection } from "./components/section/element.js";
export { JdText } from "./components/text/element.js";
export { JdVStack } from "./components/vstack/element.js";

// Behaviors (부작용 0)
export type { Behavior, BehaviorFactory } from "./behaviors/types.js";
export { createFocusTrap } from "./behaviors/focus-trap.js";
export type { FocusTrap, FocusTrapOptions } from "./behaviors/focus-trap.js";
