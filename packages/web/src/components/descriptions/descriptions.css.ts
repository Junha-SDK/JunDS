/**
 * jd-descriptions CSS — 키-값 목록 관용구의 원형. jd-key-value-grid가 그대로 쓴다
 * (Drawer가 `.jd-modal__panel`을 쓰는 것과 같은 소유 규칙).
 *
 * v2 값:
 *  - 비bordered: 제목 `text-sm font-semibold mb-3`, 격자 `gap-x-6 gap-y-3`,
 *    horizontal 항목 `flex gap-2` + 라벨 `w-[100px] shrink-0 pt-0.5`,
 *    라벨 `text-xs font-medium text-muted`, 값 `text-sm text-foreground`.
 *  - bordered: 상자 `border border-border rounded-lg overflow-hidden`,
 *    제목 줄 `px-4 py-3 bg-gray-50 border-b`, 라벨 셀 `px-3 py-2 bg-gray-50 border-r w-[120px]`,
 *    값 셀 `px-3 py-2`, 행 `border-b`(vertical은 라벨이 위 + `px-3 py-1.5 border-b`).
 * (Tailwind text-sm = 0.875rem = --jd-text-md · text-xs = --jd-text-xs ·
 *  bg-gray-50 = --jd-color-card-hover)
 *
 * bordered 격자는 표의 `last:border-0`을 쓸 수 없다 — 그리드에는 "마지막 행" 셀렉터가
 * 없기 때문이다. 대신 모든 셀에 오른쪽·아래 선을 긋고 목록을 1px 음수 마진으로 밀어
 * 상자의 overflow가 바깥 테두리 중복분을 잘라낸다. 부분만 찬 마지막 행에서도 빈 칸이
 * 생기지 않는다(gap 배경 기법의 약점 회피).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-descriptions:not(:defined) { display: block; }
  jd-descriptions:not(:defined) > script { display: none; }
}
@layer junds.components {
  jd-descriptions { display: block; }

  .jd-descriptions__box {
    box-sizing: border-box;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }
  .jd-descriptions__box[data-bordered] {
    overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
  }

  .jd-descriptions__title {
    margin: 0 0 var(--jd-space-3);
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-semibold);
  }
  .jd-descriptions__title[hidden] { display: none; }
  .jd-descriptions__box[data-bordered] > .jd-descriptions__title {
    margin: 0; padding: var(--jd-space-3) var(--jd-space-4);
    background: var(--jd-color-card-hover);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }

  .jd-descriptions__list {
    display: grid; margin: 0;
    grid-template-columns: repeat(var(--jd-desc-cols, 2), minmax(0, 1fr));
    column-gap: var(--jd-space-6); row-gap: var(--jd-space-3);
  }

  /* layout 기본 horizontal — 라벨 왼쪽 고정폭 + 값 나머지 */
  .jd-descriptions__item {
    grid-column: span var(--jd-desc-span, 1);
    display: flex; gap: var(--jd-space-2); min-width: 0;
  }
  .jd-descriptions__box[data-layout="vertical"] .jd-descriptions__item {
    display: block; gap: 0;
  }

  .jd-descriptions__label {
    margin: 0;
    flex: 0 0 var(--jd-desc-label-w, 100px);
    padding-block-start: var(--jd-space-0-5);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-muted);
  }
  .jd-descriptions__box[data-layout="vertical"] .jd-descriptions__label {
    flex: none; padding-block-start: 0; margin-block-end: var(--jd-space-0-5);
  }

  .jd-descriptions__value {
    margin: 0; flex: 1 1 auto; min-width: 0;
    font-size: var(--jd-text-md); color: var(--jd-color-foreground);
  }

  /* ── bordered 격자 ─────────────────────────────────────────── */
  .jd-descriptions__box[data-bordered] > .jd-descriptions__list {
    column-gap: 0; row-gap: 0;
    margin-inline-end: -1px; margin-block-end: -1px;
    --jd-desc-label-w: 120px;
  }
  .jd-descriptions__box[data-bordered] .jd-descriptions__item {
    border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-descriptions__box[data-bordered] .jd-descriptions__label {
    padding: var(--jd-space-2) var(--jd-space-3);
    background: var(--jd-color-card-hover);
    border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-descriptions__box[data-bordered][data-layout="vertical"] .jd-descriptions__label {
    padding: var(--jd-space-1-5) var(--jd-space-3);
    margin-block-end: 0;
    border-inline-end: 0;
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-descriptions__box[data-bordered] .jd-descriptions__value {
    padding: var(--jd-space-2) var(--jd-space-3);
  }
}`;
