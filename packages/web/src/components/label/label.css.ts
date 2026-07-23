import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-label { display: inline-block; }

  .jd-label {
    font-family: var(--jd-font-sans);
    font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
    cursor: inherit;
  }
  jd-label[required] > .jd-label::after {
    content: "*";
    margin-inline-start: var(--jd-space-0-5);
    color: var(--jd-color-danger);
  }
}`;
