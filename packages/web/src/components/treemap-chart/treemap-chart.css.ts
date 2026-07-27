import { css } from "../../core/styles.js";

/**
 * v2 값: svg width×height(기본 400×250), 타일 `rx=4 stroke="white" strokeWidth=2
 * opacity=.85`, 라벨 11px/600 흰색, 값 9px 흰색 opacity .8 (타일이 40×20보다 클 때만).
 *
 * `stroke="white"` 리터럴은 **배경 토큰**으로 번역했다 — 타일 사이의 흰 선은 "구분선"이
 * 아니라 "배경이 비쳐 보이는 틈"이고, 다크에서 흰 격자를 그리면 그림이 깨진다.
 * 타일 색은 데이터마다 다르므로 인라인 커스텀 프로퍼티 경유(소비자 CSS가 이긴다).
 */
export default css`
@layer junds.base {
  jd-treemap-chart:not(:defined) { display: inline-block; }
}
@layer junds.components {
  jd-treemap-chart {
    display: inline-block;
    line-height: 0;
    font-family: var(--jd-font-sans);
  }

  .jd-treemap-chart__svg { display: block; }

  .jd-treemap-chart__rect {
    fill: var(--jd-treemap-chart-fill, var(--jd-color-primary));
    stroke: var(--jd-color-background);
    stroke-width: 2;
    opacity: .85; /* v2 값 — 토큰 사다리에 85가 없어 리터럴 유지 */
  }

  /**
   * v2는 타일 위 글자를 항상 흰색으로 박았다. 타일 색은 소비자가 넘기는 값이라
   * (밝은 색을 주면) 글자가 배경에 묻는다 — 게다가 타일 자체가 opacity .85라 대비가
   * 한 번 더 깎인다. 색을 바꾸면 데이터 색을 왜곡하므로, 글자에만 어두운 외곽선을
   * 깔아 어떤 타일 위에서도 읽히게 한다(paint-order로 획을 글자 뒤에 그린다).
   */
  .jd-treemap-chart__label,
  .jd-treemap-chart__value {
    fill: #fff; /* v2 승계 — 채도 높은 타일 위 텍스트 */
    paint-order: stroke;
    stroke: color-mix(in srgb, var(--jd-tone-ink-toward) 35%, transparent); /* 타일 경계 — 모드마다 반대 방향 (DEC-044) */
    stroke-width: 2px;
    stroke-linejoin: round;
    pointer-events: none;
  }
  .jd-treemap-chart__label {
    font-size: 11px; font-weight: var(--jd-weight-semibold);
  }
  .jd-treemap-chart__value {
    font-size: 9px; opacity: var(--jd-opacity-80);
    font-variant-numeric: tabular-nums;
  }
  .jd-treemap-chart__label[hidden],
  .jd-treemap-chart__value[hidden] { display: none; }

  /* 그림의 텍스트 등가물 — 시각적으로만 숨긴다 (jd-comparison-grid 관용구) */
  .jd-treemap-chart__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
}`;
