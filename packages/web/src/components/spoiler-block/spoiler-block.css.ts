/**
 * jd-spoiler-block CSS — v2 composites/SpoilerBlock(rounded-lg 테두리 + p-4 ·
 * blur-sm 콘텐츠 · 중앙 알약 버튼, spoiler=foreground/80, caution=warning)의 토큰 번역.
 *
 * v2 `bg-gray-50`은 라이트 전용 리터럴이라 card-hover로 옮겼다(code.css.ts 선례).
 * 블러는 filter 전환이라 reduced-motion에서 전환만 끄고 결과 상태는 그대로 둔다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-spoiler-block {
      display: block;
      position: relative;
      box-sizing: border-box;
      padding: var(--jd-space-4);
      overflow: hidden;
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      background: var(--jd-color-card-hover);
      font-family: var(--jd-font-sans);
    }
    jd-spoiler-block[type="caution"] {
      background: var(--jd-color-warning-light);
      border-color: color-mix(in srgb, var(--jd-color-warning) 30%, transparent);
    }

    .jd-spoiler-block__content {
      transition: filter var(--jd-duration-slower) var(--jd-easing-ease-out);
    }
    jd-spoiler-block:not([revealed]) .jd-spoiler-block__content {
      filter: blur(4px);
      user-select: none;
      pointer-events: none;
    }

    .jd-spoiler-block__cover {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .jd-spoiler-block__cover[hidden] {
      display: none;
    }

    .jd-spoiler-block__reveal {
      padding: var(--jd-space-2) var(--jd-space-4);
      border: 0;
      cursor: pointer;
      border-radius: var(--jd-radius-full);
      font-family: inherit;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
      box-shadow: var(--jd-shadow-md);
      background: color-mix(in srgb, var(--jd-color-foreground) 80%, transparent);
      color: var(--jd-color-background);
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-spoiler-block__reveal:hover {
      background: var(--jd-color-foreground);
      box-shadow: var(--jd-shadow-lg);
    }
    .jd-spoiler-block__reveal:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    jd-spoiler-block[type="caution"] .jd-spoiler-block__reveal {
      background: var(--jd-color-warning);
      color: #fff;
    }
    jd-spoiler-block[type="caution"] .jd-spoiler-block__reveal:hover {
      background: color-mix(in srgb, var(--jd-color-warning) 90%, #000);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-spoiler-block__content,
      .jd-spoiler-block__reveal {
        transition: none;
      }
    }
  }
`;
