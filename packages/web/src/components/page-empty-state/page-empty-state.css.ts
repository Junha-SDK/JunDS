import { css } from "../../core/styles.js";

/**
 * jd-page-empty-state CSS — 카드 host + size 패딩 3단 + 이모지 아이콘.
 * 내부 골격(.jd-empty-state__title/__desc)은 empty-state.css.ts(공용 번들)가 담고,
 * 여기서는 host 카드·패딩과 아이콘 칩 해제만 얹는다(Result가 result.css.ts에서
 * .jd-empty-state__* 를 부분 재선언하는 것과 동일 경로 — §6 R12).
 * host 규칙은 tag 셀렉터라 base의 `jd-empty-state {}`(다른 태그)를 상속받지 못하므로
 * flex 중앙정렬을 여기서 다시 선언한다.
 */
export default css`
  @layer junds.components {
    jd-page-empty-state {
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      text-align: center;
      font-family: var(--jd-font-sans);
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-xl);
      /* 기본 md */
      padding: var(--jd-space-12) var(--jd-space-6);
    }
    jd-page-empty-state[size="sm"] {
      padding: var(--jd-space-8) var(--jd-space-6);
    }
    jd-page-empty-state[size="lg"] {
      padding: var(--jd-space-16) var(--jd-space-6);
    }

    /* 아이콘 칩 해제 — 이모지/도형을 그대로 크게 */
    jd-page-empty-state .jd-empty-state__icon {
      width: auto;
      height: auto;
      background: none;
      margin-block-end: var(--jd-space-4);
      color: var(--jd-color-muted);
    }
    jd-page-empty-state .jd-page-empty-state__emoji {
      font-size: 40px;
      line-height: 1;
      display: block;
    }
    jd-page-empty-state > [slot="action"] {
      margin-block-start: var(--jd-space-5);
    }
  }
`;
