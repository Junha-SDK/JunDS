import { css } from "../../core/styles.js";

/**
 * jd-switch 시각 (DEC-039 — 기하는 v2 유지, 질감·움직임만 승격).
 * 트랙 sm 36×20 / md 44×24 / lg 56×28, 썸 14/18/22px, 이동 16/20/28px.
 *
 * v2 대비 바뀐 것 세 가지:
 *  1) 썸 그림자를 shadow-md → shadow-knob. md의 blur(14px)는 썸 지름(18px)보다 커서
 *     그림자가 썸 밖으로 번져 '떠 있다'가 아니라 '흐릿하다'로 읽혔다.
 *  2) 이동 이징을 ease-out → overshoot. 스위치는 물리적 조작 은유이므로 끝에서
 *     살짝 지나쳐 자리를 잡아야 '딸깍'으로 읽힌다.
 *  3) 트랙 안쪽 상단에 인셋 그림자 — 오목한 홈 위에 썸이 놓인 관계가 생긴다.
 *     filter: brightness 호버는 폐기(꺼진 회색 트랙에서는 아무 변화가 없었다).
 */
export default css`
  @layer junds.components {
    jd-switch {
      display: inline-flex;
    }

    .jd-switch {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      cursor: pointer;
      user-select: none;
      font-family: var(--jd-font-sans);
    }
    /* disabled — 반투명은 트랙·썸만, 라벨은 muted 실색 (AA, DEC-027) */
    jd-switch[disabled] > .jd-switch {
      cursor: not-allowed;
    }
    jd-switch[disabled] .jd-switch__track {
      opacity: var(--jd-opacity-50);
    }
    jd-switch[disabled] .jd-switch__text {
      color: var(--jd-color-muted);
    }

    .jd-switch__track {
      position: relative;
      display: inline-flex;
      flex-shrink: 0;
      border: 0;
      margin: 0;
      padding: 0;
      cursor: inherit;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-control-track-strong);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
      transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
      width: 2.75rem;
      height: 1.5rem; /* md 기본 44×24 */
    }
    jd-switch[checked] .jd-switch__track {
      background: var(--jd-color-primary);
      /* 켜진 트랙은 홈이 아니라 발광면 — 인셋을 지우고 상단 하이라이트를 얹는다 */
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-switch__track:hover:not(:disabled) {
      background: var(--jd-color-neutral-400);
    }
    jd-switch[checked] .jd-switch__track:hover:not(:disabled) {
      background: var(--jd-color-primary-hover);
    }
    .jd-switch__track:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-switch__thumb {
      position: absolute;
      top: 50%;
      left: 3px;
      translate: 0 -50%;
      width: 1.125rem;
      height: 1.125rem; /* md 18px */
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-control-knob);
      box-shadow: var(--jd-shadow-knob);
      transition: transform var(--jd-duration-normal) var(--jd-easing-overshoot);
    }
    jd-switch[checked] .jd-switch__thumb {
      transform: translateX(20px);
    }

    jd-switch[size="sm"] .jd-switch__track {
      width: 2.25rem;
      height: 1.25rem;
    } /* 36×20 */
    jd-switch[size="sm"] .jd-switch__thumb {
      width: 0.875rem;
      height: 0.875rem;
    } /* 14px */
    jd-switch[size="sm"][checked] .jd-switch__thumb {
      transform: translateX(16px);
    }

    jd-switch[size="lg"] .jd-switch__track {
      width: 3.5rem;
      height: 1.75rem;
    } /* 56×28 */
    jd-switch[size="lg"] .jd-switch__thumb {
      width: 1.375rem;
      height: 1.375rem;
    } /* 22px */
    jd-switch[size="lg"][checked] .jd-switch__thumb {
      transform: translateX(28px);
    }

    .jd-switch__text {
      font-size: var(--jd-text-md);
      color: var(--jd-color-foreground);
    }
    .jd-switch__text[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-switch__track,
      .jd-switch__thumb {
        transition: none;
      }
    }
  }
`;
