import { css } from "../../core/styles.js";

/**
 * v2 값: 색 늘 --bm-up(초록) 고정, size fontSize sm 12 / md 14 / lg 18, 플래시 시
 * padding 1px 4px + radius 4 + 배경(up/down flash 틴트), transition .35s.
 *
 * 색은 --jd-finance-* 훅을 경유한다. v2의 --bm-up 고정을 success로 직접 박으면, 한국
 * 관례(적상승·청하락)를 켠 앱이 훅을 1회 덮어써도 이 값만 초록으로 남아 옆의
 * jd-price-badge와 갈린다. 플래시 배경도 같은 훅에서 color-mix로 뽑는다.
 * size는 reflect된 호스트 속성 → CSS가 처리(update()에 JS 분기 없음).
 * 파생 태그(jd-live-price)는 베이스 시트(jd-live-price-text) 밖이므로 tabular-nums를
 * 여기서 다시 선언한다.
 */
export default css`
  @layer junds.components {
    jd-live-price {
      display: inline-flex;
      align-items: center;
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--jd-finance-up, var(--jd-color-success));
      font-size: var(--jd-text-md); /* md = 14px */
      line-height: var(--jd-leading-tight);
      border-radius: var(--jd-radius-sm); /* 4px */
      padding: 0;
      transition: background-color 0.35s ease, padding 0.35s ease;
    }
    jd-live-price[size="sm"] {
      font-size: var(--jd-text-xs);
    } /* 12px */
    jd-live-price[size="lg"] {
      font-size: var(--jd-text-xl);
    } /* 18px */

    jd-live-price[data-flash="up"] {
      background: color-mix(
        in srgb,
        var(--jd-finance-up, var(--jd-color-success)) 16%,
        transparent
      );
      padding: 1px 4px;
    }
    jd-live-price[data-flash="down"] {
      background: color-mix(
        in srgb,
        var(--jd-finance-down, var(--jd-color-danger)) 16%,
        transparent
      );
      padding: 1px 4px;
    }

    @media (prefers-reduced-motion: reduce) {
      jd-live-price {
        transition: none;
      }
    }
  }
`;
