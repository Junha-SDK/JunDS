/**
 * jd-multi-select CSS — jd-select 시트 위에 얹는 차분(差分)만 담는다.
 *
 * v2 값: 트리거 min-h-36px px-2 py-1 rounded-lg + 칩 wrap, 칩 = Tag color="primary"
 * (bg-primary-light / text-primary / rounded-md / text-xs / medium), 초과분 Tag gray,
 * 선택 행 bg-primary-light/50, 체크박스 3.5(0.875rem) accent primary.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  /* 호스트 셀렉터는 태그 단위라 jd-select 규칙이 파생에 닿지 않는다 —
     상속 대상 중 **호스트 스코프 규칙만** 다시 선언한다(drawer→modal 선례).
     .jd-select__* 클래스 규칙은 태그와 무관하게 그대로 적용된다. */
  jd-multi-select {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%; /* v2 MultiSelect는 항상 w-full */
  }
  jd-multi-select[open] > .jd-select__trigger {
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  jd-multi-select[error] > .jd-select__trigger { border-color: var(--jd-color-danger); }
  jd-multi-select[error] > .jd-select__trigger:focus-visible,
  jd-multi-select[error][open] > .jd-select__trigger {
    border-color: var(--jd-color-danger);
    box-shadow: var(--jd-shadow-focus-ring-danger);
  }
  jd-multi-select[open] .jd-select__chevron { transform: rotate(180deg); }

  /* 칩이 줄바꿈하므로 고정 높이를 최소 높이로 바꾼다 */
  jd-multi-select > .jd-select__trigger {
    height: auto; min-height: 2.25rem;
    padding: var(--jd-space-1) var(--jd-space-2);
    align-items: center;
  }
  jd-multi-select[size="sm"] > .jd-select__trigger {
    height: auto; min-height: 2rem;
    font-size: var(--jd-text-xs); border-radius: var(--jd-radius-md);
  }
  jd-multi-select[size="lg"] > .jd-select__trigger {
    height: auto; min-height: 2.75rem;
    font-size: var(--jd-text-lg); border-radius: var(--jd-radius-xl);
  }

  jd-multi-select .jd-select__value {
    flex-wrap: wrap; gap: var(--jd-space-1);
    padding-inline-start: var(--jd-space-1);
  }
  jd-multi-select .jd-select__value[data-placeholder] { padding-inline-start: var(--jd-space-1); }

  .jd-multi-select__chip {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    max-width: 12rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-md);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    background: var(--jd-color-primary-light); color: var(--jd-color-primary-ink);
  }
  .jd-multi-select__chip[data-overflow] {
    background: color-mix(in srgb, var(--jd-color-muted) 14%, transparent);
    color: var(--jd-color-muted);
  }

  /* 선택 행 — v2는 bg-primary-light/50 (Select의 통짜 primary와 다르다) */
  jd-multi-select .jd-select__option[aria-selected="true"] {
    background: color-mix(in srgb, var(--jd-color-primary-light) 50%, transparent);
    color: var(--jd-color-foreground);
    font-weight: var(--jd-weight-normal);
  }
  jd-multi-select .jd-select__option[aria-selected="true"][data-active],
  jd-multi-select .jd-select__option[aria-selected="true"]:hover {
    background: color-mix(in srgb, var(--jd-color-primary) 12%, transparent);
    color: var(--jd-color-primary-ink);
  }

  /* 네이티브 checkbox 대신 표시 전용 상자 — 리스트박스 안 포커스 가능 요소를 만들지 않는다 */
  .jd-multi-select__box {
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-sizing: border-box; width: 0.875rem; height: 0.875rem;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-sm);
    background: var(--jd-color-card);
    color: transparent;
    transition:
      background var(--jd-duration-fast) var(--jd-easing-ease-out),
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-multi-select__box > svg { width: 0.75rem; height: 0.75rem; }
  .jd-select__option[aria-selected="true"] > .jd-multi-select__box {
    background: var(--jd-color-primary);
    border-color: var(--jd-color-primary);
    color: #fff;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-multi-select__box { transition: none; }
  }
}`;
