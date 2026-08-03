import { css } from "../../core/styles.js";

/**
 * v2 값: nav text-sm, 행 `w-full flex justify-between gap-3 py-2 pr-3 rounded-md`
 * (hover bg-surface-soft, 활성 bg-primary/10 text-primary semibold, 완독 text-muted,
 * disabled opacity-50), 마커 원 20px(활성 primary/흰 · 완독 success/20 · 그외 gray),
 * 메타 11px muted tabular. gray/soft는 border·border-light 토큰으로.
 *
 * 좌측 들여쓰기는 element.ts가 depth로 인라인 padding을 쓴다 — 여기서 건드리지 않는다.
 */
export default css`
  @layer junds.components {
    jd-chapter-list {
      display: block;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
    }

    .jd-chapter-list__root,
    .jd-chapter-list__sub {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .jd-chapter-list__sub {
      margin-block-start: var(--jd-space-0-5);
    }

    .jd-chapter-list__row {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-3);
      padding-block: var(--jd-space-2);
      padding-inline-end: var(--jd-space-3);
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      color: var(--jd-color-foreground);
      background: transparent;
      border: 0;
      border-radius: var(--jd-radius-md);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-chapter-list__row:hover:not(:disabled) {
      background: var(--jd-color-border-light);
    }
    .jd-chapter-list__row:active:not(:disabled) {
      background: color-mix(in srgb, var(--jd-color-muted) 16%, transparent);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-chapter-list__row:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    /* 활성 글자는 primary를 foreground와 섞지 않는다 — 다크에서 어두운 앵커가 옅은
     틴트 위에 얹혀 대비가 무너진다. 링크 잉크 토큰이 두 모드를 이미 갈라 둔다. */
    .jd-chapter-list__row[data-active] {
      background: color-mix(in srgb, var(--jd-color-primary) 12%, transparent);
      color: var(--jd-color-primary-ink);
      font-weight: var(--jd-weight-semibold);
    }
    .jd-chapter-list__row[data-done] {
      color: var(--jd-color-muted);
    }
    .jd-chapter-list__row:disabled {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }

    .jd-chapter-list__lead {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-chapter-list__title {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .jd-chapter-list__marker {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-none);
      background: color-mix(in srgb, var(--jd-color-muted) 18%, transparent);
      color: var(--jd-color-muted);
    }
    .jd-chapter-list__marker[data-active] {
      background: var(--jd-color-primary);
      color: #fff;
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
    }
    /* 완독 마커도 톤 레시피를 경유한다 — 혼합비만 모드를 따라가면 분기가 필요 없다 */
    .jd-chapter-list__marker[data-done]:not([data-active]) {
      --jd-tone: var(--jd-color-success);
      --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
      background: color-mix(
        in srgb,
        var(--jd-tone-face) var(--jd-tone-bg-strong-mix),
        transparent
      );
      color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
    }

    .jd-chapter-list__meta {
      flex-shrink: 0;
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .jd-chapter-list__meta[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-chapter-list__row {
        transition: none;
      }
    }
  }
`;
