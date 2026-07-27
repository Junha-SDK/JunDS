import { css } from "../../core/styles.js";

/**
 * jd-radio-group 시각 (DEC-039 — checkbox와 같은 이유로 직접 그린다).
 *
 * 표식이 원이라 SVG 없이 radial-gradient 하나로 그린다. 점의 등장은 gradient의
 * 반지름이 아니라 **background-size**로 낸다 — 커스텀 프로퍼티 보간은 @property
 * 등록이 필요한데, background-size는 등록 없이 어디서나 트랜지션된다.
 */
export default css`
@layer junds.components {
  jd-radio-group { display: flex; flex-direction: column; gap: var(--jd-space-2); }
  jd-radio-group[direction="horizontal"] {
    flex-direction: row; flex-wrap: wrap; gap: var(--jd-space-4);
  }

  .jd-radio-group__item {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    cursor: pointer; user-select: none;
    font-family: var(--jd-font-sans);
  }
  .jd-radio-group__item[data-disabled] { cursor: not-allowed; }

  .jd-radio-group__input {
    appearance: none; -webkit-appearance: none;
    flex: none; margin: 0; padding: 0; cursor: inherit;
    width: 1.125rem; height: 1.125rem;
    border: 1.5px solid var(--jd-color-neutral-300);
    border-radius: var(--jd-radius-full);
    background-color: var(--jd-color-control-surface);
    box-shadow: var(--jd-shadow-xs);
    /* closest-side + 100% — 기본 farthest-corner를 쓰면 원 반지름이 배경 상자의
       0.707배가 되어 점이 지정 크기의 70%로 작아진다. closest-side로 고정하면
       background-size가 곧 점의 지름이다. */
    background-image: radial-gradient(circle closest-side, #fff 100%, transparent 100%);
    background-repeat: no-repeat; background-position: center;
    background-size: 0% 0%;
    transition:
      background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
      border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
      background-size var(--jd-duration-snap) var(--jd-easing-overshoot),
      scale var(--jd-duration-press) var(--jd-easing-ease-out);
  }
  .jd-radio-group__input:hover:not(:disabled) {
    border-color: var(--jd-color-neutral-400);
    background-color: var(--jd-color-control-surface-hover);
  }
  .jd-radio-group__input:active:not(:disabled) { scale: 0.92; }

  .jd-radio-group__input:checked {
    background-color: var(--jd-color-primary);
    border-color: var(--jd-color-primary);
    background-size: 44% 44%;
    box-shadow: 0 1px 3px -1px color-mix(in srgb, var(--jd-color-primary) 55%, transparent);
  }

  .jd-radio-group__input:focus-visible {
    outline: var(--jd-focus-ring); outline-offset: var(--jd-focus-ring-offset);
  }

  .jd-radio-group__input:disabled {
    background-color: var(--jd-color-control-surface-muted);
    border-color: var(--jd-color-border);
  }
  .jd-radio-group__input:disabled:checked {
    background-color: var(--jd-color-neutral-400);
    border-color: var(--jd-color-neutral-400);
    box-shadow: none;
  }

  jd-radio-group[size="sm"] .jd-radio-group__input { width: 1rem; height: 1rem; }

  .jd-radio-group__label { color: var(--jd-color-foreground); font-size: var(--jd-text-md); }
  jd-radio-group[size="sm"] .jd-radio-group__label { font-size: var(--jd-text-xs); }
  .jd-radio-group__item[data-disabled] .jd-radio-group__label { color: var(--jd-color-muted); }

  @media (prefers-reduced-motion: reduce) {
    .jd-radio-group__input { transition: none; }
    .jd-radio-group__input:active:not(:disabled) { scale: 1; }
  }
}`;
