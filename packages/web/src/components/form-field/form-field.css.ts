import { css } from "../../core/styles.js";

/**
 * jd-form-field CSS — v2 composites/FormField(flex-col gap-1.5 · Label · text-xs 에러/힌트)
 * 의 토큰 번역. 에러 행은 jd-text-field와 같은 어휘(아이콘 + danger 텍스트).
 * v2 힌트의 text-muted-light(2.7:1)는 AA 미달 → --jd-color-muted (DEC-027 선례).
 */
export default css`
  @layer junds.components {
    jd-form-field {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1-5);
      font-family: var(--jd-font-sans);
    }

    .jd-form-field__label {
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-tight);
      color: var(--jd-color-foreground);
    }
    .jd-form-field__label[hidden] {
      display: none;
    }
    jd-form-field[required] > .jd-form-field__label::after {
      content: "*";
      margin-inline-start: var(--jd-space-0-5);
      color: var(--jd-color-danger);
    }

    .jd-form-field__error {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
      margin: 0;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-normal);
      color: var(--jd-color-danger);
    }
    .jd-form-field__error[hidden] {
      display: none;
    }
    .jd-form-field__error > svg {
      flex-shrink: 0;
    }

    .jd-form-field__hint {
      margin: 0;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-normal);
      color: var(--jd-color-muted);
    }
    .jd-form-field__hint[hidden] {
      display: none;
    }

    /* 컨트롤이 하나도 없는 필드는 라벨·설명만 떠 있는 **빈 껍데기**로 읽힌다(실측).
     컨트롤이 설 자리를 md 컨트롤과 같은 높이의 점선 상자로 남겨 "여기에 무엇이
     온다"를 보이게 한다. 조건은 "골격 3종(label·error·hint) 말고 자식 요소가 하나도
     없을 때"라 실제 사용(컨트롤을 넣은 경우)에는 절대 걸리지 않는다.
     ::after인 이유: ::before는 라벨보다 앞에 오는 플렉스 아이템이 된다. order로
     에러·힌트 뒤에서 되돌린다(자리는 라벨과 설명 사이). */
    jd-form-field:not(
        :has(> :not(.jd-form-field__label):not(.jd-form-field__error):not(.jd-form-field__hint))
      )::after {
      content: "";
      order: 1;
      height: 2.25rem;
      box-sizing: border-box;
      border: var(--jd-border-thin) dashed
        color-mix(in srgb, var(--jd-color-border) 60%, var(--jd-color-muted));
      border-radius: var(--jd-radius-lg);
      background: var(--jd-color-control-surface-muted);
    }
    .jd-form-field__error,
    .jd-form-field__hint {
      order: 2;
    }
  }
`;
