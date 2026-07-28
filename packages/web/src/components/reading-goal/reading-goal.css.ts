import { css } from "../../core/styles.js";

/**
 * v2 값: `inline-flex flex-col items-center`, 중앙 값 text-2xl bold foreground tabular +
 * "/target" text-sm normal muted, 단위 11px muted, 라벨 mt-2 text-xs muted.
 * 링 색·기하·회전은 jd-progress-ring이 소유(track=border · fill=primary) — 여기선
 * 중앙 콘텐츠와 하단 라벨만 칠한다.
 */
export default css`
  @layer junds.components {
    jd-reading-goal {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
    }

    .jd-reading-goal__center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: var(--jd-leading-tight);
    }
    .jd-reading-goal__value {
      font-size: var(--jd-text-2xl);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-foreground);
      font-variant-numeric: tabular-nums;
    }
    .jd-reading-goal__slash {
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-normal);
      color: var(--jd-color-muted);
    }
    .jd-reading-goal__unit {
      font-size: 11px;
      color: var(--jd-color-muted);
    }

    .jd-reading-goal__label {
      margin: var(--jd-space-2) 0 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
  }
`;
