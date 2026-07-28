/**
 * jd-swipe-action CSS — v2 composites/SwipeAction 토큰 번역.
 *
 * v2 값: 루트 `relative overflow-hidden`,
 * 액션 패널 `absolute inset-y-0 left|right-0 flex items-stretch`,
 * 액션 버튼 `flex items-center px-4 text-white text-xs font-medium`
 * (배경 = action.color, 폭 = threshold / 액션 수),
 * 콘텐츠 `relative bg-white transition-transform`
 * (transform = translateX(offset), 전이 = 드래그 중 0ms / 놓으면 300ms).
 *
 * v2의 `bg-white`는 라이트 전용 리터럴이라 다크에서 흰 행이 됐다 — 카드 토큰으로 번역.
 * 인라인 style 2개(transform·transitionDuration)는 CSS 변수 + [data-dragging]으로 옮겼다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-swipe-action {
      display: block;
      position: relative;
      overflow: hidden;
      font-family: var(--jd-font-sans);
    }

    .jd-swipe-action__panel {
      position: absolute;
      inset-block: 0;
      display: flex;
      align-items: stretch;
    }
    .jd-swipe-action__panel[hidden] {
      display: none;
    }
    .jd-swipe-action__panel[data-side="left"] {
      inset-inline-start: 0;
    }
    .jd-swipe-action__panel[data-side="right"] {
      inset-inline-end: 0;
    }

    .jd-swipe-action__button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--_jd-swipe-button-width, 5rem);
      padding-inline: var(--jd-space-4);
      font-family: inherit;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      color: #fff;
      background: var(--jd-color-muted);
      border: 0;
      cursor: pointer;
    }
    .jd-swipe-action__button[data-variant="danger"] {
      background: var(--jd-color-danger);
    }
    .jd-swipe-action__button[data-variant="primary"] {
      background: var(--jd-color-primary);
    }
    .jd-swipe-action__button[data-variant="success"] {
      background: var(--jd-color-success);
    }
    .jd-swipe-action__button[data-variant="warning"] {
      background: var(--jd-color-warning);
    }
    .jd-swipe-action__button:disabled {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }
    .jd-swipe-action__button:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-color-foreground);
      outline-offset: -3px;
    }

    .jd-swipe-action__content {
      position: relative;
      background: var(--jd-color-card);
      transform: translateX(var(--_jd-swipe-offset, 0px));
      transition: transform var(--jd-duration-slow) var(--jd-easing-ease-out);
      /* 세로 스크롤은 브라우저에, 가로 제스처는 우리에게 */
      touch-action: pan-y;
    }
    .jd-swipe-action__content[data-dragging] {
      transition-duration: 0s; /* v2: 드래그 중에는 손가락을 그대로 따라간다 */
      user-select: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-swipe-action__content {
        transition: none;
      }
    }
  }
`;
