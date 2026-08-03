/**
 * jd-recently-viewed CSS — v2 finance/RecentlyViewed의 Tailwind를 토큰으로 의미 번역.
 *
 * v2 값: 바깥 px-3 pb-4, 헤더 px-3 mb-1.5(제목 10.5px extrabold tracking .08em muted,
 * 지우기 10px semibold muted), 목록 space-y-0.5, 행 px-3 py-1.5 rounded-lg 12.5px
 * hover:bg-soft, 이름 flex-1 truncate bold, 시세 bm-num 11px, 등락 10.5px bold
 * min-w-38 우측정렬 · 상승/하락 색.
 *
 * 등락색 리터럴(#e11d48/#2563eb)은 걷어내고 --jd-finance-* 훅을 경유한다 — 한국 관례
 * (적상승·청하락)는 앱이 시작 시 1회 덮어써서 얻는 전환이고, 여기에 박으면 같은 화면의
 * price-badge와 색이 갈라진다(§8).
 * 초점 링은 존재하지 않는 --jd-color-focus를 참조하고 있었다 — var()가 풀리지 않는
 * outline 선언은 통째로 무효라 키보드 사용자에게 링이 아예 보이지 않았다(§1).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-recently-viewed {
      display: block;
      padding-inline: var(--jd-space-3);
      padding-block-end: var(--jd-space-4);
      font-family: var(--jd-font-sans);
      --_up: var(--jd-fin-up, var(--jd-finance-up, var(--jd-color-success)));
      --_down: var(--jd-fin-down, var(--jd-finance-down, var(--jd-color-danger)));
      --_muted: var(--jd-fin-muted, var(--jd-color-muted));
      --_hover: var(--jd-fin-soft-100, var(--jd-color-card-hover));
    }
    jd-recently-viewed[hidden],
    jd-recently-viewed:not(:defined) {
      display: none;
    }

    .jd-recently-viewed__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-inline: var(--jd-space-3);
      margin-block-end: var(--jd-space-1);
    }
    .jd-recently-viewed__title {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--_muted);
    }
    .jd-recently-viewed__clear {
      appearance: none;
      margin: 0;
      padding: 0;
      border: 0;
      background: none;
      font-family: inherit;
      font-size: 10px;
      font-weight: 600;
      color: var(--_muted);
      cursor: pointer;
    }
    .jd-recently-viewed__clear:hover {
      color: var(--jd-color-foreground);
    }
    .jd-recently-viewed__clear:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
      border-radius: var(--jd-radius-sm);
    }

    .jd-recently-viewed__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .jd-recently-viewed__row {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: 6px var(--jd-space-3);
      border-radius: var(--jd-radius-lg);
      font-size: 12.5px;
      color: var(--jd-color-foreground);
      text-decoration: none;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-recently-viewed__row:hover {
      background: var(--_hover);
    }
    /* 행은 목록에 꽉 차 있어 바깥 offset이 이웃 행에 잘린다 — 안쪽으로 그린다 */
    .jd-recently-viewed__row:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
    }
    .jd-recently-viewed__name {
      flex: 1;
      min-width: 0;
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* 시세·등락은 좁은 사이드바에서도 한 덩어리다 — 한 글자씩 세로로 서면 수가 아니다(§5) */
    .jd-recently-viewed__price {
      flex-shrink: 0;
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--jd-color-foreground);
    }
    .jd-recently-viewed__change {
      flex-shrink: 0;
      white-space: nowrap;
      min-width: 38px;
      text-align: right;
      font-size: 10.5px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--_muted);
    }
    .jd-recently-viewed__change[data-dir="up"] {
      color: var(--_up);
    }
    .jd-recently-viewed__change[data-dir="down"] {
      color: var(--_down);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-recently-viewed__row {
        transition: none;
      }
    }
  }
`;
