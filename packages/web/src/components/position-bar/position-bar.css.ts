import { css } from "../../core/styles.js";

/**
 * v2 값: 트랙 h-2(8px) rounded-full 회색, 밴드=tone색 18% 알파, 채움=tone 원색,
 * 마커 2×12px(#0f172a) 정중앙. tone 색은 finance 폴백 체인으로 옮겨 앱 재틴트 허용.
 * overflow visible — 마커(12px)가 트랙(8px)보다 크다.
 */
export default css`
@layer junds.components {
  jd-position-bar {
    --jd-position-bar-color: var(--jd-finance-up, var(--jd-color-success));
    position: relative;
    display: block;
    height: 0.5rem;
    border-radius: var(--jd-radius-full);
    background: color-mix(in srgb, var(--jd-color-muted) 18%, transparent);
    overflow: visible;
  }
  jd-position-bar[tone="down"] {
    --jd-position-bar-color: var(--jd-finance-down, var(--jd-color-danger));
  }

  .jd-position-bar__band {
    position: absolute;
    inset-block-start: 0;
    height: 100%;
    border-radius: var(--jd-radius-full);
    background: color-mix(in srgb, var(--jd-position-bar-color) 18%, transparent);
  }
  .jd-position-bar__fill {
    position: absolute;
    inset-block-start: 0;
    height: 100%;
    border-radius: var(--jd-radius-full);
    background: var(--jd-position-bar-color);
  }
  .jd-position-bar__marker {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 0.75rem;
    border-radius: 2px;
    background: var(--jd-color-foreground);
  }
}`;
