import { css } from "../../core/styles.js";

/**
 * v2 값: 8색(gray/primary/blue/green/red/orange/purple/teal — Tailwind 50/700 계
 * 리터럴 승계, primary만 토큰), rounded-md·xs·medium, 닫기 버튼 hover 70%.
 *
 * DEC-041: 리터럴 쌍 → 톤 레시피(base.css --jd-tone-*). 색마다 앵커 한 줄만 두고
 * 배경·글자는 공식이 파생한다 — 다크에서 형광 배경 + 검은 글자로 뒤집히던 결함 해소.
 */
export default css`
@layer junds.components {
  jd-tag {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-md);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium); white-space: nowrap;
    --jd-tone: var(--jd-color-hue-gray); /* gray 기본 */
    --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
    background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-mix), transparent);
    color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
  }
  jd-tag[color="primary"] { background: var(--jd-color-primary-light); color: var(--jd-color-primary); }
  jd-tag[color="blue"] { --jd-tone: var(--jd-color-hue-blue); }
  jd-tag[color="green"] { --jd-tone: var(--jd-color-hue-green); }
  jd-tag[color="red"] { --jd-tone: var(--jd-color-hue-red); }
  jd-tag[color="orange"] { --jd-tone: var(--jd-color-hue-orange); }
  jd-tag[color="purple"] { --jd-tone: var(--jd-color-hue-purple); }
  jd-tag[color="teal"] { --jd-tone: var(--jd-color-hue-teal); }

  .jd-tag__close {
    display: inline-flex; align-items: center; justify-content: center;
    margin-inline-start: var(--jd-space-0-5); padding: 0; border: 0;
    background: transparent; color: inherit; cursor: pointer;
    transition: opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-tag__close:hover { opacity: 0.7; }
  .jd-tag__close:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, currentColor 40%, transparent);
    outline-offset: 1px; border-radius: var(--jd-radius-sm);
  }
}`;
