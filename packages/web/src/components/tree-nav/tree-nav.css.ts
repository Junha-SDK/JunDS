/**
 * jd-tree-nav CSS — jd-tree-view 골격 위에 v2 TreeNav의 중립 팔레트만 덮는다
 * (기본 색은 muted, 활성은 중립 배경 + 진한 글자 — v2 neutral-600/100/900).
 * 골격·치수 규칙은 tree-view.css가 정본이다(파생은 색만 재정의 — jd-drawer 선례).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-tree-nav { display: block; inline-size: 100%; padding-block: 0; }

  jd-tree-nav .jd-tree-view__row { color: var(--jd-color-muted); }

  jd-tree-nav .jd-tree-view__item[aria-selected="true"] > .jd-tree-view__row {
    background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    color: var(--jd-color-foreground);
    font-weight: var(--jd-weight-medium);
  }
}`;
