import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 루트 bg-white border rounded-xl overflow-hidden.
 * - 헤더 px-5 py-4 border-b border-border-light, 제목 base semibold,
 *   카운트 배지 xs semibold rounded-full(ok=success/warn=warning/bad=danger 틴트),
 *   진행 막대 gap-0.5 · seg h-1.5 flex-1 rounded-full(status 색).
 * - 항목 divide-y, 행 gap-3 px-5 py-3, 아이콘 w-8 h-8 rounded-full status 틴트,
 *   제목 sm medium, 설명 xs muted, 조치 버튼 xs(insecure=primary/그 외 secondary).
 * status→토큰: secure=success, insecure=danger, attention=warning, unchecked=muted.
 */
export default css`
@layer junds.base {
  jd-security-checklist:not(:defined) { display: block; }
}
@layer junds.components {
  jd-security-checklist {
    display: block; box-sizing: border-box;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    overflow: hidden;
  }

  .jd-security__header {
    padding: var(--jd-space-4) var(--jd-space-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border-light);
  }
  .jd-security__head-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-3); margin-block-end: var(--jd-space-2);
  }
  .jd-security__title {
    margin: 0; font-size: var(--jd-text-md); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  .jd-security__count {
    flex-shrink: 0;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-full);
    font-variant-numeric: tabular-nums;
  }
  .jd-security__count[data-level="ok"] {
    background: color-mix(in srgb, var(--jd-color-success) 12%, transparent);
    color: color-mix(in srgb, var(--jd-color-success) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
  }
  .jd-security__count[data-level="warn"] {
    background: color-mix(in srgb, var(--jd-color-warning) 12%, transparent);
    color: color-mix(in srgb, var(--jd-color-warning) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
  }
  .jd-security__count[data-level="bad"] {
    background: color-mix(in srgb, var(--jd-color-danger) 12%, transparent);
    color: color-mix(in srgb, var(--jd-color-danger) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
  }

  /* 진행 막대 */
  .jd-security__progress { display: flex; gap: var(--jd-space-0-5); }
  .jd-security__seg {
    height: 0.375rem; flex: 1 1 0; border-radius: var(--jd-radius-full);
    background: color-mix(in srgb, var(--jd-color-muted) 25%, transparent);
  }
  .jd-security__seg[data-status="secure"] { background: var(--jd-color-success); }
  .jd-security__seg[data-status="insecure"] { background: var(--jd-color-danger); }
  .jd-security__seg[data-status="attention"] { background: var(--jd-color-warning); }

  /* 항목 */
  .jd-security__list { display: block; }
  .jd-security__item {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-5);
  }
  .jd-security__item:not(:first-child) {
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border-light);
  }

  .jd-security__icon {
    flex-shrink: 0;
    width: 2rem; height: 2rem; border-radius: var(--jd-radius-full);
    display: inline-flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--jd-color-muted) 14%, transparent);
    color: var(--jd-color-muted);
  }
  .jd-security__icon[data-status="secure"] {
    background: color-mix(in srgb, var(--jd-color-success) 14%, transparent);
    color: var(--jd-color-success-ink);
  }
  .jd-security__icon[data-status="insecure"] {
    background: color-mix(in srgb, var(--jd-color-danger) 14%, transparent);
    color: var(--jd-color-danger-ink);
  }
  .jd-security__icon[data-status="attention"] {
    background: color-mix(in srgb, var(--jd-color-warning) 14%, transparent);
    color: var(--jd-color-warning-ink);
  }
  .jd-security__icon svg { width: 1rem; height: 1rem; }

  .jd-security__body { flex: 1 1 auto; min-width: 0; }
  .jd-security__item-title {
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
  }
  .jd-security__item-desc {
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }

  .jd-security__action {
    flex-shrink: 0; cursor: pointer;
    font-family: inherit; font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    padding: var(--jd-space-1) var(--jd-space-2-5);
    border-radius: var(--jd-radius-md);
    border: var(--jd-border-thin) solid transparent;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-security__action[data-variant="primary"] { background: var(--jd-color-primary); color: #fff; }
  .jd-security__action[data-variant="primary"]:hover { background: var(--jd-color-primary-hover); }
  .jd-security__action[data-variant="secondary"] {
    background: var(--jd-color-surface); color: var(--jd-color-foreground);
    border-color: var(--jd-color-border);
  }
  .jd-security__action[data-variant="secondary"]:hover { background: var(--jd-color-surface-raised); }
  .jd-security__action:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
}`;
