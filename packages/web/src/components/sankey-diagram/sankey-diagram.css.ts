import { css } from "../../core/styles.js";

/**
 * v2 값: 호스트 inline-block, svg width×height(기본 560×320), 링크 path
 * `strokeOpacity .35` + 링크 굵기 = 값, 노드 rect `rx=2`, 라벨 11px
 * `fill-foreground`(마지막 컬럼만 오른쪽 정렬로 노드 왼편에).
 *
 * 링크/노드 색은 데이터마다 다르므로 인라인 커스텀 프로퍼티 경유 — 규칙 자체는
 * 레이어 안에 있어 소비자 CSS가 항상 이긴다(속성으로 박으면 못 이긴다).
 * 호버 강조는 v2에 없던 것을 더한 게 아니라 `stroke-opacity` 하나만 올린다 —
 * 링크가 겹쳐 보이는 다이어그램에서 어느 줄기인지 눈으로 따라가게 하는 최소 장치.
 */
export default css`
@layer junds.base {
  jd-sankey-diagram:not(:defined) { display: inline-block; }
}
@layer junds.components {
  jd-sankey-diagram {
    display: inline-block;
    line-height: 0;
    font-family: var(--jd-font-sans);
  }

  .jd-sankey-diagram__svg { display: block; overflow: visible; }

  .jd-sankey-diagram__link {
    fill: none;
    stroke: var(--jd-sankey-diagram-stroke, var(--jd-color-primary));
    stroke-opacity: .35; /* v2 값 — 토큰 사다리에 35가 없어 리터럴 유지 */
    transition: stroke-opacity var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-sankey-diagram__link:hover { stroke-opacity: .55; }

  .jd-sankey-diagram__node {
    fill: var(--jd-sankey-diagram-fill, var(--jd-color-primary));
  }

  .jd-sankey-diagram__label {
    fill: var(--jd-color-foreground);
    font-size: 11px; /* v2 fontSize=11 */
    pointer-events: none;
  }

  /* 그림의 텍스트 등가물 — 시각적으로만 숨긴다 (jd-comparison-grid 관용구) */
  .jd-sankey-diagram__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-sankey-diagram__link { transition: none; }
  }
}`;
