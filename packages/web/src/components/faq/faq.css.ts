import { css } from "../../core/styles.js";

/**
 * jd-faq CSS — v2 patterns/FAQ의 Tailwind → 토큰 기계 번역.
 *
 * v2 값:
 * - 섹션: `px-4 sm:px-6 py-12 sm:py-20 max-w-3xl mx-auto`
 * - 헤더: `text-center mb-10`, 제목 `text-2xl sm:text-3xl font-bold tracking-tight`
 *   (cta-section 섹션 헤더 관용구와 통일), 부제 `mt-3 text-base text-muted`(→ --jd-text-lg)
 * - 컨트롤: `mb-6 flex flex-col sm:flex-row gap-3`
 * - 검색: `flex-1 rounded-md border bg-surface px-3 py-2 text-sm focus ring-ring`
 *   (bg-surface → --jd-color-card · text-sm → --jd-text-md)
 * - 칩: `px-3 py-1 text-xs rounded-full border`, active `border-primary bg-primary text-white`,
 *   inactive `border-border hover:bg-surface-soft`(→ --jd-color-card-hover)
 * - 행: `rounded-lg border border-border bg-surface overflow-hidden`(space-y-2)
 * - 트리거: `w-full flex items-center justify-between gap-3 px-4 py-3 font-medium
 *   hover:bg-surface-soft`(font-medium base 1rem → --jd-text-lg)
 * - 셰브런: `text-muted transition-transform` + 열림 rotate-180
 * - 답변: `px-4 pb-3 text-sm text-muted leading-relaxed`(→ --jd-text-md)
 * - 빈 상태: `text-center py-8 text-sm text-muted`
 *
 * 행 내부(트리거·질문·셰브런·답변)는 원형 jd-disclosure 시트와 채택 순서가 확정적이지
 * 않으므로 `.jd-faq__item` 접두로 특이도(0,2,0↑)를 올려 개폐 관용구 위에 확실히 얹는다.
 */
