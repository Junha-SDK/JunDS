import { css } from "../../core/styles.js";

/**
 * v2 LivePctText는 색 없는 Fragment였다(색은 소비 측·LivePctBadge가 담당). CE 호스트는
 * inline으로 흐름을 보존하고 tabular-nums만 얹는다 — 색은 파생 jd-live-pct-badge의 몫.
 */
export default css`
  @layer junds.components {
    jd-live-pct-text {
      display: inline;
      font-variant-numeric: tabular-nums;
    }
  }
`;
