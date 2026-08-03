/**
 * jd-disclosure CSS — 개폐 관용구의 원형. jd-collapsible·jd-accordion이 그대로 쓴다
 * (Drawer가 `.jd-modal__panel`을 쓰는 것과 같은 소유 규칙).
 *
 * v2 값: 패널 `grid transition-all duration-200` + `grid-rows-[1fr]/[0fr]` +
 * `opacity-100`/`opacity-0`, 안쪽 `overflow-hidden`. 트리거는 v2 Collapsible의
 * `w-full cursor-pointer`.
 *
 * 상태는 호스트 태그가 아니라 **`data-state`**로 건다 — 파생 태그(jd-collapsible,
 * jd-accordion 행)마다 `[open]` 호스트 셀렉터를 복제하지 않기 위해서다.
 * `visibility`는 닫힘 전이가 끝난 뒤에 바뀌도록 지연시켜(전이 0s + delay)
 * **접힘 애니메이션을 보존하면서** 닫힌 본문을 AT·탭 순서에서 뺀다.
 *
 * 트리거 크롬·셰브런은 `:not(:has([class*="__chevron"]))`으로 가른다. 골격을 미리
 * 그려 넘기는 쪽(jd-accordion·jd-faq)은 **자기 셰브런과 자기 표면을 함께** 갖고
 * 오므로 원형이 다시 그리면 셰브런이 둘이 된다. 반대로 <jd-disclosure>/
 * <jd-collapsible>을 혼자 쓰면 트리거가 맨 텍스트로 남아 누를 수 있다는 신호가
 * 전혀 없었다 — 그 경우에만 원형이 크롬을 준다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-disclosure:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-disclosure {
      display: block;
    }

    .jd-disclosure__trigger {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      font-family: var(--jd-font-sans);
      font-size: inherit;
      line-height: inherit;
      color: var(--jd-color-foreground);
      text-align: start;
      cursor: pointer;
    }
    .jd-disclosure__trigger:disabled,
    .jd-disclosure__trigger[aria-disabled="true"] {
      opacity: var(--jd-opacity-40);
      cursor: not-allowed;
    }
    .jd-disclosure__trigger:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    /* ── 홀로 쓰이는 트리거의 크롬 ──
     입양 골격(자기 셰브런을 갖고 오는 것)은 여기서 빠진다. 셀렉터가 (0,3,0)이라
     위의 원형 리셋과 아래 파생 시트 어느 쪽이 뒤에 채택되든 특이도로 이긴다. */
    .jd-disclosure__trigger:not(:has([class*="__chevron"])) {
      padding: var(--jd-space-2-5) var(--jd-space-3);
      border-radius: var(--jd-radius-lg);
      font-weight: var(--jd-weight-medium);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-disclosure__trigger:not(:has([class*="__chevron"])):hover:not(
        :disabled,
        [aria-disabled="true"]
      ) {
      background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    }
    /* 폭 100% 행이라 scale로 줄이면 부모에서 떨어져 보인다 — 눌린 면이 빛을 잃는
     신호만 남긴다 (button link variant가 scale을 빼는 것과 같은 판단). */
    .jd-disclosure__trigger:not(:has([class*="__chevron"])):active:not(
        :disabled,
        [aria-disabled="true"]
      ) {
      background: color-mix(in srgb, var(--jd-color-muted) 16%, transparent);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-disclosure__trigger:not(:has([class*="__chevron"])):focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
      box-shadow: none;
    }

    /* 셰브런 — 접히는 것에는 셰브런이 있고 열림에 따라 180° 돈다. 골격에 span을
     새로 끼우지 않고 ::after로 그려 공개 DOM 표면을 그대로 둔다. 아래를 가리키는
     캐럿이 45°이므로 열림은 225°(=+180°)다. */
    .jd-disclosure__trigger:not(:has([class*="__chevron"]))::after {
      content: "";
      flex-shrink: 0;
      /* justify-between의 자리 — 라벨은 왼쪽, 셰브런은 오른쪽 끝 */
      margin-inline-start: auto;
      width: 0.45em;
      height: 0.45em;
      border-inline-end: var(--jd-border-medium) solid currentColor;
      border-block-end: var(--jd-border-medium) solid currentColor;
      color: var(--jd-color-muted);
      rotate: 45deg;
      /* 45° 회전한 캐럿은 무게중심이 아래로 쏠린다 — 광학 중앙으로 되올린다 */
      translate: 0 -0.12em;
      transition: rotate var(--jd-duration-normal) var(--jd-easing-ease-out),
        translate var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-disclosure__trigger[data-state="open"]:not(:has([class*="__chevron"]))::after {
      rotate: 225deg;
      translate: 0 0.12em;
    }

    .jd-disclosure__label {
      min-width: 0;
    }

    .jd-disclosure__panel {
      display: grid;
      grid-template-rows: 0fr;
      opacity: var(--jd-opacity-0);
      visibility: hidden;
      transition: grid-template-rows var(--jd-duration-normal) var(--jd-easing-ease-out),
        opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
        visibility 0s linear var(--jd-duration-normal);
    }
    .jd-disclosure__panel[data-state="open"] {
      grid-template-rows: 1fr;
      opacity: var(--jd-opacity-100);
      visibility: visible;
      transition-delay: 0s;
    }
    /* 0fr↔1fr 보간은 min-height:0 + overflow:hidden 자식이 있어야 성립한다 */
    .jd-disclosure__inner {
      overflow: hidden;
      min-height: 0;
    }

    /* 감속 요청 시엔 전이를 끈다 — visibility도 즉시 뒤집혀 지연 이유가 사라진다 */
    @media (prefers-reduced-motion: reduce) {
      .jd-disclosure__panel,
      .jd-disclosure__panel[data-state="open"],
      .jd-disclosure__trigger:not(:has([class*="__chevron"])),
      .jd-disclosure__trigger:not(:has([class*="__chevron"]))::after {
        transition: none;
      }
    }
  }
`;
