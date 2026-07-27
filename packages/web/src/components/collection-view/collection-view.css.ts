/**
 * jd-collection-view CSS — v2 composites/CollectionView 토큰 번역.
 *
 * v2 값: 루트 `flex flex-col gap-4`, 상단 바 `flex flex-wrap items-center gap-3`,
 * 검색 `flex-1 min-w-[200px]` + 입력 `pl-9 pr-3 py-2 rounded-lg border` (포커스 ring primary/30),
 * 뷰 토글 `rounded-lg border p-0.5` + 버튼 `p-1.5 rounded-md`(활성 bg-muted),
 * 칩 `px-3 py-1 rounded-full text-xs font-medium border`(활성 bg-primary/text-primary-foreground),
 * 그리드 `grid gap-4` 2/3/4열(sm·lg·xl 단계), 카드 `rounded-xl border bg-card overflow-hidden`
 * (활성 hover: shadow-lg·border-primary·-translate-y-0.5),
 * 미리보기 `aspect-[4/3] bg-muted/40` + 폴백 `text-3xl text-muted/30`,
 * 정보 `p-4 gap-1.5` · 라벨 `text-sm semibold` · 설명 `text-xs muted line-clamp-2`,
 * 태그 `text-[10px] px-1.5 py-0.5 rounded bg-muted`,
 * 리스트 행 `flex items-center gap-4 p-4 rounded-xl border` + 아이콘 40×40 rounded-lg,
 * 빈 상태 `py-16 text-sm muted`.
 *
 * 중립 회색(muted/40·muted/60)은 테마 토큰(card-hover · border-light)으로 번역한다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-collection-view {
    display: flex; flex-direction: column; gap: var(--jd-space-4);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }

  /* ── 상단 바 ── */
  .jd-collection-view__bar {
    display: flex; flex-wrap: wrap; align-items: center; gap: var(--jd-space-3);
  }
  .jd-collection-view__search {
    position: relative; flex: 1; min-width: 12.5rem; /* v2 min-w-[200px] */
  }
  .jd-collection-view__search[hidden] { display: none; }
  .jd-collection-view__search-icon {
    position: absolute; inset-inline-start: var(--jd-space-3); inset-block-start: 50%;
    transform: translateY(-50%); pointer-events: none;
    display: inline-flex; color: var(--jd-color-muted);
  }
  .jd-collection-view__search-icon > svg { width: 1rem; height: 1rem; }
  .jd-collection-view__search-input {
    box-sizing: border-box; width: 100%; margin: 0;
    padding: var(--jd-space-2) var(--jd-space-3) var(--jd-space-2) var(--jd-space-8);
    font-family: inherit; font-size: var(--jd-text-md);
    color: var(--jd-color-foreground); background: var(--jd-color-background);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-collection-view__search-input::placeholder { color: var(--jd-color-muted-light); }
  .jd-collection-view__search-input:focus {
    outline: none; border-color: var(--jd-color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }

  .jd-collection-view__views {
    display: flex; align-items: center; gap: var(--jd-space-1);
    padding: var(--jd-space-0-5);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
  }
  .jd-collection-view__view {
    display: inline-flex; padding: var(--jd-space-1-5);
    color: var(--jd-color-muted); background: none; border: 0;
    border-radius: var(--jd-radius-md); cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-collection-view__view > svg { width: 18px; height: 18px; }
  .jd-collection-view__view:hover { background: var(--jd-color-border-light); }
  .jd-collection-view__view[aria-pressed="true"] {
    background: var(--jd-color-card-hover); color: var(--jd-color-primary-ink);
  }
  .jd-collection-view__view:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 1px;
  }

  /* ── 카테고리 칩 ── */
  .jd-collection-view__filters { display: flex; flex-wrap: wrap; gap: var(--jd-space-2); }
  .jd-collection-view__filters[hidden] { display: none; }
  .jd-collection-view__chip {
    padding: var(--jd-space-1) var(--jd-space-3);
    font-family: inherit; font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-muted);
    background: color-mix(in srgb, var(--jd-color-card-hover) 50%, transparent);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-full); cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-collection-view__chip:hover { background: var(--jd-color-card-hover); }
  .jd-collection-view__chip[data-active] {
    color: #fff; background: var(--jd-color-primary); border-color: var(--jd-color-primary);
  }
  .jd-collection-view__chip:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 2px;
  }

  /* ── 항목 목록 ── */
  .jd-collection-view__items { margin: 0; padding: 0; list-style: none; }
  .jd-collection-view__items[data-view="grid"] {
    display: grid; gap: var(--jd-space-4); grid-template-columns: 1fr;
  }
  .jd-collection-view__items[data-view="list"] {
    display: flex; flex-direction: column; gap: var(--jd-space-2);
  }
  /* [data-view] 규칙과 특이도가 같다 — 반드시 뒤에 와야 hidden이 이긴다 */
  .jd-collection-view__items[hidden] { display: none; }
  @media (min-width: 40rem) { /* sm */
    .jd-collection-view__items[data-view="grid"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (min-width: 64rem) { /* lg */
    jd-collection-view[data-columns="3"] .jd-collection-view__items[data-view="grid"],
    jd-collection-view[data-columns="4"] .jd-collection-view__items[data-view="grid"] {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (min-width: 80rem) { /* xl */
    jd-collection-view[data-columns="4"] .jd-collection-view__items[data-view="grid"] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .jd-collection-view__card {
    display: flex; width: 100%; box-sizing: border-box;
    font: inherit; color: inherit; text-align: start; text-decoration: none;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    overflow: hidden;
    transition: box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
                border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
                transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-collection-view__card[data-activatable] { cursor: pointer; }
  .jd-collection-view__card[data-activatable]:hover {
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-lg);
    transform: translateY(-2px);
  }
  .jd-collection-view__card[data-disabled] { opacity: var(--jd-opacity-50); cursor: not-allowed; }
  .jd-collection-view__card:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 2px;
  }

  /* 그리드 카드 = 세로, 리스트 행 = 가로 */
  .jd-collection-view__items[data-view="grid"] .jd-collection-view__card { flex-direction: column; }
  .jd-collection-view__items[data-view="list"] .jd-collection-view__card {
    align-items: center; gap: var(--jd-space-4); padding: var(--jd-space-4);
  }
  .jd-collection-view__items[data-view="list"] .jd-collection-view__card[data-activatable]:hover {
    box-shadow: var(--jd-shadow-md); transform: none;
  }

  .jd-collection-view__preview {
    display: flex; align-items: center; justify-content: center;
    aspect-ratio: 4 / 3; overflow: hidden;
    background: color-mix(in srgb, var(--jd-color-card-hover) 60%, transparent);
  }
  .jd-collection-view__preview-fallback {
    font-size: var(--jd-text-3xl); color: var(--jd-color-muted-light);
  }
  .jd-collection-view__preview > * { max-width: 100%; }

  .jd-collection-view__icon {
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 2.5rem; height: 2.5rem;
    background: var(--jd-color-border-light);
    border-radius: var(--jd-radius-lg);
  }
  .jd-collection-view__icon-fallback {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-bold);
    color: var(--jd-color-muted-light);
  }

  .jd-collection-view__info {
    display: flex; flex-direction: column; gap: var(--jd-space-1-5);
    min-width: 0; flex: 1;
  }
  .jd-collection-view__items[data-view="grid"] .jd-collection-view__info { padding: var(--jd-space-4); }

  .jd-collection-view__label {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  .jd-collection-view__description { font-size: var(--jd-text-xs); color: var(--jd-color-muted); }
  /* v2: 그리드는 2줄 클램프, 리스트는 1줄 말줄임 */
  .jd-collection-view__items[data-view="grid"] .jd-collection-view__description {
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
  }
  .jd-collection-view__items[data-view="list"] .jd-collection-view__label,
  .jd-collection-view__items[data-view="list"] .jd-collection-view__description {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .jd-collection-view__tags { display: flex; flex-wrap: wrap; gap: var(--jd-space-1); }
  .jd-collection-view__items[data-view="list"] .jd-collection-view__tags { flex: 0 0 auto; }
  .jd-collection-view__tag {
    padding: var(--jd-space-0-5) var(--jd-space-1-5);
    font-size: 0.625rem; font-weight: var(--jd-weight-medium); /* v2 text-[10px] */
    color: var(--jd-color-muted);
    background: var(--jd-color-border-light);
    border-radius: var(--jd-radius-sm);
  }
  @media (max-width: 40rem) {
    .jd-collection-view__items[data-view="list"] .jd-collection-view__tags { display: none; }
  }

  .jd-collection-view__empty {
    margin: 0; padding: var(--jd-space-16) var(--jd-space-4);
    text-align: center; font-size: var(--jd-text-md); color: var(--jd-color-muted);
  }
  .jd-collection-view__empty[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-collection-view__card,
    .jd-collection-view__chip,
    .jd-collection-view__view,
    .jd-collection-view__search-input { transition: none; }
    .jd-collection-view__card[data-activatable]:hover { transform: none; }
  }
}`;
