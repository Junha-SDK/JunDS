import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 루트: bg-white/95 + backdrop-blur-sm(4px) + border-border/60 + rounded-2xl(16px)
 *   + shadow[0 1px 3px .04 / 0 1px 2px .02] + transition 300ms ease-out
 * - hoverable: cursor-pointer + shadow[0 8px 25px .08] + -translate-y-0.5(2px) + border-border
 * - Header: px-6 py-4 + border-b border-border/40, 제목 text-base(1rem)/semibold
 * - Body:   px-5 py-4
 * - Footer: px-6 py-3.5 + border-t border-border/40 + bg-gray-50/30 + rounded-b-2xl
 *
 * `transition-all`은 명시 프로퍼티 3종으로 좁혔다 — 같은 외관, 불필요한 프로퍼티 전이 없음.
 */
export default css`
@layer junds.base {
  jd-card:not(:defined),
  jd-card-header:not(:defined),
  jd-card-body:not(:defined),
  jd-card-footer:not(:defined) { display: block; }
}
@layer junds.components {
  jd-card {
    display: block;
    box-sizing: border-box; /* 스타일 프롭 w/maxW + border 병용 (DEC-014-9) */
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    background: color-mix(in srgb, var(--jd-color-card) 95%, transparent);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    border: var(--jd-border-thin) solid color-mix(in srgb, var(--jd-color-border) 60%, transparent);
    border-radius: var(--jd-radius-2xl);
    box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.02);
    transition:
      box-shadow var(--jd-duration-slow) var(--jd-easing-ease-out),
      transform var(--jd-duration-slow) var(--jd-easing-ease-out),
      border-color var(--jd-duration-slow) var(--jd-easing-ease-out);
  }

  jd-card[hoverable] { cursor: pointer; }
  /* :focus-within — 키보드 사용자도 같은 피드백을 받는다(v2에는 없었다) */
  jd-card[hoverable]:hover,
  jd-card[hoverable]:focus-within {
    box-shadow: 0 8px 25px rgba(0,0,0,.08);
    border-color: var(--jd-color-border);
  }
  jd-card[hoverable]:focus-visible {
    outline: none;
    box-shadow: 0 8px 25px rgba(0,0,0,.08), var(--jd-shadow-focus-ring);
  }
  @media (prefers-reduced-motion: no-preference) {
    jd-card[hoverable]:hover,
    jd-card[hoverable]:focus-within { transform: translateY(-2px); }
  }

  jd-card-header {
    display: block;
    box-sizing: border-box;
    padding: var(--jd-space-4) var(--jd-space-6);
    border-block-end: var(--jd-border-thin) solid
      color-mix(in srgb, var(--jd-color-border) 40%, transparent);
  }
  .jd-card-header__title {
    margin: 0;
    font-size: var(--jd-text-lg); /* v2 text-base = 1rem */
    font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-snug);
    color: var(--jd-color-foreground);
  }

  jd-card-body {
    display: block;
    box-sizing: border-box;
    padding: var(--jd-space-4) var(--jd-space-5);
  }

  jd-card-footer {
    display: block;
    box-sizing: border-box;
    padding: var(--jd-space-3-5) var(--jd-space-6);
    border-block-start: var(--jd-border-thin) solid
      color-mix(in srgb, var(--jd-color-border) 40%, transparent);
    /* v2 bg-gray-50/30 — 배경 토큰 30%로 번역해 다크에서도 "카드보다 한 톤" 유지 */
    background: color-mix(in srgb, var(--jd-color-background) 30%, transparent);
    border-end-start-radius: var(--jd-radius-2xl);
    border-end-end-radius: var(--jd-radius-2xl);
  }
}`;
