/**
 * jd-search-box CSS — Combobox의 클래스 규칙(.jd-combobox__*)을 그대로 물려받고
 * (그 시트는 상속 체인의 adoptStyles(comboboxStyles)가 문서에 넣는다), 여기서는
 *  1) 호스트 규칙 재선언 — Combobox의 호스트 규칙은 `jd-combobox` 태그 셀렉터라
 *     `jd-search-box`에는 적용되지 않는다(클래스 규칙만 상속된다),
 *  2) 검색 전용 외형 — ⌘K 힌트·지우기·풍부한 행·전체검색 푸터.
 *
 * v2 값: 컨트롤 알약(h-9 rounded-full), 드롭다운 rounded-2xl shadow-lg, 행 12/18px
 * divide-y, KOSPI/KOSDAQ 배지, 시세 우측(local) / 코드(remote), 푸터 accent 볼드.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-search-box {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      font-family: var(--jd-font-sans);
      --_up: var(--jd-fin-up, #e11d48);
      --_down: var(--jd-fin-down, #2563eb);
      --_muted: var(--jd-fin-muted, var(--jd-color-muted));
      --_soft: var(--jd-fin-soft-100, var(--jd-color-card-hover));
    }
    jd-search-box:not(:defined) {
      display: block;
    }

    /* 호스트 변형 — Combobox의 jd-combobox[...] 규칙 대응(태그가 달라 재선언) */
    jd-search-box[disabled] > .jd-combobox__control {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }
    jd-search-box[error] > .jd-combobox__control {
      border-color: var(--jd-color-danger);
    }
    jd-search-box[error] > .jd-combobox__control:focus-within {
      border-color: var(--jd-color-danger);
      box-shadow: var(--jd-shadow-focus-ring-danger);
    }
    jd-search-box > .jd-combobox__control {
      border-radius: var(--jd-radius-full);
    }
    jd-search-box > .jd-combobox__popup {
      border-radius: var(--jd-radius-xl, 16px);
      overflow: hidden;
      max-height: 60vh;
    }
    jd-search-box .jd-combobox__empty {
      display: none;
    } /* v2엔 빈 상태 문구 없음 — 푸터가 대신 */

    /* ⌘K 힌트 — 데스크톱만(v2 hidden md:inline-flex) */
    .jd-search-box__kbd {
      display: none;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      padding: 2px 7px;
      border-radius: 6px;
      background: var(--_soft);
      border: 1px solid var(--jd-color-border);
      color: var(--_muted);
      font: inherit;
      font-size: 10px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .jd-search-box__kbd > svg {
      width: 10px;
      height: 10px;
    }
    @media (min-width: 768px) {
      .jd-search-box__kbd {
        display: inline-flex;
      }
    }

    /* 지우기 */
    .jd-search-box__clear {
      display: inline-grid;
      place-items: center;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin: 0;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
      color: var(--_muted);
      border-radius: var(--jd-radius-full);
    }
    .jd-search-box__clear[hidden] {
      display: none;
    }
    .jd-search-box__clear > svg {
      width: 14px;
      height: 14px;
    }
    .jd-search-box__clear:hover {
      color: var(--jd-color-foreground);
    }
    .jd-search-box__clear:focus-visible {
      outline: 2px solid var(--jd-color-focus);
      outline-offset: 1px;
    }

    /* 결과 행 — 콤보의 .jd-combobox__option 위에 검색 외형을 덧입힌다 */
    .jd-search-box__hit {
      justify-content: space-between;
      padding: 12px 18px;
    }
    .jd-search-box__hit + .jd-search-box__hit {
      border-top: 1px solid var(--jd-color-border);
    }

    .jd-search-box__main {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-search-box__name {
      font-weight: 700;
      font-size: 13.5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-search-box__badge {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: var(--jd-radius-full);
      background: var(--_soft);
      color: var(--_muted);
      border: 1px solid var(--jd-color-border);
    }
    .jd-search-box__badge[hidden] {
      display: none;
    }
    .jd-search-box__sub {
      font-size: 11px;
      color: var(--_muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-search-box__sub[hidden] {
      display: none;
    }

    .jd-search-box__aside {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
    }
    .jd-search-box__price {
      font-size: 12.5px;
      font-weight: 600;
    }
    .jd-search-box__price[hidden] {
      display: none;
    }
    .jd-search-box__change {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 700;
      color: var(--_muted);
    }
    .jd-search-box__change[hidden] {
      display: none;
    }
    .jd-search-box__change > svg {
      width: 11px;
      height: 11px;
    }
    .jd-search-box__change[data-dir="up"] {
      color: var(--_up);
    }
    .jd-search-box__change[data-dir="down"] {
      color: var(--_down);
    }
    .jd-search-box__code {
      font-size: 11px;
      font-weight: 700;
      color: var(--_muted);
      font-variant-numeric: tabular-nums;
    }
    .jd-search-box__code[hidden] {
      display: none;
    }

    /* 전체 검색 푸터 */
    .jd-search-box__footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 100%;
      box-sizing: border-box;
      padding: var(--jd-space-2) var(--jd-space-3);
      border: 0;
      border-top: 1px solid var(--jd-color-border);
      background: var(--_soft);
      color: var(--jd-fin-accent-strong, var(--jd-color-primary));
      font: inherit;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
    }
    .jd-search-box__footer[hidden] {
      display: none;
    }
    .jd-search-box__footer-chevron {
      width: 12px;
      height: 12px;
    }
    .jd-search-box__footer:hover {
      filter: brightness(0.97);
    }
    .jd-search-box__footer:focus-visible {
      outline: 2px solid var(--jd-color-focus);
      outline-offset: -2px;
    }
  }
`;
