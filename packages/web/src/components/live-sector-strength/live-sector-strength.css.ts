import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): bm-card overflow-hidden, 헤더 px-4 py-2.5 + 하단 보더(타이틀 13px
 * extrabold, 캡션 10.5px bold muted), 행 px-4 py-2 + 상단 보더(첫 행 제외), 랭크 10.5px
 * extrabold muted w-4, 이름 12.5px bold truncate, 강도 트랙 50x1.5 라운드,
 * pct 12px extrabold 착색 min-w 52 우정렬.
 *
 * 등락색 통로: --jd-finance-* → --bm-* → 의미색. 앱이 한국 관례를 켤 때 덮어쓰는 건
 * --jd-finance-* 하나이므로 사슬 맨 앞에 둔다. 강도 막대도 v2가 JS에서 hsl 적/청을
 * 직접 칠하던 것을 걷어내고 같은 훅에서 color-mix로 뽑는다 — 막대와 등락률 글자가
 * 서로 다른 색 체계로 갈리지 않게. 강도(0~1)는 element가 --jd-lss-t로 실어 준다.
 * --jd-fin-muted는 캡션·순위처럼 방향 없는 글자도 쓰므로 훅을 걸지 않는다.
 */
export default css`
  @layer junds.components {
    jd-live-sector-strength {
      --jd-fin-up: var(--jd-finance-up, var(--bm-up, var(--jd-color-success)));
      --jd-fin-down: var(--jd-finance-down, var(--bm-down, var(--jd-color-danger)));
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-flat: var(--jd-finance-flat, var(--jd-fin-muted));
      --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
      --jd-fin-soft: var(
        --bm-soft-100,
        color-mix(in srgb, var(--jd-color-foreground) 6%, transparent)
      );

      display: block;
      box-sizing: border-box;
      overflow: hidden;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-2xl);
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
    }
    jd-live-sector-strength * {
      box-sizing: border-box;
    }
    jd-live-sector-strength .jd-live-sector-strength__row[data-dir="up"] {
      --jd-lss-dir: var(--jd-fin-up);
    }
    jd-live-sector-strength .jd-live-sector-strength__row[data-dir="down"] {
      --jd-lss-dir: var(--jd-fin-down);
    }

    jd-live-sector-strength .jd-live-sector-strength__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--jd-space-2-5) var(--jd-space-4);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    jd-live-sector-strength .jd-live-sector-strength__title {
      font-size: 13px;
      font-weight: 800;
      color: var(--jd-fin-text);
    }
    jd-live-sector-strength .jd-live-sector-strength__caption {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--jd-fin-muted);
    }

    jd-live-sector-strength .jd-live-sector-strength__list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    jd-live-sector-strength .jd-live-sector-strength__row {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-4);
      border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    jd-live-sector-strength .jd-live-sector-strength__row:first-child {
      border-block-start: none;
    }

    jd-live-sector-strength .jd-live-sector-strength__rank {
      flex-shrink: 0;
      width: 16px;
      font-size: 10.5px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-muted);
    }
    jd-live-sector-strength .jd-live-sector-strength__name {
      flex: 1;
      min-width: 0;
      font: inherit;
      font-size: 12.5px;
      font-weight: 700;
      text-align: start;
      color: var(--jd-fin-text);
      text-decoration: none;
      background: none;
      border: 0;
      padding: 0;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    jd-live-sector-strength a.jd-live-sector-strength__name:hover,
    jd-live-sector-strength button.jd-live-sector-strength__name:hover {
      text-decoration: underline;
    }
    jd-live-sector-strength .jd-live-sector-strength__name:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
      border-radius: var(--jd-radius-sm);
    }

    jd-live-sector-strength .jd-live-sector-strength__track {
      flex-shrink: 0;
      width: 50px;
      height: 6px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-fin-soft);
      overflow: hidden;
    }
    /* 강도가 낮아도 막대가 사라지지 않게 하한 46% — 위쪽은 방향색 원색까지 간다 */
    jd-live-sector-strength .jd-live-sector-strength__fill {
      height: 100%;
      border-radius: var(--jd-radius-full);
      background: color-mix(
        in srgb,
        var(--jd-lss-dir, var(--jd-fin-flat)) calc(46% + 54% * var(--jd-lss-t, 1)),
        transparent
      );
    }

    jd-live-sector-strength .jd-live-sector-strength__pct {
      min-width: 52px;
      text-align: end;
      font-size: 12px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--jd-lss-dir, var(--jd-fin-flat));
      white-space: nowrap;
    }
  }
`;
