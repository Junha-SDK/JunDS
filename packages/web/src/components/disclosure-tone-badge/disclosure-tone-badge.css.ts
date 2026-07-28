import { css } from "../../core/styles.js";

/**
 * v2 값: full = inline-flex · gap 8 · px 10 · h 28 · rounded-lg, tone 11px/800,
 * cat 10.5px/700 opacity .85, conf 10px/700 tabular opacity .6. compact = px 6 · h 20 ·
 * rounded-sm · tone 10.5px/800, cat·conf 숨김. 톤 색은 finance 토큰(--bm-* → jd 폴백).
 */
export default css`
  @layer junds.components {
    jd-disclosure-tone-badge {
      --jd-fin-up: var(--bm-up, var(--jd-color-success));
      --jd-fin-down: var(--bm-down, var(--jd-color-danger));
      --jd-fin-up-soft: var(
        --bm-up-soft,
        color-mix(in srgb, var(--jd-color-success) 14%, transparent)
      );
      --jd-fin-down-soft: var(
        --bm-down-soft,
        color-mix(in srgb, var(--jd-color-danger) 14%, transparent)
      );
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-soft: var(
        --bm-soft-100,
        color-mix(in srgb, var(--jd-color-foreground) 6%, transparent)
      );

      /* tone 기본 = neutral */
      --jd-dtb-fg: var(--jd-fin-muted);
      --jd-dtb-bg: var(--jd-fin-soft);

      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      box-sizing: border-box;
      height: 28px;
      padding: 0 var(--jd-space-2-5);
      border-radius: var(--jd-radius-lg);
      background: var(--jd-dtb-bg);
      white-space: nowrap;
      font-family: var(--jd-font-sans);
      line-height: var(--jd-leading-none);
    }
    jd-disclosure-tone-badge[tone="positive"] {
      --jd-dtb-fg: color-mix(in srgb, var(--jd-fin-up) 65%, var(--jd-color-foreground));
      --jd-dtb-bg: var(--jd-fin-up-soft);
    }
    jd-disclosure-tone-badge[tone="negative"] {
      --jd-dtb-fg: color-mix(in srgb, var(--jd-fin-down) 65%, var(--jd-color-foreground));
      --jd-dtb-bg: var(--jd-fin-down-soft);
    }
    jd-disclosure-tone-badge[tone="neutral"] {
      --jd-dtb-fg: var(--jd-fin-muted);
      --jd-dtb-bg: var(--jd-fin-soft);
    }

    jd-disclosure-tone-badge .jd-disclosure-tone-badge__tone {
      color: var(--jd-dtb-fg);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: var(--jd-tracking-wide);
    }
    jd-disclosure-tone-badge .jd-disclosure-tone-badge__cat {
      color: var(--jd-dtb-fg);
      opacity: 0.85;
      font-size: 10.5px;
      font-weight: 700;
    }
    jd-disclosure-tone-badge .jd-disclosure-tone-badge__conf {
      color: var(--jd-dtb-fg);
      opacity: 0.6;
      font-size: 10px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    /* compact — 톤 라벨만 */
    jd-disclosure-tone-badge[compact] {
      height: 20px;
      gap: 0;
      padding: 0 var(--jd-space-1-5);
      border-radius: var(--jd-radius-sm);
    }
    jd-disclosure-tone-badge[compact] .jd-disclosure-tone-badge__tone {
      font-size: 10.5px;
    }
    jd-disclosure-tone-badge[compact] .jd-disclosure-tone-badge__cat,
    jd-disclosure-tone-badge[compact] .jd-disclosure-tone-badge__conf {
      display: none;
    }
  }
`;
