import { css } from "../../core/styles.js";

/**
 * v2 값: font-bold, fontSize 12, 색 up→--bm-up / flat→--bm-muted / down→--bm-down.
 * 토큰 매핑: success / muted / danger. 파생 태그라 tabular-nums를 여기서 다시 선언한다.
 * 색은 판정 결과(data-trend)만으로 흐른다 — update()에 색 JS 분기 없음.
 */
export default css`
@layer junds.components {
  jd-live-pct-badge {
    display: inline;
    font-size: var(--jd-text-xs);          /* 12px */
    font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
    color: var(--jd-color-muted);
  }
  jd-live-pct-badge[data-trend="up"] { color: var(--jd-color-success); }
  jd-live-pct-badge[data-trend="down"] { color: var(--jd-color-danger); }
  jd-live-pct-badge[data-trend="flat"] { color: var(--jd-color-muted); }
}`;
