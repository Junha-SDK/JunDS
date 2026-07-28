import { css } from "../../core/styles.js";

/**
 * v2 값: 호스트 inline-block, 주 단위 세로 열을 flex로 나열(gap 2px),
 * 셀 12×12 · borderRadius 2, 범례 `flex items-center gap-1 mt-2 text-[10px] text-muted`
 * ("Less" + 스케일 견본 + "More").
 *
 * 구조는 flex div 나열 → **진짜 표**로 바꿨다(element.ts 교정 1). 시각 결과는
 * 같지만(7행 × N열 격자) 표 셀 간격은 flex gap이 아니라 border-spacing이라
 * 바깥쪽에도 간격이 생긴다 — 음수 마진으로 정확히 상쇄해 v2와 같은 바운딩 박스를
 * 유지한다. `display:grid` 같은 걸로 표를 덮어쓰면 브라우저가 표 role을 통째로
 * 잃어버리므로(접근성 트리에서 행/열이 사라진다) 표시 타입은 건드리지 않는다.
 *
 * 셀 색은 데이터마다 다르므로 인라인 커스텀 프로퍼티로 넣고, 규칙 자체는
 * 레이어 안에 둔다 — 소비자가 `.jd-heatmap__cell { background: … }`로 이길 수 있다.
 */
export default css`
  @layer junds.base {
    jd-heatmap:not(:defined) {
      display: inline-block;
    }
  }
  @layer junds.components {
    jd-heatmap {
      display: inline-block;
      font-family: var(--jd-font-sans);
      --jd-heatmap-cell-size: 12px;
      --jd-heatmap-gap: 2px;

      /* 잔디 5단 — element.ts는 슬롯 이름만 들고 색은 여기서 정한다.
       GitHub 초록 리터럴은 팔레트 밖(§8)인 데다 라이트/다크 어느 쪽도 따라가지
       못했다. primary를 card와 섞으면 두 모드 모두에서 "빈 칸 → 가득" 방향이
       그대로 유지된다(다크에서는 어두운 카드에서 브랜드색으로 차오른다). */
      --jd-heatmap-step-0: var(--jd-color-border-light);
      --jd-heatmap-step-1: color-mix(in srgb, var(--jd-color-primary) 22%, var(--jd-color-card));
      --jd-heatmap-step-2: color-mix(in srgb, var(--jd-color-primary) 45%, var(--jd-color-card));
      --jd-heatmap-step-3: color-mix(in srgb, var(--jd-color-primary) 70%, var(--jd-color-card));
      --jd-heatmap-step-4: var(--jd-color-primary);

      /* 1년치 잔디는 53열(≈740px)이라 어떤 카드보다 넓다 — 잘린 채 끝나지 않고
       스스로 구른다(§6). 세로는 항상 7행이라 자를 것이 없다.
       격자의 음수 마진(위/왼쪽 2px)은 이 스크롤 상자 밖으로 나가 가려지는데,
       그 2px는 border-spacing이 만든 **빈 여백**이라 보이는 것은 잃지 않는다. */
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
    }

    .jd-heatmap__grid {
      border-collapse: separate;
      border-spacing: var(--jd-heatmap-gap);
      table-layout: fixed;
      /* border-spacing이 만드는 바깥 여백 상쇄 — v2 flex gap과 같은 바운딩 박스 */
      margin: calc(var(--jd-heatmap-gap) * -1);
    }

    .jd-heatmap__cell {
      width: var(--jd-heatmap-cell-size);
      height: var(--jd-heatmap-cell-size);
      padding: 0;
      border-radius: 2px; /* v2 borderRadius: 2 — 토큰 사다리(sm=4px)보다 작다 */
      background: var(--jd-heatmap-cell, var(--jd-color-border-light));
    }

    .jd-heatmap__legend {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
      margin-block-start: var(--jd-space-2);
      /* v2는 10px였다 — 2xs(11px) 아래로는 내려가지 않는다(§9) */
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
    }
    .jd-heatmap__legend[hidden] {
      display: none;
    }

    .jd-heatmap__swatch {
      flex-shrink: 0;
      width: var(--jd-heatmap-cell-size);
      height: var(--jd-heatmap-cell-size);
      border-radius: 2px; /* v2 borderRadius: 2 — 토큰 사다리(sm=4px)보다 작다 */
      background: var(--jd-heatmap-cell, var(--jd-color-border-light));
    }

    /* 색으로만 전달되던 값의 텍스트 등가물 (jd-comparison-grid 관용구) */
    .jd-heatmap__sr {
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
  }
`;
