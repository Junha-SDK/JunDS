/**
 * jd-dropdown CSS — v2 Dropdown 표면 + **메뉴 목록 원형**(ContextMenu·Menubar 공용).
 *
 * v2 값: 메뉴 `mt-1 min-w-[160px] bg-white border border-border rounded-lg shadow-xl
 * shadow-black/15 py-1 animate-fade-in-scale`, 항목 `w-full flex items-center gap-2
 * px-3 py-1.5 text-sm text-left`, 일반 hover `bg-primary/10`, danger `text-danger
 * hover:bg-danger/10`, disabled `opacity-40 cursor-not-allowed`, 아이콘 `w-4 h-4
 * shrink-0`, 구분선 `h-px bg-border my-1`, 단축키 `text-xs text-muted ml-4`.
 *
 * z-index는 --jd-z-popover(60)를 그대로 쓴다. 의미상 --jd-z-dropdown(10)이 맞아
 * 보이지만 그 값은 sticky(20)·header(30) 아래라 헤더 밑으로 숨는다 — v2도 z-50으로
 * 헤더 위에 띄우고 있었다(패리티 우선, 토큰 재정의는 02-tokens 소관).
 *
 * `.jd-dropdown__*`는 ContextMenu·Menubar가 그대로 재사용하는 공용 클래스다
 * (Drawer가 `.jd-modal__panel`을 쓰는 것과 같은 소유 규칙).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-dropdown:not(:defined) {
      display: inline-block;
    }
    jd-dropdown:not(:defined) > script {
      display: none;
    }
  }
  @layer junds.components {
    jd-dropdown {
      position: relative;
      display: inline-block;
    }

    /* ── 트리거 ──
     원형은 포커스 가능한 자식이 없을 때만 래퍼를 승격한다 — 그래서 [tabindex] 가
     곧 "소비자가 자기 버튼을 넣지 않았다"는 표식이다. 그 경우 트리거는 맨 텍스트로
     남아 메뉴를 여는 것으로 보이지 않았다(실측). 소비자가 <jd-button>을 넣으면
     래퍼는 display:contents로 남아 이 규칙에 걸리지 않는다.
     치수·상태는 jd-button secondary와 같은 어휘를 쓴다. */
    jd-dropdown > .jd-popover__trigger[tabindex] {
      box-sizing: border-box;
      gap: var(--jd-space-2);
      height: 2.25rem;
      padding-inline: var(--jd-space-3-5);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-none);
      white-space: nowrap;
      user-select: none;
      cursor: pointer;
      box-shadow: var(--jd-shadow-xs);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    jd-dropdown > .jd-popover__trigger[tabindex]:hover {
      background: var(--jd-color-card-hover);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
      box-shadow: var(--jd-shadow-sm);
    }
    jd-dropdown > .jd-popover__trigger[tabindex]:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    jd-dropdown > .jd-popover__trigger[tabindex]:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
      /* 원형의 합성 트리거 포커스 규칙이 radius를 md로 되돌린다 — 링이 면보다
       각지지 않게 여기서 다시 못 박는다 */
      border-radius: var(--jd-radius-lg);
      box-shadow: var(--jd-shadow-xs);
    }
    /* 메뉴가 달려 있다는 표시 — 열리면 180° 돈다(아래 캐럿이 45°이므로 225°) */
    jd-dropdown > .jd-popover__trigger[tabindex]::after {
      content: "";
      flex-shrink: 0;
      width: 0.4em;
      height: 0.4em;
      border-inline-end: var(--jd-border-medium) solid currentColor;
      border-block-end: var(--jd-border-medium) solid currentColor;
      color: var(--jd-color-muted);
      rotate: 45deg;
      /* 45° 회전한 캐럿은 무게중심이 아래로 쏠린다 — 광학 중앙으로 되올린다 */
      translate: 0 -0.1em;
      transition: rotate var(--jd-duration-normal) var(--jd-easing-ease-out),
        translate var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-dropdown[open] > .jd-popover__trigger[tabindex]::after {
      rotate: 225deg;
      translate: 0 0.1em;
    }

    /* 파생 기본값(0,1,1) — v2 기본 정렬 right. 디폴트는 attribute로 반영되지 않으므로
     (§1.3) CSS가 담당한다. 명시 align attribute(0,2,0)가 언제나 이긴다. */
    jd-dropdown > .jd-popover__panel {
      left: auto;
      right: 0;
      --jd-popover-tx: 0;
      min-width: 10rem;
      padding: var(--jd-space-1) 0;
      border-radius: var(--jd-radius-lg);
      /* 떠 있는 면은 테두리를 눅이고 그림자로 띄운다 — 실선 테두리는 문서 안의
       구획으로 읽힌다 */
      border-color: color-mix(in srgb, var(--jd-color-border) 76%, transparent);
      backdrop-filter: none;
    }

    /* ── 메뉴 목록 원형 ── */
    .jd-dropdown__item {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      width: 100%;
      box-sizing: border-box;
      padding: var(--jd-space-1-5) var(--jd-space-3);
      border: 0;
      background: none;
      cursor: pointer;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      text-align: start;
      color: var(--jd-color-foreground);
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-dropdown__item:hover:not(:disabled),
    .jd-dropdown__item:focus-visible {
      background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    }
    /* 항목은 폭 전체를 차지하는 행이라 scale로 줄이면 메뉴에서 떨어져 보인다 —
     눌린 면이 더 짙어지는 것으로 대신한다(button link variant 선례) */
    .jd-dropdown__item:active:not(:disabled) {
      background: color-mix(in srgb, var(--jd-color-primary) 18%, transparent);
    }
    /* 패널이 잘라 내는 자리라 outline은 좌우가 사라진다 — 링을 box-shadow로 (§1) */
    .jd-dropdown__item:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-dropdown__item[data-danger] {
      color: var(--jd-color-danger);
    }
    .jd-dropdown__item[data-danger]:hover:not(:disabled),
    .jd-dropdown__item[data-danger]:focus-visible {
      background: color-mix(in srgb, var(--jd-color-danger) 10%, transparent);
    }
    .jd-dropdown__item[data-danger]:active:not(:disabled) {
      background: color-mix(in srgb, var(--jd-color-danger) 18%, transparent);
    }
    .jd-dropdown__item:disabled {
      opacity: var(--jd-opacity-40);
      cursor: not-allowed;
    }

    .jd-dropdown__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1rem;
      height: 1rem;
    }
    .jd-dropdown__icon > svg {
      width: 100%;
      height: 100%;
    }
    .jd-dropdown__label {
      flex: 1 1 auto;
      min-width: 0;
    }
    .jd-dropdown__shortcut {
      flex-shrink: 0;
      margin-inline-start: var(--jd-space-4);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }

    .jd-dropdown__divider {
      height: var(--jd-border-thin);
      margin-block: var(--jd-space-1);
      background: var(--jd-color-border);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-dropdown > .jd-popover__trigger[tabindex],
      jd-dropdown > .jd-popover__trigger[tabindex]::after,
      .jd-dropdown__item {
        transition: none;
      }
    }
  }
`;
