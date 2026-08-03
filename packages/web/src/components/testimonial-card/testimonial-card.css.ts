import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - card: rounded-xl border bg-surface p-5 + transition-shadow. highlighted =
 *   border-primary + ring-1 primary/30 + shadow-md / 아니면 border-border hover:shadow-md
 * - quote: relative px-6 py-8, 장식 큰따옴표 text-6xl primary/20 serif(::before),
 *   본문 text-lg italic leading-relaxed
 * - minimal: flex-col gap-3, 본문 text-sm, 작성자 인라인 text-xs muted
 * - 별점: gap-0.5 mb-2, 채움 #f59e0b(컴포넌트 고유 색 — v2 리터럴 승계)
 * - 아바타: 40px 원형, 이미지 object-cover / 이니셜 bg-primary white semibold
 * - 이름: text-sm semibold / 직책: text-xs muted / 로고: opacity-60
 */
export default css`
  @layer junds.base {
    jd-testimonial-card:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-testimonial-card {
      display: block;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    /* ── card (기본) ── */
    jd-testimonial-card[variant="card"] {
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
      border-radius: var(--jd-radius-xl);
      padding: var(--jd-space-5);
      transition: box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-testimonial-card[variant="card"]:hover {
      box-shadow: var(--jd-shadow-md);
    }
    jd-testimonial-card[variant="card"][highlighted] {
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-md),
        0 0 0 1px color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
    }

    /* ── quote ── */
    jd-testimonial-card[variant="quote"] {
      position: relative;
      padding: var(--jd-space-8) var(--jd-space-6);
    }
    jd-testimonial-card[variant="quote"] .jd-testimonial-card__quote::before {
      content: "\\201C";
      position: absolute;
      top: var(--jd-space-2);
      inset-inline-start: 0;
      font-family: var(--jd-font-serif);
      font-size: 3.75rem; /* text-6xl */
      line-height: 1;
      color: color-mix(in srgb, var(--jd-color-primary) 20%, transparent);
      user-select: none;
      pointer-events: none;
    }
    jd-testimonial-card[variant="quote"] .jd-testimonial-card__quote {
      position: static;
      font-size: var(--jd-text-lg);
      font-style: italic;
      line-height: var(--jd-leading-relaxed);
    }

    /* ── minimal ── */
    jd-testimonial-card[variant="minimal"] {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-3);
    }
    jd-testimonial-card[variant="minimal"] .jd-testimonial-card__author {
      margin-top: 0;
      gap: var(--jd-space-2);
      align-items: center;
    }
    jd-testimonial-card[variant="minimal"] .jd-testimonial-card__avatar {
      display: none;
    }
    jd-testimonial-card[variant="minimal"] .jd-testimonial-card__meta {
      flex-direction: row;
      align-items: baseline;
      gap: var(--jd-space-1-5);
      font-size: var(--jd-text-xs);
    }
    jd-testimonial-card[variant="minimal"] .jd-testimonial-card__role {
      color: var(--jd-color-muted);
    }
    jd-testimonial-card[variant="minimal"] .jd-testimonial-card__role::before {
      content: "· ";
    }

    /* ── 공통 조각 ── */
    .jd-testimonial-card__stars {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-bottom: var(--jd-space-2);
    }
    .jd-testimonial-card__star {
      flex-shrink: 0;
    }

    .jd-testimonial-card__quote {
      margin: 0;
      font-size: var(--jd-text-sm);
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-foreground);
    }

    .jd-testimonial-card__author {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      margin-top: var(--jd-space-4);
    }
    .jd-testimonial-card__avatar {
      flex-shrink: 0;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--jd-radius-full);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--jd-color-primary);
      color: #fff;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      background-size: cover;
      background-position: center;
    }
    .jd-testimonial-card__avatar[data-image] {
      background-color: transparent;
    }
    .jd-testimonial-card__meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }
    .jd-testimonial-card__name {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      font-style: normal;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-testimonial-card__role {
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-testimonial-card__logo {
      flex-shrink: 0;
      opacity: var(--jd-opacity-60);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-testimonial-card[variant="card"] {
        transition: none;
      }
    }
  }
`;
