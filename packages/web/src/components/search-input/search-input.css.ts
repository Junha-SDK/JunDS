import { css } from "../../core/styles.js";

/**
 * jd-search-input CSS — v2 composites/SearchInput 토큰 번역.
 * v2 값: sm h-8/text-xs/px-2.5 · md h-9/text-sm/px-3 · lg h-11/text-base/px-4,
 * rounded-lg · bg-white · border-border · focus 시 primary + 3px 글로우.
 * v2는 테두리를 input이, 아이콘을 absolute가 가졌지만 v3는 flex 박스가 테두리·링을
 * 갖는다(:focus-within) — 시각 결과 동일, 패딩 계산 어긋남 없음.
 * 골격 클래스는 파생 <jd-search-bar>도 공유한다(호스트 셀렉터만 각자 시트).
 */
export default css`
@layer junds.components {
  jd-search-input { display: block; width: 100%; }

  .jd-search-input__box {
    display: flex; align-items: center; gap: var(--jd-space-2);
    box-sizing: border-box; width: 100%;
    height: 2.25rem; padding-inline: var(--jd-space-3); /* md 기본 — v2 h-9/px-3 */
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  /* 포커스 링은 박스가 갖는다 — 내부 input의 outline 제거를 상쇄하는 단일 지표 */
  .jd-search-input__box:focus-within {
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  jd-search-input[disabled] .jd-search-input__box {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }

  .jd-search-input__icon {
    display: flex; flex-shrink: 0; pointer-events: none;
    color: var(--jd-color-muted);
  }

  .jd-search-input__input {
    flex: 1; min-width: 0; align-self: stretch;
    margin: 0; padding: 0; border: 0; background: transparent; outline: none;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-foreground);
  }
  .jd-search-input__input::placeholder { color: var(--jd-color-muted-light); }
  .jd-search-input__input:disabled { cursor: not-allowed; }
  /* v2 [&::-webkit-search-cancel-button]:hidden — 자체 지우기 버튼과 중복 */
  .jd-search-input__input::-webkit-search-cancel-button { display: none; }

  .jd-search-input__spinner {
    display: flex; flex-shrink: 0; color: var(--jd-color-muted);
  }
  .jd-search-input__spinner[hidden] { display: none; }
  .jd-search-input__spinner > svg {
    animation: jd-search-spin 1s linear infinite;
  }
  @keyframes jd-search-spin { to { transform: rotate(360deg); } }

  .jd-search-input__clear {
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    margin: 0; padding: var(--jd-space-0-5); border: 0; background: none;
    border-radius: var(--jd-radius-sm);
    color: var(--jd-color-muted); cursor: pointer;
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-search-input__clear:hover { color: var(--jd-color-foreground); }
  .jd-search-input__clear:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 1px;
  }
  .jd-search-input__clear[hidden] { display: none; }

  .jd-search-input__end {
    display: flex; align-items: center; gap: var(--jd-space-1); flex-shrink: 0;
  }
  .jd-search-input__end[hidden] { display: none; }

  jd-search-input[size="sm"] .jd-search-input__box {
    height: 2rem; padding-inline: var(--jd-space-2-5);
    border-radius: var(--jd-radius-md);
  }
  jd-search-input[size="sm"] .jd-search-input__input { font-size: var(--jd-text-xs); }
  jd-search-input[size="lg"] .jd-search-input__box {
    height: 2.75rem; padding-inline: var(--jd-space-4);
    border-radius: var(--jd-radius-xl);
  }
  jd-search-input[size="lg"] .jd-search-input__input { font-size: var(--jd-text-lg); }

  @media (prefers-reduced-motion: reduce) {
    .jd-search-input__box, .jd-search-input__clear { transition: none; }
    /* 정지가 아니라 감속 — 로딩 지표는 계속 보여야 한다(jd-spinner 선례) */
    .jd-search-input__spinner > svg { animation-duration: 1.6s; }
  }
}`;
