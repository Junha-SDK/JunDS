import { css } from "../../core/styles.js";

/**
 * v2 값: sticky top-0 z-30 backdrop-blur, bg var(--bm-bg)/88 + 하단 테두리,
 * inner = px-4 (lg:px-6) py-2.5 max-w-1600 mx-auto, 검색 flex-1 max-w-2xl.
 * 메타(날짜/시각 13px muted tabular)는 md 미만 숨김. 상태 알약 = 장중이면 success 14%
 * 틴트 + 맥동 점, 그 외 soft-100 + muted.
 *
 * 토큰 번역: --bm-bg→background(88%+블러), z-30→--jd-z-header, --bm-success→success,
 * soft-100→muted 6% 틴트. finance --bm-* → jd 폴백.
 */
export default css`
@layer junds.components {
  jd-top-bar {
    --jd-fin-success: var(--bm-success, var(--jd-color-success));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));

    display: block; box-sizing: border-box; font-family: var(--jd-font-sans);
  }
  jd-top-bar * { box-sizing: border-box; }

  header.jd-top-bar {
    background: color-mix(in srgb, var(--jd-color-background) 88%, transparent);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-top-bar:not([static]) header.jd-top-bar {
    position: sticky; top: 0; z-index: var(--jd-z-header);
  }

  .jd-top-bar__inner {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-2-5) var(--jd-space-4);
    max-width: 1600px; margin-inline: auto;
  }
  @media (min-width: 1024px) {
    .jd-top-bar__inner { padding-inline: var(--jd-space-6); }
  }

  .jd-top-bar__brand { display: inline-flex; align-items: center; gap: var(--jd-space-2); min-width: 0; }
  .jd-top-bar__brand[hidden] { display: none; }

  .jd-top-bar__search { flex: 1; min-width: 0; max-width: 42rem; display: flex; align-items: center; }
  .jd-top-bar__search[hidden] { display: none; }

  .jd-top-bar__meta {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold);
    color: var(--jd-fin-muted); font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .jd-top-bar__meta[hidden] { display: none; }
  /* v2: 날짜·상태 블록은 md 미만 숨김 */
  @media (max-width: 767px) {
    .jd-top-bar__meta { display: none; }
  }
  .jd-top-bar__timestamp[hidden] { display: none; }

  .jd-top-bar__status {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    font-size: 10.5px; font-weight: 800;
    padding: 1px var(--jd-space-1-5); border-radius: var(--jd-radius-full);
    background: var(--jd-fin-soft); color: var(--jd-fin-muted);
  }
  .jd-top-bar__status[hidden] { display: none; }
  .jd-top-bar__status-dot {
    width: 6px; height: 6px; border-radius: var(--jd-radius-full);
    background: currentColor; flex-shrink: 0;
  }
  /* 장중 알약: 14% 틴트 위 원색 success 글자(10.5px 800)는 대비 미달 — hue 유지하며
     글자를 foreground 쪽으로 섞어 대비 확보(03-web-arch §4.3). 점은 currentColor 상속. */
  .jd-top-bar__status[data-status="open"] {
    background: color-mix(in srgb, var(--jd-fin-success) 14%, transparent);
    color: color-mix(in srgb, var(--jd-fin-success) 65%, var(--jd-color-foreground));
  }
  @media (prefers-reduced-motion: no-preference) {
    .jd-top-bar__status[data-status="open"] .jd-top-bar__status-dot {
      animation: jd-top-bar-pulse 1.8s var(--jd-easing-ease-in-out) infinite;
    }
  }
  @keyframes jd-top-bar-pulse { 50% { opacity: 0.35; } }

  .jd-top-bar__actions {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    flex-shrink: 0; margin-inline-start: auto;
  }
}`;
