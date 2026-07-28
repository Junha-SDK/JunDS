import { css } from "../../core/styles.js";

/**
 * 기본 크기는 1rem = --jd-text-lg, lineHeight="relaxed".
 * v2에서 이 1rem은 styleProps 어휘의 "md"였는데, 그 어휘가 토큰과 충돌해 리터럴로
 * 박혀 있었다. DEC-045로 어휘를 토큰 하나로 합치면서 같은 1rem이 토큰 이름 "lg"가
 * 됐다 — 픽셀은 그대로고 이름만 정본 척도로 옮겨왔다.
 * 내부 요소는 크기·줄간만 상속 리셋 — strong/em의 UA font-weight/style은 살린다.
 */
export default css`
  @layer junds.components {
    jd-text {
      display: block;
      font-size: var(--jd-text-lg);
      line-height: var(--jd-leading-relaxed);
    }
    jd-text[as="span"],
    jd-text[as="strong"],
    jd-text[as="em"],
    jd-text[as="small"],
    jd-text[as="label"] {
      display: inline;
    }

    .jd-text {
      margin: 0;
      font-size: inherit;
      line-height: inherit;
    }

    jd-text[dimmed] {
      color: var(--jd-color-muted);
    }
    jd-text[mono] {
      font-family: var(--jd-font-mono);
    }

    jd-text[truncate] {
      overflow: hidden;
    }
    jd-text[truncate] > .jd-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;
