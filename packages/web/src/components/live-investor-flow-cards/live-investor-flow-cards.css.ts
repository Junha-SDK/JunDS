import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): bm-card p-4, 상단 라벨(muted 12.5px bold) + 방향 배지, 값 22px extrabold
 * 착색, note 11px muted, spark 220x42(area .15 + line 1.5). 호스트는 display:contents로
 * 카드가 부모 그리드 아이템이 되게(v2 프래그먼트 등가). finance 색 --bm-* → jd 폴백.
 */
export default css`
@layer junds.components {
  jd-live-investor-flow-cards {
    display: contents;
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
  }

  jd-live-investor-flow-cards .jd-live-investor-flow-cards__card {
    box-sizing: border-box;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl);
    padding: var(--jd-space-4);
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-live-investor-flow-cards .jd-live-investor-flow-cards__card * { box-sizing: border-box; }
  jd-live-investor-flow-cards .jd-live-investor-flow-cards__card[data-dir="up"] { --jd-ifc-dir: var(--jd-fin-up); }
  jd-live-investor-flow-cards .jd-live-investor-flow-cards__card[data-dir="down"] { --jd-ifc-dir: var(--jd-fin-down); }

  jd-live-investor-flow-cards .jd-live-investor-flow-cards__top {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
  }
  jd-live-investor-flow-cards .jd-live-investor-flow-cards__label {
    font-size: 12.5px; font-weight: 700; color: var(--jd-fin-muted);
  }
  jd-live-investor-flow-cards .jd-live-investor-flow-cards__badge {
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800; line-height: var(--jd-leading-none);
    padding: 2px var(--jd-space-1-5); border-radius: var(--jd-radius-full);
    /* 틴트 위 글리프: 원색 그대로면 pale 틴트에서 대비 부족 → foreground로 65% 혼합(§ 대비) */
    color: color-mix(in srgb, var(--jd-ifc-dir, var(--jd-fin-muted)) 65%, var(--jd-fin-text));
    background: color-mix(in srgb, var(--jd-ifc-dir, var(--jd-fin-muted)) 12%, transparent);
  }

  jd-live-investor-flow-cards .jd-live-investor-flow-cards__value {
    margin-block-start: var(--jd-space-1-5);
    font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums;
    color: var(--jd-ifc-dir, var(--jd-fin-text));
  }
  jd-live-investor-flow-cards .jd-live-investor-flow-cards__note {
    font-size: 11px; color: var(--jd-fin-muted);
  }

  jd-live-investor-flow-cards .jd-live-investor-flow-cards__spark {
    display: block; margin-block-start: var(--jd-space-2);
  }
  jd-live-investor-flow-cards .jd-live-investor-flow-cards__spark-area {
    fill: var(--jd-ifc-dir, var(--jd-fin-muted)); fill-opacity: 0.15; stroke: none;
  }
  jd-live-investor-flow-cards .jd-live-investor-flow-cards__spark-line {
    fill: none; stroke: var(--jd-ifc-dir, var(--jd-fin-muted)); stroke-width: 1.5;
  }
}`;
