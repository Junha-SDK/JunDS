/**
 * jd-split-pane CSS — 2분할 관용구의 원형. jd-resizable이 그대로 쓴다
 * (Drawer가 `.jd-modal__panel`을 쓰는 것과 같은 소유 규칙).
 *
 * v2 값: 컨테이너 `flex overflow-hidden` + `height:100%`, 첫 패널 `overflow-auto`,
 * 분리대 `shrink-0 bg-border hover:bg-primary/30 transition-colors` + `w-1 cursor-col-resize`
 * (세로 분할 `h-1 cursor-row-resize`), 둘째 패널 `flex-1 overflow-auto`.
 *
 * 그립(.jd-split-pane__grip)은 골격에 항상 있고 여기서는 감춘다 — v2 SplitPane에는
 * 없고 Resizable에만 있는 표식이라 파생 시트가 켠다(jd-badge count 선례).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-split-pane:not(:defined) { display: flex; }
}
@layer junds.components {
  jd-split-pane {
    display: flex; flex-direction: row; overflow: hidden;
    box-sizing: border-box; height: 100%;
    font-family: var(--jd-font-sans);
  }
  jd-split-pane[direction="vertical"] { flex-direction: column; }

  .jd-split-pane__pane { overflow: auto; min-width: 0; min-height: 0; }
  .jd-split-pane__pane--start { flex: 0 0 auto; }
  .jd-split-pane__pane--end { flex: 1 1 0; }

  .jd-split-pane__separator {
    position: relative; flex: 0 0 auto;
    background: var(--jd-color-border);
    touch-action: none; /* 드래그 중 브라우저 스크롤 제스처가 포인터를 가로채지 않게 */
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
    /* direction 기본 horizontal — v2 w-1 */
    inline-size: 4px; cursor: col-resize;
  }
  jd-split-pane[direction="vertical"] > .jd-split-pane__separator {
    inline-size: auto; block-size: 4px; cursor: row-resize;
  }
  .jd-split-pane__separator:hover {
    background: color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-split-pane__separator:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring); z-index: 1;
  }

  /* 파생(jd-resizable)이 켠다 */
  .jd-split-pane__grip { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-split-pane__separator { transition: none; }
  }
}`;
