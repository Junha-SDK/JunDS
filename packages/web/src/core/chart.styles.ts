/**
 * 차트 공용 CSS 조각 — `css` 태그가 아니라 **평문 문자열**이다.
 * 이유는 core/picker-field.styles.ts 주석과 동일: build.mjs의 정적 CSS 수집기는
 * 컴포넌트 폴더당 `*.css.ts` 1개만 읽으므로, 공용 규칙을 별도 시트로 두면
 * `dist/css/line-chart.css`만 가져다 쓰는 소비 경로가 스타일 없이 렌더된다.
 * 호출부는 `@layer junds.components { ${CHART_CSS} … }` 안에 보간한다.
 *
 * 색 규약: 실제 fill/stroke는 **여기서만** 건다. 시리즈 그룹의 인라인
 * `--jd-series-color`가 값을 나르고, 팔레트 슬롯 `--jd-chart-1..7`이 기본값이다
 * (v2의 하드코딩 `["var(--primary)","#22c55e","#f59e0b","#ef4444","#3b82f6",
 * "#a855f7","#ec4899"]`를 토큰으로 의미 번역 — 6·7번은 대응 토큰이 없어 리터럴 승계).
 * 소비자는 `jd-line-chart { --jd-chart-2: … }` 한 줄로 팔레트를 갈아끼운다.
 */
export const CHART_CSS = `
  /*
   * 호스트 기본값은 :where()로 특이도 0에 둔다. 그러지 않으면 [data-jd-chart](0,1,0)가
   * 컴포넌트 자신의 태그 규칙 jd-funnel-chart(0,0,1)를 이겨서, 파생이 display나
   * 팔레트 순서를 못 바꾼다(퍼널이 block·자기 색 순서를 되찾지 못하던 실측 함정).
   */
  :where([data-jd-chart]) {
    --jd-chart-1: var(--jd-color-primary);
    --jd-chart-2: var(--jd-color-success);
    --jd-chart-3: var(--jd-color-warning);
    --jd-chart-4: var(--jd-color-danger);
    --jd-chart-5: var(--jd-color-info);
    --jd-chart-6: #a855f7;
    --jd-chart-7: #ec4899;
    --jd-series-color: var(--jd-chart-1);
    display: inline-flex; align-items: center; gap: var(--jd-space-4);
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }

  .jd-chart__svg { display: block; overflow: visible; }

  /* 축·격자 — v2 stroke="var(--border)" strokeDasharray="2 2" strokeOpacity=.4 */
  .jd-chart__gridline {
    stroke: var(--jd-color-border); stroke-dasharray: 2 2; stroke-opacity: .4;
  }
  .jd-chart__axisline { stroke: var(--jd-color-border); stroke-opacity: .4; }
  .jd-chart__tick {
    font-size: 10px; fill: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }

  /* 시리즈 — 색은 커스텀 프로퍼티 경유(표시 속성에 박지 않는다) */
  .jd-chart__line {
    fill: none; stroke: var(--jd-series-color); stroke-width: 2;
    stroke-linecap: round; stroke-linejoin: round;
  }
  .jd-chart__area {
    fill: var(--jd-series-color);
    fill-opacity: var(--jd-chart-fill-opacity, .15);
    stroke: none;
  }
  .jd-chart__dot { fill: var(--jd-series-color); }
  .jd-chart__bar { fill: var(--jd-series-color); }
  .jd-chart__value {
    font-size: 10px; fill: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }

  /* 범례 — v2 "flex flex-col gap-1 text-xs" */
  .jd-chart__legend { margin: 0; padding: 0; list-style: none; }
  .jd-chart__legend:not([hidden]) {
    display: flex; flex-direction: column; gap: var(--jd-space-1);
    font-size: var(--jd-text-xs);
  }
  .jd-chart__legend-item {
    display: flex; align-items: center; gap: var(--jd-space-2);
  }
  .jd-chart__swatch {
    flex-shrink: 0; width: 10px; height: 10px;
    border-radius: var(--jd-radius-sm); background: var(--jd-series-color);
  }
  .jd-chart__legend-item[data-dot] > .jd-chart__swatch { border-radius: var(--jd-radius-full); }
  .jd-chart__legend-name { color: var(--jd-color-foreground); }
  .jd-chart__legend-value {
    color: var(--jd-color-muted); font-variant-numeric: tabular-nums;
  }

  /*
   * 데이터 표 — 시각적으로만 숨긴다(display:none은 AT에서도 지워진다).
   * v2에서 스크린리더가 들을 수 있던 것은 "라인 차트"라는 이름 하나뿐이었다.
   *
   * 숨김 규칙은 **래퍼**가 쓴다. width:1px를 <table>에 직접 걸면 auto 테이블 레이아웃이
   * 내용 폭까지 늘어나(실측 97×140) 절대배치 상태로 문서 오른쪽 밖으로 나갈 수 있고,
   * display를 바꿔 줄이면 표 역할 자체가 접근성 트리에서 사라진다.
   */
  .jd-chart__data {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
`;
