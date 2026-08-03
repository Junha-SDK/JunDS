/**
 * jd-segmented-control CSS — v2 composites/SegmentedControl 토큰 번역.
 *
 * v2 값: 트랙 bg-gray-100 rounded-lg p-1 gap-0.5, 인디케이터 bg-white rounded-md
 * shadow-sm top-1/bottom-1 transition-all 200ms, 세그먼트 sm(px-2.5 py-1 text-xs) /
 * md(px-3.5 py-1.5 text-sm) / lg(px-5 py-2 text-base) medium rounded-md,
 * 선택 text-foreground / 비선택 text-muted + hover:text-foreground, disabled 40%.
 * v2가 하드코딩한 gray-100/white는 테마 토큰(border-light / card)으로 번역한다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-segmented-control {
      position: relative;
      display: inline-flex;
      align-items: stretch;
      gap: var(--jd-space-0-5);
      padding: var(--jd-space-1);
      border-radius: var(--jd-radius-lg);
      /* 트랙은 "파인 홈", 인디케이터는 "떠 있는 카드"다. v2의 bg-gray-100을 그대로
       --jd-color-border-light로 번역하면 **다크에서 역전된다**(border-light #22203a가
       card #161329보다 밝아 인디케이터가 더 어두워진다). 배경을 어둡게 깎아 두 테마
       모두에서 트랙 < 인디케이터 순서를 지킨다 — 실브라우저 다크 스냅샷에서 발견. */
      background: color-mix(in srgb, var(--jd-color-background) 94%, #000);
      font-family: var(--jd-font-sans);
    }
    jd-segmented-control[full-width] {
      display: flex;
      width: 100%;
    }
    jd-segmented-control[disabled] {
      opacity: var(--jd-opacity-50);
    }

    .jd-segmented-control__indicator {
      position: absolute;
      top: var(--jd-space-1);
      bottom: var(--jd-space-1);
      left: 0;
      border-radius: var(--jd-radius-md);
      background: var(--jd-color-card);
      box-shadow: var(--jd-shadow-sm);
      transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out),
        width var(--jd-duration-normal) var(--jd-easing-ease-out);
      pointer-events: none;
    }
    .jd-segmented-control__indicator[hidden] {
      display: none;
    }

    .jd-segmented-control__seg {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--jd-space-1-5);
      border-radius: var(--jd-radius-md);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-muted);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
      /* size 기본 md */
      padding: var(--jd-space-1-5) var(--jd-space-3-5);
      font-size: var(--jd-text-md);
    }
    jd-segmented-control[full-width] .jd-segmented-control__seg {
      flex: 1;
    }
    jd-segmented-control[size="sm"] .jd-segmented-control__seg {
      padding: var(--jd-space-1) var(--jd-space-2-5);
      font-size: var(--jd-text-xs);
    }
    jd-segmented-control[size="lg"] .jd-segmented-control__seg {
      padding: var(--jd-space-2) var(--jd-space-5);
      font-size: var(--jd-text-lg);
    }

    .jd-segmented-control__seg:hover {
      color: var(--jd-color-foreground);
    }
    .jd-segmented-control__seg[data-selected] {
      color: var(--jd-color-foreground);
    }
    .jd-segmented-control__seg[data-disabled] {
      opacity: var(--jd-opacity-40);
      cursor: not-allowed;
      color: var(--jd-color-muted);
    }

    /* 네이티브 radio는 시각적으로만 숨긴다 — 포커스·키보드·폼은 그대로 살아 있다 */
    .jd-segmented-control__input {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      border: 0;
      overflow: hidden;
      white-space: nowrap;
      clip-path: inset(50%);
    }
    .jd-segmented-control__seg:has(.jd-segmented-control__input:focus-visible) {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: -1px;
    }

    .jd-segmented-control__icon {
      flex-shrink: 0;
    }
    .jd-segmented-control__icon[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-segmented-control__indicator,
      .jd-segmented-control__seg {
        transition: none;
      }
    }
  }
`;
