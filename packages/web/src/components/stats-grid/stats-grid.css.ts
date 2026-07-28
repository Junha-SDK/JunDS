import { css } from "../../core/styles.js";

/**
 * jd-stats-grid CSS — v2 patterns/StatsGrid colsMap 번역.
 * v2: gap-4, colsMap { 2:"grid-cols-2", 3:"grid-cols-3",
 *   4:"grid-cols-2 lg:grid-cols-4", 5:"grid-cols-2 lg:grid-cols-5" }.
 * lg 브레이크는 Tailwind 기본 1024px — 컴포넌트 고유 기하라 리터럴 허용(§4.3).
 *
 * 열 **수**는 v2 지도를 그대로 따르되 열 **폭**은 칸이 정한다. 고정 repeat(N)은
 * 넓은 화면의 좁은 칼럼(문서 카드·사이드바) 안에서 카드를 100px대로 눌러,
 * 12,480,000 과 원 이 서로 다른 줄로 갈라졌다(실측 · §5). auto-fit + "요청 열 수로
 * 나눈 폭"을 하한으로 두면 넓을 때는 정확히 N열이고 좁아지면 스스로 접힌다
 * (jd-descriptions 선례 — 다만 카드 수가 열 수보다 적을 수 있어 auto-fill을 쓴다).
 */
export default css`
  @layer junds.components {
    jd-stats-grid {
      --jd-stats-grid-gap: var(--jd-space-4);
      /* 라벨 + 2xl 수치 + 단위가 한 줄에 서는 최소 카드 폭(패딩 2rem 포함) */
      --jd-stats-grid-col-min: 12rem;
      /* 미지정/기본(columns=4)의 좁은 화면 — 2열 */
      --_jd-sg-n: 2;
      display: grid;
      gap: var(--jd-stats-grid-gap);
      /* auto-fit이 아니라 auto-fill — 카드가 열 수보다 적을 때 빈 트랙을 접어 버리면
       카드 두 장이 화면 절반씩 차지한다. v2의 고정 grid-cols-N과 같은 폭을 유지한다. */
      grid-template-columns: repeat(
        auto-fill,
        minmax(
          min(
            100%,
            max(
              var(--jd-stats-grid-col-min),
              (100% - (var(--_jd-sg-n) - 1) * var(--jd-stats-grid-gap)) / var(--_jd-sg-n)
            )
          ),
          1fr
        )
      );
    }

    jd-stats-grid[columns="2"] {
      --_jd-sg-n: 2;
    }
    jd-stats-grid[columns="3"] {
      --_jd-sg-n: 3;
    }

    @media (min-width: 1024px) {
      /* 기본값 columns=4는 attribute로 반영되지 않으므로(§1.3 reflect는 set 시점)
       속성 없는 호스트도 여기서 4를 받는다 — [columns="4"]만 적으면 기본 사용이
       넓은 화면에서도 2열에 머물렀다. 2·3은 위 속성 셀렉터가 더 세서 그대로 남는다. */
      jd-stats-grid {
        --_jd-sg-n: 4;
      }
      jd-stats-grid[columns="5"] {
        --_jd-sg-n: 5;
      }
    }

    .jd-stats-grid__cell {
      /* 카드 안 긴 값이 트랙을 넘기지 않게 */
      min-width: 0;
      /* 지표 격자의 수치는 열끼리 눈금이 맞아야 한다 — 자릿수가 흔들리면 어긋난다(§5) */
      font-variant-numeric: tabular-nums;
    }
  }
`;
