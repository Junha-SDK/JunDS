import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): 탭 = flex-1 세로 icon+label, 아이콘은 size-9 rounded-full pill.
 * 활성 = accent 글자 + accent-soft pill 배경. 라벨 text-[11px] font-semibold.
 * 시트 항목 = px-4 py-3 text-[13.5px] font-bold, 사이 구분선, 활성 accent-strong.
 * 시트 오버레이 자체(백드롭·패널)는 jd-bottom-sheet가 칠한다 — 여기선 내용만.
 */
export default css`
@layer junds.components {
  jd-bottom-nav {
    display: block; font-family: var(--jd-font-sans);
    --_accent: var(--jd-fin-accent, #14b8a6);
    --_accent-strong: var(--jd-fin-accent-strong, #0d9488);
    --_accent-soft: var(--jd-fin-accent-soft, color-mix(in srgb, #14b8a6 12%, transparent));
    --_surface: var(--jd-fin-surface, var(--jd-color-card));
    --_text: var(--jd-fin-text, var(--jd-color-foreground));
    --_muted: var(--jd-fin-muted, var(--jd-color-muted));
    --_border: var(--jd-fin-border, var(--jd-color-border));
  }

  /* ── 탭바 ── */
  .jd-bottom-nav__bar {
    display: flex; align-items: stretch; justify-content: space-between;
    gap: var(--jd-space-1);
    padding: var(--jd-space-2) var(--jd-space-2)
      max(env(safe-area-inset-bottom), var(--jd-space-1-5));
    background: var(--_surface);
    border-block-start: 1px solid var(--_border);
  }
  .jd-bottom-nav__tab {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    gap: var(--jd-space-1); padding: var(--jd-space-1) 0;
    appearance: none; border: 0; background: transparent; cursor: pointer;
    text-decoration: none; color: inherit; font-family: inherit;
  }
  .jd-bottom-nav__tab-icon {
    display: grid; place-items: center; width: 2.25rem; height: 2.25rem;
    border-radius: var(--jd-radius-full); color: var(--_muted);
    transition:
      color var(--jd-duration-fast, 150ms) var(--jd-easing-ease-out),
      background var(--jd-duration-fast, 150ms) var(--jd-easing-ease-out);
  }
  .jd-bottom-nav__tab[data-active] .jd-bottom-nav__tab-icon {
    color: var(--_accent); background: var(--_accent-soft);
  }
  .jd-bottom-nav__tab-label {
    font-size: 11px; font-weight: var(--jd-weight-semibold); color: var(--_muted);
  }
  .jd-bottom-nav__tab[data-active] .jd-bottom-nav__tab-label { color: var(--_accent); }
  .jd-bottom-nav__tab:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--_accent) 55%, transparent);
    outline-offset: -2px; border-radius: var(--jd-radius-md);
  }

  /* ── 더보기 시트 내용 ── */
  .jd-bottom-nav__sheet-body { padding: 0 var(--jd-space-3) var(--jd-space-2); }
  .jd-bottom-nav__sheet-section { margin-block-end: var(--jd-space-3); }
  .jd-bottom-nav__sheet-title {
    padding: 0 var(--jd-space-3); margin-block-end: var(--jd-space-1-5);
    font-size: 10.5px; font-weight: 800; letter-spacing: 0.08em; color: var(--_muted);
  }
  .jd-bottom-nav__sheet-list {
    margin: 0; padding: 0; list-style: none;
    border: 1px solid var(--_border); border-radius: var(--jd-radius-2xl);
    overflow: hidden;
  }
  .jd-bottom-nav__sheet-item {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4);
    font-size: 13.5px; font-weight: var(--jd-weight-bold);
    text-decoration: none; color: var(--_text);
  }
  .jd-bottom-nav__sheet-list > li + li > .jd-bottom-nav__sheet-item {
    border-block-start: 1px solid var(--_border);
  }
  .jd-bottom-nav__sheet-item[data-active] {
    background: var(--_accent-soft); color: var(--_accent-strong);
  }
  .jd-bottom-nav__sheet-icon {
    display: grid; place-items: center; width: var(--jd-space-5); flex-shrink: 0;
    color: var(--_muted);
  }
  .jd-bottom-nav__sheet-item[data-active] .jd-bottom-nav__sheet-icon { color: var(--_accent-strong); }
  .jd-bottom-nav__sheet-label {
    flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-bottom-nav__sheet-desc {
    font-size: 10.5px; font-weight: var(--jd-weight-medium); color: var(--_muted);
    max-width: 11.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-bottom-nav__tab-icon { transition: none; }
  }
}`;
