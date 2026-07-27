/**
 * jd-hint CSS — v2 composites/Hint(inline-flex · gap 1.5 · text-xs · leading-snug ·
 * 변형별 텍스트 색)의 토큰 번역.
 *
 * 라이트 테마 대비 보정(DEC-027 선례 — jd-badge와 같은 처리): 12px 본문은 AA 4.5:1이
 * 필요한데 semantic 원색은 흰 배경에서 success 3.9 · warning 3.9 · info 3.1로 미달한다.
 * 색상(hue)은 유지하고 명도만 내린 뒤 다크 테마에서 원색을 복원한다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-hint {
    display: inline-flex; align-items: flex-start;
    gap: var(--jd-space-1-5);
    font-family: var(--jd-font-sans);
    font-size: var(--jd-text-xs);
    line-height: var(--jd-leading-snug);
    /* variant 기본 muted — 디폴트는 attribute로 반영되지 않으므로 base가 담당(§1.3) */
    color: var(--jd-color-muted);
  }
  jd-hint[variant="info"] { color: color-mix(in srgb, var(--jd-color-info) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward)); }
  jd-hint[variant="tip"] { color: color-mix(in srgb, var(--jd-color-success) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward)); }
  jd-hint[variant="warning"] { color: color-mix(in srgb, var(--jd-color-warning) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward)); }


  /* v2 mt-px — 글리프를 첫 줄 x-height에 맞춘다 */
  .jd-hint__icon { flex-shrink: 0; margin-block-start: var(--jd-space-px); }

  /* 변형명 접두 — 시각적으로만 숨긴다(display:none은 AT에서도 지워진다) */
  .jd-hint__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
}`;
