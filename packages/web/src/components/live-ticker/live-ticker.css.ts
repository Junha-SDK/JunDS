import { css } from "../../core/styles.js";

/**
 * v2 값: 카드 크롬(bm-card + border), 왼쪽 배지 컬럼(그라디언트 페이드 + 우측 보더),
 * 항목 12px extrabold, 이름 --bm-text, 가격/등락 up→--bm-up·down→--bm-down, 거래대금
 * 10.5px --bm-muted. 흐름·정지는 jd-marquee.
 *
 * 등락색 통로: --jd-finance-* → --bm-* → 의미색. 앱이 한국 관례를 켤 때 덮어쓰는 건
 * --jd-finance-* 하나이므로 사슬 맨 앞에 둔다 — 직접 칠하면 이 띠만 override를 비껴간다.
 *
 * 오른쪽 끝은 마스크로 흐린다. 띠는 왼쪽 배지에서 시작해 오른쪽으로 흘러 나가는데,
 * 잘린 단면으로 끝나면 "여기서 끝"으로 읽힌다 — 페이드는 "더 있다"는 신호다(§6).
 * 왼쪽은 배지의 그라디언트가 이미 같은 일을 하고 있어 오른쪽만 준다.
 */
export default css`
  @layer junds.components {
    jd-live-ticker {
      --jd-fin-up: var(--jd-finance-up, var(--bm-up, var(--jd-color-success)));
      --jd-fin-down: var(--jd-finance-down, var(--bm-down, var(--jd-color-danger)));
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));
      --jd-fin-card: var(--bm-card, var(--jd-color-card));

      display: flex;
      align-items: stretch;
      overflow: hidden;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-lg);
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
    }
    jd-live-ticker * {
      box-sizing: border-box;
    }

    .jd-lt__badge {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      flex-shrink: 0;
      z-index: 1;
      padding-inline: var(--jd-space-3);
      background: linear-gradient(90deg, var(--jd-fin-card) 80%, transparent);
      border-inline-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-lt__dot {
      flex-shrink: 0;
    }
    .jd-lt__caption {
      font-size: 10.5px;
      font-weight: 800;
      white-space: nowrap;
      color: var(--jd-fin-muted);
      font-variant-numeric: tabular-nums;
    }

    .jd-lt__stage {
      position: relative;
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      /* 오른쪽 24px을 투명으로 녹여 항목이 잘린 단면이 아니라 흘러 나가는 것으로 읽히게 */
      mask-image: linear-gradient(90deg, #000 0 calc(100% - 24px), transparent);
    }
    .jd-lt__marquee {
      display: block;
      padding-block: var(--jd-space-2);
    }

    .jd-lt__item {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      font-size: 12px;
      white-space: nowrap;
    }
    .jd-lt__name {
      font-weight: 800;
      color: var(--jd-fin-text);
    }
    .jd-lt__price,
    .jd-lt__pct {
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .jd-lt__price[data-dir="up"],
    .jd-lt__pct[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-lt__price[data-dir="down"],
    .jd-lt__pct[data-dir="down"] {
      color: var(--jd-fin-down);
    }
    /* 거래대금도 숫자+단위 한 덩어리(1,840 + 억) — 항목 안에서 갈리면 안 된다(§5) */
    .jd-lt__vol {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--jd-fin-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
  }
`;
