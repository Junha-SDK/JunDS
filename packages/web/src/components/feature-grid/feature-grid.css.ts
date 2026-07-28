import { css } from "../../core/styles.js";

/**
 * jd-feature-grid CSS — v2 patterns/FeatureGrid의 Tailwind → 토큰 기계 번역.
 *
 * v2 값:
 * - 섹션: `px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto`
 * - 헤더: `text-center mb-10 max-w-2xl mx-auto`, 제목 `text-2xl sm:text-3xl font-bold
 *   tracking-tight`(→ cta-section과 동일 섹션 헤더 관용구로 --jd-text-2xl/3xl 통일),
 *   부제 `mt-3 text-base text-muted`(→ --jd-text-lg)
 * - 격자: `grid grid-cols-1 gap-6` + columns 맵(2 → sm:2 · 3 → sm:2 lg:3 · 4 → sm:2 lg:4).
 *   v3는 이 반응형 계단을 **뷰포트가 아니라 부모 폭**으로 다시 세웠다(아래 격자 주석).
 * - 아이콘: `inline-flex ... rounded-md text-primary bg-primary-soft`(→ --jd-color-primary-light),
 *   card/minimal `w-12 h-12 mb-4 text-2xl`(→ --jd-text-3xl) · iconLeft `w-10 h-10 mb-0 shrink-0`
 * - card 아이템: `rounded-xl border bg-surface p-6 hover:shadow-md`(bg-surface → --jd-color-card),
 *   highlighted `border-primary ring-1 ring-primary/30`
 * - iconLeft 아이템: `flex items-start gap-4` · minimal 아이템: `px-2`
 * - 아이템 제목: `font-semibold text-base mb-1`(→ --jd-text-lg) ·
 *   설명: `text-sm text-muted leading-relaxed`(→ --jd-text-md)
 *
 * 기본값(columns=3 · layout=card)은 base 규칙이 담당한다 — 속성이 없어도 성립.
 * [columns]/[layout] 셀렉터는 그 밖의 값만 덮는다.
 */
