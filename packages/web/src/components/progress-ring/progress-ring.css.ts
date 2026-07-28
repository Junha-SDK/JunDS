import { css } from "../../core/styles.js";

/**
 * v2 값: 호스트 relative inline-flex 중앙정렬 + size 정사각, svg `-rotate-90`
 * (12시 시작), 트랙 stroke=var(--border) · 채움 stroke=var(--primary),
 * strokeLinecap="round", transition 500ms, 중앙 기본 텍스트 text-sm bold tabular-nums.
 *
 * 색은 v2처럼 stroke 속성을 직접 쓰지 않고 커스텀 프로퍼티를 경유한다 — 속성으로
 * 박으면 테마·상태별 CSS 오버라이드가 원천 봉쇄된다(속성값은 저작자 스타일시트가
 * 이길 수 있지만, 그러려면 모든 규칙에 stroke를 다시 써야 한다).
 */
export default css`
  @layer junds.components {
    jd-progress-ring {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--jd-font-sans);
    }

    .jd-progress-ring__svg {
      display: block;
      transform: rotate(-90deg); /* 12시에서 시작 */
    }
    .jd-progress-ring__track {
      stroke: var(--jd-progress-ring-track, var(--jd-color-border));
    }
    .jd-progress-ring__fill {
      stroke: var(--jd-progress-ring-color, var(--jd-color-primary));
      stroke-linecap: round;
      transition: stroke-dashoffset var(--jd-duration-slower) var(--jd-easing-default);
    }

    .jd-progress-ring__center {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      color: var(--jd-color-foreground);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-progress-ring__fill {
        transition: none;
      }
    }
  }
`;
