import { css } from "../../core/styles.js";

/**
 * v2 값: 두 bm-card-lg 세로 스택(space-y-5), 설정 그리드 1/3칸, 컨트롤 h40 rounded-lg soft 배경,
 * 기간 버튼 active=accent/#fff, 결과 stat 그리드 2/4칸(gap:1px border), 자산곡선 SVG(전략=accent
 * 2.2 / 매수보유=muted 점선), 의견분포 칩. finance 색 --bm-* → jd 폴백.
 */
export default css`
  @layer junds.components {
    jd-backtest-runner {
      /* 등락색은 직접 칠하지 않는다(§8). 앱이 한국 관례(적상승·청하락)로 뒤집을 때
       거치는 정본 훅은 --jd-finance-* 다 — --bm-* 는 v2 앱이 쓰던 이름이라 앞에
       남겨 두되, 그것이 없으면 반드시 정본 훅을 경유해 기본값에 닿는다. 이 사슬을
       건너뛰고 --jd-color-danger를 상승에 박으면 앱의 override가 이 컴포넌트만
       비껴가 한 화면에서 등락색이 갈라진다. */
      --jd-fin-up: var(--bm-up, var(--jd-finance-up, var(--jd-color-success)));
      --jd-fin-down: var(--bm-down, var(--jd-finance-down, var(--jd-color-danger)));
      --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
      --jd-fin-soft: var(
        --bm-soft-100,
        color-mix(in srgb, var(--jd-color-foreground) 6%, transparent)
      );

      display: flex;
      flex-direction: column;
      gap: var(--jd-space-5);
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
    }
    jd-backtest-runner * {
      box-sizing: border-box;
    }

    jd-backtest-runner .jd-backtest-runner__card {
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-2xl);
      overflow: hidden;
      box-shadow: var(--jd-shadow-sm);
    }
    jd-backtest-runner .jd-backtest-runner__settings {
      padding: var(--jd-space-5);
    }

    /* 설정 헤더 */
    jd-backtest-runner .jd-backtest-runner__settings-head {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      margin-block-end: var(--jd-space-3);
    }
    jd-backtest-runner .jd-backtest-runner__spark-icon {
      color: var(--jd-fin-accent);
    }
    jd-backtest-runner .jd-backtest-runner__settings-title {
      font-size: var(--jd-text-sm);
      font-weight: 800;
      letter-spacing: var(--jd-tracking-tight);
    }

    /* 그리드 */
    jd-backtest-runner .jd-backtest-runner__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--jd-space-3);
    }
    @media (min-width: 768px) {
      jd-backtest-runner .jd-backtest-runner__grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    jd-backtest-runner .jd-backtest-runner__field {
      min-width: 0;
    }
    jd-backtest-runner .jd-backtest-runner__symbol-field {
      position: relative;
    }
    jd-backtest-runner .jd-backtest-runner__label {
      display: block;
      margin-block-end: var(--jd-space-1-5);
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      letter-spacing: var(--jd-tracking-wide);
      text-transform: uppercase;
      color: var(--jd-fin-muted);
    }
    jd-backtest-runner .jd-backtest-runner__control {
      width: 100%;
      min-width: 0; /* 긴 거장 이름이 1/3 칸을 밀어내지 않게(§5) */
      height: 40px;
      padding: 0 var(--jd-space-3);
      border-radius: var(--jd-radius-lg);
      font: inherit;
      font-size: var(--jd-text-sm);
      font-weight: 700;
      text-overflow: ellipsis;
      color: var(--jd-fin-text);
      background: var(--jd-fin-soft);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    /* select는 목록이 비어 있어도 눌리는 것이다 — 커서와 호버로 그렇게 보이게 한다(§7).
     네이티브 화살표는 그대로 둔다: appearance를 끄면 우리가 화살표를 다시 그려야 하고
     그 순간 OS별 접근성 동작(키보드 열기·타이핑 점프)까지 우리 책임이 된다. */
    jd-backtest-runner select.jd-backtest-runner__control {
      cursor: pointer;
    }
    jd-backtest-runner .jd-backtest-runner__control:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--jd-fin-accent) 40%, var(--jd-fin-border));
    }
    /* outline: none + box-shadow 조합은 링이 border-radius를 따라가지 않는다.
     라이브러리 단일 레시피(base.css --jd-focus-ring)를 그대로 쓴다. */
    jd-backtest-runner .jd-backtest-runner__control:focus-visible {
      border-color: var(--jd-fin-accent);
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    /* 서제스트 */
    jd-backtest-runner .jd-backtest-runner__suggest {
      position: absolute;
      z-index: var(--jd-z-dropdown);
      inset-inline: 0;
      inset-block-start: calc(100% + var(--jd-space-1));
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 240px;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-lg);
      box-shadow: var(--jd-shadow-lg);
    }
    jd-backtest-runner .jd-backtest-runner__suggest-item {
      display: block;
      width: 100%;
      text-align: start;
      cursor: pointer;
      padding: var(--jd-space-2) var(--jd-space-3);
      font: inherit;
      font-size: var(--jd-text-sm);
      font-weight: 700;
      color: var(--jd-fin-text);
      background: none;
      border: 0;
    }
    jd-backtest-runner .jd-backtest-runner__suggest-item:hover {
      background: var(--jd-fin-soft);
    }
    jd-backtest-runner .jd-backtest-runner__suggest-item:active {
      background: color-mix(in srgb, var(--jd-fin-accent) 14%, transparent);
    }
    jd-backtest-runner .jd-backtest-runner__suggest-item:focus-visible {
      background: var(--jd-fin-soft);
      outline: var(--jd-focus-ring);
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
    }
    jd-backtest-runner .jd-backtest-runner__suggest-sector {
      margin-inline-start: var(--jd-space-2);
      font-size: var(--jd-text-2xs);
      font-weight: 400;
      color: var(--jd-fin-muted);
    }

    /* 기간 버튼 — 4칩이 1/3 칸에 들어가지 못하면 v2는 **오른쪽에서 그냥 잘렸다**.
     칩 행은 부모 폭 안에서 끝나거나 스스로 굴러야 한다(§6).
     오른쪽 끝의 페이드가 "더 있다"를 알리는데, 페이드가 마지막 칩을 갉지 않도록
     같은 폭의 뒷여백을 둔다 — 칩은 그 앞에서 멈추고, 끝까지 굴리면 페이드 밑에
     여백만 남아 아무것도 흐려지지 않는다. */
    jd-backtest-runner .jd-backtest-runner__ranges {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      padding-inline-end: var(--jd-space-4);
      -webkit-mask-image: linear-gradient(
        90deg,
        #000 0 calc(100% - var(--jd-space-4)),
        transparent 100%
      );
      mask-image: linear-gradient(90deg, #000 0 calc(100% - var(--jd-space-4)), transparent 100%);
    }
    jd-backtest-runner .jd-backtest-runner__range {
      /* 남는 폭은 나눠 갖되(1) 좁아도 글자 밑으로는 줄지 않는다(0) — 줄어들면
       "60일"이 한 글자씩 세로로 선다(§5) */
      flex: 1 0 auto;
      height: 40px;
      padding-inline: var(--jd-space-3);
      border-radius: var(--jd-radius-lg);
      font: inherit;
      font-size: var(--jd-text-sm);
      font-weight: 800;
      white-space: nowrap;
      cursor: pointer;
      background: var(--jd-fin-soft);
      color: var(--jd-fin-text);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    jd-backtest-runner .jd-backtest-runner__range:hover:not([data-active="true"]) {
      background: color-mix(in srgb, var(--jd-fin-accent) 10%, transparent);
      border-color: color-mix(in srgb, var(--jd-fin-accent) 40%, transparent);
    }
    /* 눌린 면은 빛을 잃는다(§1) */
    jd-backtest-runner .jd-backtest-runner__range:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    jd-backtest-runner .jd-backtest-runner__range[data-active="true"] {
      background: var(--jd-fin-accent);
      color: #fff;
      border-color: var(--jd-fin-accent);
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    jd-backtest-runner .jd-backtest-runner__range:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    /* 결과 헤더 */
    jd-backtest-runner .jd-backtest-runner__results-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-3);
      padding: var(--jd-space-3-5) var(--jd-space-5);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    jd-backtest-runner .jd-backtest-runner__results-title {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      font-size: var(--jd-text-md);
      font-weight: 800;
      letter-spacing: var(--jd-tracking-tight);
    }
    jd-backtest-runner .jd-backtest-runner__head-emoji {
      font-size: 16px;
      line-height: var(--jd-leading-none);
    }
    jd-backtest-runner .jd-backtest-runner__results-note {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      letter-spacing: var(--jd-tracking-wide);
      text-transform: uppercase;
      color: var(--jd-fin-muted);
      white-space: nowrap;
    }

    /* 스탯 그리드 */
    jd-backtest-runner .jd-backtest-runner__stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--jd-border-thin);
      background: var(--jd-fin-border);
    }
    @media (min-width: 768px) {
      jd-backtest-runner .jd-backtest-runner__stat-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    jd-backtest-runner .jd-backtest-runner__stat {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1);
      padding: var(--jd-space-3) var(--jd-space-4);
      background: var(--jd-fin-card);
    }
    jd-backtest-runner .jd-backtest-runner__stat-label {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      letter-spacing: var(--jd-tracking-wide);
      text-transform: uppercase;
      color: var(--jd-fin-muted);
    }
    jd-backtest-runner .jd-backtest-runner__stat-value {
      font-size: var(--jd-text-lg);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
    }
    jd-backtest-runner .jd-backtest-runner__stat-value[data-tone="up"] {
      color: var(--jd-fin-up);
    }
    jd-backtest-runner .jd-backtest-runner__stat-value[data-tone="down"] {
      color: var(--jd-fin-down);
    }

    /* 자산곡선 */
    jd-backtest-runner .jd-backtest-runner__chart {
      padding: var(--jd-space-4);
    }
    jd-backtest-runner .jd-backtest-runner__equity {
      display: block;
      width: 100%;
      height: auto;
    }
    jd-backtest-runner .jd-backtest-runner__baseline {
      stroke: var(--jd-fin-border);
    }
    jd-backtest-runner .jd-backtest-runner__axis {
      fill: var(--jd-fin-muted);
    }
    jd-backtest-runner .jd-backtest-runner__line-eq {
      stroke: var(--jd-fin-accent);
    }
    jd-backtest-runner .jd-backtest-runner__line-bh {
      stroke: var(--jd-fin-muted);
    }
    jd-backtest-runner .jd-backtest-runner__legend-box {
      fill: var(--jd-fin-card);
      stroke: var(--jd-fin-border);
    }
    jd-backtest-runner .jd-backtest-runner__legend-eq {
      fill: var(--jd-fin-text);
    }
    jd-backtest-runner .jd-backtest-runner__legend-bh {
      fill: var(--jd-fin-muted);
    }

    /* 의견 분포 */
    jd-backtest-runner .jd-backtest-runner__histogram {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      flex-wrap: wrap;
      padding: var(--jd-space-3) var(--jd-space-4);
      border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    jd-backtest-runner .jd-backtest-runner__histogram-label {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      letter-spacing: var(--jd-tracking-wide);
      text-transform: uppercase;
      color: var(--jd-fin-muted);
    }
    jd-backtest-runner .jd-backtest-runner__verdict {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    jd-backtest-runner .jd-backtest-runner__verdict-name {
      color: var(--jd-fin-muted);
    }
    jd-backtest-runner .jd-backtest-runner__verdict-count[data-tone="up"] {
      color: var(--jd-fin-up);
    }
    jd-backtest-runner .jd-backtest-runner__verdict-count[data-tone="down"] {
      color: var(--jd-fin-down);
    }
    jd-backtest-runner .jd-backtest-runner__verdict-count[data-tone="flat"] {
      color: var(--jd-fin-text);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-backtest-runner .jd-backtest-runner__control,
      jd-backtest-runner .jd-backtest-runner__range {
        transition: none;
      }
    }
  }
`;
