/**
 * jd-highlight CSS — v2 primitives/Highlight(yellow/primary/underline 3변형).
 * yellow는 Mark와 같은 팔레트 리터럴 승계(DEC-025-1), primary/underline은 토큰.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-highlight {
      display: inline;
    }

    .jd-highlight__mark {
      padding-inline: var(--jd-space-0-5);
      border-radius: var(--jd-radius-sm);
      /* v2 yellow-200 리터럴은 다크에서 형광 슬래브 + 흰 글자로 뒤집혔다 — 톤 레시피로 (DEC-044) */
      --jd-tone: var(--jd-color-hue-amber);
      --jd-tone-ink-mix: 68%;
      --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
      background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-strong-mix), transparent);
      color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
    }
    [data-jd-theme="dark"] .jd-highlight__mark,
    [data-theme="dark"] .jd-highlight__mark {
      background: rgb(234 179 8 / 0.3);
    }

    jd-highlight[variant="primary"] .jd-highlight__mark {
      background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
      color: var(--jd-color-primary-ink);
      font-weight: var(--jd-weight-semibold);
    }
    jd-highlight[variant="underline"] .jd-highlight__mark {
      padding-inline: 0;
      background: transparent;
      color: inherit;
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 2px;
      text-decoration-color: var(--jd-color-primary-ink);
    }
  }
`;
