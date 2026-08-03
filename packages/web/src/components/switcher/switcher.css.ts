import { css } from "../../core/styles.js";

/**
 * 임계 폭 미만이면 가로 → 세로로 **스스로** 뒤집히는 배치. 미디어 쿼리가 없다.
 *
 * ## 원리
 * `flex-basis: calc((threshold - 100%) * 999)`.
 * `100%`는 **컨테이너 폭**이므로:
 * - 컨테이너가 임계값보다 좁으면 괄호가 양수 → basis가 거대해져 아이템마다 한 줄을 쓴다.
 * - 임계값 이상이면 음수 → basis가 0으로 잘려 아이템들이 한 줄을 나눠 쓴다.
 *
 * ## 왜 미디어 쿼리가 아닌가
 * 미디어 쿼리는 **뷰포트**를 본다. 그래서 같은 컴포넌트를 사이드바 안에 넣으면
 * 화면은 넓은데 자리는 좁아 가로로 깔린 채 찌그러진다 — 컴포넌트를 어디에 두느냐에
 * 따라 배치가 틀어지고, 그때마다 새 브레이크포인트를 고민해야 한다.
 * 이 방식은 **자기가 놓인 자리의 폭**을 보므로 어디에 중첩해도 맞게 동작한다.
 * iOS가 브레이크포인트를 뷰포트가 아니라 컨테이너 폭으로 해석하는 것과 같은 규칙이다
 * (04 §10) — 웹과 iOS가 같은 의미를 갖는다.
 */
export default css`
  @layer junds.components {
    jd-switcher {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-4);
      /* 기본 임계값 — 두 칸이 나란히 서기엔 640px 정도가 하한이라는 경험값 */
      --jd-switcher-threshold: var(--jd-breakpoint-sm);
    }

    jd-switcher > * {
      flex-grow: 1;
      flex-basis: calc((var(--jd-switcher-threshold) - 100%) * 999);
    }

    /* 임계값은 브레이크포인트 이름으로 고른다 — jd-show·p="4 md:6"와 같은 어휘 */
    jd-switcher[threshold="sm"] {
      --jd-switcher-threshold: var(--jd-breakpoint-sm);
    }
    jd-switcher[threshold="md"] {
      --jd-switcher-threshold: var(--jd-breakpoint-md);
    }
    jd-switcher[threshold="lg"] {
      --jd-switcher-threshold: var(--jd-breakpoint-lg);
    }
    jd-switcher[threshold="xl"] {
      --jd-switcher-threshold: var(--jd-breakpoint-xl);
    }
    jd-switcher[threshold="2xl"] {
      --jd-switcher-threshold: var(--jd-breakpoint-2xl);
    }
  }
`;
