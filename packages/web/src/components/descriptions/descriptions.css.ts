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
    jd-descriptions:not(:defined) {
      display: block;
    }
    jd-descriptions:not(:defined) > script {
      display: none;
    }
  }
  @layer junds.components {
    jd-descriptions {
      display: block;
    }

    .jd-descriptions__box {
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    .jd-descriptions__box[data-bordered] {
      overflow: hidden;
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
    }

    .jd-descriptions__title {
      margin: 0 0 var(--jd-space-3);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
    }
    .jd-descriptions__title[hidden] {
      display: none;
    }
    .jd-descriptions__box[data-bordered] > .jd-descriptions__title {
      margin: 0;
      padding: var(--jd-space-3) var(--jd-space-4);
      background: var(--jd-color-card-hover);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }

    /* 열 **수**는 소비자가 정하지만 열 **폭**은 칸이 정한다. 고정 repeat(N)은 좁은
     칼럼(카드 안·사이드바) 안에서 라벨 100px에게 칸을 다 빼앗기고, 남은 값 칸이
     한 글자씩 세로로 선다(실측). auto-fit + "요청 열 수로 나눈 폭"을 하한으로 두면
     넓을 때는 정확히 --jd-desc-cols 열이고 좁아지면 스스로 열을 접는다 — 뷰포트
     미디어쿼리와 달리 부모 폭을 본다. */
    .jd-descriptions__list {
      --jd-desc-col-gap: var(--jd-space-6);
      --jd-desc-col-min: 14rem;
      display: grid;
      margin: 0;
      grid-template-columns: repeat(
        auto-fit,
        minmax(
          min(
            100%,
            max(
              var(--jd-desc-col-min),
              (100% - (var(--jd-desc-cols, 2) - 1) * var(--jd-desc-col-gap)) /
                var(--jd-desc-cols, 2)
            )
          ),
          1fr
        )
      );
      /* 접힌 격자에서 span이 열 수를 넘으면 암시 열이 생긴다 — 폭 0으로 못 박아
       목록이 상자를 밀고 나가지 못하게 한다(§6) */
      grid-auto-columns: 0;
      column-gap: var(--jd-desc-col-gap);
      row-gap: var(--jd-space-3);
    }

    /* layout 기본 horizontal — 라벨 왼쪽 고정폭 + 값 나머지 */
    .jd-descriptions__item {
      grid-column: span var(--jd-desc-span, 1);
      display: flex;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-descriptions__box[data-layout="vertical"] .jd-descriptions__item {
      display: block;
      gap: 0;
    }

    /* 라벨 폭은 고정이되 칸의 절반을 넘지 않는다 — 넘게 두면 값 칸이 0으로 눌려
     한 글자씩 세로로 선다. keep-all은 라벨이 어절 중간에서 끊기지 않게 한다. */
    .jd-descriptions__label {
      margin: 0;
      /* v2의 w-[100px]/w-[120px]는 Tailwind preflight(border-box) 위의 **총폭**이다 —
       content-box로 두면 bordered 라벨 셀이 패딩만큼(24px) 넓어져 값 칸을 더 좁힌다 */
      box-sizing: border-box;
      flex: 0 0 var(--jd-desc-label-w, 100px);
      max-width: 45%;
      padding-block-start: var(--jd-space-0-5);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-muted);
      word-break: keep-all;
    }
    .jd-descriptions__box[data-layout="vertical"] .jd-descriptions__label {
      flex: none;
      /* 라벨이 값 위에 오는 배치에서는 폭을 나눌 상대가 없다 — 상한을 되돌린다 */
      max-width: none;
      padding-block-start: 0;
      margin-block-end: var(--jd-space-0-5);
    }

    /* 값은 길이를 모른다: 어절은 지키고(keep-all) 한 어절이 칸보다 길 때만 끊는다.
     기본 CJK 줄바꿈은 글자 단위라 좁은 칸에서 세로 한 줄이 된다. */
    .jd-descriptions__value {
      margin: 0;
      box-sizing: border-box;
      flex: 1 1 auto;
      min-width: 0;
      font-size: var(--jd-text-md);
      color: var(--jd-color-foreground);
      word-break: keep-all;
      overflow-wrap: break-word;
      /* 값은 대개 수치다 — 자릿수가 흔들리면 행끼리 눈금이 어긋난다 */
      font-variant-numeric: tabular-nums;
    }

    /* ── bordered 격자 ─────────────────────────────────────────── */
    .jd-descriptions__box[data-bordered] > .jd-descriptions__list {
      /* 칸을 선으로 붙이므로 열 간격이 0 — 열 폭 계산식도 같은 값을 써야 한다 */
      --jd-desc-col-gap: 0px;
      --jd-desc-col-min: 15rem;
      row-gap: 0;
      margin-inline-end: -1px;
      margin-block-end: -1px;
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
  }
`;
