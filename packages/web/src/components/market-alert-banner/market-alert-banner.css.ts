import { css } from "../../core/styles.js";

/**
 * jd-market-alert-banner CSS — v2 finance/MarketAlertBanner.
 * warning 계열이 배너 아이덴티티. 등락색은 --jd-finance-* 훅을 경유한다 —
 * 한국 관례(적상승·청하락)는 앱이 그 변수를 시작 시 1회 덮어써서 얻는 전환이라
 * (DECISIONS "색 기본값은 웹을 따르고, 관례 전환은 앱에 남겼다"), danger/info를 여기
 * 박으면 앱의 override가 이 배너만 비껴가 한 화면에서 등락색이 갈라진다.
 * 지역 별칭은 :where()로 특이도 0에 두어 소비자가 태그 셀렉터로도 재정의할 수 있다.
 */
export default css`
  @layer junds.components {
    :where(jd-market-alert-banner) {
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      --jd-fin-warning: var(--jd-color-warning);
      /* 배경 틴트도 같은 훅에서 뽑는다 — 글자만 따라 바뀌면 알약이 두 색으로 갈린다 */
      --jd-fin-up-soft: color-mix(in srgb, var(--jd-fin-up) 14%, transparent);
      --jd-fin-down-soft: color-mix(in srgb, var(--jd-fin-down) 14%, transparent);
    }
    jd-market-alert-banner {
      display: block;
      font-family: var(--jd-font-sans);
    }
    jd-market-alert-banner:not(:defined) {
      display: block;
    }

    .jd-mab {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2-5);
      padding: var(--jd-space-2-5) var(--jd-space-3-5);
      border-radius: var(--jd-radius-xl);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
      color: inherit;
      text-decoration: none;
      overflow: hidden;
      /* 시간·감속도 토큰으로 말한다 — 리터럴 0.2s/ease는 밀도·모션 설정을 따라가지 못하고
       이 배너만 다른 속도로 움직인다. 대상은 속성별로 지목한다(DEC-039). */
      transition: border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
      box-shadow: var(--jd-shadow-xs);
    }
    .jd-mab:hover {
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
      box-shadow: var(--jd-shadow-md);
    }
    /* 눌린 면은 빛을 잃는다 — 배너 전체가 링크라 누름이 면 단위로 보여야 한다 */
    .jd-mab:active {
      scale: 0.99;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-mab:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-mab__icon {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-fin-warning);
      color: #fff;
    }

    .jd-mab__body {
      flex: 1;
      min-width: 0;
    }
    .jd-mab__meta {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      flex-wrap: wrap;
    }
    .jd-mab__time {
      font-size: 11.5px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: var(--jd-radius-sm);
      font-variant-numeric: tabular-nums;
      background: color-mix(in srgb, var(--jd-fin-warning) 12%, transparent);
      color: color-mix(in srgb, var(--jd-fin-warning) 55%, var(--jd-color-foreground));
    }
    .jd-mab__label {
      font-size: 11.5px;
      font-weight: 800;
      color: color-mix(in srgb, var(--jd-fin-warning) 55%, var(--jd-color-foreground));
    }

    .jd-mab__headline {
      margin: 2px 0 0;
      font-size: 12.5px;
      font-weight: 700;
      line-height: 1.35;
      color: var(--jd-color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-mab__symbol {
      font-weight: 800;
    }
    .jd-mab__dot {
      margin: 0 4px;
      color: var(--jd-color-muted);
    }

    .jd-mab__pct {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 12.5px;
      font-weight: 800;
      padding: var(--jd-space-1) var(--jd-space-2);
      border-radius: var(--jd-radius-md);
      font-variant-numeric: tabular-nums;
    }
    /* 14% 틴트 위 원색 글자는 12.5px 굵기에서 AA에 못 미친다 — hue는 유지하고 글자만
     foreground 쪽으로 섞어 대비를 올린다(jd-theme-card hot pill·jd-fx-board 선례). */
    .jd-mab__pct[data-dir="up"] {
      background: var(--jd-fin-up-soft);
      color: color-mix(in srgb, var(--jd-fin-up) 65%, var(--jd-color-foreground));
    }
    .jd-mab__pct[data-dir="down"] {
      background: var(--jd-fin-down-soft);
      color: color-mix(in srgb, var(--jd-fin-down) 65%, var(--jd-color-foreground));
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-mab {
        transition: none;
      }
    }
  }
`;
