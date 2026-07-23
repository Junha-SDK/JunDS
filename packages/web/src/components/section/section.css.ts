import { css } from "../../core/styles.js";

/**
 * v2 값: border 시 radius "xl"(16px — styleProps 어휘) + 1px border. 헤더 mb 16px,
 * 제목 = Heading level 4(1.125rem·semibold), 설명 mt 2px(0.5)·sm·muted.
 * 본문 = 세로 flex gap "md"(16px) 기본.
 */
export default css`
@layer junds.components {
  jd-section { display: block; }
  jd-section[border] {
    border: 1px solid var(--jd-color-border);
    border-radius: 16px;
  }

  .jd-section__header { margin-bottom: var(--jd-space-4); }
  .jd-section__header[hidden] { display: none; }
  .jd-section__title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-normal);
    color: var(--jd-color-foreground);
  }
  .jd-section__desc {
    margin: var(--jd-space-0-5) 0 0;
    font-size: 0.875rem;
    line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-muted);
  }

  .jd-section__body {
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-4);
  }
}`;
