import { css } from "../../core/styles.js";

/**
 * jd-market-heatmap CSS — v2 finance/MarketHeatmap.
 * 칸 색은 데이터(등락률의 세기)라 인라인 --jd-mh-fill이 나른다. 단 그 값은 이제 순색
 * hsl이 아니라 --jd-finance-* 훅을 카드색에 눅인 색이다(element의 heatmapColor 주석) —
 * 앱이 관례를 뒤집으면 이 히트맵도 함께 뒤집힌다. 그 외 크롬(배경·칸 경계·그룹 헤더)은 토큰.
 * 대체 목록(.jd-mh__sr)은 시각적으로만 숨긴다(display:none은 AT에서도 지워진다).
 */
export default css`
  @layer junds.components {
    jd-market-heatmap {
      display: block;
      font-family: var(--jd-font-sans);
    }
    jd-market-heatmap:not(:defined) {
      display: block;
    }

    .jd-mh__svg {
      display: block;
      max-width: 100%;
      height: auto;
      font-variant-numeric: tabular-nums;
    }
    .jd-mh__bg {
      fill: var(--jd-color-card);
    }

    .jd-mh__cell {
      cursor: pointer;
    }
    .jd-mh__cell-rect {
      fill: var(
        --jd-mh-fill,
        color-mix(in srgb, var(--jd-color-muted) 30%, var(--jd-color-surface))
      );
      stroke: color-mix(in srgb, var(--jd-color-card) 85%, transparent);
      stroke-width: 1;
      /* all 금지 — x/y/width/height까지 대상이 되어 리사이즈마다 칸이 흘러간다 */
      transition: stroke var(--jd-duration-snap) var(--jd-easing-ease-out),
        stroke-width var(--jd-duration-snap) var(--jd-easing-ease-out),
        fill-opacity var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    /* 칸 색은 데이터라 hover에서 색을 바꿀 수 없다(등락률을 거짓말하게 된다) —
     대신 칸 경계를 카드색에서 잉크로 올려 "지금 이 칸"을 테두리로 말한다.
     filter: brightness는 쓰지 않는다 — 흰 라벨까지 밝혀 칸 안에서 글자가 녹는다. */
    .jd-mh__cell:hover .jd-mh__cell-rect {
      stroke: var(--jd-color-foreground);
      stroke-width: 2;
    }
    /* 눌린 면은 빛을 잃는다 — 칸 자체가 면이므로 채도를 낮춰 눌림을 만든다 */
    .jd-mh__cell:active .jd-mh__cell-rect {
      fill-opacity: 0.78;
    }
    .jd-mh__cell-text {
      fill: #fff;
      pointer-events: none;
      filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.55));
    }
    .jd-mh__cell-price {
      fill: rgba(255, 255, 255, 0.78);
      filter: none;
    }

    .jd-mh__group-bg {
      fill: color-mix(in srgb, var(--jd-color-card) 96%, transparent);
    }
    .jd-mh__group-divider {
      fill: color-mix(in srgb, var(--jd-color-foreground) 6%, transparent);
    }
    .jd-mh__group-label {
      fill: var(--jd-color-foreground);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      letter-spacing: var(--jd-tracking-wide);
      pointer-events: none;
    }

    .jd-mh__sr {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-mh__cell-rect {
        transition: none;
      }
    }
  }
`;
