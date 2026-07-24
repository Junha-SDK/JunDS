import { css } from "../../core/styles.js";

/**
 * jd-stats-grid CSS — v2 patterns/StatsGrid colsMap 번역.
 * v2: gap-4, colsMap { 2:"grid-cols-2", 3:"grid-cols-3",
 *   4:"grid-cols-2 lg:grid-cols-4", 5:"grid-cols-2 lg:grid-cols-5" }.
 * lg 브레이크는 Tailwind 기본 1024px — 컴포넌트 고유 기하라 리터럴 허용(§4.3).
 * minmax(0,1fr)로 긴 값이 트랙을 밀어 넘치지 않게 한다(grid-cols-* 기본 동형).
 */
export default css`
@layer junds.components {
  jd-stats-grid {
    display: grid;
    gap: var(--jd-space-4);
    /* 미지정/기본(columns=4)의 좁은 화면 — 2열 */
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  jd-stats-grid[columns="2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  jd-stats-grid[columns="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }

  @media (min-width: 1024px) {
    jd-stats-grid[columns="4"] { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    jd-stats-grid[columns="5"] { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  }

  .jd-stats-grid__cell { min-width: 0; } /* 카드 안 긴 값이 트랙을 넘기지 않게 */
}`;
