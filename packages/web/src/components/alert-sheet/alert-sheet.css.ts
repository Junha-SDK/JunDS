import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰): body px-4 pb-5 pt-1, 종목 라벨 13px muted semibold,
 * 이름 18px extrabold, 현재가 12.5px(라벨 muted·값 tabular bold). 그룹 간격 mt-4,
 * 그룹 라벨 12px bold muted. SegmentedPill = 소프트 트랙 + 선택 세그먼트 부양.
 * 입력 size lg(₩ 프리픽스·delta 서픽스 11px muted). 빠른 pill 11px bold soft-100.
 * 액션 2열 lg(secondary/primary).
 *
 * 토큰 번역: soft-100→muted 12% 틴트, text-soft/muted→--jd-color-muted,
 * accent→--jd-color-primary, border→--jd-color-border, card→--jd-color-card.
 */
export default css`
@layer junds.components {
  .jd-alert-sheet__body {
    padding: var(--jd-space-1) var(--jd-space-4) var(--jd-space-5);
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }

  .jd-alert-sheet__field-label {
    margin: 0; font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-muted);
  }
  .jd-alert-sheet__name {
    margin: var(--jd-space-0-5) 0 0;
    font-size: var(--jd-text-xl); font-weight: 800; line-height: var(--jd-leading-tight);
  }
  .jd-alert-sheet__price {
    margin-top: var(--jd-space-1); display: flex; align-items: baseline; gap: var(--jd-space-2);
    font-size: 12.5px;
  }
  .jd-alert-sheet__price-label { color: var(--jd-color-muted); }
  .jd-alert-sheet__price-value { font-weight: var(--jd-weight-bold); font-variant-numeric: tabular-nums; }

  .jd-alert-sheet__group { margin-top: var(--jd-space-4); }
  .jd-alert-sheet__group-label {
    display: block; margin: 0 0 var(--jd-space-1-5);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-bold); color: var(--jd-color-muted);
  }

  /* ── SegmentedPill ── */
  .jd-alert-sheet__segmented {
    display: flex; gap: var(--jd-space-1); padding: var(--jd-space-1);
    background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    border-radius: var(--jd-radius-full);
  }
  .jd-alert-sheet__seg {
    flex: 1 1 0; height: 2.25rem; border-radius: var(--jd-radius-full);
    font-family: inherit; font-size: var(--jd-text-md); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-muted); background: transparent; cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-default),
                color var(--jd-duration-fast) var(--jd-easing-default),
                box-shadow var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-alert-sheet__seg[data-selected] {
    background: var(--jd-color-card); color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-sm);
  }
  .jd-alert-sheet__seg:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  /* ── 목표가 입력 ── */
  .jd-alert-sheet__input {
    display: flex; align-items: center; gap: var(--jd-space-2);
    height: 3rem; padding: 0 var(--jd-space-3);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    transition: border-color var(--jd-duration-fast) var(--jd-easing-default),
                box-shadow var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-alert-sheet__input:focus-within {
    border-color: var(--jd-color-primary); box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-alert-sheet__won { font-weight: var(--jd-weight-bold); color: var(--jd-color-foreground); }
  .jd-alert-sheet__field {
    flex: 1 1 auto; min-width: 0; border: 0; background: transparent; outline: none;
    font-family: inherit; font-size: var(--jd-text-lg); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground); font-variant-numeric: tabular-nums;
  }
  .jd-alert-sheet__delta {
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-muted); font-variant-numeric: tabular-nums; white-space: nowrap;
  }

  .jd-alert-sheet__quick {
    margin-top: var(--jd-space-2); display: flex; align-items: center; gap: var(--jd-space-2);
    flex-wrap: wrap;
  }
  .jd-alert-sheet__quick-pill {
    padding: 3px var(--jd-space-2-5); border-radius: var(--jd-radius-full);
    font-family: inherit; font-size: 11px; font-weight: var(--jd-weight-bold);
    color: var(--jd-color-foreground);
    background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    cursor: pointer;
  }
  .jd-alert-sheet__quick-pill:hover { background: color-mix(in srgb, var(--jd-color-muted) 18%, transparent); }
  .jd-alert-sheet__quick-pill:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  /* ── 액션 ── */
  .jd-alert-sheet__actions {
    margin-top: var(--jd-space-5); display: grid; grid-template-columns: 1fr 1fr; gap: var(--jd-space-2);
  }
  .jd-alert-sheet__cancel, .jd-alert-sheet__submit {
    height: 3rem; border-radius: var(--jd-radius-lg);
    font-family: inherit; font-size: var(--jd-text-md); font-weight: var(--jd-weight-bold);
    cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-default),
                opacity var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-alert-sheet__cancel {
    background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    color: var(--jd-color-foreground); border: 0;
  }
  .jd-alert-sheet__cancel:hover { background: color-mix(in srgb, var(--jd-color-muted) 18%, transparent); }
  .jd-alert-sheet__submit {
    background: var(--jd-color-primary); color: #fff; border: 0;
  }
  .jd-alert-sheet__submit:hover:not(:disabled) { background: var(--jd-color-primary-hover); }
  .jd-alert-sheet__submit:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }
  .jd-alert-sheet__cancel:focus-visible, .jd-alert-sheet__submit:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
}`;
