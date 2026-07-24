/**
 * jd-key-value-grid-client CSS — jd-key-value-grid의 스킨을 별칭 태그에 그대로 재적용.
 *
 * descriptions.css의 **클래스 규칙**(box/list/label/value)은 클래스 셀렉터라 별칭
 * 태그에도 캐스케이드된다. 그러나 KeyValueGrid 고유 스킨(반응형 열·타이포·bordered)은
 * `jd-key-value-grid …` **태그 셀렉터**라 별칭 태그에 닿지 않는다 — 그 규칙만 여기서
 * `jd-key-value-grid-client`로 태그를 바꿔 복제한다(원형은 배정 밖이라 수정 불가).
 * 값은 key-value-grid.css.ts와 문자 단위로 같다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-key-value-grid-client:not(:defined) { display: block; }
  jd-key-value-grid-client:not(:defined) > script { display: none; }
}
@layer junds.components {
  jd-key-value-grid-client { display: block; }

  jd-key-value-grid-client .jd-descriptions__list {
    grid-template-columns: minmax(0, 1fr);
    column-gap: var(--jd-space-4); row-gap: var(--jd-space-4);
  }
  jd-key-value-grid-client .jd-descriptions__item { grid-column: span 1; }

  @media (min-width: 640px) {
    jd-key-value-grid-client .jd-descriptions__list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    jd-key-value-grid-client .jd-descriptions__item[data-span="2"],
    jd-key-value-grid-client .jd-descriptions__item[data-span="3"],
    jd-key-value-grid-client .jd-descriptions__item[data-span="4"] { grid-column: span 2; }
  }
  @media (min-width: 768px) {
    jd-key-value-grid-client .jd-descriptions__list {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    jd-key-value-grid-client[columns="2"] .jd-descriptions__list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    jd-key-value-grid-client[columns="4"] .jd-descriptions__list {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    jd-key-value-grid-client .jd-descriptions__item[data-span="3"] { grid-column: span 3; }
    jd-key-value-grid-client .jd-descriptions__item[data-span="4"] { grid-column: span 4; }
  }

  jd-key-value-grid-client .jd-descriptions__box .jd-descriptions__label {
    margin-block-end: var(--jd-space-1);
    font-size: .625rem; font-weight: var(--jd-weight-medium);
    text-transform: uppercase; letter-spacing: .05em;
    color: var(--jd-color-muted);
  }
  jd-key-value-grid-client .jd-descriptions__box .jd-descriptions__value {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
    border-radius: var(--jd-radius-sm);
    padding-inline: var(--jd-space-1);
    margin-inline: calc(-1 * var(--jd-space-1));
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  jd-key-value-grid-client .jd-descriptions__box .jd-descriptions__value:hover {
    background: var(--jd-color-card-hover);
  }

  jd-key-value-grid-client .jd-descriptions__box[data-bordered] .jd-descriptions__item {
    padding: var(--jd-space-3);
    background: var(--jd-color-card);
  }
  jd-key-value-grid-client .jd-descriptions__box[data-bordered] .jd-descriptions__label {
    padding: 0; background: none; border: 0;
  }
  jd-key-value-grid-client .jd-descriptions__box[data-bordered] .jd-descriptions__value {
    padding-block: 0; padding-inline: var(--jd-space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    jd-key-value-grid-client .jd-descriptions__box .jd-descriptions__value { transition: none; }
  }
}`;
