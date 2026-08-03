/**
 * jd-bottom-sheet CSS — v2 BottomSheet(상단 둥근 모서리 + 그래버 + height 3종).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-bottom-sheet {
      display: none;
    }
    jd-bottom-sheet[open] {
      display: flex;
      position: fixed;
      inset: 0;
      z-index: var(--jd-z-modal);
      align-items: flex-end;
      justify-content: center;
      padding: 0;
    }

    jd-bottom-sheet .jd-modal__panel {
      width: 100%;
      max-width: 100%;
      border-radius: var(--jd-radius-2xl) var(--jd-radius-2xl) 0 0;
      /* height 기본 auto — v2 max-h 80vh */
      max-height: 80vh;
      animation: jd-sheet-in var(--jd-duration-normal) var(--jd-easing-spring);
      transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    /* 시트 안에 포커스 가능한 것이 없으면 포커스트랩이 패널에 tabindex="-1"을 심고
     패널 자체를 포커스한다(behaviors/focus-trap) — 그때 UA 기본 아웃라인이 패널
     테두리를 따라 그려져 팔레트를 벗어난다. 패널은 감금 기점일 뿐 조작 대상이
     아니므로 표시를 지운다. 시트에 담기는 조작 요소(jd-button 등)는 각자 자기
     :focus-visible을 갖고 있어 §1의 "대체 없이 지우기"에 해당하지 않는다. */
    jd-bottom-sheet > .jd-modal__panel:focus,
    jd-bottom-sheet > .jd-modal__panel:focus-visible {
      outline: none;
    }
    jd-bottom-sheet[height="half"] .jd-modal__panel {
      height: 50vh;
      max-height: 50vh;
    }
    jd-bottom-sheet[height="full"] .jd-modal__panel {
      height: 90vh;
      max-height: 90vh;
    }

    @keyframes jd-sheet-in {
      from {
        transform: translateY(100%);
      }
    }

    .jd-bottom-sheet__grabber {
      flex-shrink: 0;
      width: 2.5rem;
      height: 0.25rem;
      margin: var(--jd-space-3) auto var(--jd-space-1);
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-border);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-bottom-sheet__grabber[hidden] {
      display: none;
    }
    jd-bottom-sheet[draggable] .jd-bottom-sheet__grabber {
      cursor: grab;
      touch-action: none; /* 끌 때 브라우저 스크롤과 다투지 않는다 */
      /* 손잡이만으로는 잡기 어렵다 — 히트 영역을 넓힌다 */
      padding-block: var(--jd-space-2);
      background-clip: content-box;
      height: calc(0.25rem + var(--jd-space-4));
      box-sizing: content-box;
    }
    /* draggable일 때만 손잡이가 잡히는 것이다 — 잡을 수 있음을 색으로 먼저 말하고,
     잡은 동안 커서를 grabbing으로 바꿔 "지금 끌고 있다"를 남긴다. draggable이
     아닌 시트의 손잡이는 장식이라 응답하지 않는다. */
    jd-bottom-sheet[draggable] .jd-bottom-sheet__grabber:hover {
      background: var(--jd-color-muted-light);
    }
    jd-bottom-sheet[draggable] .jd-bottom-sheet__grabber:active {
      cursor: grabbing;
      background: var(--jd-color-muted);
    }

    .jd-bottom-sheet__title {
      flex-shrink: 0;
      margin: 0;
      padding: var(--jd-space-2) var(--jd-space-5) var(--jd-space-3);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-bottom-sheet__title[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      jd-bottom-sheet .jd-modal__panel {
        animation: none;
        transition: none;
      }
      .jd-bottom-sheet__grabber {
        transition: none;
      }
    }
  }
`;