export default css`
  @layer junds.base {
    jd-faq:not(:defined) {
      display: block;
    }
    jd-faq:not(:defined) > script {
      display: none;
    }
  }
  @layer junds.components {
    jd-faq {
      display: block;
      box-sizing: border-box;
      max-width: 48rem; /* max-w-3xl */
      margin-inline: auto;
      padding: var(--jd-space-12) var(--jd-space-4); /* py-12 px-4 */
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    @media (min-width: 640px) {
      jd-faq {
        padding: var(--jd-space-20) var(--jd-space-6);
      } /* sm:py-20 sm:px-6 */
    }

    /* ── 헤더 ─────────────────────────────────────────────────── */
    .jd-faq__header {
      text-align: center;
      margin-block-end: var(--jd-space-10);
    } /* mb-10 */
    .jd-faq__header[hidden] {
      display: none;
    }

    .jd-faq__title {
      margin: 0;
      font-size: var(--jd-text-2xl);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-tight);
      letter-spacing: var(--jd-tracking-tight);
    }
    .jd-faq__title[hidden] {
      display: none;
    }
    @media (min-width: 640px) {
      .jd-faq__title {
        font-size: var(--jd-text-3xl);
      }
    }

    .jd-faq__subtitle {
      margin: var(--jd-space-3) 0 0; /* mt-3 */
      font-size: var(--jd-text-lg); /* text-base */
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted);
    }
    .jd-faq__subtitle[hidden] {
      display: none;
    }

    /* ── 컨트롤 (검색 + 필터) ─────────────────────────────────── */
    .jd-faq__controls {
      margin-block-end: var(--jd-space-6); /* mb-6 */
      display: flex;
      flex-direction: column; /* flex-col */
      gap: var(--jd-space-3); /* gap-3 */
    }
    .jd-faq__controls[hidden] {
      display: none;
    }
    @media (min-width: 640px) {
      .jd-faq__controls {
        flex-direction: row;
      } /* sm:flex-row */
    }

    .jd-faq__search {
      flex: 1 1 auto; /* flex-1 */
      box-sizing: border-box;
      min-width: 0;
      margin: 0;
      padding: var(--jd-space-2) var(--jd-space-3); /* px-3 py-2 */
      font-family: inherit;
      font-size: var(--jd-text-md); /* text-sm */
      color: var(--jd-color-foreground);
      background: var(--jd-color-card); /* bg-surface */
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-md); /* rounded-md */
    }
    .jd-faq__search[hidden] {
      display: none;
    }
    .jd-faq__search::placeholder {
      color: var(--jd-color-muted);
    }
    .jd-faq__search:focus-visible {
      outline: none;
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring); /* ring-ring */
    }

    .jd-faq__filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-1); /* gap-1 */
    }
    .jd-faq__filters[hidden] {
      display: none;
    }

    .jd-faq__chip {
      box-sizing: border-box;
      margin: 0;
      padding: var(--jd-space-1) var(--jd-space-3); /* px-3 py-1 */
      font-family: inherit;
      font-size: var(--jd-text-xs); /* text-xs */
      line-height: var(--jd-leading-normal);
      color: var(--jd-color-foreground);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-full); /* rounded-full */
      cursor: pointer;
      transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        color var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-faq__chip:hover {
      background: var(--jd-color-card-hover);
    } /* hover:bg-surface-soft */
    .jd-faq__chip[data-active] {
      border-color: var(--jd-color-primary);
      background: var(--jd-color-primary);
      color: #fff;
    }
    .jd-faq__chip:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    /* ── 목록 (분리형 카드, space-y-2) ────────────────────────── */
    .jd-faq__list {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-2); /* space-y-2 */
    }

    /* 원형 jd-disclosure { display:block } 위에서 필터 숨김이 이기도록 (0,2,0) */
    .jd-faq__item {
      box-sizing: border-box;
      background: var(--jd-color-card); /* bg-surface */
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg); /* rounded-lg */
      overflow: hidden;
    }
    .jd-faq__item[hidden] {
      display: none;
    }

    /* 트리거 — 원형 .jd-disclosure__trigger 위에 얹는다(.jd-faq__item 접두로 특이도↑) */
    .jd-faq__item .jd-faq__trigger {
      justify-content: space-between; /* justify-between */
      gap: var(--jd-space-3); /* gap-3 */
      padding: var(--jd-space-3) var(--jd-space-4); /* px-4 py-3 */
      font-size: var(--jd-text-lg); /* font-medium base */
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
      transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-faq__item .jd-faq__trigger:hover:not(:disabled) {
      background: var(--jd-color-card-hover); /* hover:bg-surface-soft */
    }

    .jd-faq__item .jd-faq__question {
      flex: 1 1 auto;
      min-width: 0;
    }

    .jd-faq__item .jd-faq__chevron {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--jd-color-muted);
      transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-faq__item .jd-faq__chevron > svg {
      width: 1rem;
      height: 1rem;
    }
    .jd-faq__item .jd-faq__trigger[data-state="open"] .jd-faq__chevron {
      transform: rotate(180deg);
    }

    .jd-faq__item .jd-faq__answer {
      padding: 0 var(--jd-space-4) var(--jd-space-3); /* px-4 pb-3 */
      font-size: var(--jd-text-md); /* text-sm */
      color: var(--jd-color-muted);
      line-height: var(--jd-leading-relaxed);
    }

    /* ── 빈 상태 ──────────────────────────────────────────────── */
    .jd-faq__empty {
      padding: var(--jd-space-8) 0; /* py-8 */
      text-align: center;
      font-size: var(--jd-text-md); /* text-sm */
      color: var(--jd-color-muted);
    }
    .jd-faq__empty[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-faq__chip,
      .jd-faq__item .jd-faq__trigger,
      .jd-faq__item .jd-faq__chevron {
        transition: none;
      }
    }
  }
`;
