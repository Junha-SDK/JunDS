import { css } from "../../core/styles.js";

/**
 * v2 값: nav text-sm, 행 `w-full flex justify-between gap-3 py-2 pr-3 rounded-md`
 * (hover bg-surface-soft, 활성 bg-primary/10 text-primary semibold, 완독 text-muted,
 * disabled opacity-50), 마커 원 20px(활성 primary/흰 · 완독 success/20 · 그외 gray),
 * 메타 11px muted tabular. gray/soft는 border·border-light 토큰으로.
 */
export default css`
@layer junds.components {
  jd-chapter-list {
    display: block; box-sizing: border-box;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
  }

  .jd-chapter-list__root, .jd-chapter-list__sub {
    list-style: none; margin: 0; padding: 0;
  }
  .jd-chapter-list__sub { margin-block-start: var(--jd-space-0-5); }

  .jd-chapter-list__row {
    width: 100%; box-sizing: border-box;
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-3);
    padding-block: var(--jd-space-2); padding-inline-end: var(--jd-space-3);
    text-align: left; cursor: pointer;
    font-family: inherit; font-size: inherit;
    color: var(--jd-color-foreground);
    background: transparent; border: 0;
    border-radius: var(--jd-radius-md);
    transition: background-color var(--jd-duration-fast) var(--jd-easing-default),
                color var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-chapter-list__row:hover:not(:disabled) {
    background: var(--jd-color-border-light);
  }
  .jd-chapter-list__row:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-chapter-list__row[data-active] {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
    font-weight: var(--jd-weight-semibold);
  }
  .jd-chapter-list__row[data-done] { color: var(--jd-color-muted); }
  .jd-chapter-list__row:disabled { opacity: 0.5; cursor: not-allowed; }

  .jd-chapter-list__lead {
    display: inline-flex; align-items: center; gap: var(--jd-space-2); min-width: 0;
  }
  .jd-chapter-list__title {
    min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .jd-chapter-list__marker {
    flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    width: 1.25rem; height: 1.25rem; border-radius: var(--jd-radius-full);
    font-size: 10px; font-weight: var(--jd-weight-semibold);
    background: var(--jd-color-border); color: var(--jd-color-muted);
  }
  .jd-chapter-list__marker[data-active] {
    background: var(--jd-color-primary); color: #fff;
  }
  .jd-chapter-list__marker[data-done]:not([data-active]) {
    background: color-mix(in srgb, var(--jd-color-success) 20%, transparent);
    color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground));
  }

  .jd-chapter-list__meta {
    flex-shrink: 0; font-size: 11px;
    color: var(--jd-color-muted); font-variant-numeric: tabular-nums;
  }
  .jd-chapter-list__meta[hidden] { display: none; }
}`;
