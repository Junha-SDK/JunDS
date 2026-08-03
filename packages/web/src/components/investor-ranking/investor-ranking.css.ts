/**
 * jd-investor-ranking CSS — v2 finance/InvestorRanking.
 * bm-card → 카드 크롬, bm-num → tabular-nums. 투자자색은 열의 인라인 --_c가 나른다(점·1위 배지).
 * 색 기본값은 :where()로 특이도 0 → 소비자가 태그 셀렉터로 재정의.
 *
 * 3열 전환은 뷰포트가 아니라 **카드 폭**으로 판단한다 — 뷰포트가 넓어도 카드가 좁은 자리에
 * 놓이면 3열이 되어 종목명이 두세 글자로 잘렸다(정보 파괴). 컨테이너 질의로 바꾸고 이름 트랙에
 * 최소 폭을 줘서 말줄임이 "정보가 남는 말줄임"이 되게 한다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-investor-ranking:not(:defined) {
      display: block;
    }

    :where(jd-investor-ranking) {
      /* 투자자 3구분은 의미색(success/danger/…)이 아니라 **계열색**이다 — hue 팔레트에서
       뽑아야 danger가 '위험'이 아니라 '외국인'을 뜻하는 혼선이 생기지 않는다. */
      --jd-fin-foreign: var(--jd-color-hue-red);
      --jd-fin-institution: var(--jd-color-hue-purple);
      --jd-fin-individual: var(--jd-color-hue-amber);
      /* 등락색은 직접 칠하지 않고 앱이 1회 덮어쓰는 훅을 경유한다 — 직접 칠하면 한국 관례
       override가 이 컴포넌트만 비껴가 한 화면에서 등락색이 갈라진다. */
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
    }
    jd-investor-ranking {
      display: block;
      /* 열 배분의 기준은 뷰포트가 아니라 이 카드가 실제로 받은 폭이다 */
      /* inline-size 컨테이너는 **내용이 폭을 정하지 못한다**. 부모가 준 폭을 명시적으로
         받지 않으면 flex·inline 문맥에서 호스트가 0으로 접혀 카드가 통째로 사라진다(실측). */
      width: 100%;
      container: jd-ir / inline-size;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    .jd-ir__card {
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      /* 채움만 있는 면은 색종이로 읽힌다 — 얕은 그림자로 면을 띄운다 */
      box-shadow: var(--jd-shadow-xs);
    }

    /* 좁아지면 제목과 주석을 **줄로 접는다** — 글자를 세로로 세우지 않는다 */
    .jd-ir__head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--jd-space-1) var(--jd-space-2);
      min-width: 0;
      padding: var(--jd-space-2) var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-ir__title {
      font-size: 12.5px;
      font-weight: 800;
      white-space: nowrap;
    }
    .jd-ir__sub-note {
      margin-inline-start: var(--jd-space-2);
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }

    .jd-ir__grid {
      display: grid;
      grid-template-columns: 1fr;
    }
    /* 42rem = 한 열이 (순위 16 + 이름 최소 6rem + 순매수) 를 감당하는 최소 카드 폭.
     이보다 좁으면 3열로 쪼개는 순간 이름이 남지 않는다 — 세로로 쌓는다. */
    @container jd-ir (min-width: 42rem) {
      .jd-ir__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .jd-ir__col {
      min-width: 0;
      border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-ir__col[data-last] {
      border-inline-end: none;
    }
    @container jd-ir (max-width: 41.999rem) {
      .jd-ir__col {
        border-inline-end: none;
        border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
      }
      .jd-ir__col[data-last] {
        border-block-end: none;
      }
    }

    .jd-ir__col-head {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      padding: 6px var(--jd-space-3);
      background: var(--jd-color-card-hover);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-ir__dot {
      width: 8px;
      height: 8px;
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
      background: var(--_c, var(--jd-color-muted));
    }
    .jd-ir__col-label {
      font-size: 11.5px;
      font-weight: 800;
      white-space: nowrap;
    }

    .jd-ir__list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    /* 이름 트랙에 바닥을 준다 — 1fr(=minmax(auto,1fr))은 남는 폭을 순매수 열에 다 내주고
     "삼…"처럼 두세 글자만 남긴다. 말줄임은 정보가 남을 때만 말줄임이다. */
    .jd-ir__row {
      display: grid;
      grid-template-columns: 16px minmax(6rem, 1fr) auto;
      gap: 6px;
      align-items: center;
      padding: 6px var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-ir__row:last-child {
      border-block-end: none;
    }

    .jd-ir__rank {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      background: var(--jd-color-card-hover);
      color: var(--jd-color-muted);
    }
    .jd-ir__rank[data-first] {
      background: var(--_c, var(--jd-color-primary));
      color: #fff;
    }

    .jd-ir__meta {
      min-width: 0;
    }
    .jd-ir__name {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--jd-color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-ir__row-sub {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      min-width: 0;
      margin-block-start: 2px;
    }
    /* 값 + 단위는 한 덩어리다 — 접히면 "1,840"과 "억"이 다른 줄에 선다 */
    .jd-ir__close {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }
    .jd-ir__pct {
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .jd-ir__net {
      font-size: 11.5px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    /* live 틱마다 방향이 바뀐다 — 색이 튀지 않게 짧게 건너간다 */
    .jd-ir__pct,
    .jd-ir__net {
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-ir__pct[data-dir="up"],
    .jd-ir__net[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-ir__pct[data-dir="down"],
    .jd-ir__net[data-dir="down"] {
      color: var(--jd-fin-down);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-ir__pct,
      .jd-ir__net {
        transition: none;
      }
    }
  }
`;
