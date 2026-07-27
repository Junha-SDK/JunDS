import { css } from "../../core/styles.js";

/**
 * v2 값: 색 늘 --bm-up(초록) 고정, size fontSize sm 12 / md 14 / lg 18, 플래시 시
 * padding 1px 4px + radius 4 + 배경(up/down flash 틴트), transition .35s.
 *
 * 색 토큰 매핑: --bm-up→success, 플래시 배경은 badge와 같은 color-mix 틴트 관용구.
 * size는 reflect된 호스트 속성 → CSS가 처리(update()에 JS 분기 없음).
 * 파생 태그(jd-live-price)는 베이스 시트(jd-live-price-text) 밖이므로 tabular-nums를
 * 여기서 다시 선언한다.
 */
export default css`
@layer junds.components {
  jd-live-price {
    display: inline-flex; align-items: center;
    font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
    color: var(--jd-color-success-ink);
    font-size: var(--jd-text-md);          /* md = 14px */
    line-height: var(--jd-leading-tight);
    border-radius: var(--jd-radius-sm);    /* 4px */
    padding: 0;
    transition: background-color .35s ease, padding .35s ease;
  }
  jd-live-price[size="sm"] { font-size: var(--jd-text-xs); }  /* 12px */
  jd-live-price[size="lg"] { font-size: var(--jd-text-xl); }  /* 18px */

  jd-live-price[data-flash="up"] {
    background: color-mix(in srgb, var(--jd-color-success) 16%, transparent);
    padding: 1px 4px;
  }
  jd-live-price[data-flash="down"] {
    background: color-mix(in srgb, var(--jd-color-danger) 16%, transparent);
    padding: 1px 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    jd-live-price { transition: none; }
  }
}`;
