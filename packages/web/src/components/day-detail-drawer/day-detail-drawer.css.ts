/**
 * jd-day-detail-drawer CSS — v2 finance/DayDetailDrawer 토큰 번역.
 * 패널 슬라이드·백드롭·스크롤은 jd-drawer 시트를 쓰고, 여기서는 본문(스탯·테마·차트·
 * 순매수·왕관 종목)의 타이포·색만 정의한다. v2 폭 480px를 승계(드로어 기본 420 대체).
 * 상승/하락은 앱 재틴트용 --jd-finance-up/down 폴백 체인을 경유하고, 투자자 계열색은
 * --jd-color-hue-* 와 warning 에서 고른다 — 팔레트 밖 리터럴은 남기지 않는다.
 */
import { css } from "../../core/styles.js";

const UP = "var(--jd-finance-up, var(--jd-color-success))";
const DOWN = "var(--jd-finance-down, var(--jd-color-danger))";

export default css`
  @layer junds.components {
    jd-day-detail-drawer:not(:defined) {
      display: none;
    }
    jd-day-detail-drawer .jd-modal__panel {
      max-width: min(480px, 95vw);
    }

    .jd-day-detail__content {
      display: block;
    }
    .jd-day-detail__content[hidden] {
      display: none;
    }

    .jd-day-detail__meta {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-3) var(--jd-space-4) 0;
    }
    /* 이 패널의 면들(알약·스탯·순매수 카드·줄무늬)은 드로어 카드 위에 얹힌 **본문**이지
     라이트에서도 어두워야 할 크롬이 아니다 — surface를 쓰면서 잉크는 foreground로 두어
     라이트 모드에서 검은 판에 검은 글자가 얹혔다. 카드보다 한 단 눌린 면인
     background로 내리면 잉크는 그대로 두고 두 모드 다 성립한다(DEC-044). */
    .jd-day-detail__pill {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-bold);
      padding: var(--jd-space-1) var(--jd-space-2-5);
      border-radius: var(--jd-radius-full);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      background: var(--jd-color-background);
      color: var(--jd-color-foreground);
    }
    /* 오늘 표시는 팔레트 밖 핑크(#ec4899)였다 — 강조는 primary 계열이다 */
    .jd-day-detail__pill[data-today] {
      background: var(--jd-color-primary);
      color: #fff;
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-day-detail__meta-sub {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
    }

    /* 스탯 그리드 */
    .jd-day-detail__stats {
      display: grid;
      /* minmax(0,1fr) — 기본 1fr은 최소 폭이 내용이라 긴 숫자가 칸을 밀어내고,
       밀린 칸의 말줄임은 끝내 걸리지 않는다 */
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--jd-space-3);
      padding: var(--jd-space-4);
    }
    .jd-day-detail__stat {
      padding: var(--jd-space-2) var(--jd-space-3);
      border-radius: var(--jd-radius-xl);
      background: var(--jd-color-background);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
      min-width: 0;
    }
    .jd-day-detail__stat-label {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
    }
    .jd-day-detail__stat-value {
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      color: var(--jd-color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-day-detail__stat-sub {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      color: var(--jd-color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-day-detail__stat-value[data-dir="up"],
    .jd-day-detail__stat-sub[data-dir="up"] {
      color: ${UP};
    }
    .jd-day-detail__stat-value[data-dir="down"],
    .jd-day-detail__stat-sub[data-dir="down"] {
      color: ${DOWN};
    }

    /* 섹션 공통 */
    .jd-day-detail__section {
      padding: 0 var(--jd-space-4) var(--jd-space-4);
    }
    .jd-day-detail__section-title {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      letter-spacing: var(--jd-tracking-wide);
      color: var(--jd-color-muted);
      margin-block-end: var(--jd-space-2);
    }

    /* 테마 */
    .jd-day-detail__theme-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-1-5);
    }
    .jd-day-detail__theme {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      padding: var(--jd-space-1) var(--jd-space-2-5);
      /* 칩 라벨은 접히지 않는다 — 두 줄이 되면 칩이 알약으로 읽히지 않는다 */
      white-space: nowrap;
      /* 틴트 위 글자는 foreground 쪽으로 섞어 대비 확보 */
      border-radius: var(--jd-radius-full);
      color: color-mix(in srgb, var(--jd-color-accent) 65%, var(--jd-color-foreground));
      background: color-mix(in srgb, var(--jd-color-accent) 12%, transparent);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-accent) 28%, transparent);
    }

    /* 차트 공통 — viewBox가 비율을 쥐고 있으므로 높이는 폭을 따라간다. height 속성을
     고정값으로 두면 좁은 화면에서 캔들이 옆으로 눌린다. */
    .jd-day-detail__chart {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
    }
    .jd-day-detail__candle--up {
      stroke: ${UP};
      fill: ${UP};
    }
    .jd-day-detail__candle--down {
      stroke: ${DOWN};
      fill: ${DOWN};
    }
    .jd-day-detail__candle {
      stroke-width: 1;
    }
    .jd-day-detail__flow-axis {
      stroke: color-mix(in srgb, var(--jd-color-foreground) 25%, transparent);
      stroke-width: 0.5;
    }
    .jd-day-detail__flow-bar {
      fill: var(--jd-color-muted);
    }
    .jd-day-detail__flow-bar[data-neg] {
      fill-opacity: 0.55;
    }
    .jd-day-detail__flow-bar--foreign {
      fill: ${UP};
    }
    .jd-day-detail__flow-bar--institution {
      fill: var(--jd-color-hue-purple);
    }
    .jd-day-detail__flow-bar--individual {
      fill: var(--jd-color-warning);
    }

    /* 순매수 카드 */
    .jd-day-detail__nets {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--jd-space-2);
    }
    .jd-day-detail__net {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--jd-space-0-5);
      padding: var(--jd-space-2);
      border-radius: var(--jd-radius-xl);
      background: var(--jd-color-background);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
      min-width: 0;
    }
    .jd-day-detail__net-label {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
      white-space: nowrap;
    }
    .jd-day-detail__net-dot {
      flex-shrink: 0;
      width: var(--jd-space-2);
      height: var(--jd-space-2);
      border-radius: var(--jd-radius-full);
    }
    .jd-day-detail__net-dot--foreign {
      background: ${UP};
    }
    .jd-day-detail__net-dot--institution {
      background: var(--jd-color-hue-purple);
    }
    .jd-day-detail__net-dot--individual {
      background: var(--jd-color-warning);
    }
    /* "+1,840억"은 숫자와 단위가 한 덩어리다 — 접히면 단위가 다음 줄에 홀로 선다 */
    .jd-day-detail__net-value {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .jd-day-detail__net-value[data-dir="up"] {
      color: ${UP};
    }
    .jd-day-detail__net-value[data-dir="down"] {
      color: ${DOWN};
    }

    /* 왕관 종목 */
    .jd-day-detail__leaders {
      list-style: none;
      margin: 0;
      padding: 0;
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-day-detail__leader {
      display: grid;
      /* 종목명 칸은 minmax(0,1fr) — 1fr의 최소 폭은 내용이라 긴 이름이 오른쪽
       수치 칸을 밀어내고 말줄임이 끝내 걸리지 않는다 */
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-day-detail__leader:last-child {
      border-block-end: 0;
    }
    /* 줄무늬는 어떤 면 위에 얹혀도 같게 읽혀야 한다 — 불투명 색이 아니라 잉크 틴트 */
    .jd-day-detail__leader[data-alt] {
      background: color-mix(in srgb, var(--jd-color-muted) 7%, transparent);
    }
    .jd-day-detail__leader-crown {
      color: var(--jd-color-warning);
      font-size: var(--jd-text-md);
    }
    .jd-day-detail__leader-name {
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-bold);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-day-detail__leader-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: var(--jd-leading-tight);
    }
    .jd-day-detail__leader-close,
    .jd-day-detail__leader-pct {
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .jd-day-detail__leader-close {
      font-size: var(--jd-text-xs);
    }
    .jd-day-detail__leader-pct {
      font-size: var(--jd-text-2xs);
    }
    .jd-day-detail__leader-pct[data-dir="up"] {
      color: ${UP};
    }
    .jd-day-detail__leader-pct[data-dir="down"] {
      color: ${DOWN};
    }
  }
`;
