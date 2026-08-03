import { css } from "../../core/styles.js";

/**
 * v2 값: font-bold, fontSize 12, 색 up→--bm-up / flat→--bm-muted / down→--bm-down.
 * 파생 태그라 tabular-nums를 여기서 다시 선언한다.
 * 색은 판정 결과(data-trend)만으로 흐른다 — update()에 색 JS 분기 없음.
 *
 * 등락색은 --jd-finance-* 훅을 반드시 경유한다. success/danger를 직접 박으면 한국 관례
 * (적상승·청하락)를 켠 앱의 1회 override가 이 배지만 비껴가, 형제 jd-price-badge와
 * 한 화면에서 색이 갈린다(DECISIONS: 색 기본값은 웹, 관례 전환은 앱).
 */
export default css`
  @layer junds.components {
    jd-live-pct-badge {
      display: inline;
      font-size: var(--jd-text-xs); /* 12px */
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      color: var(--jd-finance-flat, var(--jd-color-muted));
    }
    jd-live-pct-badge[data-trend="up"] {
      color: var(--jd-finance-up, var(--jd-color-success));
    }
    jd-live-pct-badge[data-trend="down"] {
      color: var(--jd-finance-down, var(--jd-color-danger));
    }
    jd-live-pct-badge[data-trend="flat"] {
      color: var(--jd-finance-flat, var(--jd-color-muted));
    }
  }
`;
