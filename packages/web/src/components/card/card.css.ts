import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 루트: bg-white/95 + backdrop-blur-sm(4px) + border-border/60 + rounded-2xl(16px)
 *   + shadow(→ --jd-shadow-xs + 상단 인셋 하이라이트) + transition 300ms ease-out
 * - hoverable: cursor-pointer + shadow(→ --jd-shadow-lg) + -translate-y-0.5(2px) + border-border
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
    jd-card-footer:not(:defined) {
      display: block;
    }
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
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-border) 60%, transparent);
      border-radius: var(--jd-radius-2xl);
      /* v2의 rgba 리터럴 그림자는 다크에서 검정 위 검정이라 사라졌다 — 모드별로
       값이 갈리는 토큰으로 옮기고, 위에서 받는 빛 한 겹을 더한다(§2). */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      transition: box-shadow var(--jd-duration-slow) var(--jd-easing-ease-out),
        transform var(--jd-duration-slow) var(--jd-easing-ease-out),
        border-color var(--jd-duration-slow) var(--jd-easing-ease-out);
    }

    jd-card[hoverable] {
      cursor: pointer;
    }
    /* :focus-within — 키보드 사용자도 같은 피드백을 받는다(v2에는 없었다) */
    jd-card[hoverable]:hover,
    jd-card[hoverable]:focus-within {
      box-shadow: var(--jd-shadow-lg), inset 0 1px 0 var(--jd-color-highlight);
      border-color: var(--jd-color-border);
    }
    /* 누른 순간은 빛을 잃는다(§1) — 상승도 함께 거둔다 */
    jd-card[hoverable]:active {
      box-shadow: var(--jd-shadow-xs), inset 0 1px 2px var(--jd-color-shade);
      transform: none;
    }
    jd-card[hoverable]:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-lg), var(--jd-shadow-focus-ring);
    }
    @media (prefers-reduced-motion: no-preference) {
      jd-card[hoverable]:hover,
      jd-card[hoverable]:focus-within {
        transform: translateY(-2px);
      }
    }

    jd-card-header {
      display: block;
      box-sizing: border-box;
      padding: var(--jd-space-4) var(--jd-space-6);
      border-block-end: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-border) 40%, transparent);
    }
    /* 헤더뿐인 카드(본문·바닥 없음)에서는 구분선이 나눌 것이 없다. 그대로 두면 선이
     카드의 둥근 아래 모서리를 가로질러 제목 둘레에 어중간한 테두리를 만든다 —
     실측된 "헤더가 깨져 보인다"의 정체다. 같은 이유로 바닥만 있는 카드도 막는다. */
    jd-card-header:last-child {
      border-block-end: 0;
    }
    jd-card-footer:first-child {
      border-block-start: 0;
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
    jd-card-footer:first-child {
      border-start-start-radius: var(--jd-radius-2xl);
      border-start-end-radius: var(--jd-radius-2xl);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-card {
        transition: none;
      }
    }
  }
`;
