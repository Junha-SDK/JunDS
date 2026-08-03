/**
 * jd-spotlight CSS — v2 Spotlight 표면.
 * v2 값: 오버레이 `fixed inset-0 z-[9998]`, SVG `absolute inset-0 w-full h-full`,
 * 딤 `rgba(0,0,0,0.5)`(딤 값은 프로퍼티로 열어 두고 기본값이 v2와 같다),
 * 콘텐츠 `absolute z-[9999] translateX(-50%)`. 임의 z 값은 --jd-z-max 토큰으로.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-spotlight:not(:defined) {
      display: none;
    }
  }
  @layer junds.components {
    jd-spotlight {
      display: none;
    }
    jd-spotlight[active] {
      display: block;
      position: fixed;
      inset: 0;
      z-index: var(--jd-z-max);
    }

    .jd-spotlight__canvas {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
    }

    /* 딤은 모드와 무관하게 검은 면이다 — 그 위 글자를 --jd-color-foreground로 두면
     라이트 모드에서 검은 글자가 검은 면에 얹혀 안내문이 통째로 사라진다(§4).
     surface/on-surface 짝으로 말풍선을 세워 두 모드에서 같은 대비를 얻는다. */
    .jd-spotlight__content {
      position: absolute;
      translate: -50% 0;
      z-index: 1;
      box-sizing: border-box;
      /* 대상 중앙에 맞춰 옆으로 밀리므로 화면 밖으로 나가지 않게 상한을 둔다 */
      max-width: min(22rem, calc(100vw - 2rem));
      padding: var(--jd-space-4);
      border-radius: var(--jd-radius-xl);
      background: var(--jd-color-surface-overlay);
      color: var(--jd-color-on-surface);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-on-surface) 14%, transparent);
      box-shadow: var(--jd-shadow-xl), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      line-height: var(--jd-leading-normal);
    }
    .jd-spotlight__content[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: no-preference) {
      jd-spotlight[active] > .jd-spotlight__canvas {
        animation: jd-spotlight-in var(--jd-duration-normal) var(--jd-easing-ease-out);
      }
      jd-spotlight[active] > .jd-spotlight__content {
        animation: jd-spotlight-rise var(--jd-duration-normal) var(--jd-easing-ease-out);
      }
    }
    @keyframes jd-spotlight-in {
      from {
        opacity: 0;
      }
    }
    @keyframes jd-spotlight-rise {
      from {
        opacity: 0;
        translate: -50% 6px;
      }
    }
  }
`;
