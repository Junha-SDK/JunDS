/**
 * jd-time-picker 컴포넌트 CSS.
 * v2 ds/composites/TimePicker의 트리거(h-9·border·rounded-lg·focus 글로우),
 * 패널(flex·shadow-lg), 열(w-16 h-48 overflow-auto·구분선), 항목(h-8·text-sm·중앙정렬),
 * 선택(bg-primary-light text-primary font-medium)을 --jd-* 토큰으로 의미 번역.
 * AM/PM 열이 높이를 반씩 나눠 갖는 v2 기하(flex-1)도 그대로.
 *
 * PICKER_FIELD_CSS 보간 근거는 core/picker-field.styles.ts 주석 참조.
 */
import { css } from "../../core/styles.js";
import { PICKER_FIELD_CSS } from "../../core/picker-field.styles.js";

export default css`
@layer junds.components {
${PICKER_FIELD_CSS}

  .jd-time-picker__panel { display: flex; }

  .jd-time-picker__col {
    width: 4rem; height: 12rem; overflow-y: auto; overscroll-behavior: contain;
    padding-block: var(--jd-space-1); box-sizing: border-box;
    scrollbar-width: thin;
  }
  .jd-time-picker__col + .jd-time-picker__col:not([hidden]) {
    border-inline-start: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-time-picker__col[hidden] { display: none; }
  .jd-time-picker__col:focus-visible { outline: none; }

  .jd-time-picker__opt {
    display: flex; align-items: center; justify-content: center;
    height: 2rem; font-size: var(--jd-text-md); color: var(--jd-color-foreground);
    cursor: pointer; user-select: none;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-time-picker__opt:hover { background: var(--jd-color-card-hover); }
  .jd-time-picker__opt[aria-selected="true"] {
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-primary-ink); background: var(--jd-color-primary-light);
  }
  /* aria-activedescendant는 실제 포커스를 옮기지 않는다 — 활성 항목 링을 직접 그린다 */
  .jd-time-picker__col:focus-visible .jd-time-picker__opt[data-active] {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: calc(-1 * var(--jd-border-medium));
  }

  /* AM/PM 열 — 두 항목이 높이를 반씩(v2 flex-1) */
  .jd-time-picker__col[data-col="period"] { display: flex; flex-direction: column; }
  .jd-time-picker__col[data-col="period"] > .jd-time-picker__opt { flex: 1; height: auto; }

  @media (prefers-reduced-motion: reduce) {
    .jd-time-picker__opt { transition: none; }
  }
}`;
