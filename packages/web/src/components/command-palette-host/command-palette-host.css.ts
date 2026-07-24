import { css } from "../../core/styles.js";

/**
 * jd-command-palette-host CSS — 태그-스코프 레이아웃 규칙만.
 *
 * `.jd-command-palette__*` **클래스** 규칙은 부모 시트(command-palette.css)가 이미
 * 전역 채택하므로 상속된다. 그러나 display/오버레이/애니메이션은 부모가
 * `jd-command-palette` **태그**로 스코프해 파생 태그에 닿지 않는다 — 여기서 다시 건다
 * (command-palette.css가 jd-modal 태그 규칙을 재선언한 것과 동형).
 */
export default css`
@layer junds.components {
  jd-command-palette-host { display: none; }
  jd-command-palette-host[open] {
    display: flex; position: fixed; inset: 0; z-index: var(--jd-z-modal);
    align-items: flex-start; justify-content: center;
    padding: 20vh var(--jd-space-4) var(--jd-space-4);
  }

  jd-command-palette-host > .jd-modal__backdrop {
    background: rgba(0, 0, 0, .4);
    backdrop-filter: none;
  }

  jd-command-palette-host > .jd-modal__panel {
    max-width: min(32rem, calc(100vw - 2rem));
    max-height: calc(100vh - 24vh);
    overflow: hidden;
    box-shadow: var(--jd-shadow-2xl);
  }

  @media (prefers-reduced-motion: no-preference) {
    jd-command-palette-host[open] > .jd-modal__backdrop {
      animation: jd-cmdk-fade var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-command-palette-host[open] > .jd-modal__panel {
      animation: jd-cmdk-pop var(--jd-duration-normal) var(--jd-easing-default);
    }
  }
}`;
