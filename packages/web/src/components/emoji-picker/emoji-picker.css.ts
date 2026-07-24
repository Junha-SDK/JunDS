/**
 * jd-emoji-picker 컴포넌트 CSS.
 * v2 ds/composites/EmojiPicker 시각을 --jd-* 토큰으로 의미 번역:
 *   판 = w-72 bg-white border rounded-xl shadow-lg overflow-hidden /
 *   검색줄 = p-2 + 하단 구분선, 입력 h-7 px-2.5 text-xs rounded-lg /
 *   분류줄 = px-2 py-1.5 gap-0.5 + 하단 구분선 + 가로 스크롤,
 *   칩 = px-2 py-1 10px rounded-md, 활성 bg-primary/10 + text-primary /
 *   격자 = 8열 gap-0.5 p-2 max-h-48 세로 스크롤, 칸 32px rounded-lg text-lg.
 *
 * v2의 bg-white·gray-100 리터럴은 다크 모드에서 깨진다 → card/card-hover 토큰으로.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-emoji-picker {
    display: block;
    box-sizing: border-box;
    width: 18rem;
    max-width: 100%;
    overflow: hidden;
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    box-shadow: var(--jd-shadow-lg);
    font-family: var(--jd-font-sans);
  }

  /* ── 검색줄 ── */
  .jd-emoji-picker__search {
    padding: var(--jd-space-2);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-emoji-picker__search-input {
    box-sizing: border-box;
    width: 100%;
    height: 1.75rem;
    margin: 0;
    padding-inline: var(--jd-space-2-5);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    font-family: inherit;
    font-size: var(--jd-text-xs);
  }
  .jd-emoji-picker__search-input:focus {
    outline: none;
    border-color: var(--jd-color-primary);
  }
  .jd-emoji-picker__search-input::placeholder {
    color: color-mix(in srgb, var(--jd-color-muted-light) 60%, transparent);
  }

  /* ── 분류줄 ── */
  .jd-emoji-picker__tabs {
    display: flex;
    gap: var(--jd-space-0-5);
    padding: var(--jd-space-1-5) var(--jd-space-2);
    overflow-x: auto;
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-emoji-picker__tabs[hidden] { display: none; }

  .jd-emoji-picker__tab {
    flex-shrink: 0;
    margin: 0;
    padding: var(--jd-space-1) var(--jd-space-2);
    background: transparent;
    color: var(--jd-color-muted);
    border: 0;
    border-radius: var(--jd-radius-md);
    font-family: inherit;
    font-size: 10px; /* v2 text-[10px] — 대응 토큰 없음(badge 선례) */
    font-weight: var(--jd-weight-medium);
    white-space: nowrap;
    cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-emoji-picker__tab:hover { background: var(--jd-color-card-hover); }
  .jd-emoji-picker__tab[data-active] {
    background: var(--jd-color-primary-light);
    /* v2는 text-primary 원색이었다 — 다크에서 틴트 배경 대비가 2.6:1로 무너진다.
       foreground를 섞어 양쪽 테마에서 4.5:1을 넘긴다(§4 색 대비 규칙) */
    color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
  }
  .jd-emoji-picker__tab:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 1px;
  }

  /* ── 격자 ── */
  .jd-emoji-picker__grid {
    display: grid;
    /* 열 수는 update()가 --jd-emoji-picker-columns로 넘긴다 (기본 8 = v2 grid-cols-8) */
    grid-template-columns: repeat(var(--jd-emoji-picker-columns, 8), minmax(0, 1fr));
    gap: var(--jd-space-0-5);
    padding: var(--jd-space-2);
    max-height: 12rem;
    overflow-y: auto;
  }
  .jd-emoji-picker__grid[hidden] { display: none; }

  .jd-emoji-picker__emoji {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    margin: 0;
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: var(--jd-radius-lg);
    font-family: inherit;
    font-size: var(--jd-text-xl);
    line-height: var(--jd-leading-none);
    cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-emoji-picker__emoji:hover { background: var(--jd-color-card-hover); }
  .jd-emoji-picker__emoji:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: -1px;
  }

  .jd-emoji-picker__empty {
    margin: 0;
    padding: var(--jd-space-6) var(--jd-space-2);
    text-align: center;
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-emoji-picker__empty[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-emoji-picker__tab,
    .jd-emoji-picker__emoji { transition: none; }
  }
}`;
