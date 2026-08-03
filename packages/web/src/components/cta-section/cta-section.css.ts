import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 래퍼: default = px-4/6 py-12/16 + bg-surface + border-y border-border
 *         gradient = 동일 패딩 + bg-gradient primary→primary-hover + text-white
 *         subtle = 동일 패딩 + bg-surface-soft(→ card-hover)
 *         split = max-w-6xl mx-auto px-4/6 py-12 + 내부 카드(rounded-2xl border p-8, 2단 그리드)
 * - inner: default/gradient/subtle = max-w-3xl mx-auto text-center / split = max-w-6xl
 * - 제목: text-2xl/3xl bold tracking-tight, 부제: text-base(=lg) muted (gradient는 white/85)
 * - 버튼: rounded-md px-5 py-2.5 text-sm semibold. primary=primary/white, secondary=border/surface
 *         gradient(dark)에서 primary=white/foreground, secondary=white 테두리
 */
export default css`
  @layer junds.base {
    jd-cta-section:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-cta-section {
      display: block;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
      /* default */
      padding: var(--jd-space-12) var(--jd-space-4);
      background: var(--jd-color-card);
      border-block: var(--jd-border-thin) solid var(--jd-color-border);
    }
    @media (min-width: 640px) {
      jd-cta-section {
        padding: var(--jd-space-16) var(--jd-space-6);
      }
    }

    jd-cta-section[variant="gradient"] {
      background: var(--jd-gradient-primary);
      color: #fff;
      border-block: 0;
    }
    jd-cta-section[variant="subtle"] {
      background: var(--jd-color-card-hover);
      border-block: 0;
    }
    jd-cta-section[variant="split"] {
      background: transparent;
      border-block: 0;
      padding: var(--jd-space-12) var(--jd-space-4);
    }
    @media (min-width: 640px) {
      jd-cta-section[variant="split"] {
        padding: var(--jd-space-12) var(--jd-space-6);
      }
    }

    .jd-cta-section__inner {
      max-width: 48rem; /* max-w-3xl */
      margin-inline: auto;
    }
    jd-cta-section[variant="split"] .jd-cta-section__inner {
      max-width: 72rem; /* max-w-6xl */
      display: grid;
      gap: var(--jd-space-8);
      align-items: center;
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-border) 76%, transparent);
      border-radius: var(--jd-radius-2xl);
      background: var(--jd-color-card);
      /* 페이지 위에 얹힌 카드 — 면만 있으면 색종이로 읽힌다 */
      box-shadow: var(--jd-shadow-sm), inset 0 1px 0 var(--jd-color-highlight);
      padding: var(--jd-space-8);
    }
    @media (min-width: 1024px) {
      jd-cta-section[variant="split"] .jd-cta-section__inner {
        grid-template-columns: 1fr 1fr;
      }
    }

    .jd-cta-section__content {
      text-align: center;
    }
    jd-cta-section[variant="split"] .jd-cta-section__content {
      text-align: start;
    }

    .jd-cta-section__title {
      margin: 0;
      font-size: var(--jd-text-2xl);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-tight);
      letter-spacing: var(--jd-tracking-tight);
      /* 가운데 정렬 헤드라인이 마지막 줄에 한 단어만 남기지 않게 */
      text-wrap: balance;
    }
    @media (min-width: 640px) {
      .jd-cta-section__title {
        font-size: var(--jd-text-3xl);
      }
    }

    .jd-cta-section__desc {
      margin: var(--jd-space-3) 0 0;
      font-size: var(--jd-text-lg);
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted);
    }
    jd-cta-section[variant="gradient"] .jd-cta-section__desc {
      color: rgba(255, 255, 255, 0.85);
    }

    .jd-cta-section__actions {
      margin-top: var(--jd-space-6);
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-3);
      justify-content: center;
    }
    jd-cta-section[variant="split"] .jd-cta-section__actions {
      justify-content: flex-start;
    }

    .jd-cta-section__media {
      min-width: 0;
    }

    /* 버튼 — anchor·button 공용 */
    .jd-cta-section__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border: var(--jd-border-thin) solid transparent;
      margin: 0;
      padding: var(--jd-space-2-5) var(--jd-space-5);
      font-family: inherit;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-none);
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      border-radius: var(--jd-radius-md);
      /* filter를 전이 대상에서 뺐다 — brightness 호버는 글자까지 함께 밝혀 흰 글자가
       배경에 녹고 GPU 레이어를 새로 만든다. 호버는 실색 전환으로 한다. */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-cta-section__btn:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-cta-section__btn:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-cta-section__btn--primary {
      background: var(--jd-color-primary);
      color: #fff;
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-cta-section__btn--primary:hover {
      background: var(--jd-color-primary-hover);
      box-shadow: 0 4px 12px var(--jd-color-primary-glow), var(--jd-shadow-xs),
        inset 0 1px 0 var(--jd-color-highlight);
    }

    .jd-cta-section__btn--secondary {
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      border-color: var(--jd-color-border);
      box-shadow: var(--jd-shadow-xs);
    }
    .jd-cta-section__btn--secondary:hover {
      background: var(--jd-color-card-hover);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
      box-shadow: var(--jd-shadow-sm);
    }

    /* gradient(dark) 위에서의 버튼 반전 */
    jd-cta-section[variant="gradient"] .jd-cta-section__btn--primary {
      background: #fff;
      color: var(--jd-color-primary-hover);
      box-shadow: var(--jd-shadow-sm);
    }
    jd-cta-section[variant="gradient"] .jd-cta-section__btn--primary:hover {
      /* brightness 대신 실색 — 흰 면을 primary 쪽으로 아주 조금 당긴다 */
      background: color-mix(in srgb, #ffffff 90%, var(--jd-color-primary));
      box-shadow: var(--jd-shadow-md);
    }
    jd-cta-section[variant="gradient"] .jd-cta-section__btn--secondary {
      background: transparent;
      color: #fff;
      border-color: rgba(255, 255, 255, 0.4);
    }
    jd-cta-section[variant="gradient"] .jd-cta-section__btn--secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    jd-cta-section[variant="gradient"] .jd-cta-section__btn:focus-visible {
      outline-color: rgba(255, 255, 255, 0.7);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-cta-section__btn {
        transition: none;
      }
    }
  }
`;
