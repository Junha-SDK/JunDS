/**
 * jd-exif-panel CSS — v2 composites/ExifPanel 토큰 번역.
 * 골격은 jd-descriptions 소유(`.jd-descriptions__box|list|item|label|value`)이고
 * 여기서는 **치수·색만** 재정의한다(jd-drawer가 `.jd-modal__panel`을 쓰는 규칙).
 *
 * v2 값:
 *  - 기본: `dl grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs`,
 *    dt `text-muted`, dd `font-medium text-foreground tabular-nums`.
 *  - compact: `flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted`,
 *    라벨 `text-muted-light`.
 * (text-xs 0.75rem == --jd-text-xs · gap-x-4 == --jd-space-4 · gap-y-1 == --jd-space-1)
 *
 * 라벨 열 폭: 기반은 100px 고정인데 EXIF 라벨은 "초점거리"가 최장이라 4rem이면 충분하고,
 * 그래야 v2의 `auto` 열에 가깝다. --jd-desc-label-w를 재정의해 기반 규칙을 그대로 쓴다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-exif-panel:not(:defined) { display: block; }
  jd-exif-panel:not(:defined) > script { display: none; }
}
@layer junds.components {
  jd-exif-panel { display: block; }

  jd-exif-panel .jd-descriptions__list {
    --jd-desc-label-w: 4rem;
    column-gap: var(--jd-space-4);
    row-gap: var(--jd-space-1);
  }
  jd-exif-panel .jd-descriptions__label {
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-normal);
    color: var(--jd-color-muted);
  }
  jd-exif-panel .jd-descriptions__value {
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
    font-variant-numeric: tabular-nums;
  }

  /* ── compact — 같은 dl을 한 줄로 흘린다 ─────────────────────── */
  jd-exif-panel[compact] .jd-descriptions__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: var(--jd-space-3);
    row-gap: var(--jd-space-1);
  }
  jd-exif-panel[compact] .jd-descriptions__item {
    display: inline-flex;
    align-items: baseline;
    gap: var(--jd-space-1);
  }
  jd-exif-panel[compact] .jd-descriptions__label {
    flex: none;
    padding-block-start: 0;
    color: var(--jd-color-muted-light);
  }
  jd-exif-panel[compact] .jd-descriptions__value {
    font-weight: var(--jd-weight-normal);
    color: var(--jd-color-muted);
  }
}`;
