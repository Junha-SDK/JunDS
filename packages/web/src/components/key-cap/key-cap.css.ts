import { css } from "../../core/styles.js";

/**
 * v2 값: sm 20 / md 24 / lg 32px(min-width=height), variant default(카드+입체 그림자)/
 * primary/muted, pressed = 1px 내려앉음+그림자 제거. v2 bg-surface/surface-soft
 * (Tailwind 커스텀)는 card/card-hover 토큰으로 근사 번역(DECISIONS B4).
 */
export default css`
@layer junds.components {
  jd-key-cap { display: inline-flex; }

  .jd-key-cap {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: var(--jd-radius-md);
    font-family: var(--jd-font-mono); font-weight: var(--jd-weight-medium);
    transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out);
    /* size 기본 md — 24px */
    height: 1.5rem; min-width: 1.5rem; padding-inline: var(--jd-space-1-5);
    font-size: var(--jd-text-xs);
    /* variant 기본 default */
    background: var(--jd-color-card); color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    box-shadow: 0 1px 0 rgba(0,0,0,.06), inset 0 -1px 0 rgba(0,0,0,.04);
  }
  jd-key-cap[size="sm"] > .jd-key-cap {
    height: 1.25rem; min-width: 1.25rem; padding-inline: var(--jd-space-1); font-size: 10px;
  }
  jd-key-cap[size="lg"] > .jd-key-cap {
    height: 2rem; min-width: 2rem; padding-inline: var(--jd-space-2);
    font-size: var(--jd-text-md);
  }

  jd-key-cap[variant="primary"] > .jd-key-cap {
    background: var(--jd-color-primary); color: #fff;
    border-color: var(--jd-color-primary); box-shadow: none;
  }
  jd-key-cap[variant="muted"] > .jd-key-cap {
    background: var(--jd-color-card-hover); color: var(--jd-color-muted);
    border-color: var(--jd-color-border-light); box-shadow: none;
  }

  jd-key-cap[pressed] > .jd-key-cap {
    transform: translateY(1px); box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-key-cap { transition: none; }
  }
}`;
