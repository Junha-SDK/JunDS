import { css } from "../../core/styles.js";

/**
 * v2 값: 11px bold, 점 size-2(8px). 라이브면 --bm-live-bright 점 + --bm-live-glow 확장 링
 * 펄스 + --bm-live 텍스트, 아니면 --bm-muted 점/텍스트. 라이브 3색은 모두 success 계열로
 * 매핑(글로우 링은 success color-mix). 펄스는 JS 타이머 대신 키프레임(감속 선호 시 정지).
 * 11px는 v2 리터럴(text-xs=12 눈금 밖).
 */
export default css`
@layer junds.components {
  jd-live-status-dot {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    font-family: var(--jd-font-sans);
    font-size: 11px; font-weight: var(--jd-weight-bold);
    color: var(--jd-color-muted);
  }
  .jd-live-status-dot__dot {
    flex-shrink: 0; width: 8px; height: 8px;
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-muted);
  }

  jd-live-status-dot[live] { color: var(--jd-color-success); }
  jd-live-status-dot[live] .jd-live-status-dot__dot {
    background: var(--jd-color-success);
    animation: jd-live-status-pulse 1.6s ease-out infinite;
  }

  /* 확장-소멸 글로우 링 — v2 box-shadow 토글의 키프레임 이식 */
  @keyframes jd-live-status-pulse {
    0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--jd-color-success) 45%, transparent); }
    70%  { box-shadow: 0 0 0 5px color-mix(in srgb, var(--jd-color-success) 0%, transparent); }
    100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--jd-color-success) 0%, transparent); }
  }

  @media (prefers-reduced-motion: reduce) {
    jd-live-status-dot[live] .jd-live-status-dot__dot { animation: none; }
  }
}`;
