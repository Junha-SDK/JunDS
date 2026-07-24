import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): bm-card-lg(둥근 카드·테두리), 섹션 헤드/타이틀, bm-chip(pill),
 * bm-table, bm-num(tabular). 상승/하락은 --jd-fin-up/down(한국 관례: 상승=적, 하락=청)로
 * 노출 — 소비자가 CSS로 뒤집을 수 있다. 활성 상태는 accent 계열.
 */
export default css`
@layer junds.components {
  jd-consensus-screener {
    display: block; overflow: hidden;
    border: 1px solid var(--jd-fin-border, var(--jd-color-border));
    border-radius: var(--jd-radius-2xl);
    background: var(--jd-fin-surface, var(--jd-color-card));
    font-family: var(--jd-font-sans);
    --_accent: var(--jd-fin-accent, #14b8a6);
    --_accent-strong: var(--jd-fin-accent-strong, #0d9488);
    --_accent-soft: var(--jd-fin-accent-soft, color-mix(in srgb, #14b8a6 12%, transparent));
    --_soft: var(--jd-fin-soft-100, #f1f5f9);
    --_text: var(--jd-fin-text, var(--jd-color-foreground));
    --_muted: var(--jd-fin-muted, var(--jd-color-muted));
    --_border: var(--jd-fin-border, var(--jd-color-border));
    --_up: var(--jd-fin-up, #e11d48);
    --_down: var(--jd-fin-down, #2563eb);
  }

  .jd-consensus-screener__head {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-end: 1px solid var(--_border);
  }
  .jd-consensus-screener__title {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    font-size: var(--jd-text-sm); font-weight: 800; color: var(--_text);
  }
  .jd-consensus-screener__title-icon { display: inline-flex; color: var(--_accent-strong); }
  .jd-consensus-screener__sort {
    height: 1.75rem; padding: 0 var(--jd-space-2);
    font-size: 12px; font-weight: var(--jd-weight-bold); font-family: inherit;
    border-radius: var(--jd-radius-md); outline: none;
    background: var(--_soft); border: 1px solid var(--_border); color: var(--_text);
  }

  .jd-consensus-screener__bulls {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-end: 1px solid var(--_border);
  }
  .jd-consensus-screener__bulls-label {
    font-size: 11px; font-weight: 800; letter-spacing: var(--jd-tracking-wide);
    text-transform: uppercase; color: var(--_muted);
  }
  .jd-consensus-screener__bull-btns { display: flex; align-items: center; gap: 6px; }
  .jd-consensus-screener__bull-btn {
    height: 1.75rem; min-width: 34px; padding: 0 var(--jd-space-2);
    font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
    border-radius: var(--jd-radius-md);
    background: var(--_soft); color: var(--_text); border: 1px solid var(--_border);
  }
  .jd-consensus-screener__bull-btn[data-active] {
    /* 원색 배경 + 흰 글자는 대비 부족(accent-strong·#0d9488 vs #fff ≈ 3.7:1) —
       foreground를 20% 섞어 darken해 AA(≈5.3:1) 확보. */
    background: color-mix(in srgb, var(--_accent-strong) 80%, var(--jd-color-foreground));
    color: #fff;
    border-color: color-mix(in srgb, var(--_accent-strong) 80%, var(--jd-color-foreground));
  }
  .jd-consensus-screener__count {
    margin-inline-start: auto; font-size: 11.5px; color: var(--_muted);
    font-variant-numeric: tabular-nums;
  }

  .jd-consensus-screener__chips {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2-5) var(--jd-space-4);
    overflow-x: auto; border-block-end: 1px solid var(--_border);
  }
  .jd-consensus-screener__chip {
    display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
    padding: 4px var(--jd-space-2-5); font-size: 12px; font-weight: var(--jd-weight-bold);
    font-family: inherit; cursor: pointer; white-space: nowrap;
    border-radius: var(--jd-radius-full);
    background: var(--_soft); color: var(--_text); border: 1px solid transparent;
  }
  .jd-consensus-screener__chip[data-active] {
    background: var(--_accent-soft); color: var(--_accent-strong);
    border-color: var(--_accent);
  }
  .jd-consensus-screener__chip-count { font-size: 10px; font-weight: 800; opacity: 0.7; }

  .jd-consensus-screener__table-wrap { overflow-x: auto; }
  .jd-consensus-screener__table {
    width: 100%; border-collapse: collapse; font-size: 13px;
  }
  .jd-consensus-screener__table th,
  .jd-consensus-screener__table td {
    padding: var(--jd-space-2) var(--jd-space-3); text-align: right; white-space: nowrap;
  }
  .jd-consensus-screener__table thead th {
    font-size: 11px; font-weight: var(--jd-weight-semibold); color: var(--_muted);
    border-block-end: 1px solid var(--_border);
  }
  .jd-consensus-screener__table thead th:first-child,
  .jd-consensus-screener__table tbody th { text-align: left; }
  .jd-consensus-screener__table tbody tr + tr th,
  .jd-consensus-screener__table tbody tr + tr td {
    border-block-start: 1px solid color-mix(in srgb, var(--_border) 60%, transparent);
  }
  .jd-consensus-screener__table tbody th { font-weight: var(--jd-weight-bold); color: var(--_text); }

  .jd-consensus-screener__num { font-variant-numeric: tabular-nums; color: var(--_text); }
  .jd-consensus-screener__num[data-tone="up"] { color: var(--_up); }
  .jd-consensus-screener__num[data-tone="down"] { color: var(--_down); }
  .jd-consensus-screener__num[data-tone="muted"] { color: var(--_muted); }
  .jd-consensus-screener__strong { font-weight: 800; }

  .jd-consensus-screener__name {
    appearance: none; padding: 0; border: 0; background: none; cursor: pointer;
    font: inherit; font-weight: 800; color: var(--_text); text-decoration: none;
  }
  .jd-consensus-screener__name:hover { text-decoration: underline; }
  .jd-consensus-screener__sector {
    margin-inline-start: 6px; font-size: 10.5px; font-weight: var(--jd-weight-bold);
    color: var(--_muted);
  }

  .jd-consensus-screener__supporters {
    display: flex; align-items: center; gap: 2px; justify-content: flex-end;
  }
  .jd-consensus-screener__emoji { font-size: 14px; line-height: 1; }

  .jd-consensus-screener__empty {
    display: flex; flex-direction: column; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-10) var(--jd-space-4); text-align: center;
  }
  .jd-consensus-screener__empty-icon { color: var(--_muted); }
  .jd-consensus-screener__empty-title { font-size: var(--jd-text-sm); font-weight: var(--jd-weight-bold); color: var(--_text); }
  .jd-consensus-screener__empty-desc { font-size: var(--jd-text-xs); color: var(--_muted); }
}`;
