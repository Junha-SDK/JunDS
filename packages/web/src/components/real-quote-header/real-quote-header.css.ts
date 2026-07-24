/**
 * jd-real-quote-header CSS — v2 finance/RealQuoteHeader의 Tailwind/인라인 style을 토큰 번역.
 *
 * v2 값: bm-card + border, 헤더 px-4 py-3 border-b, KIS 배지 teal 알약(dot glow),
 * Yahoo 배지 작은 회색 알약, 대표 4칸 grid(2→md:4) px-4 py-3, 보조 6칸 grid(3→md:6)
 * bg-soft border-t, PER/PBR 2칸 border-t. 숫자는 tabular-nums. 상승=적/하락=청.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-real-quote-header {
    display: block;
    overflow: hidden;
    border: 1px solid var(--jd-fin-border, var(--jd-color-border));
    border-radius: var(--jd-radius-lg);
    background: var(--jd-fin-card, var(--jd-color-card));
    color: var(--jd-fin-text, var(--jd-color-foreground));
    font-family: var(--jd-font-sans);
    --_up: var(--jd-fin-up, #e11d48);
    --_down: var(--jd-fin-down, #2563eb);
    --_muted: var(--jd-fin-muted, var(--jd-color-muted));
    --_border: var(--jd-fin-border, var(--jd-color-border));
    --_soft: var(--jd-fin-soft-100, var(--jd-color-card-hover));
    --_accent: var(--jd-fin-accent, #14b8a6);
    --_accent-strong: var(--jd-fin-accent-strong, #0f766e);
  }
  jd-real-quote-header[hidden],
  jd-real-quote-header:not(:defined) { display: none; }

  .jd-real-quote-header__header {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-2);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-end: 1px solid var(--_border);
  }
  .jd-real-quote-header__titlebar {
    display: flex; align-items: center; gap: var(--jd-space-2);
    min-width: 0;
  }
  .jd-real-quote-header__icon { flex-shrink: 0; color: var(--_accent-strong); }
  .jd-real-quote-header__heading { margin: 0; font-size: 14px; font-weight: 800; }

  .jd-real-quote-header__source {
    display: inline-flex; align-items: center; gap: 6px;
    border-radius: var(--jd-radius-full); white-space: nowrap;
  }
  .jd-real-quote-header__source::before {
    content: ""; flex-shrink: 0; border-radius: var(--jd-radius-full);
  }
  .jd-real-quote-header__source[data-source="kis"] {
    padding: 4px 10px; font-size: 12px; font-weight: 800; letter-spacing: 0.02em;
    color: var(--_accent-strong);
    background: color-mix(in srgb, var(--_accent) 14%, transparent);
    border: 1.5px solid color-mix(in srgb, var(--_accent) 45%, transparent);
  }
  .jd-real-quote-header__source[data-source="kis"]::before {
    width: 8px; height: 8px; background: var(--_accent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--_accent) 18%, transparent);
  }
  .jd-real-quote-header__source[data-source="yahoo"] {
    padding: 2px 6px; font-size: 10px; font-weight: 700; opacity: 0.8;
    color: var(--_muted); background: var(--_soft);
    border: 1px solid var(--_border);
  }
  .jd-real-quote-header__source[data-source="yahoo"]::before {
    width: 4px; height: 4px; background: var(--_muted);
  }

  .jd-real-quote-header__delay {
    flex-shrink: 0; font-size: 11px; font-weight: 600; color: var(--_muted);
  }

  .jd-real-quote-header__kv {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4);
    font-variant-numeric: tabular-nums;
  }
  .jd-real-quote-header__kv-label { font-size: 10.5px; font-weight: 700; color: var(--_muted); }
  .jd-real-quote-header__kv-value {
    margin-block-start: 2px; font-size: 14px; font-weight: 800;
    color: var(--jd-fin-text, var(--jd-color-foreground));
  }
  .jd-real-quote-header__kv-value[data-large] { font-size: 18px; }
  .jd-real-quote-header__kv-value[data-tone="up"] { color: var(--_up); }
  .jd-real-quote-header__kv-value[data-tone="down"] { color: var(--_down); }
  .jd-real-quote-header__kv-unit {
    margin-inline-start: 4px; font-size: 10.5px; font-weight: 600; opacity: 0.8;
  }
  .jd-real-quote-header__kv-unit[hidden] { display: none; }

  .jd-real-quote-header__mini,
  .jd-real-quote-header__ratio {
    display: grid; gap: var(--jd-space-3);
    font-size: 11.5px; font-variant-numeric: tabular-nums;
    border-block-start: 1px solid var(--_border);
  }
  .jd-real-quote-header__mini {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 10px var(--jd-space-4);
    background: var(--_soft);
  }
  .jd-real-quote-header__ratio {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: var(--jd-space-2) var(--jd-space-4);
  }
  .jd-real-quote-header__ratio[hidden] { display: none; }

  .jd-real-quote-header__mini-cell {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
  }
  .jd-real-quote-header__mini-label {
    font-size: 10.5px; font-weight: 700; color: var(--_muted);
  }
  .jd-real-quote-header__mini-value {
    font-weight: 800; color: var(--jd-fin-text, var(--jd-color-foreground));
  }
  .jd-real-quote-header__mini-value[data-tone="up"] { color: var(--_up); }
  .jd-real-quote-header__mini-value[data-tone="down"] { color: var(--_down); }

  @media (min-width: 768px) {
    .jd-real-quote-header__kv { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .jd-real-quote-header__mini { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  }
}`;
