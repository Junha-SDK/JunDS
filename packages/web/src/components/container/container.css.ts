import { css } from "../../core/styles.js";

/**
 * v2 sizeMap: xs 512 / sm 640 / md 768 / lg 1024(기본) / xl 1280 / 2xl 1536 / full 100%.
 * 기본 px는 {base:4, sm:6} — 정적 @media (sm=640px).
 */
export default css`
@layer junds.components {
  jd-container {
    display: block;
    width: 100%;
    margin-inline: auto;
    max-width: 1024px;
    padding-inline: var(--jd-space-4);
  }
  jd-container[size="xs"] { max-width: 512px; }
  jd-container[size="sm"] { max-width: 640px; }
  jd-container[size="md"] { max-width: 768px; }
  jd-container[size="xl"] { max-width: 1280px; }
  jd-container[size="2xl"] { max-width: 1536px; }
  jd-container[size="full"] { max-width: 100%; }
  jd-container[no-center] { margin-inline: 0; }

  @media (min-width: 640px) {
    jd-container { padding-inline: var(--jd-space-6); }
  }
}`;
