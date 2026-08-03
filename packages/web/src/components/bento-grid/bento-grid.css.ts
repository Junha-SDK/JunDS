import { css } from "../../core/styles.js";

/**
 * v2 값: 격자 `grid auto-rows-[180px] grid-cols-4` + `gap: gap*4px`(기본 4 → 16px),
 * 아이템 `rounded-2xl border border-border bg-white p-5 overflow-hidden
 * transition-shadow duration-300 hover:shadow-lg`.
 * 기본값은 전부 base 규칙이 담당한다 — 프롭을 주면 인라인 스타일이 이긴다(§4.3).
 *
 * v2에서 고친 둘: 고정 4열은 좁은 부모에서 셀을 짓눌렀고, 고정 180px 행은 내용을
 * 아래에서 잘랐다(실측). 열은 부모 폭 기준으로 접히고, 행은 180px을 최소로만 쓴다.
 */
export default css`
  @layer junds.base {
    jd-bento-grid:not(:defined) {
      display: grid;
    }
    jd-bento-grid-item:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-bento-grid {
      --jd-bento-gap: var(--jd-space-4);
      /* 계산식에는 실제 간격이 아니라 **상한**을 넣는다 — gap 스타일 프롭은 인라인으로
       들어와 시트가 볼 수 없다. 상한보다 좁은 간격이면 열 수가 그대로 유지되고,
       상한을 크게 잡아도 1fr가 남는 폭을 도로 나눠 가지므로 보이는 폭은 같다. */
      --jd-bento-gap-max: var(--jd-space-6);
      --jd-bento-cols: 4;
      --jd-bento-col-min: 11rem;
      display: grid;
      /* 4열은 넓을 때의 이야기다. 고정 repeat(4)는 좁은 부모 안에서 셀을 60px로 눌러
       제목이 세로로 서거나 잘린다 — 하한을 두고 auto-fit에 맡기면 넓을 때는 그대로
       4열이고 좁아지면 3 → 2 → 1열로 접힌다(§5). 뷰포트가 아니라 부모 폭을 본다. */
      grid-template-columns: repeat(
        auto-fit,
        minmax(
          min(
            100%,
            max(
              var(--jd-bento-col-min),
              (100% - (var(--jd-bento-cols) - 1) * var(--jd-bento-gap-max)) / var(--jd-bento-cols)
            )
          ),
          1fr
        )
      );
      /* 열이 접힌 뒤 col-span이 남은 열 수를 넘으면 암시 열이 생긴다 — 폭 0으로 못 박아
       격자가 부모를 밀고 나가지 못하게 한다(§6) */
      grid-auto-columns: 0;
      /* 180px은 최소이지 정답이 아니다 — 고정 행이면 "이번 달 수익률"의 둘째 줄이
       그대로 잘린다(실측). 내용이 넘치면 행이 자란다. */
      grid-auto-rows: minmax(180px, auto);
      gap: var(--jd-bento-gap);
    }

    jd-bento-grid-item {
      display: block;
      box-sizing: border-box;
      min-width: 0; /* 격자 자식 기본 min-width:auto가 칸을 밀어내지 못하게(§5) */
      padding: var(--jd-space-5);
      overflow: hidden;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-2xl);
      /* 면만 있는 카드는 색종이로 읽힌다 — 쉬는 상태의 얕은 그림자가 있어야
       hover의 shadow-lg가 '떠오름'으로 읽힌다(§2) */
      box-shadow: var(--jd-shadow-xs);
      word-break: keep-all; /* 셀 안의 CJK 제목이 글자 단위로 쪼개지지 않게 */
      overflow-wrap: break-word;
      transition: box-shadow var(--jd-duration-slow) var(--jd-easing-ease-out);
    }
    jd-bento-grid-item:hover,
    jd-bento-grid-item:focus-within {
      box-shadow: var(--jd-shadow-lg);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-bento-grid-item {
        transition: none;
      }
    }
  }
`;
