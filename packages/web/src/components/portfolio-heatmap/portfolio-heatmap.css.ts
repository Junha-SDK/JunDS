import { css } from "../../core/styles.js";

/**
 * v2 값: bm-card 카드(p-4), 헤더 flex-wrap(제목 15px/extrabold + 부제 11px muted +
 * 우측 3지표), 지표는 우측 정렬 세로 스택(라벨 10px muted / 값 13px extrabold / 보조 10.5px).
 * 트리맵은 rounded-xl 안쪽 링. bm-* 토큰을 --jd-* 로 번역. 셀 텍스트는 흰 글자 + 그림자.
 */
export default css`
@layer junds.components {
  jd-portfolio-heatmap {
    display: block;
    box-sizing: border-box; /* 스타일 프롭 w/maxW + border 병용 (DEC-014-9, jd-card 선례) */
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-2xl);
    padding: var(--jd-space-4);
    overflow: hidden;
  }

  .jd-ph__header {
    display: flex;
    align-items: center;
    gap: var(--jd-space-3);
    flex-wrap: wrap;
    margin-block-end: var(--jd-space-3);
  }
  .jd-ph__title { margin: 0; font-size: 15px; font-weight: 800; }
  .jd-ph__sub { font-size: 11px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted); }

  .jd-ph__stats {
    margin-inline-start: auto;
    display: grid;
    grid-template-columns: repeat(3, auto);
    gap: var(--jd-space-3);
  }
  .jd-ph__stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: var(--jd-leading-tight);
    font-variant-numeric: tabular-nums;
  }
  .jd-ph__stat-label { font-size: 10px; font-weight: 800; color: var(--jd-color-muted); }
  .jd-ph__stat-value { font-size: 13px; font-weight: 800; }
  .jd-ph__stat-sub { font-size: 10.5px; font-weight: var(--jd-weight-bold); }
  .jd-ph__stat-sub:empty { display: none; }

  .jd-ph__map {
    border-radius: var(--jd-radius-xl);
    overflow: hidden;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--jd-color-foreground) 6%, transparent);
  }
  .jd-ph__svg { display: block; max-width: 100%; height: auto; }
  .jd-ph__bg { fill: var(--jd-color-card); }

  .jd-ph__cell rect {
    stroke: color-mix(in srgb, var(--jd-color-card) 85%, transparent);
    stroke-width: 1;
  }
  .jd-ph__cell text {
    fill: #fff;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
    filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.55));
  }
  .jd-ph__cell-name { font-weight: 800; }
  .jd-ph__cell-sub { font-weight: var(--jd-weight-bold); fill: rgba(255, 255, 255, 0.95); }
  .jd-ph__cell-price { fill: rgba(255, 255, 255, 0.78); filter: none; }

  /* 시각적으로 숨긴 대체 목록 (jd-treemap-chart sr 규칙과 동형) */
  .jd-ph__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    list-style: none;
  }
}`;
