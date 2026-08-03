import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): section grid-cols-1 lg:[1fr_2fr_1fr] gap-3 mb-4, 각 패널 bm-card
 * overflow-hidden(헤더 px-4 py-2.5 + 하단 보더, 본문 px-4 py-3). 분위기: 점수 28px
 * extrabold 착색 + /100, 게이지 h2(down→accent→up 그라디언트), 가중 muted.
 * 폭: 카운트 extrabold(up/down/flat) + 가중 착색 ml-auto, breadth h2 3분할.
 *
 * 1:2:1 강조는 뷰포트 미디어 질의로 잡을 수 없다 — 뷰포트가 넓어도 이 컴포넌트가 좁은
 * 자리에 놓이면 세 패널이 눌려 "시장 분위기"가 한 글자씩 세로로 섰다. 트랙은 내재적
 * auto-fit으로 깔고, **자기 폭**이 충분할 때만 가운데 패널을 2칸으로 넓혀 v2 비율을 되찾는다.
 */
export default css`
  @layer junds.components {
    jd-live-market-stats {
      /* 등락색은 직접 칠하지 않고 앱이 1회 덮어쓰는 훅을 경유한다 — 직접 칠하면 한국 관례
       override가 이 컴포넌트만 비껴가 한 화면에서 등락색이 갈라진다. */
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
      --jd-fin-accent: var(--bm-accent, var(--jd-color-primary));
      --jd-fin-accent-strong: var(--bm-accent-strong, var(--jd-color-primary));
      --jd-fin-soft: var(
        --bm-soft-100,
        color-mix(in srgb, var(--jd-color-foreground) 6%, transparent)
      );

      display: grid;
      /* min(100%, …)이 없으면 호스트가 13rem보다 좁을 때 트랙이 호스트를 밀어낸다 */
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
      gap: var(--jd-space-3);
      margin-block-end: var(--jd-space-4);
      box-sizing: border-box;
      /* inline-size 컨테이너는 **내용이 폭을 정하지 못한다**. 부모가 준 폭을 명시적으로
         받지 않으면 flex·inline 문맥에서 호스트가 0으로 접혀 카드가 통째로 사라진다(실측). */
      width: 100%;
      container: jd-lms / inline-size;
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
    }
    jd-live-market-stats * {
      box-sizing: border-box;
    }
    /* 56rem이면 auto-fit이 4트랙을 깐다 — 가운데를 2칸 주면 1:2:1(v2 lg 레이아웃)이 된다.
     남는 트랙은 auto-fit이 스스로 접으므로 더 넓어져도 비율은 그대로다. */
    @container jd-lms (min-width: 56rem) {
      jd-live-market-stats .jd-live-market-stats__panel:nth-child(2) {
        grid-column: span 2;
      }
    }
    jd-live-market-stats[data-sentiment="up"] {
      --jd-lms-sent: var(--jd-fin-up);
    }
    jd-live-market-stats[data-sentiment="neutral"] {
      --jd-lms-sent: var(--jd-fin-muted);
    }
    jd-live-market-stats[data-sentiment="down"] {
      --jd-lms-sent: var(--jd-fin-down);
    }
    jd-live-market-stats[data-wavg="up"] {
      --jd-lms-wavg: var(--jd-fin-up);
    }
    jd-live-market-stats[data-wavg="down"] {
      --jd-lms-wavg: var(--jd-fin-down);
    }

    jd-live-market-stats .jd-live-market-stats__panel {
      /* 그리드 자식의 기본 min-width는 auto라 내용이 칸을 밀어낸다 — 밀린 칸이 세로 글자를 만든다 */
      min-width: 0;
      overflow: hidden;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-2xl);
      /* 채움만 있는 면은 색종이로 읽힌다 — 얕은 그림자로 면을 띄운다 */
      box-shadow: var(--jd-shadow-xs);
    }
    /* 좁아지면 제목과 배지를 **줄로 접는다** — 글자를 세로로 세우지 않는다 */
    jd-live-market-stats .jd-live-market-stats__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--jd-space-1) var(--jd-space-2);
      min-width: 0;
      padding: var(--jd-space-2-5) var(--jd-space-4);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    jd-live-market-stats .jd-live-market-stats__title {
      font-size: 13px;
      font-weight: 800;
      white-space: nowrap;
      color: var(--jd-fin-text);
    }
    jd-live-market-stats .jd-live-market-stats__meta {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
    }
    jd-live-market-stats .jd-live-market-stats__pill {
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      white-space: nowrap;
      padding: 2px var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      /* 틴트 위 라벨: 원색 그대로면 pale 틴트에서 대비 부족 → foreground로 65% 혼합(§ 대비) */
      color: color-mix(in srgb, var(--jd-lms-sent, var(--jd-fin-muted)) 65%, var(--jd-fin-text));
      background: color-mix(in srgb, var(--jd-lms-sent, var(--jd-fin-muted)) 12%, transparent);
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    jd-live-market-stats .jd-live-market-stats__nxt {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      border-radius: var(--jd-radius-sm);
      text-decoration: none;
      color: var(--jd-fin-accent-strong);
    }
    jd-live-market-stats .jd-live-market-stats__nxt:hover {
      text-decoration: underline;
    }
    /* 키보드로 온 사람에게도 여기가 어디인지 보여야 한다 */
    jd-live-market-stats .jd-live-market-stats__nxt:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    jd-live-market-stats .jd-live-market-stats__body {
      padding: var(--jd-space-3) var(--jd-space-4);
    }

    /* 분위기 */
    jd-live-market-stats .jd-live-market-stats__score-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    jd-live-market-stats .jd-live-market-stats__score {
      font-size: 28px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      color: var(--jd-lms-sent, var(--jd-fin-muted));
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    jd-live-market-stats .jd-live-market-stats__out-of {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
    }
    jd-live-market-stats .jd-live-market-stats__gauge {
      margin-block-start: var(--jd-space-2);
      height: 8px;
      overflow: hidden;
      border-radius: var(--jd-radius-full);
      background: var(--jd-fin-soft);
    }
    jd-live-market-stats .jd-live-market-stats__gauge-fill {
      height: 100%;
      border-radius: var(--jd-radius-full);
      background: linear-gradient(
        90deg,
        var(--jd-fin-down) 0%,
        var(--jd-fin-accent) 50%,
        var(--jd-fin-up) 100%
      );
    }
    jd-live-market-stats .jd-live-market-stats__scale {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-1);
      margin-block-start: var(--jd-space-1-5);
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      color: var(--jd-fin-muted);
    }
    /* "약세 0" 같은 눈금은 낱말과 숫자가 한 덩어리다 — 접히면 눈금이 아니라 낙서가 된다 */
    jd-live-market-stats .jd-live-market-stats__scale > * {
      white-space: nowrap;
    }
    jd-live-market-stats .jd-live-market-stats__wavg-a {
      margin-block-start: var(--jd-space-1-5);
      font-size: var(--jd-text-2xs);
      white-space: nowrap;
      color: var(--jd-fin-muted);
    }

    /* 폭 */
    jd-live-market-stats .jd-live-market-stats__counts {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--jd-space-1) var(--jd-space-3);
      min-width: 0;
      font-size: 14px;
      font-weight: 800;
      margin-block-end: var(--jd-space-2);
    }
    /* "↑ 128"은 기호와 수가 한 덩어리다 */
    jd-live-market-stats .jd-live-market-stats__counts > * {
      white-space: nowrap;
    }
    jd-live-market-stats .jd-live-market-stats__count-up {
      color: var(--jd-fin-up);
    }
    jd-live-market-stats .jd-live-market-stats__count-down {
      color: var(--jd-fin-down);
    }
    jd-live-market-stats .jd-live-market-stats__count-flat {
      color: var(--jd-fin-muted);
    }
    jd-live-market-stats .jd-live-market-stats__wavg-b {
      margin-inline-start: auto;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      color: var(--jd-lms-wavg, var(--jd-fin-muted));
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    jd-live-market-stats .jd-live-market-stats__breadth {
      display: flex;
      height: 8px;
      overflow: hidden;
      border-radius: var(--jd-radius-full);
      background: var(--jd-fin-soft);
    }
    jd-live-market-stats .jd-live-market-stats__breadth-up {
      background: var(--jd-fin-up);
    }
    jd-live-market-stats .jd-live-market-stats__breadth-flat {
      background: var(--jd-fin-muted);
    }
    jd-live-market-stats .jd-live-market-stats__breadth-down {
      background: var(--jd-fin-down);
    }

    /* 거래대금 */
    /* "1.84" + "조"는 한 덩어리 — 접히면 단위만 다음 줄에 남는다 */
    jd-live-market-stats .jd-live-market-stats__turnover {
      font-size: 20px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
    }
    jd-live-market-stats .jd-live-market-stats__split {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--jd-space-1) var(--jd-space-2);
      margin-block-start: var(--jd-space-1-5);
      font-size: var(--jd-text-2xs);
      color: var(--jd-fin-muted);
    }
    jd-live-market-stats .jd-live-market-stats__split > * {
      white-space: nowrap;
    }

    @media (prefers-reduced-motion: reduce) {
      jd-live-market-stats .jd-live-market-stats__pill,
      jd-live-market-stats .jd-live-market-stats__score,
      jd-live-market-stats .jd-live-market-stats__wavg-b {
        transition: none;
      }
    }
  }
`;
