import { css } from "../../core/styles.js";

/**
 * v2 값: emerald/amber/red/blue/gray 50·700 리터럴 승계, rounded-full·medium,
 * dot 8px(500 계), size sm 10px / md xs.
 */
export default css`
@layer junds.components {
  jd-severity-badge {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    border-radius: var(--jd-radius-full);
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-medium);
    white-space: nowrap;
    padding: var(--jd-space-1) var(--jd-space-2-5); font-size: var(--jd-text-xs);
    /* DEC-044 톤 레시피 — severity 4종은 앵커만 바꾼다(base.css --jd-tone-*) */
    --jd-tone: var(--jd-color-hue-gray); /* neutral 기본 */
    --jd-tone-ink-mix: 52%; /* 10~12px 텍스트의 양 테마 AA 대비선 */
    --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
    background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-mix), transparent);
    color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
  }
  jd-severity-badge[size="sm"] {
    padding: var(--jd-space-0-5) var(--jd-space-2); font-size: 10px;
  }

  jd-severity-badge[severity="ok"] { --jd-tone: var(--jd-color-hue-green); }
  jd-severity-badge[severity="warn"] { --jd-tone: var(--jd-color-hue-amber); }
  jd-severity-badge[severity="danger"] { --jd-tone: var(--jd-color-hue-red); }
  jd-severity-badge[severity="info"] { --jd-tone: var(--jd-color-hue-blue); }

  /* 점은 틴트가 아니라 원색이다 — 배지 안에서 유일하게 채도가 살아 있는 지점 */
  jd-severity-badge[dot]::before {
    content: ""; flex-shrink: 0;
    width: 8px; height: 8px; border-radius: var(--jd-radius-full);
    background: var(--jd-tone);
  }
}`;
