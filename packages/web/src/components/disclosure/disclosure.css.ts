/**
 * jd-disclosure CSS — 개폐 관용구의 원형. jd-collapsible·jd-accordion이 그대로 쓴다
 * (Drawer가 `.jd-modal__panel`을 쓰는 것과 같은 소유 규칙).
 *
 * v2 값: 패널 `grid transition-all duration-200` + `grid-rows-[1fr]/[0fr]` +
 * `opacity-100`/`opacity-0`, 안쪽 `overflow-hidden`. 트리거는 v2 Collapsible의
 * `w-full cursor-pointer`.
 *
 * 상태는 호스트 태그가 아니라 **`data-state`**로 건다 — 파생 태그(jd-collapsible,
 * jd-accordion 행)마다 `[open]` 호스트 셀렉터를 복제하지 않기 위해서다.
 * `visibility`는 닫힘 전이가 끝난 뒤에 바뀌도록 지연시켜(전이 0s + delay)
 * **접힘 애니메이션을 보존하면서** 닫힌 본문을 AT·탭 순서에서 뺀다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-disclosure:not(:defined) { display: block; }
}
@layer junds.components {
  jd-disclosure { display: block; }

  .jd-disclosure__trigger {
    display: flex; align-items: center; gap: var(--jd-space-2);
    width: 100%; box-sizing: border-box;
    margin: 0; padding: 0; border: 0; background: transparent;
    font-family: var(--jd-font-sans); font-size: inherit; line-height: inherit;
    color: var(--jd-color-foreground); text-align: start; cursor: pointer;
  }
  .jd-disclosure__trigger:disabled,
  .jd-disclosure__trigger[aria-disabled="true"] {
    opacity: var(--jd-opacity-40); cursor: not-allowed;
  }
  .jd-disclosure__trigger:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-disclosure__panel {
    display: grid; grid-template-rows: 0fr;
    opacity: var(--jd-opacity-0); visibility: hidden;
    transition:
      grid-template-rows var(--jd-duration-normal) var(--jd-easing-ease-out),
      opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
      visibility 0s linear var(--jd-duration-normal);
  }
  .jd-disclosure__panel[data-state="open"] {
    grid-template-rows: 1fr;
    opacity: var(--jd-opacity-100); visibility: visible;
    transition-delay: 0s;
  }
  /* 0fr↔1fr 보간은 min-height:0 + overflow:hidden 자식이 있어야 성립한다 */
  .jd-disclosure__inner { overflow: hidden; min-height: 0; }

  /* 감속 요청 시엔 전이를 끈다 — visibility도 즉시 뒤집혀 지연 이유가 사라진다 */
  @media (prefers-reduced-motion: reduce) {
    .jd-disclosure__panel,
    .jd-disclosure__panel[data-state="open"] { transition: none; }
  }
}`;
