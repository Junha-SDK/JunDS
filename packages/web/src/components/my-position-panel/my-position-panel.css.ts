import { css } from "../../core/styles.js";

/**
 * jd-my-position-panel CSS — v2 MyPositionPanel(포지션 카드 + 빈 상태 유도).
 * finance 색은 --bm-* → jd 폴백. 손익 방향(수익=상승적, 손실=하락청)은 data-dir로 칠한다.
 * 값 폰트는 tabular-nums(bm-num). 그리드는 2열, 640px↑ 4열(v2 lg:grid-cols-4).
 */
export default css`
@layer junds.components {
  jd-my-position-panel {
    --jd-fin-up: var(--bm-up, var(--jd-color-danger));
    --jd-fin-down: var(--bm-down, var(--jd-color-info));
    --jd-fin-up-soft: var(--bm-up-soft, color-mix(in srgb, var(--jd-fin-up) 14%, transparent));
    --jd-fin-down-soft: var(--bm-down-soft, color-mix(in srgb, var(--jd-fin-down) 14%, transparent));
    --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));

    display: block; box-sizing: border-box;
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-my-position-panel * { box-sizing: border-box; }
  .jd-my-position-panel__icon { flex-shrink: 0; }

  /* ── 포지션 카드 ── */
  .jd-my-position-panel__holding {
    display: block; overflow: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-xl);
  }
  .jd-my-position-panel__header {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-my-position-panel__titlewrap {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    color: var(--jd-fin-accent);
  }
  .jd-my-position-panel__heading {
    margin: 0; font-size: 14px; font-weight: 800; color: var(--jd-fin-text);
  }
  .jd-my-position-panel__tag {
    display: inline-flex; align-items: center;
    padding: 2px var(--jd-space-2); border-radius: var(--jd-radius-full);
    font-size: 11px; font-weight: 800; font-variant-numeric: tabular-nums;
    background: var(--jd-fin-soft); color: var(--jd-fin-muted);
  }
  .jd-my-position-panel__tag[data-dir="up"] { background: var(--jd-fin-up-soft); color: var(--jd-fin-up); }
  .jd-my-position-panel__tag[data-dir="down"] { background: var(--jd-fin-down-soft); color: var(--jd-fin-down); }

  .jd-my-position-panel__grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--jd-space-3);
    padding: var(--jd-space-4);
  }
  @media (min-width: 640px) {
    .jd-my-position-panel__grid { grid-template-columns: repeat(4, 1fr); }
  }
  .jd-my-position-panel__cell {
    padding: var(--jd-space-2-5) var(--jd-space-3);
    border-radius: var(--jd-radius-xl); background: var(--jd-fin-soft);
  }
  .jd-my-position-panel__cell-label {
    font-size: 10.5px; font-weight: 700; color: var(--jd-fin-muted);
  }
  .jd-my-position-panel__cell-value {
    margin-block-start: 2px; font-size: 15px; font-weight: 800;
    font-variant-numeric: tabular-nums; color: var(--jd-fin-text);
  }
  .jd-my-position-panel__cell-value[data-tone="up"] { color: var(--jd-fin-up); }
  .jd-my-position-panel__cell-value[data-tone="down"] { color: var(--jd-fin-down); }
  .jd-my-position-panel__cell-unit {
    margin-inline-start: 2px; font-size: 10.5px; font-weight: 600; opacity: 0.7;
  }

  .jd-my-position-panel__footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--jd-space-3) var(--jd-space-4);
    background: var(--jd-fin-soft);
    border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-my-position-panel__foot-right { text-align: end; }
  .jd-my-position-panel__foot-label {
    font-size: 10.5px; font-weight: 700; color: var(--jd-fin-muted);
  }
  .jd-my-position-panel__profit-value {
    font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums;
    color: var(--jd-fin-text);
  }
  .jd-my-position-panel__profit-value[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-my-position-panel__profit-value[data-dir="down"] { color: var(--jd-fin-down); }
  .jd-my-position-panel__cost-value {
    font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums;
    color: var(--jd-fin-text);
  }

  /* ── 빈 상태 ── */
  .jd-my-position-panel__empty {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-2-5) var(--jd-space-3-5);
    border-radius: var(--jd-radius-xl);
    background: var(--jd-fin-soft);
    border: var(--jd-border-thin) dashed var(--jd-fin-border);
    color: var(--jd-fin-muted);
  }
  .jd-my-position-panel__empty-text {
    flex: 1; min-width: 0; display: flex; align-items: baseline; gap: var(--jd-space-2); flex-wrap: wrap;
  }
  .jd-my-position-panel__empty-title { font-size: 12.5px; font-weight: 700; color: var(--jd-fin-text); }
  .jd-my-position-panel__empty-sub { font-size: 11.5px; color: var(--jd-fin-muted); }
  .jd-my-position-panel__register {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: var(--jd-space-1);
    height: 28px; padding: 0 var(--jd-space-2-5);
    border: none; border-radius: var(--jd-radius-lg); cursor: pointer;
    font-family: inherit; font-size: 12px; font-weight: 800;
    background: var(--jd-fin-accent); color: var(--jd-fin-card);
  }
  .jd-my-position-panel__register:hover { filter: brightness(1.06); }
  .jd-my-position-panel__all {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 2px;
    font-size: 12px; font-weight: 700; text-decoration: none;
    color: var(--jd-fin-accent);
  }
  .jd-my-position-panel__all:hover { text-decoration: underline; }
}`;
