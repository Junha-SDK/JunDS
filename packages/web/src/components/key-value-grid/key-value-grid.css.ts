/**
 * jd-key-value-grid CSS — 원형(jd-descriptions) 시트 위에 v2 KeyValueGrid의 스킨만 얹는다.
 *
 * v2 값: 격자 `gap-4`(비bordered) / `gap-px`(bordered), 열
 * `grid-cols-1 sm:grid-cols-2 md:grid-cols-{2|3|4}`, span
 * `col-span-1 sm:col-span-2 md:col-span-{3|4}`, 항목 `space-y-1` + bordered `bg-white p-3`,
 * dt `text-[10px] font-medium text-muted uppercase tracking-wider`,
 * dd `text-sm font-medium text-foreground rounded px-1 -mx-1 hover:bg-gray-50`.
 *
 * 열 계단은 뷰포트가 아니라 **부모 폭**으로 선다 — 원형의 auto-fit 격자에 열 수와
 * 간격만 넘기고 고정 repeat(N)은 쓰지 않는다(아래 격자 주석). 기본 columns=3은
 * attribute로 반영되지 않지만(§1.3 · DEC-012-2) element가 --jd-desc-cols를 인라인으로
 * 실어 주므로 호스트 속성 셀렉터가 열 수를 다시 셀 필요가 없다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-key-value-grid:not(:defined) {
      display: block;
    }
    jd-key-value-grid:not(:defined) > script {
      display: none;
    }
  }
  @layer junds.components {
    jd-key-value-grid {
      display: block;
    }

    /* 열 계단(1 → sm 2 → md columns)을 뷰포트 미디어쿼리로 세우면, 넓은 화면의 좁은
     칼럼 안에서 3~4열을 그대로 그려 라벨과 값이 한 글자씩 접혔다(§5·§6). 원형의
     격자 규칙은 이미 "요청 열 수로 나눈 폭"을 하한으로 둔 auto-fit이다 — 고정
     repeat(N)으로 덮어쓰던 것을 걷어내고 원형에 열 수(--jd-desc-cols는 element가
     columns 프롭에서 인라인으로 실어 준다)와 v2 간격만 넘긴다. 넓으면 columns 열,
     좁아지면 스스로 접힌다. span도 원형이 --jd-desc-span으로 처리한다. */
    jd-key-value-grid .jd-descriptions__list {
      /* v2 gap-4 */
      --jd-desc-col-gap: var(--jd-space-4);
      /* 10px 라벨 + 14px 값 한 쌍이 접히지 않고 서는 최소 칸 폭 */
      --jd-desc-col-min: 10rem;
      row-gap: var(--jd-space-4);
    }
    /* bordered는 칸을 선으로 붙여 간격이 0이다(원형이 0px로 덮는다) — 칸이 카드라
     최소 폭만 이 스킨 쪽으로 당긴다. 원형의 (0,2,0)을 이겨야 해서 box를 함께 건다. */
    jd-key-value-grid .jd-descriptions__box[data-bordered] .jd-descriptions__list {
      --jd-desc-col-min: 11rem;
    }

    /* 타이포 — 원형의 vertical 규칙(0,2,0)을 이겨야 하므로 box를 함께 건다 */
    jd-key-value-grid .jd-descriptions__box .jd-descriptions__label {
      margin-block-end: var(--jd-space-1);
      font-size: 0.625rem;
      font-weight: var(--jd-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--jd-color-muted);
    }
    jd-key-value-grid .jd-descriptions__box .jd-descriptions__value {
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
      border-radius: var(--jd-radius-sm);
      padding-inline: var(--jd-space-1);
      margin-inline: calc(-1 * var(--jd-space-1));
      transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    jd-key-value-grid .jd-descriptions__box .jd-descriptions__value:hover {
      background: var(--jd-color-card-hover);
    }

    /* bordered — 라벨 셀 틴트 대신 항목 전체가 카드다 (v2 bg-white p-3) */
    jd-key-value-grid .jd-descriptions__box[data-bordered] .jd-descriptions__item {
      padding: var(--jd-space-3);
      background: var(--jd-color-card);
    }
    jd-key-value-grid .jd-descriptions__box[data-bordered] .jd-descriptions__label {
      padding: 0;
      background: none;
      border: 0;
    }
    jd-key-value-grid .jd-descriptions__box[data-bordered] .jd-descriptions__value {
      padding-block: 0;
      padding-inline: var(--jd-space-1);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-key-value-grid .jd-descriptions__box .jd-descriptions__value {
        transition: none;
      }
    }
  }
`;
