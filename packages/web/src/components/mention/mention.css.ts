import { css } from "../../core/styles.js";

/**
 * jd-mention CSS — v2 composites/Mention의 Tailwind를 --jd-* 토큰으로 의미 번역.
 *
 * v2 값: 입력 `w-full min-h-[80px] px-3 py-2 text-sm border bg-card rounded-lg
 * resize-y` + focus `border-primary shadow-[0_0_0_3px_var(--primary-glow)]`
 * · 팝업 `fixed w-64 max-h-48 rounded-lg border shadow-lg py-1 animate-fade-in-scale`
 * · 행 `px-3 py-2 gap-2 text-sm`, 활성 `bg-primary-light`, hover `bg-primary/10`
 * · 아바타 `w-6 h-6 rounded-full`, 이니셜 원 `bg-primary/10 text-primary text-xs`
 * · 설명 `text-xs text-muted truncate`.
 *
 * 입력 표면은 **jd-textarea와 같은 시각 언어**로 맞췄다(card 80% 유리 배경·
 * 글로우 포커스·radius xl) — v2에서도 두 컴포넌트는 같은 입력 어휘를 썼고,
 * 한 폼 안에 섞여 서므로 어긋나면 바로 보인다.
 *
 * 팝업은 v2의 fixed(포털)가 아니라 호스트 기준 absolute다(element.ts 주해 참조).
 * 그래서 `w-64` 고정폭 대신 입력창 너비를 따르되 v2 최소폭(16rem)을 보장한다.
 */
export default css`
@layer junds.components {
  jd-mention { position: relative; display: block; font-family: var(--jd-font-sans); }

  /* ── 입력 ───────────────────────────────────────────────── */
  .jd-mention__input {
    display: block; width: 100%; box-sizing: border-box; margin: 0;
    min-height: 80px; resize: vertical;
    font-family: inherit; color: var(--jd-color-foreground);
    font-size: var(--jd-text-md); line-height: var(--jd-leading-normal);
    background: var(--jd-color-control-surface);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    padding: var(--jd-space-2-5) var(--jd-space-3-5);
    transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      color var(--jd-duration-normal) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
      opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
      scale var(--jd-duration-normal) var(--jd-easing-ease-out),
      transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-mention__input::placeholder {
    color: var(--jd-color-neutral-400);
  }
  .jd-mention__input:focus {
    outline: none; border-color: var(--jd-color-primary);
    background: var(--jd-color-card);
    box-shadow: var(--jd-shadow-focus-ring), var(--jd-shadow-xs);
  }
  .jd-mention__input:disabled {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
    background: var(--jd-color-card-hover);
  }

  /* ── 팝업 ───────────────────────────────────────────────── */
  .jd-mention__popup {
    position: absolute; top: 100%; inset-inline-start: 0;
    min-width: 16rem; max-width: 100%;
    margin-block-start: var(--jd-space-1);
    z-index: var(--jd-z-dropdown);
    box-sizing: border-box;
    max-height: 12rem; overflow: auto;
    padding-block: var(--jd-space-1);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    box-shadow: var(--jd-shadow-lg);
    transform-origin: top center;
    animation: jd-mention-pop var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-mention__popup[hidden] { display: none; }
  @keyframes jd-mention-pop { from { opacity: 0; transform: scale(0.97); } }

  .jd-mention__list { list-style: none; margin: 0; padding: 0; }

  .jd-mention__option {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3);
    font-size: var(--jd-text-md); color: var(--jd-color-foreground);
    text-align: start; cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-mention__option:hover {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
  }
  .jd-mention__option[data-active] { background: var(--jd-color-primary-light); }

  .jd-mention__media {
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; box-sizing: border-box;
    width: 1.5rem; height: 1.5rem;
    border-radius: var(--jd-radius-full);
    overflow: hidden;
  }
  .jd-mention__media[data-initial] {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    color: var(--jd-color-primary-ink);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-none);
    user-select: none;
  }
  .jd-mention__avatar {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }

  .jd-mention__body {
    display: flex; flex-direction: column; flex: 1; min-width: 0;
  }
  .jd-mention__label {
    font-weight: var(--jd-weight-medium);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-mention__desc {
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    font-weight: var(--jd-weight-normal);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-mention__desc[hidden] { display: none; }

  /* 결과 수 공지 — 읽히기만 한다 (jd-trust-indicator __sr 관용구) */
  .jd-mention__status {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-mention__input,
    .jd-mention__option { transition: none; }
    .jd-mention__popup { animation: none; }
  }
}`;
