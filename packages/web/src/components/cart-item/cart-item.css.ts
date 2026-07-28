import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 행: flex items-start gap-4 py-4 border-b border-border, last:border-b-0, disabled opacity-60.
 * - 썸네일: w-20 h-20(5rem) rounded-md overflow-hidden bg-surface-soft(→--jd-color-background).
 * - 본문: 제목 text-sm medium truncate, variant mt-0.5 text-xs muted truncate,
 *   단가 mt-2 text-sm muted, 수량 위젯 mt-2.
 * - 우측: flex-col items-end gap-2, 소계 text-sm semibold, 삭제 text-xs muted hover:text-danger.
 *
 * v2의 3단 flex(썸네일 · 본문 · 우측 컬럼)는 **금액이 두 번 나오는 행**으로 읽혔다:
 * 단가와 소계가 같은 크기·같은 무게로 서로 다른 축에 얹혀 어느 쪽이 결제 금액인지
 * 알 수 없었고, "삭제"는 소계 아래 아무 데도 정렬되지 않은 채 떠 있었다.
 * v3는 행을 **5칸 그리드**로 못 박는다 — 썸네일 · 이름/옵션/단가 · 수량 · 금액 · 삭제.
 * DOM은 v2 골격(body/aside 래퍼)을 그대로 두고 두 래퍼만 `display: contents`로
 * 풀어 자식들이 직접 그리드 칸을 차지하게 했다 — element.ts를 건드리지 않고
 * 열을 세우는 유일한 방법이고, 입양 셀렉터(`:scope > .jd-cart-item__body`)도 산다.
 *
 * 행 3줄(제목/옵션/단가) 중 마지막만 1fr이다: 썸네일(5rem)이 세 줄을 가로지르며
 * 남는 높이를 만드는데, 세 줄에 고루 나눠 주면 옵션이 없는 흔한 행에서 제목이
 * 허공 한가운데 뜬다. 남는 높이는 전부 마지막 줄이 먹고 글자는 위에 붙는다.
 */
export default css`
  @layer junds.base {
    jd-cart-item:not(:defined) {
      display: flex;
    }
  }
  @layer junds.components {
    jd-cart-item {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto auto auto;
      grid-template-rows: auto auto 1fr;
      align-items: start;
      /* 칸 사이 여백은 column-gap이 아니라 **앞 칸의 뒷여백**이다. gap은 칸이 비어도
       (썸네일 없음·삭제 없음) 그대로 남아 행이 한쪽으로 밀린다 — 마진은 사라진 칸과
       함께 사라진다. */
      column-gap: 0;
      padding-block: var(--jd-space-4);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    jd-cart-item:last-of-type {
      border-block-end: none;
    }
    jd-cart-item[disabled] {
      opacity: var(--jd-opacity-60);
    }

    .jd-cart-item__thumb {
      display: block;
      grid-column: 1;
      grid-row: 1 / -1;
      align-self: center;
      flex-shrink: 0;
      width: 5rem;
      height: 5rem;
      margin-inline-end: var(--jd-space-4);
      border-radius: var(--jd-radius-lg);
      overflow: hidden;
      background: var(--jd-color-background);
      /* 빈 자리도 면이어야 한다 — 이미지가 늦게 뜰 때 구멍으로 보이지 않게(§2) */
      box-shadow: inset 0 0 0 var(--jd-border-thin)
        color-mix(in srgb, var(--jd-color-border) 76%, transparent);
    }
    /* display 지정 요소는 [hidden]이 안 먹으므로 명시 가드 */
    .jd-cart-item__thumb[hidden],
    .jd-cart-item__variant[hidden],
    .jd-cart-item__price[hidden] {
      display: none;
    }
    .jd-cart-item__image {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* 래퍼를 풀어 자식이 곧 그리드 칸이 된다 — 골격은 v2 그대로 남는다 */
    .jd-cart-item__body,
    .jd-cart-item__aside {
      display: contents;
    }

    .jd-cart-item__title {
      grid-column: 2;
      grid-row: 1;
      margin: 0 var(--jd-space-4) 0 0;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-snug);
      color: var(--jd-color-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .jd-cart-item__variant {
      display: block;
      grid-column: 2;
      grid-row: 2;
      margin: var(--jd-space-0-5) var(--jd-space-4) 0 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* 단가는 **소계의 보조**다. 같은 크기로 두면 한 행에 금액이 두 번 있는 것으로
     읽힌다 — 한 단 작게, muted로, 숫자는 자릿수가 흔들리지 않게(§5). */
    .jd-cart-item__price {
      display: block;
      grid-column: 2;
      grid-row: 3;
      margin: var(--jd-space-1-5) var(--jd-space-4) 0 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .jd-cart-item__qty {
      grid-column: 3;
      grid-row: 1 / -1;
      align-self: center;
      justify-self: start;
      margin-inline-end: var(--jd-space-4);
    }

    .jd-cart-item__subtotal {
      grid-column: 4;
      grid-row: 1 / -1;
      align-self: center;
      justify-self: end;
      margin-inline-end: var(--jd-space-2);
      /* 이 행에서 결제되는 금액 — 단가보다 한 단 크고 무겁게 */
      font-size: var(--jd-text-lg);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-none);
      color: var(--jd-color-foreground);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    /* 맨 텍스트는 트리거가 아니다(§7) — 눌리는 면을 주고 상태 3종을 붙인다 */
    .jd-cart-item__remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      grid-column: 5;
      grid-row: 1 / -1;
      align-self: center;
      padding: var(--jd-space-1-5) var(--jd-space-2-5);
      border: 0;
      border-radius: var(--jd-radius-lg);
      background: transparent;
      font-family: inherit;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-none);
      white-space: nowrap;
      color: var(--jd-color-muted);
      cursor: pointer;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-cart-item__remove[hidden] {
      display: none;
    }
    .jd-cart-item__remove:hover:not(:disabled) {
      color: var(--jd-color-danger);
      background: var(--jd-color-danger-light);
    }
    .jd-cart-item__remove:active:not(:disabled) {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-cart-item__remove:disabled {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }
    .jd-cart-item__remove:focus-visible {
      outline: var(--jd-focus-ring-danger);
      outline-offset: var(--jd-focus-ring-offset);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-cart-item__remove {
        transition: none;
      }
    }
  }
`;
