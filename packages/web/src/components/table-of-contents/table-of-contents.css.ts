/**
 * jd-table-of-contents CSS — jd-scroll-spy 골격 위에 v2 ToC의 **여백·캡션만** 덮는다
 * (Drawer가 jd-modal 시트를 그대로 쓰고 기하만 덮는 것과 동형).
 *
 * v2 ToC 항목은 `py-0.5 pl-2 border-l-2`로 배경·모서리가 없고, 호버는 배경이 아니라
 * 왼쪽 선이 border 색으로 켜진다 — ScrollSpy(rounded + primary/5 배경)와 이 점이 다르다.
 * v2 캡션 `tracking-wider`(0.05em)는 토큰 최대치인 --jd-tracking-wide(0.025em)로 근사.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-table-of-contents {
      display: block;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
    }
    jd-table-of-contents[data-empty] {
      display: none;
    }

    .jd-table-of-contents__heading {
      margin: 0 0 var(--jd-space-2);
      font-size: var(--jd-text-xs);
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wide);
      color: var(--jd-color-muted);
    }
    .jd-table-of-contents__heading[hidden] {
      display: none;
    }

    jd-table-of-contents .jd-scroll-spy__item {
      padding-block: var(--jd-space-0-5);
      padding-inline: var(--jd-space-2) 0;
      border-radius: 0;
    }
    jd-table-of-contents .jd-scroll-spy__item:hover {
      background: transparent;
      border-inline-start-color: var(--jd-color-border);
    }
    jd-table-of-contents .jd-scroll-spy__item[aria-current] {
      background: transparent;
    }
    jd-table-of-contents .jd-scroll-spy__item:focus-visible {
      border-radius: var(--jd-radius-sm);
    }
  }
`;
