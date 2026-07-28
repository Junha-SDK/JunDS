/**
 * jd-snackbar CSS — v2 composites/Snackbar(어두운 알약 + 위치 4종 + 슬라이드 인).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-snackbar {
      display: none;
    }
    jd-snackbar[open] {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      position: fixed;
      z-index: var(--jd-z-toast);
      box-sizing: border-box;
      /* 좁은 화면에서 글자를 줄이는 대신 줄 수를 늘린다 — min-width가 알약을 무너지지
       않게 잡아 주고, 넘치는 문장은 max-width 안에서 접힌다. 본문 크기를 md 아래로
       내리면 어두운 면 위 흰 글자가 그 자리에서 읽히지 않는다. */
      min-width: min(17rem, calc(100vw - 2rem));
      max-width: min(28rem, calc(100vw - 2rem));
      padding: var(--jd-space-3) var(--jd-space-4);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      line-height: var(--jd-leading-normal);
      /* surface의 짝은 on-surface다 — 라이트에서도 어두운 면이므로 잉크가 모드를
       따라가면 안 된다 (DEC-044) */
      color: var(--jd-color-on-surface);
      background: var(--jd-color-surface-overlay);
      border-radius: var(--jd-radius-xl);
      /* 떠 있는 것은 그림자만으로는 배경에서 떨어지지 않는다 — 위에서 받는 빛
       한 줄과 하이라이트 테두리가 알약에 두께를 준다 */
      border: var(--jd-border-thin) solid var(--jd-color-highlight);
      box-shadow: var(--jd-shadow-lg), inset 0 1px 0 var(--jd-color-highlight);
      animation: jd-snackbar-in var(--jd-duration-normal) var(--jd-easing-ease-out);
      /* position 기본 bottom(중앙) */
      inset-block-end: var(--jd-space-6);
      inset-inline-start: 50%;
      transform: translateX(-50%);
    }
    jd-snackbar[position="top"][open] {
      inset-block-end: auto;
      inset-block-start: var(--jd-space-6);
      animation-name: jd-snackbar-in-top;
    }
    jd-snackbar[position="bottom-left"][open] {
      inset-inline-start: var(--jd-space-6);
      transform: none;
    }
    jd-snackbar[position="bottom-right"][open] {
      inset-inline-start: auto;
      inset-inline-end: var(--jd-space-6);
      transform: none;
    }

    /* 의미색 변종은 원색 위라 잉크가 흰색으로 고정된다(on-surface는 원색 위에서
     회색기가 돌아 탁해진다) */
    jd-snackbar[variant="success"][open],
    jd-snackbar[variant="error"][open],
    jd-snackbar[variant="warning"][open],
    jd-snackbar[variant="info"][open] {
      color: #ffffff;
    }
    jd-snackbar[variant="success"][open] {
      background: var(--jd-color-success);
    }
    jd-snackbar[variant="error"][open] {
      background: var(--jd-color-danger);
    }
    jd-snackbar[variant="warning"][open] {
      background: var(--jd-color-warning);
    }
    jd-snackbar[variant="info"][open] {
      background: var(--jd-color-info);
    }

    .jd-snackbar__message {
      flex: 1;
      /* 플렉스 자식 기본 min-width:auto는 긴 URL 한 덩어리에 알약을 밀어낸다 */
      min-width: 0;
      overflow-wrap: anywhere;
    }
    jd-snackbar > [slot="action"] {
      flex-shrink: 0;
    }

    @keyframes jd-snackbar-in {
      from {
        opacity: 0;
        transform: translate(-50%, 1rem);
      }
    }
    @keyframes jd-snackbar-in-top {
      from {
        opacity: 0;
        transform: translate(-50%, -1rem);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      jd-snackbar[open] {
        animation: none;
      }
    }
  }
`;
