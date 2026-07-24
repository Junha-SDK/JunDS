/**
 * jd-spotlight CSS — v2 Spotlight 표면.
 * v2 값: 오버레이 `fixed inset-0 z-[9998]`, SVG `absolute inset-0 w-full h-full`,
 * 딤 `rgba(0,0,0,0.5)`(딤 값은 프로퍼티로 열어 두고 기본값이 v2와 같다),
 * 콘텐츠 `absolute z-[9999] translateX(-50%)`. 임의 z 값은 --jd-z-max 토큰으로.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-spotlight:not(:defined) { display: none; }
}
@layer junds.components {
  jd-spotlight { display: none; }
  jd-spotlight[active] {
    display: block; position: fixed; inset: 0;
    z-index: var(--jd-z-max);
  }

  .jd-spotlight__canvas {
    position: absolute; inset: 0;
    display: block; width: 100%; height: 100%;
  }

  .jd-spotlight__content {
    position: absolute;
    translate: -50% 0;
    z-index: 1;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }
  .jd-spotlight__content[hidden] { display: none; }

  @media (prefers-reduced-motion: no-preference) {
    jd-spotlight[active] > .jd-spotlight__canvas {
      animation: jd-spotlight-in var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
  }
  @keyframes jd-spotlight-in { from { opacity: 0; } }
}`;
