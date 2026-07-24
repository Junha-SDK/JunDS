/**
 * jd-hashtag CSS — v2 primitives/Hashtag(primary 링크 + 🔥 + 게시물 수).
 * v2 count 색은 text-muted(4.85:1로 AA 통과) — 그대로 토큰 참조.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-hashtag { display: inline; }

  .jd-hashtag {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    color: var(--jd-color-primary); font-weight: var(--jd-weight-medium);
    text-decoration: none; border-radius: var(--jd-radius-sm);
  }
  .jd-hashtag:hover { text-decoration: underline; }
  .jd-hashtag:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 2px;
  }
  .jd-hashtag__trending { font-size: 11px; }
  .jd-hashtag__trending[hidden] { display: none; }
  .jd-hashtag__count {
    font-size: 11px; color: var(--jd-color-muted); font-variant-numeric: tabular-nums;
  }
  .jd-hashtag__count[hidden] { display: none; }
}`;
