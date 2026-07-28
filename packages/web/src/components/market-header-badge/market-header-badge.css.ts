import { css } from "../../core/styles.js";

/**
 * jd-market-header-badge CSS — v2 finance/MarketHeader.
 * accent(=primary) 틴트가 정상 배지 바탕. 등락 태그는 --jd-finance-* 훅을 경유한다 —
 * 한국 관례(적상승·청하락)는 앱이 그 변수를 시작 시 1회 덮어써서 얻는 전환이라
 * (DECISIONS "색 기본값은 웹을 따르고, 관례 전환은 앱에 남겼다"), danger/info를 여기
 * 박으면 앱의 override가 이 배지만 비껴가 헤더와 본문의 등락색이 갈라진다.
 * 지역 별칭은 :where()로 특이도 0 → 소비자가 태그 셀렉터로도 재정의한다.
 */
export default css`
  @layer junds.components {
    :where(jd-market-header-badge) {
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      --jd-fin-accent: var(--jd-color-primary);
      --jd-fin-accent-strong: var(--jd-color-primary);
    }
    jd-market-header-badge {
      display: inline-block;
      font-family: var(--jd-font-sans);
    }
    jd-market-header-badge:not(:defined) {
      display: inline-block;
    }

    /* 헤더 배지는 한 줄짜리 알약이다 — 좁은 헤더에서 "코스피 2,480 +12(+0.5%)"가 접히면
     지수명과 숫자가 따로 놀아 읽히지 않는다. 줄바꿈을 막고 폭은 내용이 정한다. */
    .jd-mhb {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-1-5) var(--jd-space-3);
      border-radius: var(--jd-radius-xl);
      font-size: 12.5px;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      background: var(--jd-color-card);
    }
    .jd-mhb[data-state="ready"] {
      background: color-mix(in srgb, var(--jd-fin-accent) 10%, transparent);
    }
    .jd-mhb[data-state="loading"],
    .jd-mhb[data-state="empty"] {
      background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    }

    .jd-mhb__msg {
      font-weight: 800;
      color: var(--jd-color-muted);
    }
    .jd-mhb__ready {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
    }

    .jd-mhb__name {
      font-weight: 800;
      color: var(--jd-fin-accent-strong);
    }
    .jd-mhb__value {
      font-weight: 800;
      color: var(--jd-color-foreground);
    }

    .jd-mhb__tag {
      padding: 1px 6px;
      border-radius: var(--jd-radius-sm);
      font-size: 11px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    /* 12% 틴트 위 원색 글자는 11px에서 AA에 못 미친다 — hue는 유지하고 글자만 foreground
     쪽으로 섞어 대비를 올린다(jd-fx-board·jd-theme-card 선례). */
    .jd-mhb__tag[data-dir="up"] {
      background: color-mix(in srgb, var(--jd-fin-up) 12%, transparent);
      color: color-mix(in srgb, var(--jd-fin-up) 65%, var(--jd-color-foreground));
    }
    .jd-mhb__tag[data-dir="down"] {
      background: color-mix(in srgb, var(--jd-fin-down) 12%, transparent);
      color: color-mix(in srgb, var(--jd-fin-down) 65%, var(--jd-color-foreground));
    }

    .jd-mhb__status {
      font-size: 10px;
      font-weight: 700;
      color: var(--jd-color-muted);
    }
    .jd-mhb__status[hidden] {
      display: none;
    }
  }
`;
