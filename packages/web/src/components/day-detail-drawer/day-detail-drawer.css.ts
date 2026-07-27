/**
 * jd-day-detail-drawer CSS — v2 finance/DayDetailDrawer 토큰 번역.
 * 패널 슬라이드·백드롭·스크롤은 jd-drawer 시트를 쓰고, 여기서는 본문(스탯·테마·차트·
 * 순매수·왕관 종목)의 타이포·색만 정의한다. v2 폭 480px를 승계(드로어 기본 420 대체).
 * 상승/하락·투자자 색은 앱 재틴트용 --jd-finance-up/down 폴백 체인 + 리터럴 승계.
 */
import { css } from "../../core/styles.js";

const UP = "var(--jd-finance-up, var(--jd-color-success))";
const DOWN = "var(--jd-finance-down, var(--jd-color-danger))";

export default css`
@layer junds.components {
  jd-day-detail-drawer:not(:defined) { display: none; }
  jd-day-detail-drawer .jd-modal__panel { max-width: min(480px, 95vw); }

  .jd-day-detail__content { display: block; }
  .jd-day-detail__content[hidden] { display: none; }

  .jd-day-detail__meta {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-3) var(--jd-space-4) 0;
  }
  .jd-day-detail__pill {
    font-size: 13px; font-weight: var(--jd-weight-bold); padding: 4px 10px;
    border-radius: var(--jd-radius-full); font-variant-numeric: tabular-nums;
    background: var(--jd-color-surface); color: var(--jd-color-foreground);
  }
  .jd-day-detail__pill[data-today] { background: #ec4899; color: #fff; }
  .jd-day-detail__meta-sub { font-size: 11px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted); }

  /* 스탯 그리드 */
  .jd-day-detail__stats {
    display: grid; grid-template-columns: 1fr 1fr; gap: var(--jd-space-3);
    padding: var(--jd-space-4);
  }
  .jd-day-detail__stat {
    padding: var(--jd-space-2) var(--jd-space-3); border-radius: var(--jd-radius-xl);
    background: var(--jd-color-surface); border: var(--jd-border-thin) solid var(--jd-color-border);
    min-width: 0;
  }
  .jd-day-detail__stat-label { font-size: 10.5px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted); }
  .jd-day-detail__stat-value {
    font-size: 14px; font-weight: var(--jd-weight-bold); font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-day-detail__stat-sub {
    font-size: 10.5px; font-weight: var(--jd-weight-bold); font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-day-detail__stat-value[data-dir="up"], .jd-day-detail__stat-sub[data-dir="up"] { color: ${UP}; }
  .jd-day-detail__stat-value[data-dir="down"], .jd-day-detail__stat-sub[data-dir="down"] { color: ${DOWN}; }

  /* 섹션 공통 */
  .jd-day-detail__section { padding: 0 var(--jd-space-4) var(--jd-space-4); }
  .jd-day-detail__section-title {
    font-size: 11px; font-weight: var(--jd-weight-bold); letter-spacing: 0.05em;
    color: var(--jd-color-muted); margin-block-end: var(--jd-space-2);
  }

  /* 테마 */
  .jd-day-detail__theme-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .jd-day-detail__theme {
    font-size: 11px; font-weight: var(--jd-weight-bold); padding: 4px 10px;
    /* 틴트 위 글자는 foreground 쪽으로 섞어 대비 확보 */
    border-radius: var(--jd-radius-full); color: color-mix(in srgb, var(--jd-color-accent) 65%, var(--jd-color-foreground));
    background: color-mix(in srgb, var(--jd-color-accent) 12%, transparent);
    border: var(--jd-border-thin) solid color-mix(in srgb, var(--jd-color-accent) 28%, transparent);
  }

  /* 차트 공통 */
  .jd-day-detail__chart { display: block; }
  .jd-day-detail__candle--up { stroke: ${UP}; fill: ${UP}; }
  .jd-day-detail__candle--down { stroke: ${DOWN}; fill: ${DOWN}; }
  .jd-day-detail__candle { stroke-width: 1; }
  .jd-day-detail__flow-axis { stroke: color-mix(in srgb, var(--jd-color-foreground) 25%, transparent); stroke-width: .5; }
  .jd-day-detail__flow-bar { fill: var(--jd-color-muted); }
  .jd-day-detail__flow-bar[data-neg] { fill-opacity: .55; }
  .jd-day-detail__flow-bar--foreign { fill: ${UP}; }
  .jd-day-detail__flow-bar--institution { fill: var(--jd-color-hue-purple); }
  .jd-day-detail__flow-bar--individual { fill: var(--jd-color-warning); }

  /* 순매수 카드 */
  .jd-day-detail__nets { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--jd-space-2); }
  .jd-day-detail__net {
    display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
    padding: var(--jd-space-2); border-radius: var(--jd-radius-xl);
    background: var(--jd-color-surface); border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-day-detail__net-label { display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted); }
  .jd-day-detail__net-dot { width: 8px; height: 8px; border-radius: var(--jd-radius-full); }
  .jd-day-detail__net-dot--foreign { background: ${UP}; }
  .jd-day-detail__net-dot--institution { background: var(--jd-color-hue-purple); }
  .jd-day-detail__net-dot--individual { background: var(--jd-color-warning); }
  .jd-day-detail__net-value { font-size: 13.5px; font-weight: var(--jd-weight-bold); font-variant-numeric: tabular-nums; }
  .jd-day-detail__net-value[data-dir="up"] { color: ${UP}; }
  .jd-day-detail__net-value[data-dir="down"] { color: ${DOWN}; }

  /* 왕관 종목 */
  .jd-day-detail__leaders {
    list-style: none; margin: 0; padding: 0; border-radius: var(--jd-radius-xl); overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-day-detail__leader {
    display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-day-detail__leader:last-child { border-block-end: 0; }
  .jd-day-detail__leader[data-alt] { background: var(--jd-color-surface); }
  .jd-day-detail__leader-crown { color: var(--jd-color-warning-ink); font-size: 14px; }
  .jd-day-detail__leader-name {
    font-size: 12.5px; font-weight: var(--jd-weight-bold);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-day-detail__leader-right { display: flex; flex-direction: column; align-items: flex-end; line-height: var(--jd-leading-tight); }
  .jd-day-detail__leader-close { font-size: 12px; font-weight: var(--jd-weight-bold); font-variant-numeric: tabular-nums; }
  .jd-day-detail__leader-pct { font-size: 10.5px; font-weight: var(--jd-weight-bold); font-variant-numeric: tabular-nums; }
  .jd-day-detail__leader-pct[data-dir="up"] { color: ${UP}; }
  .jd-day-detail__leader-pct[data-dir="down"] { color: ${DOWN}; }
}`;
