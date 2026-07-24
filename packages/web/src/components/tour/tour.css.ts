/**
 * jd-tour CSS — v2 patterns/Tour 표면 의미 번역.
 * v2 값: 오버레이 `fixed inset-0 z-[9998]`, 딤 `rgba(0,0,0,0.5)`(dim 프로퍼티 기본값),
 * 팝오버 `absolute z-[9999] w-72 bg-white rounded-lg shadow-xl border p-4`,
 * 제목 `text-sm font-semibold mb-1`, 설명 `text-sm text-muted mb-4`, 카운터
 * `text-xs text-muted`, 버튼 `px-3 py-1 text-xs rounded-md`(다음/완료=primary,
 * 이전=border, 닫기=muted). 임의 z 값은 --jd-z-max 토큰으로.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-tour:not(:defined) { display: none; }
}
@layer junds.components {
  jd-tour { display: none; }
  jd-tour[open] {
    display: block;
    position: fixed;
    inset: 0;
    z-index: var(--jd-z-max);
    font-family: var(--jd-font-sans);
  }

  .jd-tour__canvas {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  .jd-tour__popover {
    box-sizing: border-box; /* width + padding + border — 배치 좌표가 실폭과 어긋나지 않게 */
    position: absolute;
    width: 18rem;
    max-width: calc(100vw - 2rem);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    box-shadow: var(--jd-shadow-xl);
    padding: var(--jd-space-4);
  }

  .jd-tour__title {
    margin: 0 0 var(--jd-space-1);
    font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  .jd-tour__desc {
    margin: 0 0 var(--jd-space-4);
    font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
    line-height: var(--jd-leading-relaxed);
  }
  .jd-tour__desc[hidden] { display: none; }

  .jd-tour__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--jd-space-2);
  }
  .jd-tour__counter {
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }
  .jd-tour__actions { display: flex; gap: var(--jd-space-2); }

  .jd-tour__btn {
    padding: var(--jd-space-1) var(--jd-space-3);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium);
    border-radius: var(--jd-radius-md);
    border: var(--jd-border-thin) solid transparent;
    cursor: pointer;
    transition:
      background var(--jd-duration-fast) var(--jd-easing-ease-out),
      color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-tour__btn[hidden] { display: none; }
  .jd-tour__btn:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-tour__btn--primary {
    background: var(--jd-color-primary);
    color: #fff;
  }
  .jd-tour__btn--primary:hover {
    background: color-mix(in srgb, var(--jd-color-primary) 90%, black);
  }
  .jd-tour__btn--ghost {
    background: transparent;
    border-color: var(--jd-color-border);
    color: var(--jd-color-foreground);
  }
  .jd-tour__btn--ghost:hover {
    background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
  }
  .jd-tour__btn--muted {
    background: transparent;
    color: var(--jd-color-muted);
  }
  .jd-tour__btn--muted:hover { color: var(--jd-color-foreground); }

  @media (prefers-reduced-motion: no-preference) {
    jd-tour[open] > .jd-tour__canvas {
      animation: jd-tour-fade var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-tour[open] > .jd-tour__popover {
      animation: jd-tour-pop var(--jd-duration-normal) var(--jd-easing-default);
    }
  }
  @keyframes jd-tour-fade { from { opacity: 0; } }
  @keyframes jd-tour-pop { from { opacity: 0; } }
}`;
