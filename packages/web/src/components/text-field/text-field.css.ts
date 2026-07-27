/**
 * jd-text-field 컴포넌트 CSS.
 * v2 ds/primitives/Input(size sm/md/lg·error·focus 글로우) + ds/composites/FormField
 * (Label·에러 메시지 행)의 시각을 --jd-* 토큰으로 의미 번역.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-text-field { display: flex; flex-direction: column; gap: var(--jd-space-1-5); }

  .jd-text-field__label {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }
  .jd-text-field__label[hidden] { display: none; }
  jd-text-field[required] > .jd-text-field__label::after {
    content: "*"; margin-inline-start: var(--jd-space-0-5); color: var(--jd-color-danger);
  }

  /* 입력면은 불투명(DEC-039). v2 이식본의 "card 80% + backdrop-filter: blur(4px)"는
     조상 배경이 투명하면 브라우저가 백드롭 루트를 새로 잡아 다크에서 밝은 회색
     슬래브로 렌더됐다(실측). 흐림은 진짜 오버레이 전용. */
  .jd-text-field__input {
    width: 100%; box-sizing: border-box; margin: 0;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    background: var(--jd-color-control-surface);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    caret-color: var(--jd-color-primary);
    /* all 금지 — height/padding까지 트랜지션 대상이 되어 size 전환·리플로우가 흐른다 */
    transition:
      border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
      background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    /* size 기본 md — 디폴트는 attribute 미반영(§1.3)이라 base가 담당. v2: 40px */
    height: 2.5rem; padding-inline: var(--jd-space-3-5);
    font-size: var(--jd-text-md); border-radius: var(--jd-radius-xl);
  }
  .jd-text-field__input::placeholder {
    /* 램프 400 — 두 모드에서 같은 '읽히지만 물러나는' 위치. 이전의 muted-light 60%는
       라이트에서 2.1:1로 사실상 보이지 않았다. */
    color: var(--jd-color-neutral-400);
  }
  .jd-text-field__input::selection {
    background: color-mix(in srgb, var(--jd-color-primary) 26%, transparent);
  }
  /* 호버 피드백 — 입력면에 호버 상태가 없으면 '누를 수 있는 곳'이라는 신호가 없다 */
  .jd-text-field__input:hover:not(:disabled):not(:focus) {
    border-color: var(--jd-color-neutral-300);
    background: var(--jd-color-control-surface-hover);
  }
  .jd-text-field__input:focus {
    outline: var(--jd-focus-ring); outline-offset: var(--jd-focus-ring-offset);
    border-color: var(--jd-color-primary);
    background: var(--jd-color-control-surface);
  }
  /* disabled에 opacity를 걸면 테두리·글자가 함께 흐려져 '고장난 필드'로 읽힌다 →
     면과 글자를 각각 실색으로 낮춘다(AA 유지, DEC-027과 동일 원칙) */
  .jd-text-field__input:disabled {
    cursor: not-allowed;
    background: var(--jd-color-control-surface-muted);
    border-color: var(--jd-color-border-light);
    color: var(--jd-color-neutral-500);
  }
  .jd-text-field__input:disabled::placeholder { color: var(--jd-color-neutral-400); }

  /* size — v2 Input: sm 32px / lg 48px (md는 base) */
  jd-text-field[size="sm"] > .jd-text-field__input {
    height: 2rem; padding-inline: var(--jd-space-3);
    font-size: var(--jd-text-xs); border-radius: var(--jd-radius-lg);
  }
  jd-text-field[size="lg"] > .jd-text-field__input {
    height: 3rem; padding-inline: var(--jd-space-4);
    font-size: var(--jd-text-lg); border-radius: var(--jd-radius-xl);
  }

  /* error 상태 — 호스트 error 속성(reflect, 비어있지 않을 때만)이 스타일 훅 */
  jd-text-field[error]:not([error=""]) > .jd-text-field__input {
    border-color: var(--jd-color-danger);
  }
  jd-text-field[error]:not([error=""]) > .jd-text-field__input:focus {
    border-color: var(--jd-color-danger);
    outline: var(--jd-focus-ring-danger); outline-offset: var(--jd-focus-ring-offset);
  }

  .jd-text-field__error {
    display: flex; align-items: center; gap: var(--jd-space-1); margin: 0;
    font-size: var(--jd-text-xs); font-family: var(--jd-font-sans);
    color: var(--jd-color-danger);
  }
  .jd-text-field__error[hidden] { display: none; }
  .jd-text-field__error > svg { flex-shrink: 0; }

  @media (prefers-reduced-motion: reduce) {
    .jd-text-field__input { transition: none; }
  }
}`;
