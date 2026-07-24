/**
 * jd-radio-card-group 컴포넌트 CSS.
 * v2 ds/composites/RadioCardGroup의 Tailwind 시각을 --jd-* 토큰으로 의미 번역:
 *   grid gap-2 / 카드 border+rounded-lg+p-3+gap-3 / 선택 시 border-primary·
 *   bg-primary-soft·ring-1 ring-primary/30 / 비활성 opacity-50 / 제목 text-sm
 *   font-medium / 설명·배지 text-xs text-muted / 아이콘 text-lg.
 *
 * 클래스는 파생(<jd-checkbox-card-group>)이 그대로 공유한다 — jd-drawer가
 * .jd-modal__panel을 쓰는 것과 같은 규약(기반 클래스 이름을 유지).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  /* 기본 1컬럼 — columns>1일 때만 update()가 인라인으로 덮는다 */
  jd-radio-card-group {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: var(--jd-space-2);
    font-family: var(--jd-font-sans);
  }

  .jd-radio-card-group__item {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--jd-space-3);
    box-sizing: border-box;
    padding: var(--jd-space-3);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    cursor: pointer;
    user-select: none;
    transition:
      background-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-radio-card-group__item:hover { background: var(--jd-color-card-hover); }

  /* v2: border-primary + bg-primary-soft + ring-1 ring-primary/30 */
  .jd-radio-card-group__item[data-selected] {
    border-color: var(--jd-color-primary);
    background: var(--jd-color-primary-light);
    box-shadow: 0 0 0 var(--jd-border-thin)
      color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-radio-card-group__item[data-selected]:hover { background: var(--jd-color-primary-light); }

  .jd-radio-card-group__item[data-disabled] {
    opacity: var(--jd-opacity-50);
    cursor: not-allowed;
  }
  .jd-radio-card-group__item[data-disabled]:hover { background: var(--jd-color-card); }
  .jd-radio-card-group__item[data-disabled][data-selected]:hover {
    background: var(--jd-color-primary-light);
  }

  /* 키보드 초점은 카드 전체에 — 내부 input에만 걸리면 카드 경계가 보이지 않는다 */
  .jd-radio-card-group__item:has(.jd-radio-card-group__input:focus-visible) {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }

  .jd-radio-card-group__input {
    appearance: auto;
    flex-shrink: 0;
    margin: var(--jd-space-1) 0 0;
    width: 1rem;
    height: 1rem;
    accent-color: var(--jd-color-primary);
    cursor: inherit;
  }

  .jd-radio-card-group__icon {
    flex-shrink: 0;
    margin-block-start: var(--jd-space-0-5);
    font-size: var(--jd-text-xl);
    line-height: var(--jd-leading-none);
  }

  .jd-radio-card-group__body {
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-0-5);
    flex: 1 1 0;
    min-width: 0;
  }

  .jd-radio-card-group__title {
    font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
  }
  .jd-radio-card-group__description {
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-radio-card-group__badge {
    flex-shrink: 0;
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }

  .jd-radio-card-group__icon[hidden],
  .jd-radio-card-group__description[hidden],
  .jd-radio-card-group__badge[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-radio-card-group__item { transition: none; }
  }
}`;
