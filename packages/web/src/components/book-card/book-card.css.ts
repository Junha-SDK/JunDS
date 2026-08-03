import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 버튼: block w-full text-left rounded-xl overflow-hidden
 *   transition-all 300ms ease-out · hover -translate-y-1(0.25rem) + shadow-xl/black20
 *   · focus-visible ring-2 ring-blue-500 ring-offset-2 → 레포 표준 포커스 링 토큰
 * - 커버: relative aspect-[3/4] overflow-hidden rounded-t-xl
 * - 광택: bg-gradient-to-br from-white/25 via-transparent, opacity 0 → hover 1, 500ms
 * - 그레인: feTurbulence 데이터 URI, opacity .06, mix-blend-overlay
 * - 잠금: bg-black/50 backdrop-blur-[2px] + 🔒 text-3xl(1.875rem) + text-xs medium opacity-80
 * - 메타: p-3 bg-white dark:bg-slate-900 · 제목 text-sm(0.875rem) semibold truncate
 *   · 종류 text-xs slate-500 · 저자 text-xs slate-400 · 배지 mt-1.5
 *
 * 앰버 칩은 <jd-badge variant="warning" size="sm">가 그린다 — 여기서는 여백만 준다.
 */
export default css`
  @layer junds.base {
    jd-book-card:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-book-card {
      display: block;
    }

    .jd-book-card__button {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border: 0;
      text-align: start;
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      font-family: var(--jd-font-sans);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
      cursor: pointer;
      transition: transform var(--jd-duration-slow) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-slow) var(--jd-easing-ease-out);
    }
    .jd-book-card__button:hover,
    .jd-book-card__button:focus-visible {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
    }
    .jd-book-card__button:focus-visible {
      outline: none;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2),
        var(--jd-shadow-focus-ring);
    }
    @media (prefers-reduced-motion: no-preference) {
      /* 키보드 사용자도 같은 상승을 받는다(v2는 hover 전용이었다) */
      .jd-book-card__button:hover,
      .jd-book-card__button:focus-visible {
        transform: translateY(-0.25rem);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .jd-book-card__button {
        transition: none;
      }
    }

    .jd-book-card__cover {
      position: relative;
      display: block;
      aspect-ratio: 3 / 4;
      overflow: hidden;
      border-start-start-radius: var(--jd-radius-xl);
      border-start-end-radius: var(--jd-radius-xl);
      isolation: isolate;
    }

    /* 광택 — 호버·포커스에서만 (DOM 0) */
    .jd-book-card__cover::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.25) 0%,
        transparent 50%,
        transparent 100%
      );
      opacity: 0;
      transition: opacity var(--jd-duration-slower) var(--jd-easing-ease-out);
    }
    .jd-book-card__button:hover .jd-book-card__cover::before,
    .jd-book-card__button:focus-visible .jd-book-card__cover::before {
      opacity: 1;
    }

    /* 그레인 텍스처 — v2 데이터 URI 그대로 (DOM 0) */
    .jd-book-card__cover::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 3;
      pointer-events: none;
      opacity: 0.06;
      mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    .jd-book-card__lock {
      position: absolute;
      inset: 0;
      z-index: 4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--jd-space-2);
      color: #fff;
      background: rgba(0, 0, 0, 0.5);
      -webkit-backdrop-filter: blur(2px);
      backdrop-filter: blur(2px);
    }
    .jd-book-card__lock[hidden] {
      display: none;
    }
    .jd-book-card__lock-icon {
      font-size: 1.875rem;
      line-height: var(--jd-leading-none);
    }
    .jd-book-card__lock-text {
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      opacity: var(--jd-opacity-80);
    }

    .jd-book-card__meta {
      display: block;
      box-sizing: border-box;
      padding: var(--jd-space-3);
      background: var(--jd-color-card);
    }
    .jd-book-card__title {
      display: block;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .jd-book-card__sub {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      margin-block-start: var(--jd-space-1);
      font-size: var(--jd-text-xs);
      min-width: 0;
    }
    .jd-book-card__kind {
      color: var(--jd-color-muted);
    }
    .jd-book-card__kind[hidden] {
      display: none;
    }
    .jd-book-card__author {
      color: var(--jd-color-muted-light);
    }
    .jd-book-card__author[hidden] {
      display: none;
    }

    .jd-book-card__badge {
      margin-block-start: var(--jd-space-1-5);
    }
    /* 저작 display가 UA의 [hidden]을 이긴다 — jd-badge는 inline-flex다(레포 관용구) */
    .jd-book-card__badge[hidden] {
      display: none;
    }
  }
`;
