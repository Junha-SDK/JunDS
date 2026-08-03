import { css } from "../../core/styles.js";

/**
 * v2 값: `grid grid-cols-2 md:grid-cols-4 gap-3`, 타일 `rounded-xl border border-border
 * bg-surface p-4`, 라벨 11px uppercase tracking-wider muted, 값 text-2xl bold foreground
 * tabular mt-1, 단위 text-sm normal muted, 오늘 바 mt-2 h-1 track gray-200/dark-800
 * 채움 primary. bg-surface→card, gray track→border 토큰(두 테마 성립). md=768.
 */
export default css`
  @layer junds.components {
    /* 열 수는 v2 지도(2 → md 4)를 따르되 열 폭은 칸이 정한다. 고정 repeat(4)는 넓은
     화면의 좁은 칼럼 안에서 타일을 100px대로 눌러 12h 34m 이 두 줄로 갈라졌다(§5·§6).
     auto-fit + "요청 열 수로 나눈 폭" 하한이면 넓을 때만 4열이다(jd-descriptions 선례). */
    jd-reading-stats {
      --jd-reading-stats-gap: var(--jd-space-3);
      /* 2xl 수치 + 단위가 한 줄에 서는 최소 타일 폭(패딩 2rem 포함) */
      --jd-reading-stats-col-min: 9rem;
      --_jd-rs-n: 2;
      display: grid;
      box-sizing: border-box;
      gap: var(--jd-reading-stats-gap);
      grid-template-columns: repeat(
        auto-fit,
        minmax(
          min(
            100%,
            max(
              var(--jd-reading-stats-col-min),
              (100% - (var(--_jd-rs-n) - 1) * var(--jd-reading-stats-gap)) / var(--_jd-rs-n)
            )
          ),
          1fr
        )
      );
      font-family: var(--jd-font-sans);
    }
    @media (min-width: 768px) {
      jd-reading-stats {
        --_jd-rs-n: 4;
      }
    }

    .jd-reading-stats__tile {
      box-sizing: border-box;
      min-width: 0; /* 긴 값이 트랙을 밀어 격자를 넘기지 않게(§6) */
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      background: var(--jd-color-card);
      padding: var(--jd-space-4);
    }

    /* 라벨은 두 글자 남기고 접히면 뜻을 잃는다 — 한 줄로 두고 넘치면 말줄임(§5) */
    .jd-reading-stats__label {
      margin: 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--jd-color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* 숫자와 단위는 한 덩어리다 — 누적 시간은 12h 34m 처럼 사이에 공백이 있어
     좁은 타일에서 12h / 34m 으로 갈라졌다(§5) */
    .jd-reading-stats__value {
      margin: var(--jd-space-1) 0 0;
      font-size: var(--jd-text-2xl);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-foreground);
      font-variant-numeric: tabular-nums;
      line-height: var(--jd-leading-tight);
      white-space: nowrap;
    }
    .jd-reading-stats__unit {
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-normal);
      color: var(--jd-color-muted);
    }

    .jd-reading-stats__track {
      margin-block-start: var(--jd-space-2);
      height: 0.25rem;
      overflow: hidden;
      background: var(--jd-color-border);
      border-radius: var(--jd-radius-full);
    }
    .jd-reading-stats__track[hidden] {
      display: none;
    }
    .jd-reading-stats__bar {
      height: 100%;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-primary);
      transition: width var(--jd-duration-slow) var(--jd-easing-default);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-reading-stats__bar {
        transition: none;
      }
    }
  }
`;
