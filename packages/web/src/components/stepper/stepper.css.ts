/**
 * jd-stepper CSS — v2 composites/Stepper(32px 원 · 진행선 · 완료=primary /
 * 진행=primary+ring / 예정=회색)의 의미 번역. direction 분기는 호스트 속성 셀렉터.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-stepper {
      display: block;
    }

    .jd-stepper__list {
      display: flex;
      align-items: center;
      gap: 0;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .jd-stepper__step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1 1 0;
      min-width: 0;
    }

    /* 원 + 연결선 — 가로에서는 한 줄로 나란히 */
    .jd-stepper__marker {
      display: flex;
      align-items: center;
      inline-size: 100%;
    }

    .jd-stepper__circle {
      inline-size: 2rem;
      block-size: 2rem;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--jd-radius-full);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-none);
      background: var(--jd-color-border);
      color: var(--jd-color-muted);
      transition: background var(--jd-duration-slow) var(--jd-easing-ease-out),
        color var(--jd-duration-slow) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-slow) var(--jd-easing-ease-out);
    }
    .jd-stepper__circle > svg {
      inline-size: 1rem;
      block-size: 1rem;
    }

    .jd-stepper__step[data-status="completed"] > .jd-stepper__marker > .jd-stepper__circle,
    .jd-stepper__step[data-status="current"] > .jd-stepper__marker > .jd-stepper__circle {
      background: var(--jd-color-primary);
      color: #fff;
    }
    /* v2: ring-4 ring-primary-light */
    .jd-stepper__step[data-status="current"] > .jd-stepper__marker > .jd-stepper__circle {
      box-shadow: 0 0 0 4px var(--jd-color-primary-light);
    }

    .jd-stepper__line {
      flex: 1 1 auto;
      block-size: var(--jd-border-thin);
      margin-inline: var(--jd-space-2);
      background: var(--jd-color-border);
      transition: background var(--jd-duration-slow) var(--jd-easing-ease-out);
    }
    .jd-stepper__step[data-status="completed"] > .jd-stepper__marker > .jd-stepper__line {
      background: var(--jd-color-primary);
    }
    .jd-stepper__step[data-last] > .jd-stepper__marker > .jd-stepper__line {
      display: none;
    }

    /* 글줄은 자기 단계의 칸 안에서 끝난다. align-items:center만으로는 상자가
     내용 폭(fit-content)을 따라가 옆 단계의 글줄과 맞붙었다 — 폭을 칸에 못 박고
     좌우로 한 칸 띄워 두 줄이 되어도 이웃과 부딪치지 않게 한다(§5). */
    .jd-stepper__body {
      display: flex;
      flex-direction: column;
      align-items: center;
      inline-size: 100%;
      min-inline-size: 0;
      padding-inline: var(--jd-space-2);
      box-sizing: border-box;
      margin-block-start: var(--jd-space-2);
      text-align: center;
    }
    /* 기본 CJK 줄바꿈은 글자 단위라 좁은 단계에서 낱말 한가운데가 끊긴다 —
     어절은 지키고(keep-all) 한 어절이 칸보다 길 때만 끊는다. balance는 두 줄이
     될 때 길이를 고르게 나눠 옆 단계 쪽으로 한 줄만 길게 삐져나오지 않게 한다. */
    .jd-stepper__title {
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
      word-break: keep-all;
      overflow-wrap: break-word;
      text-wrap: balance;
    }
    .jd-stepper__step[data-status="upcoming"] .jd-stepper__title {
      color: var(--jd-color-muted);
    }
    .jd-stepper__description {
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      margin-block-start: var(--jd-space-0-5);
      word-break: keep-all;
      overflow-wrap: break-word;
      text-wrap: balance;
    }
    .jd-stepper__description[hidden] {
      display: none;
    }

    /* 상태 텍스트 — 시각적으로만 숨긴다(AT에는 남는다) */
    .jd-stepper__status {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    /* ── direction=vertical — v2: 행 배치 + 세로 연결선 ───────────────── */
    jd-stepper[direction="vertical"] > .jd-stepper__list {
      flex-direction: column;
      align-items: stretch;
    }
    jd-stepper[direction="vertical"] .jd-stepper__step {
      flex-direction: row;
      align-items: stretch;
      flex: 0 0 auto;
      gap: var(--jd-space-3);
    }
    jd-stepper[direction="vertical"] .jd-stepper__marker {
      flex-direction: column;
      inline-size: auto;
    }
    jd-stepper[direction="vertical"] .jd-stepper__line {
      inline-size: var(--jd-border-thin);
      block-size: auto;
      min-block-size: 1.5rem;
      margin-inline: auto;
      margin-block: var(--jd-space-1);
    }
    jd-stepper[direction="vertical"] .jd-stepper__body {
      align-items: flex-start;
      text-align: start;
      /* 세로 배치에서는 옆 단계가 없다 — 폭 못 박기·좌우 여백·balance를 되돌린다 */
      inline-size: auto;
      flex: 1 1 auto;
      padding-inline: 0;
      margin-block-start: 0;
      padding-block: var(--jd-space-0-5) var(--jd-space-6);
    }
    jd-stepper[direction="vertical"] .jd-stepper__title,
    jd-stepper[direction="vertical"] .jd-stepper__description {
      text-wrap: wrap;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-stepper__circle,
      .jd-stepper__line {
        transition: none;
      }
    }
  }
`;
