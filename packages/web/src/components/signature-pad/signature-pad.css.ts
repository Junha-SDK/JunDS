import { css } from "../../core/styles.js";

/**
 * jd-signature-pad CSS — v2 composites/SignaturePad 토큰 번역.
 * v2 값: 캔버스 border-2 dashed · rounded-xl · bg-white · cursor-crosshair · touch-none,
 * 버튼 행 mt-2 gap-2 · px-3 py-1.5 text-xs rounded-lg(보조=테두리, 저장=primary).
 * 캔버스는 반드시 content-box — border-box면 테두리만큼 그리기 면이 줄어 좌표가
 * 어긋난다(DEC-024의 box-sizing 교훈이 정반대로 적용되는 유일한 표면).
 */
export default css`
@layer junds.components {
  jd-signature-pad {
    display: inline-flex; flex-direction: column; gap: var(--jd-space-2);
  }

  .jd-signature-pad__canvas {
    display: block; box-sizing: content-box;
    color: var(--jd-color-foreground); /* 기본 획 색의 원천 (currentColor) */
    background: var(--jd-color-card);
    border: var(--jd-border-medium) dashed var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    cursor: crosshair; touch-action: none;
  }
  jd-signature-pad[disabled] .jd-signature-pad__canvas {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }

  .jd-signature-pad__actions { display: flex; gap: var(--jd-space-2); }

  .jd-signature-pad__button {
    margin: 0; padding: var(--jd-space-1-5) var(--jd-space-3);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg); cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-signature-pad__button:hover:not(:disabled) {
    background: var(--jd-color-card-hover);
  }
  .jd-signature-pad__button:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }
  .jd-signature-pad__button:disabled {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }

  .jd-signature-pad__button--primary {
    color: #fff; background: var(--jd-color-primary); border-color: transparent;
  }
  .jd-signature-pad__button--primary:hover:not(:disabled) {
    background: var(--jd-color-primary-hover);
  }

  /* 서명 유무 통지 — 시각적으로는 감추고 AT에만 노출 */
  .jd-signature-pad__status {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-signature-pad__button { transition: none; }
  }
}`;
