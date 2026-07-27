/**
 * jd-modal 컴포넌트 CSS.
 * v2 ds/composites/Modal의 백드롭(black/30 + blur 2px)·패널(white·radius 2xl·
 * 층 그림자·max-h 90vh)·size 5종(sm/md/lg/xl/full)을 --jd-* 토큰으로 의미 번역.
 * top layer(<dialog>) 미사용 — --jd-z-modal 토큰 체계로 쌓임 제어(DECISIONS 참조).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-modal {
      display: none;
    }
    jd-modal[open] {
      display: flex;
      position: fixed;
      inset: 0;
      z-index: var(--jd-z-modal);
      align-items: center;
      justify-content: center;
      padding: var(--jd-space-4);
    }

    .jd-modal__backdrop {
      position: absolute;
      inset: 0;
      background: color-mix(in srgb, #090811 46%, transparent);
      backdrop-filter: blur(3px) saturate(0.9);
    }

    .jd-modal__panel {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow: auto;
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      font-family: var(--jd-font-sans);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-border) 76%, transparent);
      border-radius: var(--jd-radius-2xl);
      box-shadow:
        0 32px 80px rgba(0, 0, 0, 0.22),
        0 12px 28px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 var(--jd-color-highlight);
      /* size 기본 md(32rem) — 디폴트는 attribute 미반영(§1.3)이라 base가 담당 */
      max-width: min(32rem, calc(100vw - 2rem));
    }

    .jd-modal__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--jd-space-4);
      padding: var(--jd-space-5);
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border-light);
    }
    .jd-modal__title {
      min-width: 0;
      margin: 0;
      font-size: var(--jd-text-xl);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-snug);
      letter-spacing: -0.012em;
    }
    .jd-modal__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 2rem;
      height: 2rem;
      padding: 0;
      margin: -0.25rem -0.25rem -0.25rem 0;
      border: 0;
      border-radius: var(--jd-radius-full);
      background: transparent;
      color: var(--jd-color-muted);
      cursor: pointer;
      transition:
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-modal__close:hover {
      color: var(--jd-color-foreground);
      background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    }
    .jd-modal__close:active {
      scale: 0.94;
    }
    .jd-modal__close:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-modal__body {
      min-height: 0;
      padding: var(--jd-space-5);
      overflow: auto;
      line-height: var(--jd-leading-relaxed);
    }
    .jd-modal__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
      padding: var(--jd-space-4) var(--jd-space-5);
      border-top: var(--jd-border-thin) solid var(--jd-color-border-light);
      background: color-mix(
        in srgb,
        var(--jd-color-card-hover) 50%,
        transparent
      );
    }

    /* size — v2: sm 28rem / lg 42rem / xl 56rem / full 뷰포트 (md는 base) */
    jd-modal[size="sm"] > .jd-modal__panel {
      max-width: min(28rem, calc(100vw - 2rem));
    }
    jd-modal[size="lg"] > .jd-modal__panel {
      max-width: min(42rem, calc(100vw - 2rem));
    }
    jd-modal[size="xl"] > .jd-modal__panel {
      max-width: min(56rem, calc(100vw - 2rem));
    }
    jd-modal[size="full"] > .jd-modal__panel {
      max-width: calc(100vw - 2rem);
      max-height: calc(100vh - 2rem);
    }

    @media (max-width: 36rem) {
      jd-modal[open] {
        align-items: flex-end;
        padding: var(--jd-space-2);
      }
      .jd-modal__panel {
        max-width: none;
        max-height: calc(100dvh - var(--jd-space-4));
        border-radius: var(--jd-radius-2xl);
      }
      .jd-modal__header,
      .jd-modal__body {
        padding: var(--jd-space-4);
      }
      .jd-modal__footer {
        padding: var(--jd-space-3) var(--jd-space-4);
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      jd-modal[open] > .jd-modal__backdrop {
        animation: jd-modal-fade var(--jd-duration-normal)
          var(--jd-easing-ease-out);
      }
      jd-modal[open] > .jd-modal__panel {
        animation: jd-modal-pop var(--jd-duration-normal)
          var(--jd-easing-default);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .jd-modal__close {
        transition: none;
      }
    }
    @keyframes jd-modal-fade {
      from {
        opacity: 0;
      }
    }
    @keyframes jd-modal-pop {
      from {
        opacity: 0;
        transform: scale(0.96);
      }
    }
  }
`;
