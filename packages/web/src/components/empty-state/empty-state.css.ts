/**
 * jd-empty-state CSS — v2 composites/EmptyState(세로 중앙 정렬 + 원형 아이콘 칩).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-sizing: border-box; padding: var(--jd-space-12) var(--jd-space-6);
    text-align: center; font-family: var(--jd-font-sans);
  }

  .jd-empty-state__icon {
    display: flex; align-items: center; justify-content: center;
    width: 3rem; height: 3rem; margin-block-end: var(--jd-space-3);
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-card-hover); color: var(--jd-color-muted);
  }
  .jd-empty-state__title {
    margin: 0 0 var(--jd-space-1); font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-semibold); color: var(--jd-color-foreground);
  }
  .jd-empty-state__title[hidden] { display: none; }
  .jd-empty-state__desc {
    margin: 0; max-width: 22rem; font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
  .jd-empty-state__desc[hidden] { display: none; }
  jd-empty-state > [slot="action"] { margin-block-start: var(--jd-space-4); }
}`;
