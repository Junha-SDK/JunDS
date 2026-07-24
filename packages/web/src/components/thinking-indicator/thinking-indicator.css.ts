import { css } from "../../core/styles.js";

/**
 * jd-thinking-indicator CSS — v2 composites/ThinkingIndicator.
 *
 * v2 값: 호스트 `inline-flex items-center gap-2 text-sm text-muted`,
 * dots 6px×3(gap 4, 1.4s bounce, 0.16s 스태거) · pulse 8px(1.4s) ·
 * wave 2×12px 막대 4개(gap 2, items-end, 1s scaleY, 0.1s 스태거) ·
 * typewriter 2×14px 캐럿(1s steps(2) blink).
 * 스태거는 인라인 style이 아니라 nth-child로 — 조각 수가 고정이라 CSS로 충분하다.
 */
export default css`
@layer junds.components {
  jd-thinking-indicator {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }

  .jd-thinking-indicator__anim { display: inline-flex; align-items: center; }
  .jd-thinking-indicator__piece {
    display: block; flex-shrink: 0;
    background: var(--jd-thinking-color, currentColor);
  }

  /* dots */
  .jd-thinking-indicator__anim[data-variant="dots"] { gap: var(--jd-space-1); }
  .jd-thinking-indicator__anim[data-variant="dots"] > .jd-thinking-indicator__piece {
    width: 6px; height: 6px; border-radius: var(--jd-radius-full);
    animation: jd-think-bounce 1.4s var(--jd-easing-ease-in-out) infinite;
  }
  .jd-thinking-indicator__anim[data-variant="dots"] > .jd-thinking-indicator__piece:nth-child(2) { animation-delay: .16s; }
  .jd-thinking-indicator__anim[data-variant="dots"] > .jd-thinking-indicator__piece:nth-child(3) { animation-delay: .32s; }

  /* pulse */
  .jd-thinking-indicator__anim[data-variant="pulse"] > .jd-thinking-indicator__piece {
    width: 8px; height: 8px; border-radius: var(--jd-radius-full);
    animation: jd-think-pulse 1.4s var(--jd-easing-ease-in-out) infinite;
  }

  /* wave */
  .jd-thinking-indicator__anim[data-variant="wave"] {
    align-items: flex-end; gap: var(--jd-space-0-5); height: 12px;
  }
  .jd-thinking-indicator__anim[data-variant="wave"] > .jd-thinking-indicator__piece {
    width: 2px; height: 100%; border-radius: var(--jd-radius-full);
    transform-origin: bottom;
    animation: jd-think-wave 1s var(--jd-easing-ease-in-out) infinite;
  }
  .jd-thinking-indicator__anim[data-variant="wave"] > .jd-thinking-indicator__piece:nth-child(2) { animation-delay: .1s; }
  .jd-thinking-indicator__anim[data-variant="wave"] > .jd-thinking-indicator__piece:nth-child(3) { animation-delay: .2s; }
  .jd-thinking-indicator__anim[data-variant="wave"] > .jd-thinking-indicator__piece:nth-child(4) { animation-delay: .3s; }

  /* typewriter */
  .jd-thinking-indicator__anim[data-variant="typewriter"] > .jd-thinking-indicator__piece {
    width: 2px; height: 14px; border-radius: var(--jd-radius-sm);
    animation: jd-think-blink 1s steps(2) infinite;
  }

  .jd-thinking-indicator__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @keyframes jd-think-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: .4; }
    40% { transform: translateY(-3px); opacity: 1; }
  }
  @keyframes jd-think-pulse {
    0%, 100% { transform: scale(.8); opacity: .5; }
    50% { transform: scale(1.2); opacity: 1; }
  }
  @keyframes jd-think-wave {
    0%, 100% { transform: scaleY(.4); }
    50% { transform: scaleY(1); }
  }
  @keyframes jd-think-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* 움직임을 끄고 조각만 남긴다 — 대기 상태는 role=status 문장이 이미 말한다 */
  @media (prefers-reduced-motion: reduce) {
    .jd-thinking-indicator__piece { animation: none; opacity: .6; }
    .jd-thinking-indicator__anim[data-variant="wave"] > .jd-thinking-indicator__piece {
      transform: scaleY(.7);
    }
  }
}`;
