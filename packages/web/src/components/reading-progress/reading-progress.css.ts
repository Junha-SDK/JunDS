import { css } from "../../core/styles.js";

/**
 * v2 값: full = `space-y-1.5`, 헤더(챕터 text-sm medium foreground truncate ↔ 페이지
 * text-xs muted tabular, 현재쪽 semibold foreground), 바 h-2 트랙 gray-200/dark-800
 * 채움 그라디언트 from-primary to-primary-hover, 푸터 11px muted. compact = 한 줄
 * (바 h-1 flex-1 + pct). 트랙 gray는 border 토큰으로(두 테마 성립), 채움 그라디언트는
 * primary→primary-hover 토큰.
 */
export default css`
  @layer junds.components {
    jd-reading-progress {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1-5);
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
    }
    jd-reading-progress[compact] {
      flex-direction: row;
      align-items: center;
      gap: var(--jd-space-2);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }

    .jd-reading-progress__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--jd-space-3);
    }
    .jd-reading-progress__chapter {
      margin: 0;
      min-width: 0;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-reading-progress__count {
      margin: 0;
      flex-shrink: 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }
    .jd-reading-progress__cur {
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
    }
    .jd-reading-progress__sep {
      margin-inline: var(--jd-space-1);
    }

    .jd-reading-progress__track {
      position: relative;
      overflow: hidden;
      height: 0.5rem;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-border);
    }
    jd-reading-progress[compact] .jd-reading-progress__track {
      flex: 1;
      height: 0.25rem;
    }
    .jd-reading-progress__fill {
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      border-radius: var(--jd-radius-full);
      background: linear-gradient(90deg, var(--jd-color-primary), var(--jd-color-primary-hover));
      transition: width var(--jd-duration-slow) var(--jd-easing-default);
    }
    jd-reading-progress[compact] .jd-reading-progress__fill {
      background: var(--jd-color-primary);
    }

    .jd-reading-progress__compact-pct {
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
    }

    .jd-reading-progress__foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: var(--jd-color-muted);
    }
    .jd-reading-progress__remain[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-reading-progress__fill {
        transition: none;
      }
    }
  }
`;
