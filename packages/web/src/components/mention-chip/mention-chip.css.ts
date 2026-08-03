/**
 * jd-mention-chip CSS — v2 primitives/MentionChip(primary 링크 + hover 밑줄).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-mention-chip {
      display: inline;
    }

    .jd-mention-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-0-5);
      color: var(--jd-color-primary-ink);
      font-weight: var(--jd-weight-medium);
      text-decoration: none;
      border-radius: var(--jd-radius-sm);
    }
    .jd-mention-chip:hover {
      text-decoration: underline;
    }
    .jd-mention-chip:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: 2px;
    }
    .jd-mention-chip__verified {
      font-size: 11px;
    }
    .jd-mention-chip__verified[hidden] {
      display: none;
    }
  }
`;
