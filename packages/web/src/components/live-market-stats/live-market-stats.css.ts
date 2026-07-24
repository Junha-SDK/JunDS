import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): section grid-cols-1 lg:[1fr_2fr_1fr] gap-3 mb-4, 각 패널 bm-card
 * overflow-hidden(헤더 px-4 py-2.5 + 하단 보더, 본문 px-4 py-3). 분위기: 점수 28px
 * extrabold 착색 + /100, 게이지 h2(down→accent→up 그라디언트), 스케일 10px, 가중 10.5px
 * muted. 폭: 카운트 14px extrabold(up/down/flat) + 가중 13px 착색 ml-auto, breadth h2 3분할.
 * 거래대금: 20px extrabold + 코스피/코스닥 10.5px muted. --bm-* → jd 폴백.
 */
export default css`
@layer junds.components {
  jd-live-market-stats {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-accent: var(--bm-accent, var(--jd-color-primary));
    --jd-fin-accent-strong: var(--bm-accent-strong, var(--jd-color-primary));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));

    display: grid; grid-template-columns: 1fr; gap: var(--jd-space-3);
    margin-block-end: var(--jd-space-4);
    box-sizing: border-box; font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-live-market-stats * { box-sizing: border-box; }
  @media (min-width: 1024px) {
    jd-live-market-stats { grid-template-columns: 1fr 2fr 1fr; }
  }
  jd-live-market-stats[data-sentiment="up"] { --jd-lms-sent: var(--jd-fin-up); }
  jd-live-market-stats[data-sentiment="neutral"] { --jd-lms-sent: var(--jd-fin-muted); }
  jd-live-market-stats[data-sentiment="down"] { --jd-lms-sent: var(--jd-fin-down); }
  jd-live-market-stats[data-wavg="up"] { --jd-lms-wavg: var(--jd-fin-up); }
  jd-live-market-stats[data-wavg="down"] { --jd-lms-wavg: var(--jd-fin-down); }

  jd-live-market-stats .jd-live-market-stats__panel {
    overflow: hidden; background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl);
  }
  jd-live-market-stats .jd-live-market-stats__head {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
    padding: var(--jd-space-2-5) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-live-market-stats .jd-live-market-stats__title {
    font-size: 13px; font-weight: 800; color: var(--jd-fin-text);
  }
  jd-live-market-stats .jd-live-market-stats__meta {
    font-size: 10.5px; font-weight: 700; color: var(--jd-fin-muted);
  }
  jd-live-market-stats .jd-live-market-stats__pill {
    font-size: 10.5px; font-weight: 800; padding: 2px var(--jd-space-2);
    border-radius: var(--jd-radius-full);
    /* 틴트 위 라벨: 원색 그대로면 pale 틴트에서 대비 부족 → foreground로 65% 혼합(§ 대비) */
    color: color-mix(in srgb, var(--jd-lms-sent, var(--jd-fin-muted)) 65%, var(--jd-fin-text));
    background: color-mix(in srgb, var(--jd-lms-sent, var(--jd-fin-muted)) 12%, transparent);
  }
  jd-live-market-stats .jd-live-market-stats__nxt {
    font-size: 10.5px; font-weight: 700; text-decoration: none;
    color: var(--jd-fin-accent-strong);
  }
  jd-live-market-stats .jd-live-market-stats__nxt:hover { text-decoration: underline; }
  jd-live-market-stats .jd-live-market-stats__body {
    padding: var(--jd-space-3) var(--jd-space-4);
  }

  /* 분위기 */
  jd-live-market-stats .jd-live-market-stats__score-row {
    display: flex; align-items: baseline; justify-content: space-between;
  }
  jd-live-market-stats .jd-live-market-stats__score {
    font-size: 28px; font-weight: 800; font-variant-numeric: tabular-nums;
    color: var(--jd-lms-sent, var(--jd-fin-muted));
  }
  jd-live-market-stats .jd-live-market-stats__out-of {
    font-size: 10.5px; font-weight: 700; color: var(--jd-fin-muted);
  }
  jd-live-market-stats .jd-live-market-stats__gauge {
    margin-block-start: var(--jd-space-2); height: 8px; overflow: hidden;
    border-radius: var(--jd-radius-full); background: var(--jd-fin-soft);
  }
  jd-live-market-stats .jd-live-market-stats__gauge-fill {
    height: 100%; border-radius: var(--jd-radius-full);
    background: linear-gradient(90deg, var(--jd-fin-down) 0%, var(--jd-fin-accent) 50%, var(--jd-fin-up) 100%);
  }
  jd-live-market-stats .jd-live-market-stats__scale {
    display: flex; align-items: center; justify-content: space-between;
    margin-block-start: var(--jd-space-1-5); font-size: 10px; font-weight: 700;
    color: var(--jd-fin-muted);
  }
  jd-live-market-stats .jd-live-market-stats__wavg-a {
    margin-block-start: var(--jd-space-1-5); font-size: 10.5px; color: var(--jd-fin-muted);
  }

  /* 폭 */
  jd-live-market-stats .jd-live-market-stats__counts {
    display: flex; align-items: center; gap: var(--jd-space-3);
    font-size: 14px; font-weight: 800; margin-block-end: var(--jd-space-2);
  }
  jd-live-market-stats .jd-live-market-stats__count-up { color: var(--jd-fin-up); }
  jd-live-market-stats .jd-live-market-stats__count-down { color: var(--jd-fin-down); }
  jd-live-market-stats .jd-live-market-stats__count-flat { color: var(--jd-fin-muted); }
  jd-live-market-stats .jd-live-market-stats__wavg-b {
    margin-inline-start: auto; font-size: 13px; font-variant-numeric: tabular-nums;
    color: var(--jd-lms-wavg, var(--jd-fin-muted));
  }
  jd-live-market-stats .jd-live-market-stats__breadth {
    display: flex; height: 8px; overflow: hidden;
    border-radius: var(--jd-radius-full); background: var(--jd-fin-soft);
  }
  jd-live-market-stats .jd-live-market-stats__breadth-up { background: var(--jd-fin-up); }
  jd-live-market-stats .jd-live-market-stats__breadth-flat { background: var(--jd-fin-muted); }
  jd-live-market-stats .jd-live-market-stats__breadth-down { background: var(--jd-fin-down); }

  /* 거래대금 */
  jd-live-market-stats .jd-live-market-stats__turnover {
    font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums;
    color: var(--jd-fin-text);
  }
  jd-live-market-stats .jd-live-market-stats__split {
    display: flex; align-items: center; justify-content: space-between;
    margin-block-start: var(--jd-space-1-5); font-size: 10.5px; color: var(--jd-fin-muted);
  }
}`;
