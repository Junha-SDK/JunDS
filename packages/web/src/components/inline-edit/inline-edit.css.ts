import { css } from "../../core/styles.js";

/**
 * jd-inline-edit CSS — v2 composites/InlineEdit 토큰 번역.
 * v2 값: 아래 테두리 2px(표시=transparent, hover=primary/30, focus=primary/40,
 * 편집=primary), 빈 값은 muted + italic, 연필 12px opacity 0→1.
 * 트리거는 <button>이라 폰트·색을 상속시켜 v2의 text-inherit/font-inherit를 재현한다.
 *
 * v2와 달리 **쉼 상태에도 점선 밑줄**을 남긴다: transparent 밑줄 + 숨은 연필은
 * 본문 텍스트와 구별되지 않아, 편집할 수 있다는 사실을 포인터를 올려 보기 전에는
 * 알 수 없었다(실측). 두께는 그대로 두고 style/color만 바꾸므로 hover에서 글자가
 * 밀리지 않는다.
 */
export default css`
  @layer junds.components {
    jd-inline-edit {
      display: inline-block;
    }

    .jd-inline-edit__display {
      display: inline-block;
      margin: 0;
    }
    .jd-inline-edit__display[hidden] {
      display: none;
    }

    .jd-inline-edit__trigger {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      margin: 0;
      /* 강조 배경이 글자에 달라붙지 않게 좌우로 벌리고, 같은 만큼 음수 마진으로
       되당겨 앞뒤 본문과의 글줄 정렬을 유지한다 */
      padding-inline: var(--jd-space-1);
      margin-inline: calc(var(--jd-space-1) * -1);
      padding-block: 0;
      background: none;
      border-radius: var(--jd-radius-sm);
      font: inherit;
      color: inherit;
      text-align: inherit;
      border: 0;
      border-block-end: var(--jd-border-medium) dashed
        color-mix(in srgb, var(--jd-color-muted) 45%, transparent);
      cursor: pointer;
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-inline-edit__trigger:hover:not(:disabled) {
      border-block-end-style: solid;
      border-block-end-color: var(--jd-color-primary);
      background: color-mix(in srgb, var(--jd-color-primary) 8%, transparent);
    }
    /* 글줄 안에 앉은 텍스트라 scale로 줄이면 앞뒤 본문이 흔들린다 — 눌린 신호는
     면을 짙게 하는 것으로 낸다 (button link variant가 scale을 빼는 것과 같은 판단) */
    .jd-inline-edit__trigger:active:not(:disabled) {
      border-block-end-style: solid;
      border-block-end-color: var(--jd-color-primary-hover);
      background: color-mix(in srgb, var(--jd-color-primary) 16%, transparent);
    }
    .jd-inline-edit__trigger:focus-visible {
      border-block-end-style: solid;
      border-block-end-color: var(--jd-color-primary);
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-inline-edit__trigger:disabled {
      border-block-end-color: transparent;
      background: none;
      cursor: default;
    }

    /* 빈 값 안내 — muted-light(2.7:1)는 AA 미달이라 muted (DEC-027) */
    .jd-inline-edit__trigger[data-empty] .jd-inline-edit__text {
      color: var(--jd-color-muted);
      font-style: italic;
    }

    .jd-inline-edit__pencil {
      flex-shrink: 0;
      color: var(--jd-color-muted);
      /* v2는 쉼 상태 0이라 편집 가능하다는 사실이 포인터를 올리기 전엔 보이지 않았다.
       흐리게라도 남겨 둔다 — 자리는 어차피 잡고 있으므로(opacity만 오간다) 나타날 때
       글자가 밀리지 않는다. */
      opacity: var(--jd-opacity-30);
      transition: opacity var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-inline-edit__trigger:hover > .jd-inline-edit__pencil,
    .jd-inline-edit__trigger:focus-visible > .jd-inline-edit__pencil {
      color: var(--jd-color-primary-ink);
      opacity: var(--jd-opacity-100);
    }
    .jd-inline-edit__trigger:disabled > .jd-inline-edit__pencil {
      display: none;
    }

    .jd-inline-edit__input {
      margin: 0;
      padding-inline: var(--jd-space-1);
      margin-inline: calc(var(--jd-space-1) * -1);
      background: transparent;
      font: inherit;
      color: inherit;
      border: 0;
      border-block-end: var(--jd-border-medium) solid var(--jd-color-primary);
      transition: border-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-inline-edit__input[hidden] {
      display: none;
    }
    .jd-inline-edit__input:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-inline-edit__input:disabled {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-inline-edit__trigger,
      .jd-inline-edit__pencil,
      .jd-inline-edit__input {
        transition: none;
      }
    }
  }
`;
