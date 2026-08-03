import { css } from "../../core/styles.js";

/**
 * jd-checkbox 시각 (DEC-039 — v2 기계 이식본 대체).
 *
 * v2는 `appearance: auto` + `accent-color`로 **OS 기본 체크박스**를 그대로 썼다.
 * 그래서 (1) 모양이 플랫폼마다 달라 디자인 시스템의 표식이 없고, (2) 다크에서
 * 미체크 상자가 OS가 칠한 회색 덩어리로 남고, (3) 상태 전환에 움직임이 없었다.
 * 여기서는 상자를 직접 그린다 — DOM은 그대로(네이티브 input 위임 유지)이고
 * background-image + background-size 트랜지션으로 표식이 자리를 잡는다.
 * ::after를 쓰지 않는 이유: input은 대체 요소라 의사 요소가 렌더되지 않는다.
 */
export default css`
  @layer junds.components {
    jd-checkbox {
      display: inline-flex;
    }

    .jd-checkbox {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      cursor: pointer;
      user-select: none;
      font-family: var(--jd-font-sans);
      /* 표식 — 흰 스트로크는 primary 채움 위에서 두 모드 모두 정답 */
      --_jd-cb-check: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.6 8.5l2.8 2.8L12.5 5.2' fill='none' stroke='%23fff' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      --_jd-cb-dash: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.4 8h7.2' fill='none' stroke='%23fff' stroke-width='2.1' stroke-linecap='round'/%3E%3C/svg%3E");
    }
    /* disabled에 opacity를 통째로 걸면 라벨까지 흐려져 AA를 깬다 → 상자만 낮춘다 */
    jd-checkbox[disabled] > .jd-checkbox {
      cursor: not-allowed;
    }

    .jd-checkbox__input {
      appearance: none;
      -webkit-appearance: none;
      flex: none;
      margin: 0;
      padding: 0;
      cursor: inherit;
      /* 18px — v2의 16px는 14px 한글 라벨 옆에서 시각적으로 한 급 작게 읽힌다 */
      width: 1.125rem;
      height: 1.125rem;
      border: 1.5px solid var(--jd-color-neutral-300);
      border-radius: var(--jd-radius-md);
      background-color: var(--jd-color-control-surface);
      background-repeat: no-repeat;
      background-position: center;
      /* 미체크에서 표식은 크기 0 — 체크 시 100%로 자라며 나타난다 */
      background-size: 0% 0%;
      box-shadow: var(--jd-shadow-xs);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-size var(--jd-duration-snap) var(--jd-easing-overshoot),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-checkbox__input:hover:not(:disabled) {
      border-color: var(--jd-color-neutral-400);
      background-color: var(--jd-color-control-surface-hover);
    }
    /* 누르는 순간 상자가 살짝 들어간다 — 클릭이 '먹었다'는 유일한 즉시 신호 */
    .jd-checkbox__input:active:not(:disabled) {
      scale: 0.92;
    }

    .jd-checkbox__input:checked,
    .jd-checkbox__input:indeterminate {
      background-color: var(--jd-color-primary);
      border-color: var(--jd-color-primary);
      background-size: 100% 100%;
      box-shadow: 0 1px 3px -1px color-mix(in srgb, var(--jd-color-primary) 55%, transparent);
    }
    .jd-checkbox__input:checked {
      background-image: var(--_jd-cb-check);
    }
    /* indeterminate가 checked보다 뒤 — 둘이 동시에 참일 때 대시가 이긴다(OS 관례) */
    .jd-checkbox__input:indeterminate {
      background-image: var(--_jd-cb-dash);
    }

    .jd-checkbox__input:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-checkbox__input:disabled {
      background-color: var(--jd-color-control-surface-muted);
      border-color: var(--jd-color-border);
    }
    .jd-checkbox__input:disabled:checked,
    .jd-checkbox__input:disabled:indeterminate {
      background-color: var(--jd-color-neutral-400);
      border-color: var(--jd-color-neutral-400);
      box-shadow: none;
    }

    /* sm — 상자 16px, 표식·테두리도 함께 줄여 비율 유지 */
    jd-checkbox[size="sm"] .jd-checkbox__input {
      width: 1rem;
      height: 1rem;
      border-radius: var(--jd-radius-sm);
    }

    .jd-checkbox__label {
      color: var(--jd-color-foreground);
      font-size: var(--jd-text-md);
    }
    .jd-checkbox__label[hidden] {
      display: none;
    }
    jd-checkbox[size="sm"] .jd-checkbox__label {
      font-size: var(--jd-text-xs);
    }
    jd-checkbox[disabled] .jd-checkbox__label {
      color: var(--jd-color-muted);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-checkbox__input {
        transition: none;
      }
      .jd-checkbox__input:active:not(:disabled) {
        scale: 1;
      }
    }
  }
`;