export default css`
  @layer junds.base {
    jd-feature-grid:not(:defined) {
      display: block;
    }
    jd-feature-grid:not(:defined) > script {
      display: none;
    }
  }
  @layer junds.components {
    jd-feature-grid {
      display: block;
      box-sizing: border-box;
      max-width: 80rem; /* max-w-7xl */
      margin-inline: auto;
      padding: var(--jd-space-12) var(--jd-space-4); /* py-12 px-4 */
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    @media (min-width: 640px) {
      jd-feature-grid {
        padding: var(--jd-space-20) var(--jd-space-6);
      } /* sm:py-20 sm:px-6 */
    }

    /* ── 헤더 (cta-section 섹션 헤더 관용구와 일치) ─────────────── */
    .jd-feature-grid__header {
      max-width: 42rem; /* max-w-2xl */
      margin: 0 auto var(--jd-space-10); /* mb-10 */
      text-align: center;
    }
    .jd-feature-grid__header[hidden] {
      display: none;
    }

    .jd-feature-grid__title {
      margin: 0;
      font-size: var(--jd-text-2xl);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-tight);
      letter-spacing: var(--jd-tracking-tight);
    }
    .jd-feature-grid__title[hidden] {
      display: none;
    }
    @media (min-width: 640px) {
      .jd-feature-grid__title {
        font-size: var(--jd-text-3xl);
      }
    }

    .jd-feature-grid__subtitle {
      margin: var(--jd-space-3) 0 0; /* mt-3 */
      font-size: var(--jd-text-lg); /* text-base */
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted);
    }
    .jd-feature-grid__subtitle[hidden] {
      display: none;
    }

    /* ── 격자 ─────────────────────────────────────────────────── */
    /* v2의 sm/lg 미디어쿼리를 **부모 폭 기준**으로 옮긴 것. 뷰포트 미디어쿼리는 이
     섹션이 좁은 칼럼(카드·사이드바·미리보기) 안에 놓이면 거짓말을 한다 — 화면이
     1024px이라는 이유로 300px 칸에 3열을 그려 본문이 단어마다 줄이 바뀌었다(실측).
     하한은 "요청 열 수로 나눈 폭"과 최소 카드 폭 중 큰 쪽이라, 넓을 때는 정확히
     columns 열이고 좁아지면 스스로 2열 → 1열로 접힌다. */
    .jd-feature-grid__grid {
      --jd-fg-gap: var(--jd-space-6); /* gap-6 */
      --jd-fg-cols: 3;
      --jd-fg-col-min: 16rem;
      display: grid;
      grid-template-columns: repeat(
        auto-fit,
        minmax(
          min(
            100%,
            max(
              var(--jd-fg-col-min),
              (100% - (var(--jd-fg-cols) - 1) * var(--jd-fg-gap)) / var(--jd-fg-cols)
            )
          ),
          1fr
        )
      );
      gap: var(--jd-fg-gap);
    }
    jd-feature-grid[columns="2"] .jd-feature-grid__grid {
      --jd-fg-cols: 2;
    }
    jd-feature-grid[columns="4"] .jd-feature-grid__grid {
      --jd-fg-cols: 4;
    }

    /* ── 아이템 (기본 = card) ─────────────────────────────────── */
    .jd-feature-grid__item {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      min-width: 0; /* 격자 자식 기본 min-width:auto가 칸을 밀어내지 못하게(§5) */
      padding: var(--jd-space-6); /* p-6 */
      background: var(--jd-color-card); /* bg-surface */
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl); /* rounded-xl */
      /* 면만 있는 카드는 색종이로 읽힌다 — 쉬는 상태에도 얕은 그림자를 얹어야
       hover의 shadow-md가 '떠오름'으로 읽힌다(§2) */
      box-shadow: var(--jd-shadow-xs);
      transition: box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
        border-color var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-feature-grid__item:hover {
      box-shadow: var(--jd-shadow-md);
    }
    .jd-feature-grid__item[data-highlighted] {
      border-color: var(--jd-color-primary); /* border-primary */
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--jd-color-primary) 30%, transparent),
        var(--jd-shadow-xs); /* ring-1 ring-primary/30 */
    }
    .jd-feature-grid__item[data-highlighted]:hover {
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--jd-color-primary) 30%, transparent),
        var(--jd-shadow-md);
    }

    /* 링크 카드 — hover:no-underline, 색 상속 */
    a.jd-feature-grid__item {
      text-decoration: none;
      color: inherit;
      /* 누를 수 있는 카드는 눌리는 것이 보여야 한다(§1) */
      transition: box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
        border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    a.jd-feature-grid__item:hover {
      text-decoration: none;
    }
    a.jd-feature-grid__item:active {
      scale: 0.99;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    /* 링은 outline으로 — border-radius를 따라가고 카드의 그림자를 지우지 않는다(DEC-039) */
    a.jd-feature-grid__item:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    /* minimal — 카드 크롬 제거, px-2만 */
    jd-feature-grid[layout="minimal"] .jd-feature-grid__item {
      padding: 0 var(--jd-space-2); /* px-2 */
      background: none;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }
    jd-feature-grid[layout="minimal"] .jd-feature-grid__item:hover {
      box-shadow: none;
    }

    /* iconLeft — 카드 크롬 제거, 가로 배치 */
    jd-feature-grid[layout="iconLeft"] .jd-feature-grid__item {
      flex-direction: row;
      align-items: flex-start; /* items-start */
      gap: var(--jd-space-4); /* gap-4 */
      padding: 0;
      background: none;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }
    jd-feature-grid[layout="iconLeft"] .jd-feature-grid__item:hover {
      box-shadow: none;
    }

    /* ── 아이콘 ───────────────────────────────────────────────── */
    .jd-feature-grid__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: flex-start; /* 세로 배치에서 늘어나지 않게 */
      box-sizing: border-box;
      flex-shrink: 0;
      width: 3rem; /* w-12 */
      height: 3rem;
      margin-block-end: var(--jd-space-4); /* mb-4 */
      color: var(--jd-color-primary-ink); /* text-primary */
      background: var(--jd-color-primary-light); /* bg-primary-soft */
      border-radius: var(--jd-radius-md); /* rounded-md */
      font-size: var(--jd-text-3xl); /* text-2xl */
    }
    .jd-feature-grid__icon[hidden] {
      display: none;
    }
    .jd-feature-grid__icon > svg {
      width: 1.5rem;
      height: 1.5rem;
    }
    jd-feature-grid[layout="iconLeft"] .jd-feature-grid__icon {
      width: 2.5rem; /* w-10 */
      height: 2.5rem;
      margin-block-end: 0; /* mb-0 */
      font-size: var(--jd-text-lg);
    }
    jd-feature-grid[layout="iconLeft"] .jd-feature-grid__icon > svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    /* ── 본문 ─────────────────────────────────────────────────── */
    /* flex-1 min-w-0 — 카드 높이 채움(격자 stretch) + iconLeft 가로 채움 */
    .jd-feature-grid__body {
      flex: 1 1 auto;
      min-width: 0;
    }

    /* 제목·본문은 어절을 지킨다 — 기본 CJK 줄바꿈은 글자 단위라 칸이 좁아지는 순간
     "웹소/켓 시/세를"처럼 낱말이 조각난다(§5) */
    .jd-feature-grid__item-title {
      margin: 0 0 var(--jd-space-1); /* mb-1 */
      font-size: var(--jd-text-lg); /* text-base */
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-snug);
      color: var(--jd-color-foreground);
      word-break: keep-all;
      overflow-wrap: break-word;
      text-wrap: balance;
    }

    .jd-feature-grid__item-desc {
      margin: 0;
      font-size: var(--jd-text-md); /* text-sm */
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted); /* text-muted */
      word-break: keep-all;
      overflow-wrap: break-word;
    }
    .jd-feature-grid__item-desc[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      /* 링크 카드 규칙(a.…)이 더 구체적이라 함께 적지 않으면 전이가 살아남는다 */
      .jd-feature-grid__item,
      a.jd-feature-grid__item {
        transition: none;
      }
    }
  }
`;
