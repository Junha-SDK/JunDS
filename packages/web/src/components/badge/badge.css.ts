import { css } from "../../core/styles.js";

/**
 * v2 값: variant 7종(색/10% 배경 + 15% 인셋 링 = color-mix 관용구), size 3종
 * (sm 10px/rounded-md · md 12px/rounded-lg · lg 14px), dot 6px, 카운트 모드
 * 18px 원형 danger. gray·blue 계 리터럴은 v2 Tailwind 승계(G2 gray 어휘).
 */
export default css`
@layer junds.components {
  jd-badge {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-semibold);
    letter-spacing: var(--jd-tracking-wide); white-space: nowrap;
    /* size 기본 md */
    padding: var(--jd-space-1) var(--jd-space-2-5);
    font-size: var(--jd-text-xs); border-radius: var(--jd-radius-lg);
    /* variant 기본 default — gray */
    background: rgba(107,114,128,.1); color: #374151;
    box-shadow: 0 0 0 1px inset rgba(0,0,0,.06);
  }
  jd-badge[size="sm"] {
    padding: var(--jd-space-0-5) var(--jd-space-2);
    font-size: 10px; border-radius: var(--jd-radius-md);
  }
  jd-badge[size="lg"] {
    padding: var(--jd-space-1) var(--jd-space-3);
    font-size: var(--jd-text-md);
  }

  jd-badge[variant="primary"] {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    color: var(--jd-color-primary);
    box-shadow: 0 0 0 1px inset color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
  }
  /* 텍스트만 검정 쪽 파생(라이트 AA, DEC-027) — 틴트·점·링은 원색, 다크는 원색 복원 */
  jd-badge[variant="success"] {
    background: color-mix(in srgb, var(--jd-color-success) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-success) 80%, #000);
    box-shadow: 0 0 0 1px inset color-mix(in srgb, var(--jd-color-success) 15%, transparent);
  }
  jd-badge[variant="warning"] {
    background: color-mix(in srgb, var(--jd-color-warning) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-warning) 75%, #000);
    box-shadow: 0 0 0 1px inset color-mix(in srgb, var(--jd-color-warning) 15%, transparent);
  }
  jd-badge[variant="danger"] {
    background: color-mix(in srgb, var(--jd-color-danger) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-danger) 90%, #000);
    box-shadow: 0 0 0 1px inset color-mix(in srgb, var(--jd-color-danger) 15%, transparent);
  }
  [data-jd-theme="dark"] jd-badge[variant="success"],
  [data-theme="dark"] jd-badge[variant="success"] { color: var(--jd-color-success); }
  [data-jd-theme="dark"] jd-badge[variant="warning"],
  [data-theme="dark"] jd-badge[variant="warning"] { color: var(--jd-color-warning); }
  [data-jd-theme="dark"] jd-badge[variant="danger"],
  [data-theme="dark"] jd-badge[variant="danger"] { color: var(--jd-color-danger); }
  jd-badge[variant="info"] {
    background: rgba(59,130,246,.1); color: #1d4ed8;
    box-shadow: 0 0 0 1px inset rgba(59,130,246,.15);
  }
  jd-badge[variant="outline"] {
    background: transparent; color: var(--jd-color-foreground);
    box-shadow: none; border: var(--jd-border-thin) solid var(--jd-color-border);
  }

  /* dot — DOM 없이 ::before */
  jd-badge[dot]::before {
    content: ""; flex-shrink: 0;
    width: 6px; height: 6px; border-radius: var(--jd-radius-full);
    background: var(--jd-color-neutral-400); /* default */
  }
  jd-badge[dot][variant="primary"]::before { background: var(--jd-color-primary); }
  jd-badge[dot][variant="success"]::before { background: var(--jd-color-success); }
  jd-badge[dot][variant="warning"]::before { background: var(--jd-color-warning); }
  jd-badge[dot][variant="danger"]::before { background: var(--jd-color-danger); }
  jd-badge[dot][variant="info"]::before { background: #3b82f6; }
  jd-badge[dot][variant="outline"]::before { background: var(--jd-color-foreground); }

  /* 카운트 모드 — 원형 danger (v2 동형) */
  jd-badge[data-count-mode] {
    justify-content: center; padding: 0 var(--jd-space-1);
    min-width: 18px; height: 18px; border-radius: var(--jd-radius-full);
    background: var(--jd-color-danger); color: #fff;
    box-shadow: none; font-variant-numeric: tabular-nums; font-size: 10px;
  }
}`;
