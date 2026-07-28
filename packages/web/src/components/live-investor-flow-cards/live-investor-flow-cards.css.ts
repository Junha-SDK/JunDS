import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): bm-card p-4, 상단 라벨(muted 12.5px bold) + 방향 배지, 값 22px extrabold
 * 착색, note 11px muted, spark 220x42(area .15 + line 1.5). 호스트는 display:contents로
 * 카드가 부모 그리드 아이템이 되게(v2 프래그먼트 등가). finance 색 --bm-* → jd 폴백.
 * 반픽셀·비계단 글자 크기(12.5·10·22px)는 토큰 계단으로 올렸다 — 11px이 읽기의 바닥이고
 * (§9) 계단 밖 값은 밀도 전환을 따라오지 못한다.
 */
export default css`
  @layer junds.components {
    /* 등락색은 --jd-finance-up/down 훅을 **반드시 경유**한다(§8). 앱이 한국 관례
     (적상승·청하락)로 뒤집을 때 이 한 컴포넌트만 훅을 비껴가면 한 화면 안에서
     등락색이 갈라진다. --bm-*은 v2 앱이 이미 쓰던 우선 덮개라 앞에 남긴다. */
    jd-live-investor-flow-cards {
      display: contents;
      --jd-fin-up: var(--bm-up, var(--jd-finance-up, var(--jd-color-success)));
      --jd-fin-down: var(--bm-down, var(--jd-finance-down, var(--jd-color-danger)));
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
    }

    jd-live-investor-flow-cards .jd-live-investor-flow-cards__card {
      box-sizing: border-box;
      /* 부모 격자의 칸이 좁아도 카드가 칸을 밀어내지 않게(§5) */
      min-width: 0;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-2xl);
      /* 면만 있는 카드는 색종이로 읽힌다 — 위에서 받는 빛을 함께 준다(§2) */
      box-shadow: var(--jd-shadow-xs);
      padding: var(--jd-space-4);
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
    }
    jd-live-investor-flow-cards .jd-live-investor-flow-cards__card * {
      box-sizing: border-box;
    }
    jd-live-investor-flow-cards .jd-live-investor-flow-cards__card[data-dir="up"] {
      --jd-ifc-dir: var(--jd-fin-up);
    }
    jd-live-investor-flow-cards .jd-live-investor-flow-cards__card[data-dir="down"] {
      --jd-ifc-dir: var(--jd-fin-down);
    }

    jd-live-investor-flow-cards .jd-live-investor-flow-cards__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    /* 투자자 구분("외국인")은 접히지 않는다 — 두 줄이 되면 카드끼리 값 위치가 어긋난다 */
    jd-live-investor-flow-cards .jd-live-investor-flow-cards__label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-fin-muted);
    }
    jd-live-investor-flow-cards .jd-live-investor-flow-cards__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      /* 10px은 읽기의 바닥(11px, §9) 아래였다 */
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-none);
      padding: var(--jd-space-0-5) var(--jd-space-1-5);
      border-radius: var(--jd-radius-full);
      /* 틴트 위 글리프: 원색 그대로면 pale 틴트에서 대비 부족 → foreground로 65% 혼합(§ 대비) */
      color: color-mix(in srgb, var(--jd-ifc-dir, var(--jd-fin-muted)) 65%, var(--jd-fin-text));
      background: color-mix(in srgb, var(--jd-ifc-dir, var(--jd-fin-muted)) 12%, transparent);
    }

    /* 수치와 단위는 한 덩어리다 — "+1,840"과 "억"이 갈라지면 다른 수로 읽힌다(§5) */
    jd-live-investor-flow-cards .jd-live-investor-flow-cards__value {
      margin-block-start: var(--jd-space-1-5);
      font-size: var(--jd-text-3xl);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-tight);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--jd-ifc-dir, var(--jd-fin-text));
    }
    jd-live-investor-flow-cards .jd-live-investor-flow-cards__note {
      font-size: var(--jd-text-2xs);
      color: var(--jd-fin-muted);
      word-break: keep-all;
      overflow-wrap: break-word;
    }

    jd-live-investor-flow-cards .jd-live-investor-flow-cards__spark {
      display: block;
      max-width: 100%; /* 차트는 카드 폭 안에서 끝난다(§6) */
      margin-block-start: var(--jd-space-2);
    }
    jd-live-investor-flow-cards .jd-live-investor-flow-cards__spark-area {
      fill: var(--jd-ifc-dir, var(--jd-fin-muted));
      fill-opacity: 0.15;
      stroke: none;
    }
    jd-live-investor-flow-cards .jd-live-investor-flow-cards__spark-line {
      fill: none;
      stroke: var(--jd-ifc-dir, var(--jd-fin-muted));
      stroke-width: 1.5;
    }
  }
`;
