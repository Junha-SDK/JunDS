/**
 * jd-notification-center CSS — v2 NotificationCenter 표면의 토큰 번역.
 * 패널 배치·등장 애니메이션은 공유 시트(popover.css)의 `[align] > .jd-popover__panel`
 * / `[open] > .jd-popover__panel` 규칙을 그대로 받는다. 여기서는 **호스트 박스 규칙**
 * (popover.css는 태그별 각자 선언을 요구)과 **표면 오버라이드**만 얹는다.
 *
 * v2 값: 벨 `w-9 h-9 rounded-lg hover:bg-gray-100 text-muted`, 미읽음 배지 18px danger,
 * 패널 `w-80 bg-white border rounded-xl shadow-xl`, 헤더 `px-4 py-2.5 border-b`,
 * 항목 `gap-3 px-4 py-3 border-b`, 미읽음 `bg-primary-light/30` + dot `bg-primary`.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-notification-center:not(:defined) {
      display: inline-block;
    }
    jd-notification-center:not(:defined) > script {
      display: none;
    }
  }
  @layer junds.components {
    /* 호스트 박스 — popover.css는 파생 태그가 각자 선언하도록 요구한다 */
    jd-notification-center {
      position: relative;
      display: inline-block;
    }

    /* 패널 표면 오버라이드 (배치·애니메이션은 공유 시트) */
    jd-notification-center > .jd-popover__panel {
      width: 20rem;
      max-width: min(20rem, calc(100vw - 2rem));
      padding: 0;
      overflow: hidden;
      backdrop-filter: none;
      box-shadow: var(--jd-shadow-xl);
    }

    /* ── 벨 트리거 ── */
    .jd-notification-center__bell {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      padding: 0;
      cursor: pointer;
      border: 0;
      background: none;
      color: var(--jd-color-muted);
      border-radius: var(--jd-radius-lg);
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-notification-center__bell:hover {
      background: var(--jd-color-card-hover);
    }
    .jd-notification-center__bell:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-notification-center__badge {
      position: absolute;
      inset-block-start: -2px;
      inset-inline-end: -2px;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 var(--jd-space-1);
      background: var(--jd-color-danger);
      color: #ffffff;
      font-size: 10px;
      font-weight: var(--jd-weight-semibold);
      font-variant-numeric: tabular-nums;
      border-radius: var(--jd-radius-full);
    }
    .jd-notification-center__badge[hidden] {
      display: none;
    }

    /* ── 헤더 ── */
    .jd-notification-center__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2-5) var(--jd-space-4);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border-light);
    }
    .jd-notification-center__heading {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
    }
    .jd-notification-center__header-actions {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }
    .jd-notification-center__mark-all,
    .jd-notification-center__clear {
      border: 0;
      background: none;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
      font-size: 11px;
    }
    .jd-notification-center__mark-all {
      color: var(--jd-color-primary-ink);
    }
    .jd-notification-center__mark-all:hover {
      text-decoration: underline;
    }
    .jd-notification-center__clear {
      color: var(--jd-color-muted);
    }
    .jd-notification-center__clear:hover {
      color: var(--jd-color-foreground);
    }
    .jd-notification-center__mark-all[hidden],
    .jd-notification-center__clear[hidden] {
      display: none;
    }
    .jd-notification-center__mark-all:focus-visible,
    .jd-notification-center__clear:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
      border-radius: var(--jd-radius-sm);
    }

    /* ── 목록 ── */
    .jd-notification-center__list {
      max-height: 20rem;
      overflow-y: auto;
    }
    .jd-notification-center__empty {
      padding: var(--jd-space-8) var(--jd-space-4);
      text-align: center;
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
    }

    .jd-notification-center__item {
      display: flex;
      gap: var(--jd-space-3);
      width: 100%;
      box-sizing: border-box;
      padding: var(--jd-space-3) var(--jd-space-4);
      border: 0;
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border-light);
      background: none;
      text-align: start;
      font-family: inherit;
      color: inherit;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-notification-center__list > .jd-notification-center__item:last-child {
      border-block-end: 0;
    }
    button.jd-notification-center__item {
      cursor: pointer;
    }
    button.jd-notification-center__item:hover {
      background: var(--jd-color-card-hover);
    }
    button.jd-notification-center__item:focus-visible {
      outline: 2px solid var(--jd-color-primary);
      outline-offset: -2px;
    }
    .jd-notification-center__item[data-unread] {
      background: color-mix(in srgb, var(--jd-color-primary-light) 30%, transparent);
    }

    .jd-notification-center__icon {
      flex-shrink: 0;
      display: inline-flex;
      margin-block-start: 2px;
    }
    .jd-notification-center__icon > svg {
      width: 1.125rem;
      height: 1.125rem;
    }

    .jd-notification-center__body {
      flex: 1 1 auto;
      min-width: 0;
    }
    .jd-notification-center__title {
      margin: 0;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-normal);
      color: var(--jd-color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-notification-center__item[data-unread] .jd-notification-center__title {
      font-weight: var(--jd-weight-medium);
    }
    .jd-notification-center__desc {
      margin: 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-notification-center__time {
      margin: 2px 0 0;
      font-size: 10px;
      color: var(--jd-color-muted-light);
    }

    .jd-notification-center__dot {
      flex-shrink: 0;
      width: 8px;
      height: 8px;
      margin-block-start: 6px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-primary);
    }
  }
`;
