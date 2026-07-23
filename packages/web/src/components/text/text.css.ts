import { css } from "../../core/styles.js";

/**
 * v2 기본값: fontSize="md"(1rem — styleProps 어휘, --jd-text-md와 값 충돌로 리터럴),
 * lineHeight="relaxed". 내부 요소는 크기·줄간만 상속 리셋 — strong/em의 UA
 * font-weight/style은 살린다(v2 Box도 건드리지 않았다).
 */
export default css`
@layer junds.components {
  jd-text {
    display: block;
    font-size: 1rem;
    line-height: var(--jd-leading-relaxed);
  }
  jd-text[as="span"],
  jd-text[as="strong"],
  jd-text[as="em"],
  jd-text[as="small"],
  jd-text[as="label"] { display: inline; }

  .jd-text {
    margin: 0;
    font-size: inherit;
    line-height: inherit;
  }

  jd-text[dimmed] { color: var(--jd-color-muted); }
  jd-text[mono] { font-family: var(--jd-font-mono); }

  jd-text[truncate] { overflow: hidden; }
  jd-text[truncate] > .jd-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}`;
