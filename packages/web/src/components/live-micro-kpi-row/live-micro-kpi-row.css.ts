import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): bm-card overflow-hidden, px-3 py-2.5, 라벨 10.5px bold muted,
 * 값 16px extrabold(단위 10.5px semibold), 보조 라인 10px bold 착색. 호스트는
 * display:contents로 셀이 부모 그리드 아이템이 되게(v2 프래그먼트 등가).
 *
 * 등락색 통로: --jd-finance-* → --bm-* → 의미색. 앱이 한국 관례를 켤 때 덮어쓰는 건
 * --jd-finance-* 하나이므로 사슬 맨 앞에 둔다 — 직접 칠하면 이 행만 override를 비껴간다.
 * --jd-fin-muted는 라벨처럼 방향 없는 글자도 쓰므로 훅을 걸지 않고, 보합은 --jd-fin-flat.
 */
export default css`
  @layer junds.components {
    jd-live-micro-kpi-row {
      display: contents;
      --jd-fin-up: var(--jd-finance-up, var(--bm-up, var(--jd-color-success)));
      --jd-fin-down: var(--jd-finance-down, var(--bm-down, var(--jd-color-danger)));
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-flat: var(--jd-finance-flat, var(--jd-fin-muted));
      --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
    }

    jd-live-micro-kpi-row .jd-live-micro-kpi-row__cell {
      box-sizing: border-box;
      overflow: hidden;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-2xl);
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
    }
    jd-live-micro-kpi-row .jd-live-micro-kpi-row__cell * {
      box-sizing: border-box;
    }
    jd-live-micro-kpi-row .jd-live-micro-kpi-row__cell[data-dir="up"] {
      --jd-mkr-dir: var(--jd-fin-up);
    }
    jd-live-micro-kpi-row .jd-live-micro-kpi-row__cell[data-dir="down"] {
      --jd-mkr-dir: var(--jd-fin-down);
    }

    jd-live-micro-kpi-row .jd-live-micro-kpi-row__inner {
      padding: var(--jd-space-2-5) var(--jd-space-3);
    }
    jd-live-micro-kpi-row .jd-live-micro-kpi-row__label {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--jd-fin-muted);
    }
    /* 값과 단위(1,840 + 억)는 한 덩어리 — 좁은 셀에서 단위만 다음 줄로 떨어지면
     숫자가 미완성으로 읽힌다(§5) */
    jd-live-micro-kpi-row .jd-live-micro-kpi-row__value {
      font-size: 16px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--jd-fin-text);
    }
    jd-live-micro-kpi-row .jd-live-micro-kpi-row__unit {
      margin-inline-start: 2px;
      font-size: 10.5px;
      font-weight: 600;
    }
    jd-live-micro-kpi-row .jd-live-micro-kpi-row__sub {
      margin-block-start: 2px;
      font-size: 10px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--jd-mkr-dir, var(--jd-fin-flat));
    }
  }
`;
