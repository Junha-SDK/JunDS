/**
 * JdPickerField 공용 CSS 조각 — `css` 태그가 아니라 **평문 문자열**이다.
 *
 * 이유: build.mjs의 정적 CSS 수집기는 컴포넌트 폴더당 `*.css.ts` **1개**만 읽는다
 * (03-web-arch §6.1-3). 베이스 CSS를 별도 시트로 두면 dist/css/<name>.css에서
 * 통째로 빠져 "컴포넌트별 CSS만 가져다 쓰는" 소비 경로가 스타일 없이 렌더된다
 * (drawer.css가 modal 규칙을 못 담는 기존 한계와 같은 계열). 파생 컴포넌트의
 * css.ts가 이 문자열을 보간해 자기 시트 안에 넣으면 두 경로가 모두 완전해진다.
 * junds.css에 규칙이 2회 들어가지만 동일 규칙이라 멱등이다.
 *
 * 호출부는 `@layer junds.components { ${PICKER_FIELD_CSS} … }` 안에 넣는다.
 */
export const PICKER_FIELD_CSS = `
  [data-jd-picker-field] { position: relative; display: inline-flex; }

  /* v2: div.flex.items-center.gap-2.h-9.px-3.border.bg-white.rounded-lg — 진짜 button으로 승격 */
  .jd-picker-field__trigger {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    height: 2.25rem; padding-inline: var(--jd-space-3); margin: 0;
    box-sizing: border-box; max-width: 100%;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-foreground); text-align: start;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg); cursor: pointer;
    transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-picker-field__trigger:focus-visible {
    outline: none; border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-picker-field__trigger[aria-expanded="true"] {
    border-color: var(--jd-color-primary); box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-picker-field__trigger:disabled {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
    background: var(--jd-color-card-hover);
  }
  .jd-picker-field__icon {
    display: inline-flex; flex-shrink: 0; color: var(--jd-color-muted);
  }
  .jd-picker-field__value {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-picker-field__value[data-placeholder] { color: var(--jd-color-muted-light); }

  /* v2는 Portal+fixed라 스크롤하면 패널이 떨어져 나갔다 — absolute로 좌표 동기화를 브라우저에 위임 */
  .jd-picker-field__panel {
    position: absolute; top: calc(100% + var(--jd-space-1));
    inset-inline-start: 0; z-index: var(--jd-z-popover);
    box-sizing: border-box;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg); box-shadow: var(--jd-shadow-lg);
  }
  .jd-picker-field__panel[hidden] { display: none; }
  [data-jd-picker-field][data-placement="top"] > .jd-picker-field__panel {
    top: auto; bottom: calc(100% + var(--jd-space-1));
  }

  @media (prefers-reduced-motion: no-preference) {
    .jd-picker-field__panel:not([hidden]) {
      animation: jd-picker-field-in var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
  }
  @keyframes jd-picker-field-in { from { opacity: 0; transform: scale(.97); } }
`;
