/**
 * jd-popover CSS — 앵커 상대 배치 기하 + v2 Popover 표면.
 *
 * v2 값: 래퍼 `relative inline-block`, 패널 `absolute z-60 bg-white border border-border
 * rounded-xl shadow-xl shadow-black/15 p-4 backdrop-blur-sm animate-fade-in-scale`,
 * side bottom=`mt-1 top-full` / top=`mb-1 bottom-full`, align left=`left-0` ·
 * right=`right-0` · center=`left-1/2 -translate-x-1/2`.
 *
 * ⚠️ 이 시트는 **파생 4종(Tooltip·HoverCard·Dropdown·ContextMenu)이 공유**한다.
 * 그래서 상태 분기를 `jd-popover[side=…]`가 아니라 **태그 무관 속성 셀렉터**
 * (`[side="top"] > .jd-popover__panel`)로 쓴다. §4.3의 "호스트 속성 → 자식 조합자"
 * 규칙은 유지하되 호스트 태그명만 뺀 것으로, 자식 조합자가 `.jd-popover__panel`을
 * 요구하므로 이 패널을 가진 요소(=이 가족) 밖으로는 새지 않는다.
 * 호스트 박스 규칙(display/position)만 태그별로 각자 시트에서 선언한다.
 *
 * transform 대신 `translate`/`scale` 개별 프로퍼티를 쓰는 이유: 중앙 정렬 이동과
 * 등장 애니메이션이 같은 transform 슬롯을 다투면 열릴 때 패널이 튄다
 * (v2 `-translate-x-1/2` + `animate-fade-in-scale` 조합의 실측 문제).
 *
 * 디폴트(side=bottom·align=left)는 attribute로 반영되지 않으므로(§1.3) base 규칙이
 * 담당하고, 속성 규칙은 **전부 리셋을 포함**한다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    /* 업그레이드 전(§3.2): 트리거만 보이고 패널이 될 children은 감춘다 */
    jd-popover:not(:defined) {
      display: inline-block;
    }
    jd-popover:not(:defined) > :not([slot="trigger"]) {
      display: none;
    }
  }
  @layer junds.components {
    jd-popover {
      position: relative;
      display: inline-block;
    }

    .jd-popover__trigger {
      display: contents;
    }
    /* 합성 트리거(포커스 가능한 자식이 없어 래퍼가 승격된 경우)만 실체를 가진다 */
    .jd-popover__trigger[tabindex] {
      display: inline-flex;
      align-items: center;
    }
    .jd-popover__trigger[role="button"] {
      cursor: pointer;
    }
    .jd-popover__trigger[tabindex]:focus-visible {
      outline: none;
      border-radius: var(--jd-radius-md);
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-popover__panel {
      --jd-popover-offset: var(--jd-space-1);
      --jd-popover-tx: 0;
      --jd-popover-ty: 0;
      /* 꼬리 반폭. 0이면 ::after가 0×0이라 그려지지 않는다 — 파생(Dropdown·ContextMenu처럼
       메뉴 표면인 것들)은 아무것도 하지 않으면 꼬리가 없다. 켤 파생만 값을 준다. */
      --jd-popover-arrow: 0px;
      --jd-popover-arrow-face: var(--jd-color-card);
      position: absolute;
      z-index: var(--jd-z-popover);
      translate: var(--jd-popover-tx) var(--jd-popover-ty);
      /* 기본 side=bottom · align=left */
      top: 100%;
      bottom: auto;
      left: 0;
      right: auto;
      margin-block-start: var(--jd-popover-offset);
      box-sizing: border-box;
      /* 절대 배치 상자는 shrink-to-fit이라 컨테이닝 블록(=트리거 폭)에 갇힌다 —
       버튼 하나짜리 앵커에서 패널이 세로로 찌그러지는 실측 문제. max-content로
       내용 폭을 쓰되 뷰포트를 넘지 않게 상한을 둔다. */
      width: max-content;
      max-width: min(24rem, calc(100vw - 2rem));
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      /* 떠 있는 것의 테두리는 눅인다 — 실선 border는 그림자 위에서 두 번 그은 선이 된다 */
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-border) 76%, transparent);
      border-radius: var(--jd-radius-xl);
      box-shadow: var(--jd-shadow-xl);
      backdrop-filter: blur(2px);
      padding: var(--jd-space-4);
    }
    .jd-popover__panel[hidden] {
      display: none;
    }
    /* 원형(jd-popover) 자신은 꼬리를 켠다. 꼬리(6px)가 간격(4px)보다 크면 트리거를
     파고들므로 오프셋도 함께 올린다. 파생은 각자 시트에서 켜고 끈다. */
    jd-popover > .jd-popover__panel {
      --jd-popover-arrow: 6px;
      --jd-popover-offset: var(--jd-space-2);
    }

    /* ── 꼬리 ──
     앵커를 가리키지 않는 패널은 "어디서 나온 상자인지"를 말하지 않는다(§7 어포던스).
     테두리 삼각형이라 패널 면색 하나만 물려받으면 되고, 스킨을 바꾸는 파생은
     --jd-popover-arrow-face 한 줄만 갈아 끼운다. 기본 side=bottom · align=left는
     attribute로 반영되지 않으므로(§1.3) base 규칙이 담당한다. */
    .jd-popover__panel::after {
      content: "";
      position: absolute;
      border: var(--jd-popover-arrow) solid transparent;
      pointer-events: none;
      /* side=bottom — 꼬리는 패널 위쪽 모서리에서 트리거를 향해 선다 */
      bottom: 100%;
      border-top-width: 0;
      border-bottom-color: var(--jd-popover-arrow-face);
      left: var(--jd-space-4);
    }
    /* align이 먼저, side가 뒤 — 기하 규칙과 같은 서열이다(side=left/right는 정렬을
     수직 중앙으로 고정하므로 align이 쓴 가로 좌표를 되돌려야 한다). */
    [align="left"] > .jd-popover__panel::after {
      left: var(--jd-space-4);
      right: auto;
      margin-inline-start: 0;
    }
    [align="center"] > .jd-popover__panel::after {
      left: 50%;
      right: auto;
      margin-inline-start: calc(-1 * var(--jd-popover-arrow));
    }
    [align="right"] > .jd-popover__panel::after {
      left: auto;
      right: var(--jd-space-4);
      margin-inline-start: 0;
    }
    [side="bottom"] > .jd-popover__panel::after {
      top: auto;
      bottom: 100%;
      margin-block-start: 0;
      border-width: var(--jd-popover-arrow);
      border-top-width: 0;
      border-top-color: transparent;
      border-bottom-color: var(--jd-popover-arrow-face);
    }
    [side="top"] > .jd-popover__panel::after {
      bottom: auto;
      top: 100%;
      margin-block-start: 0;
      border-width: var(--jd-popover-arrow);
      border-bottom-width: 0;
      border-bottom-color: transparent;
      border-top-color: var(--jd-popover-arrow-face);
    }
    [side="left"] > .jd-popover__panel::after,
    [side="right"] > .jd-popover__panel::after {
      bottom: auto;
      top: 50%;
      margin-block-start: calc(-1 * var(--jd-popover-arrow));
      margin-inline-start: 0;
      border-width: var(--jd-popover-arrow);
      border-bottom-color: transparent;
      border-top-color: transparent;
    }
    [side="left"] > .jd-popover__panel::after {
      left: 100%;
      right: auto;
      border-right-width: 0;
      border-left-color: var(--jd-popover-arrow-face);
    }
    [side="right"] > .jd-popover__panel::after {
      left: auto;
      right: 100%;
      border-left-width: 0;
      border-right-color: var(--jd-popover-arrow-face);
    }

    /* ── align (side=top/bottom에서 유효) ──
     파생이 자기 기본값을 낮은 특이도(0,1,1)로 선언하므로, **명시 attribute 규칙은
     축을 완전히 리셋**해야 파생 기본값을 확실히 이긴다(0,2,0). */
    [align="left"] > .jd-popover__panel {
      left: 0;
      right: auto;
      --jd-popover-tx: 0;
    }
    [align="right"] > .jd-popover__panel {
      left: auto;
      right: 0;
      --jd-popover-tx: 0;
    }
    [align="center"] > .jd-popover__panel {
      left: 50%;
      right: auto;
      --jd-popover-tx: -50%;
    }

    /* ── side ── (align 뒤에 온다 — left/right는 정렬을 수직 중앙으로 고정한다) */
    [side="bottom"] > .jd-popover__panel {
      top: 100%;
      bottom: auto;
      margin-block: var(--jd-popover-offset) 0;
      --jd-popover-ty: 0;
    }
    [side="top"] > .jd-popover__panel {
      top: auto;
      bottom: 100%;
      margin-block: 0 var(--jd-popover-offset);
      --jd-popover-ty: 0;
    }
    [side="left"] > .jd-popover__panel,
    [side="right"] > .jd-popover__panel {
      top: 50%;
      bottom: auto;
      margin-block: 0;
      --jd-popover-tx: 0;
      --jd-popover-ty: -50%;
    }
    [side="left"] > .jd-popover__panel {
      left: auto;
      right: 100%;
      margin-inline: 0 var(--jd-popover-offset);
    }
    [side="right"] > .jd-popover__panel {
      left: 100%;
      right: auto;
      margin-inline: var(--jd-popover-offset) 0;
    }

    .jd-popover__label {
      display: block;
    }

    @media (prefers-reduced-motion: no-preference) {
      [open] > .jd-popover__panel {
        animation: jd-popover-in var(--jd-duration-fast) var(--jd-easing-ease-out);
      }
    }
    @keyframes jd-popover-in {
      from {
        opacity: 0;
        scale: 0.96;
      }
    }
  }
`;
