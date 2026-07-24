import { css } from "../../core/styles.js";

/**
 * v2 값 번역: 루트 space-y-3, 칸 행 flex gap-2 + flex-1 min-w-0,
 * 라벨 10px semibold muted uppercase mb-1, 칸 h-8 px-2 text-sm 가운데정렬
 * border-border rounded-lg + focus:border-primary + mono tabular-nums,
 * 요약 행 px-3 py-2 bg-gray-50 rounded-lg (다크는 v2 globals의 --dm-surface-raised 규칙 승계),
 * 원문 text-xs muted mono flex-1, 요약 text-xs primary medium.
 * 클래스 접두는 태그 축약형 `.jd-cron__*` (battery-indicator의 `.jd-battery__*` 선례).
 * 가산 1건: v2의 `outline-none + 1px 테두리 색 변경`만으로는 포커스 가시성이 약해
 * --jd-shadow-focus-ring을 얹었다(다른 입력 컴포넌트와 동일 관용구).
 */
export default css`
@layer junds.components {
  jd-cron-expression {
    display: flex; flex-direction: column; gap: var(--jd-space-3);
    font-family: var(--jd-font-sans);
  }

  .jd-cron__fields { display: flex; gap: var(--jd-space-2); }
  .jd-cron__field { flex: 1 1 0%; min-width: 0; }

  .jd-cron__label {
    display: block; margin-bottom: var(--jd-space-1);
    font-size: 10px; font-weight: var(--jd-weight-semibold);
    text-transform: uppercase; letter-spacing: var(--jd-tracking-wide);
    color: var(--jd-color-muted);
  }

  .jd-cron__input {
    box-sizing: border-box; width: 100%; height: 2rem; margin: 0;
    padding-inline: var(--jd-space-2); text-align: center;
    font-family: var(--jd-font-mono); font-size: var(--jd-text-sm);
    font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground); background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg); outline: none;
    transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-cron__input:focus {
    border-color: var(--jd-color-primary); box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-cron__input:disabled {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
    background: var(--jd-color-card-hover);
  }

  .jd-cron__summary {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3);
    background: #f9fafb; border-radius: var(--jd-radius-lg);
  }
  [data-jd-theme="dark"] .jd-cron__summary,
  [data-theme="dark"] .jd-cron__summary { background: var(--jd-color-surface-raised); }

  .jd-cron__value {
    flex: 1 1 0%; min-width: 0; overflow-wrap: anywhere;
    font-family: var(--jd-font-mono); font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-cron__desc {
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-primary);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-cron__input { transition: none; }
  }
}`;
