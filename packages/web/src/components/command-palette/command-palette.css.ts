/**
 * jd-command-palette CSS — v2 ds/patterns/CommandPalette 기계 번역.
 *
 * v2 Tailwind → --jd-* 토큰 의미 번역:
 *  - 컨테이너: fixed inset-0 z-50 flex items-start pt-[20vh]  → jd-command-palette[open]
 *  - 백드롭: bg-black/40 (blur 없음 — Modal 기본 blur를 명시적으로 끈다)
 *  - 패널: max-w-lg(=32rem) rounded-2xl shadow-2xl overflow-hidden (Modal 패널 상속 + 오버라이드)
 *  - 활성 행: bg-primary-light text-primary (v2 idx===activeIdx). 아이콘/설명은 v2와 동일하게
 *    항상 muted 유지(v2에서 자식 text-muted가 부모 text-primary를 이긴다).
 *
 * 표시/애니메이션 규칙은 Modal이 `jd-modal` 태그로 스코프하므로 상속되지 않는다 —
 * 여기서 `jd-command-palette` 태그로 다시 선언한다(action-sheet.css와 동형).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-command-palette { display: none; }
  jd-command-palette[open] {
    display: flex; position: fixed; inset: 0; z-index: var(--jd-z-modal);
    align-items: flex-start; justify-content: center;
    /* v2 pt-[20vh] + 좌우 여백 */
    padding: 20vh var(--jd-space-4) var(--jd-space-4);
  }

  /* v2 백드롭은 black/40, 블러 없음 — Modal 기본(blur 2px)을 끈다 */
  jd-command-palette > .jd-modal__backdrop {
    background: rgba(0, 0, 0, .4);
    backdrop-filter: none;
  }

  /* max-w-lg(32rem) 고정 폭. 결과 목록만 내부 스크롤 → 패널 자체는 overflow hidden */
  jd-command-palette > .jd-modal__panel {
    max-width: min(32rem, calc(100vw - 2rem));
    max-height: calc(100vh - 24vh);
    overflow: hidden;
    box-shadow: var(--jd-shadow-2xl);
  }

  /* 검색 행 */
  .jd-command-palette__search {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border-light);
  }
  .jd-command-palette__search-icon {
    display: inline-flex; flex-shrink: 0; color: var(--jd-color-muted);
  }
  .jd-command-palette__input {
    flex: 1; min-width: 0;
    border: 0; outline: none; background: transparent;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    color: var(--jd-color-foreground);
  }
  .jd-command-palette__input::placeholder { color: var(--jd-color-muted-light); }

  /* 결과 목록 — v2 max-h-[320px] 내부 스크롤 */
  .jd-command-palette__results {
    max-height: 320px; overflow-y: auto;
    padding-block: var(--jd-space-1);
  }
  .jd-command-palette__empty {
    padding: var(--jd-space-8) var(--jd-space-4);
    text-align: center; font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }

  .jd-command-palette__group-label {
    padding: var(--jd-space-1-5) var(--jd-space-4) var(--jd-space-0-5);
    font-size: 10px; line-height: var(--jd-leading-normal);
    font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-muted-light);
    text-transform: uppercase; letter-spacing: var(--jd-tracking-wide);
  }

  .jd-command-palette__option {
    display: flex; align-items: center; gap: var(--jd-space-3);
    width: 100%; box-sizing: border-box; padding: var(--jd-space-2) var(--jd-space-4);
    text-align: start; cursor: pointer; color: var(--jd-color-foreground);
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  /* 활성 행(키보드/포인터 공통) — v2 bg-primary-light text-primary */
  .jd-command-palette__option[aria-selected="true"] {
    background: var(--jd-color-primary-light); color: var(--jd-color-primary-ink);
  }

  .jd-command-palette__option-icon {
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0; width: var(--jd-space-5); height: var(--jd-space-5);
    color: var(--jd-color-muted);
  }
  .jd-command-palette__option-body { flex: 1; min-width: 0; }
  .jd-command-palette__option-label {
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-medium);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .jd-command-palette__option-desc {
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* 푸터 힌트 */
  .jd-command-palette__footer {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-2) var(--jd-space-4);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border-light);
    font-size: 10px; color: var(--jd-color-muted-light);
  }
  .jd-command-palette__hint { display: inline-flex; align-items: center; gap: var(--jd-space-1); }

  /* 진입 애니메이션 — Modal은 jd-modal 태그로 스코프돼 상속 안 됨 */
  @media (prefers-reduced-motion: no-preference) {
    jd-command-palette[open] > .jd-modal__backdrop {
      animation: jd-cmdk-fade var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-command-palette[open] > .jd-modal__panel {
      animation: jd-cmdk-pop var(--jd-duration-normal) var(--jd-easing-default);
    }
  }
  @keyframes jd-cmdk-fade { from { opacity: 0; } }
  @keyframes jd-cmdk-pop { from { opacity: 0; transform: translateY(-.5rem) scale(.98); } }
}`;
