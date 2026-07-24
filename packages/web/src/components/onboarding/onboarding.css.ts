import { css } from "../../core/styles.js";

/**
 * jd-onboarding CSS — v2 composites/Onboarding의 Tailwind를 --jd-* 토큰으로 의미 번역.
 *
 * v2 값: 카드 `rounded-xl border border-border bg-white p-5` · 헤더 `mb-4`
 * (제목 text-base/semibold, 카운트 text-xs/muted/tabular-nums) · 트랙 `h-1.5
 * bg-gray-100 rounded-full mb-4` + 채움 `bg-primary transition-all duration-500`
 * · 행 `p-3 gap-3 rounded-lg`, 완료 `bg-success/5`, 미완료 hover `bg-gray-50`
 * · 마커 `w-5 h-5 rounded-full border-2 mt-0.5`, 완료 `bg-success border-success`
 * · 제목 text-sm/medium(완료 시 line-through+muted), 설명 text-xs/muted/mt-0.5
 * · 마무리 버튼 `w-full h-9 bg-primary text-white text-sm rounded-lg`.
 *
 * v2가 하드코딩한 bg-white/bg-gray-100/bg-gray-50은 테마 토큰(card / border-light /
 * card-hover)으로 옮겼다(jd-combobox 선례). `bg-success/5`처럼 알파를 섞던 자리는
 * color-mix로 옮긴다 — 토큰 하나가 라이트·다크 양쪽에서 같은 의미를 유지한다.
 */
export default css`
@layer junds.components {
  jd-onboarding {
    display: block; box-sizing: border-box;
    font-family: var(--jd-font-sans);
    padding: var(--jd-space-5);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
  }

  /* ── 헤더 ───────────────────────────────────────────────── */
  .jd-onboarding__header {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-3);
    margin-block-end: var(--jd-space-4);
  }
  .jd-onboarding__title {
    margin: 0;
    font-size: var(--jd-text-lg); font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-snug);
    color: var(--jd-color-foreground);
  }
  .jd-onboarding__title[hidden] { display: none; }
  .jd-onboarding__count {
    flex-shrink: 0;
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }

  /* ── 진행바 ─────────────────────────────────────────────── */
  .jd-onboarding__track {
    height: 6px; overflow: hidden;
    margin-block-end: var(--jd-space-4);
    background: var(--jd-color-border-light);
    border-radius: var(--jd-radius-full);
  }
  .jd-onboarding__fill {
    height: 100%; width: 0;
    background: var(--jd-color-primary);
    border-radius: var(--jd-radius-full);
    transition: width var(--jd-duration-slower) var(--jd-easing-ease-out);
  }

  /* ── 단계 목록 ──────────────────────────────────────────── */
  .jd-onboarding__list {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: var(--jd-space-2);
  }

  .jd-onboarding__button {
    position: relative; /* 숨김 상태 텍스트(absolute)의 기준 — 문서 끝으로 새지 않게 */
    display: flex; align-items: flex-start; gap: var(--jd-space-3);
    width: 100%; box-sizing: border-box; margin: 0;
    padding: var(--jd-space-3);
    border: 0; background: transparent;
    border-radius: var(--jd-radius-lg);
    font-family: inherit; text-align: start; cursor: pointer;
    color: var(--jd-color-foreground);
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-onboarding__button:hover { background: var(--jd-color-card-hover); }
  .jd-onboarding__button:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 2px;
  }
  /* 완료 행 — 눌러도 아무 일이 없다(aria-disabled) */
  .jd-onboarding__step[data-completed] > .jd-onboarding__button {
    background: color-mix(in srgb, var(--jd-color-success) 5%, transparent);
    cursor: default;
  }
  .jd-onboarding__step[data-completed] > .jd-onboarding__button:hover {
    background: color-mix(in srgb, var(--jd-color-success) 5%, transparent);
  }

  .jd-onboarding__marker {
    flex-shrink: 0; box-sizing: border-box;
    display: flex; align-items: center; justify-content: center;
    width: 1.25rem; height: 1.25rem;
    margin-block-start: 0.125rem; /* v2 mt-0.5 — 첫 줄 글자와 광학 정렬 */
    border: var(--jd-border-medium) solid var(--jd-color-border);
    border-radius: var(--jd-radius-full);
    color: transparent; /* 체크는 항상 있고 완료일 때만 보인다 */
    transition:
      background var(--jd-duration-fast) var(--jd-easing-ease-out),
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-onboarding__marker > svg { width: 10px; height: 10px; display: block; }
  .jd-onboarding__step[data-completed] .jd-onboarding__marker {
    background: var(--jd-color-success);
    border-color: var(--jd-color-success);
    color: #fff; /* 성공색 위 체크 — 대비 고정값(v2 stroke="white") */
  }

  .jd-onboarding__body {
    display: flex; flex-direction: column; gap: 0.125rem; min-width: 0;
  }
  .jd-onboarding__step-title {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-snug);
  }
  .jd-onboarding__step[data-completed] .jd-onboarding__step-title {
    text-decoration: line-through; color: var(--jd-color-muted);
  }
  .jd-onboarding__desc {
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    line-height: var(--jd-leading-normal);
  }
  .jd-onboarding__desc[hidden] { display: none; }

  /* 상태 텍스트는 읽히기만 한다 (jd-progress-steps __status 관용구) */
  .jd-onboarding__status {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  /* ── 마무리 버튼 ────────────────────────────────────────── */
  .jd-onboarding__finish {
    display: block; width: 100%; box-sizing: border-box;
    height: 2.25rem; margin-block-start: var(--jd-space-4);
    border: 0; border-radius: var(--jd-radius-lg);
    background: var(--jd-color-primary); color: #fff;
    font-family: inherit; font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium);
    cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-onboarding__finish:hover { background: var(--jd-color-primary-hover); }
  .jd-onboarding__finish:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 2px;
  }
  .jd-onboarding__finish[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-onboarding__fill,
    .jd-onboarding__button,
    .jd-onboarding__marker,
    .jd-onboarding__finish { transition: none; }
  }
}`;
