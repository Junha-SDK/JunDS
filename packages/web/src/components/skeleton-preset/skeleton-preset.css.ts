import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → rem 기계 번역):
 *  card    카드 rounded-xl/border/p-5/space-y-4 · 썸네일 h-40 rounded-xl ·
 *          제목 h-5 w-3/4 · 부제 h-4 w-1/2 · 칩 h-8 w-20 rounded-lg ×2
 *  table   rounded-xl/border/overflow-hidden · 헤더 bg-gray-50 · 행 p-3 gap-4 ·
 *          셀 h-4 flex-1 ×4 · 마지막 행 border 없음
 *  profile 아바타 14(3.5rem) rounded-full · 이름 h-5 w-32 · 메타 h-4 w-48
 *  article 헤드라인 h-8 w-3/4 · 바이라인(아바타 8 + h-4 w-24 + h-4 w-20) ·
 *          히어로 h-48 rounded-xl · 문단 h-4 ×3(마지막 5/6)
 *  list    아이콘 10(2.5rem) rounded-lg · 제목 h-4 w-2/3 · 부제 h-3 w-1/3
 *
 * 반짝임(색·박자·다크·reduced-motion)은 전부 skeleton.css의 `.jd-skeleton-block`이
 * 갖는다 — 여기에는 **치수와 배치만** 있다.
 */
export default css`
  @layer junds.components {
    jd-skeleton-preset {
      display: block;
    } /* CE 기본 display:inline 방지 */

    /* ── card(기본) ─────────────────────────────────────── */
    /* default variant는 attribute로 나가지 않는다. 맨 호스트에 카드 규칙을 얹으면
     padding·gap이 표·프로필로 새므로 :not([variant])로 기본 경우만 집는다. */
    jd-skeleton-preset:not([variant]),
    jd-skeleton-preset[variant="card"] {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-4);
      padding: var(--jd-space-5);
      box-sizing: border-box;
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
    }
    .jd-skeleton-preset__thumb {
      height: 10rem;
      --jd-skeleton-radius: var(--jd-radius-xl);
    }
    .jd-skeleton-preset__title {
      height: 1.25rem;
      width: 75%;
    }
    .jd-skeleton-preset__subtitle {
      height: 1rem;
      width: 50%;
    }
    .jd-skeleton-preset__actions {
      display: flex;
      gap: var(--jd-space-2);
    }
    .jd-skeleton-preset__chip {
      height: 2rem;
      width: 5rem;
      --jd-skeleton-radius: var(--jd-radius-lg);
    }

    /* ── table ──────────────────────────────────────────── */
    jd-skeleton-preset[variant="table"] {
      display: block;
      box-sizing: border-box;
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
    }
    .jd-skeleton-preset__head,
    .jd-skeleton-preset__row {
      display: flex;
      gap: var(--jd-space-4);
      padding: var(--jd-space-3);
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-skeleton-preset__head {
      background: var(--jd-color-border-light);
    }
    .jd-skeleton-preset__row:last-child {
      border-bottom: 0;
    }
    .jd-skeleton-preset__cell {
      height: 1rem;
      flex: 1;
      min-width: 0;
    }

    /* ── profile ────────────────────────────────────────── */
    jd-skeleton-preset[variant="profile"] {
      display: flex;
      align-items: center;
      gap: var(--jd-space-4);
    }
    .jd-skeleton-preset__avatar {
      width: 3.5rem;
      height: 3.5rem;
      flex-shrink: 0;
      --jd-skeleton-radius: var(--jd-radius-full);
    }
    .jd-skeleton-preset__body {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-2);
      flex: 1;
      min-width: 0;
    }
    .jd-skeleton-preset__name {
      height: 1.25rem;
      width: 8rem;
    }
    .jd-skeleton-preset__meta {
      height: 1rem;
      width: 12rem;
    }

    /* ── article ────────────────────────────────────────── */
    jd-skeleton-preset[variant="article"] {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-4);
    }
    .jd-skeleton-preset__headline {
      height: 2rem;
      width: 75%;
    }
    .jd-skeleton-preset__byline {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
    }
    .jd-skeleton-preset__byline .jd-skeleton-preset__avatar {
      width: 2rem;
      height: 2rem;
    }
    .jd-skeleton-preset__by-name {
      height: 1rem;
      width: 6rem;
    }
    .jd-skeleton-preset__by-date {
      height: 1rem;
      width: 5rem;
    }
    .jd-skeleton-preset__hero {
      height: 12rem;
      --jd-skeleton-radius: var(--jd-radius-xl);
    }
    .jd-skeleton-preset__para {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-2);
    }
    .jd-skeleton-preset__p {
      height: 1rem;
      width: 100%;
    }
    .jd-skeleton-preset__p[data-last] {
      width: 83.333%;
    } /* v2 w-5/6 */

    /* ── list ───────────────────────────────────────────── */
    jd-skeleton-preset[variant="list"] {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-3);
    }
    .jd-skeleton-preset__item {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
    }
    .jd-skeleton-preset__icon {
      width: 2.5rem;
      height: 2.5rem;
      flex-shrink: 0;
      --jd-skeleton-radius: var(--jd-radius-lg);
    }
    .jd-skeleton-preset__item .jd-skeleton-preset__body {
      gap: var(--jd-space-1-5);
    }
    .jd-skeleton-preset__item-title {
      height: 1rem;
      width: 66.666%;
    }
    .jd-skeleton-preset__item-sub {
      height: 0.75rem;
      width: 33.333%;
    }
  }
`;
