import { css } from "../../core/styles.js";

/**
 * v2 값: bm-pill(inline 알약) + linear-gradient(180deg, up 72%+#fff → up), 흰 글자,
 * 12px/800, padding 4px 10px, tabular-nums. up색은 finance 폴백 체인.
 *
 * 대비 교정: v2 그라디언트 상단(up 72%+흰색)은 흰 글자가 얹히기엔 너무 밝았다.
 * 흰 글자가 원색 위에 앉으므로 표면을 finance-up 80%+foreground로 낮춰 대비를 확보한다
 * (jd-fzone-card 선례). 상단=원색·하단=어둡게로 세로 그라디언트(급등 알약 정체성)는 유지.
 */
export default css`
  @layer junds.components {
    jd-hot-pct-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      font-family: var(--jd-font-sans);
      font-variant-numeric: tabular-nums;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-none);
      padding: var(--jd-space-1) var(--jd-space-2-5);
      border-radius: var(--jd-radius-full);
      color: #fff;
      background: linear-gradient(
        180deg,
        var(--jd-finance-up, var(--jd-color-success)) 0%,
        color-mix(
            in srgb,
            var(--jd-finance-up, var(--jd-color-success)) 80%,
            var(--jd-color-foreground)
          )
          100%
      );
      /* 알약은 실체가 있는 면이다 — 상단 인셋 하이라이트가 없으면 색종이로 읽힌다 */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
  }
`;
