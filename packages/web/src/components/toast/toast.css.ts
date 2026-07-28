/**
 * jd-toast CSS — 토스트 스택(모서리 고정) + 개별 카드.
 * 카드 표면은 jd-notification과 같은 어휘(30% 테두리 + 틴트)를 쓴다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-toast {
      position: fixed;
      z-index: var(--jd-z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-2);
      width: min(22rem, calc(100vw - 2rem));
      pointer-events: none; /* 빈 영역이 아래 UI를 막지 않는다 */
      /* position 기본 top-right */
      inset-block-start: var(--jd-space-6);
      inset-inline-end: var(--jd-space-6);
    }
    jd-toast[position="top-left"] {
      inset-inline-end: auto;
      inset-inline-start: var(--jd-space-6);
    }
    jd-toast[position="bottom-right"] {
      inset-block-start: auto;
      inset-block-end: var(--jd-space-6);
      flex-direction: column-reverse;
    }
    jd-toast[position="bottom-left"] {
      inset-block-start: auto;
      inset-block-end: var(--jd-space-6);
      inset-inline-end: auto;
      inset-inline-start: var(--jd-space-6);
      flex-direction: column-reverse;
    }
    jd-toast[position="top"] {
      inset-inline: 0;
      margin-inline: auto;
    }
    jd-toast[position="bottom"] {
      inset-block-start: auto;
      inset-block-end: var(--jd-space-6);
      inset-inline: 0;
      margin-inline: auto;
      flex-direction: column-reverse;
    }

    /* 변종 색은 **혼합비가 모드를 따라가는** 톤 레시피를 경유한다(DEC-044).
     의미색 앵커(success #2f8f57 등)는 라이트에서 옅은 틴트 위 글자가 AA를 넘도록
     600~700단에 둔 값이라, 다크에서 그 앵커를 5%만 섞으면 카드와 구분이 사라진 어두운
     면이 남는다 — 토스트가 배경에 잠기고 글자만 떠 있는 것처럼 읽혔다(실측).
     다크에서만 앵커를 흰 쪽으로 들어 올린 뒤(face) 섞으면 면이 확실히 위로 뜬다. */
    .jd-toast__item {
      position: relative;
      pointer-events: auto;
      box-sizing: border-box;
      min-width: 0;
      padding: var(--jd-space-3-5) var(--jd-space-8) var(--jd-space-3-5) var(--jd-space-4);
      font-family: var(--jd-font-sans);
      --jd-tone: var(--jd-color-info);
      --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
      background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-mix), var(--jd-color-card));
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-border-mix), transparent);
      border-radius: var(--jd-radius-xl);
      /* 떠 있는 것은 lg 이상 + 위에서 받는 빛 */
      box-shadow: var(--jd-shadow-lg), inset 0 1px 0 var(--jd-color-highlight);
      animation: jd-toast-in var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-toast__item[data-variant="success"] {
      --jd-tone: var(--jd-color-success);
    }
    .jd-toast__item[data-variant="warning"] {
      --jd-tone: var(--jd-color-warning);
    }
    .jd-toast__item[data-variant="danger"] {
      --jd-tone: var(--jd-color-danger);
    }

    .jd-toast__title {
      margin: 0;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-snug);
      color: var(--jd-color-foreground);
      overflow-wrap: anywhere;
    }
    .jd-toast__desc {
      margin: var(--jd-space-0-5) 0 0;
      font-size: var(--jd-text-sm);
      line-height: var(--jd-leading-normal);
      color: var(--jd-color-muted);
      overflow-wrap: anywhere;
    }
    .jd-toast__close {
      position: absolute;
      inset-block-start: var(--jd-space-2);
      inset-inline-end: var(--jd-space-2);
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: none;
      cursor: pointer;
      font-size: var(--jd-text-md);
      line-height: 1;
      color: var(--jd-color-muted);
      border-radius: var(--jd-radius-md);
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    /* 틴트된 면 위이므로 hover 배경도 카드색이 아니라 잉크에서 뽑는다 —
     card-hover를 얹으면 변종 틴트가 그 자리만 지워진다. */
    .jd-toast__close:hover {
      color: var(--jd-color-foreground);
      background: color-mix(in srgb, var(--jd-color-muted) 14%, transparent);
    }
    .jd-toast__close:active {
      scale: 0.94;
      background: color-mix(in srgb, var(--jd-color-muted) 22%, transparent);
    }
    .jd-toast__close:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    @keyframes jd-toast-in {
      from {
        opacity: 0;
        transform: translateY(-0.5rem);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-toast__item {
        animation: none;
      }
      .jd-toast__close {
        transition: none;
      }
    }
  }
`;
