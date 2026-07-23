/**
 * @junds/web 전체 배럴 — 부수효과 없음 (03-web-arch §6.2).
 * 컴포넌트 자동 define은 각 컴포넌트의 index.ts / cdn.ts 몫.
 */
export { JdElement } from "./core/element.js";
export type { PropDef, PropType } from "./core/element.js";
export { defineElement } from "./core/define.js";
export { css, adoptStyles } from "./core/styles.js";
export type { JdStyles } from "./core/styles.js";
