/**
 * jd-fzone-card CSS — v2 finance/FZoneCard 토큰 번역.
 * v2 값: bm-card 컨테이너, kind별 파스텔 헤더(리터럴 승계 — 대응 토큰 없음), 상태 pill은
 * 상승색+흰 글자, 하이라이트 라인은 상승색 12% 배경+테두리. 상승/하락은 앱 재틴트용
 * --jd-finance-up/down 폴백 체인.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-fzone-card {
      display: block;
    }
    jd-fzone-card:not(:defined) {
      display: block;
    }

    .jd-fzone-card__link {
      display: block;
      overflow: hidden;
      text-decoration: none;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      transition: box-shadow var(--jd-duration-fast) var(--jd-easing-default);
    }
    .jd-fzone-card__link[hidden] {
      display: none;
    }
    .jd-fzone-card__link:hover {
      box-shadow: var(--jd-shadow-md);
    }
    .jd-fzone-card__link:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-fzone-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-3);
      /* DEC-044 톤 레시피 — kind 4종은 앵커만 바꾼다 */
      --jd-tone: var(--jd-color-hue-teal); /* kind=F 기본 */
      --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
      background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-mix), transparent);
    }
    .jd-fzone-card__header[data-kind="SF"] {
      --jd-tone: var(--jd-color-hue-orange);
    }
    .jd-fzone-card__header[data-kind="G"] {
      --jd-tone: var(--jd-color-hue-amber);
    }
    .jd-fzone-card__header[data-kind="J"] {
      --jd-tone: var(--jd-color-hue-rose);
    }
    .jd-fzone-card__name {
      font-size: 14px;
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-foreground);
    }
    .jd-fzone-card__status {
      font-size: 12px;
      font-weight: var(--jd-weight-bold);
      padding: 2px 10px;
      border-radius: var(--jd-radius-full);
      /* 원색 배경 + 흰 글자는 대비 미달(성공색 3.6:1) → 배경을 foreground 쪽으로 80% 섞는다 */
      background: color-mix(
        in srgb,
        var(--jd-finance-up, var(--jd-color-success)) 80%,
        var(--jd-color-foreground)
      );
      color: #fff;
    }

    .jd-fzone-card__body {
      display: grid;
      grid-template-columns: 1fr 18px;
      gap: var(--jd-space-2);
      padding: var(--jd-space-3) var(--jd-space-3) var(--jd-space-2);
    }
    .jd-fzone-card__info {
      min-width: 0;
    }

    .jd-fzone-card__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      margin-block-start: 2px;
    }
    .jd-fzone-card__row:first-child {
      margin-block-start: 0;
    }
    .jd-fzone-card__row-label {
      font-size: 12px;
      color: var(--jd-color-muted);
    }
    .jd-fzone-card__meta {
      font-size: 12px;
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }

    .jd-fzone-card__price {
      font-size: 14px;
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
    }
    .jd-fzone-card__pct {
      font-size: 12px;
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
    }
    .jd-fzone-card__price[data-dir="up"],
    .jd-fzone-card__pct[data-dir="up"] {
      color: var(--jd-finance-up, var(--jd-color-success));
    }
    .jd-fzone-card__price[data-dir="down"],
    .jd-fzone-card__pct[data-dir="down"] {
      color: var(--jd-finance-down, var(--jd-color-danger));
    }

    .jd-fzone-card__levels {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-block-start: var(--jd-space-2);
    }
    .jd-fzone-card__level {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12.5px;
    }
    .jd-fzone-card__level-label {
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-foreground);
      padding: 1px 4px;
      border-radius: var(--jd-radius-sm);
    }
    .jd-fzone-card__level[data-muted] .jd-fzone-card__level-label {
      color: var(--jd-color-muted);
    }
    .jd-fzone-card__level[data-highlight] .jd-fzone-card__level-label {
      color: color-mix(
        in srgb,
        var(--jd-finance-up, var(--jd-color-success)) 65%,
        var(--jd-color-foreground)
      );
      font-size: 11px;
      padding: 1px 8px;
      background: color-mix(
        in srgb,
        var(--jd-finance-up, var(--jd-color-success)) 12%,
        transparent
      );
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-finance-up, var(--jd-color-success)) 55%, transparent);
    }
    .jd-fzone-card__level-value {
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
      font-variant-numeric: tabular-nums;
    }
    .jd-fzone-card__level[data-muted] .jd-fzone-card__level-value {
      color: var(--jd-color-muted);
    }

    .jd-fzone-card__marker {
      display: block;
      align-self: start;
    }
    .jd-fzone-card__marker-guide {
      stroke: color-mix(in srgb, var(--jd-color-foreground) 15%, transparent);
    }
    .jd-fzone-card__marker-seg {
      fill: transparent;
    }
    .jd-fzone-card__marker-seg[data-on][data-dir="up"] {
      fill: var(--jd-finance-up, var(--jd-color-success));
    }
    .jd-fzone-card__marker-seg[data-on][data-dir="down"] {
      fill: var(--jd-finance-down, var(--jd-color-danger));
    }
  }
`;
