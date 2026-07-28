import { css } from "../../core/styles.js";
import { BREAKPOINTS, CONTAINER_SIZES } from "../../core/tokens.generated.js";

/**
 * size 프리셋 = tokens/container.json 정본 (xs 512 … 2xl 1536, 기본 lg).
 * 값은 `--jd-container-*`로 참조하고, `full`만 상한 없음이라 100%로 따로 적는다.
 *
 * 규칙을 프리셋마다 손으로 적지 않고 CONTAINER_SIZES를 순회해 만든다 — 프리셋이
 * 늘거나 줄면 CSS가 따라온다. 기본 lg도 `[size="lg"]` 규칙이 아니라 var 참조라
 * 프리셋 표가 한 곳이다.
 *
 * `@media`는 var()를 못 쓰므로 조건 숫자만 생성된 BREAKPOINTS에서 보간한다 —
 * 640을 손으로 적어 두면 tokens/breakpoint.json을 고쳤을 때 이 파일만 뒤처진다.
 */
const sizeRules = Object.keys(CONTAINER_SIZES)
  .map((size) => `  jd-container[size="${size}"] { max-width: var(--jd-container-${size}); }`)
  .join("\n");

export default css`
  @layer junds.components {
    jd-container {
      display: block;
      box-sizing: border-box; /* DEC-014-9 */
      width: 100%;
      margin-inline: auto;
      max-width: var(--jd-container-lg);
      padding-inline: var(--jd-space-4);
    }
    ${sizeRules}
    jd-container[size="full"] {
      max-width: 100%;
    }
    jd-container[no-center] {
      margin-inline: 0;
    }

    @media (min-width: ${String(BREAKPOINTS.sm)}px) {
      jd-container {
        padding-inline: var(--jd-space-6);
      }
    }
  }
`;
