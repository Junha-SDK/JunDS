import { css } from "../../core/styles.js";

/**
 * jd-stat-card CSS — v2 composites/StatCard의 카드 크롬만. 골격(.jd-stat__*)은
 * stat.css가 이미 깔았고 여기서는 델타만 쓴다.
 *
 * v2 값: `bg-white border border-border rounded-xl p-4`, 라벨줄 mb-2, 값 text-2xl bold,
 * change는 `text-xs font-semibold px-1.5 py-0.5 rounded-md` 칩(up=success/success-light,
 * down=danger/danger-light, neutral=muted/gray-100), 아이콘 text-muted-light,
 * description `text-xs text-muted mt-1`, onClick이면 cursor-pointer + card-hover.
 */
export default css`
  @layer junds.components {
    jd-stat-card {
      display: block;
      box-sizing: border-box;
      padding: var(--jd-space-4);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      background: var(--jd-color-card);
      font-family: var(--jd-font-sans);
      transition: background var(--jd-duration-normal) var(--jd-easing-ease-out),
        border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
    }

    /* v2 라벨줄 mb-2 — 라벨과 값 사이만 벌린다 */
    jd-stat-card .jd-stat__text {
      gap: var(--jd-space-2);
    }
    jd-stat-card .jd-stat__row {
      gap: var(--jd-space-2);
      align-items: flex-end;
    }
    /* 값·단위 묶음도 카드의 눈금(v2 gap-2)과 밑선 맞춤(items-end)을 그대로 따른다 */
    jd-stat-card .jd-stat__pair {
      gap: var(--jd-space-2);
      align-items: flex-end;
    }
    jd-stat-card .jd-stat__label {
      font-weight: var(--jd-weight-medium);
    }
    jd-stat-card .jd-stat__value {
      font-weight: var(--jd-weight-bold);
    }
    jd-stat-card .jd-stat__main > [slot="icon"] {
      color: var(--jd-color-muted-light);
    }
    jd-stat-card .jd-stat__hint {
      margin-block-start: calc(var(--jd-space-1) * -1);
    }

    /* StatCard 고유 — 변화량이 배경 있는 칩이다(Stat·MetricCard는 맨 텍스트) */
    jd-stat-card .jd-stat__change {
      padding: var(--jd-space-0-5) var(--jd-space-1-5);
      border-radius: var(--jd-radius-md);
      font-weight: var(--jd-weight-semibold);
      background: var(--_jd-stat-trend-bg, transparent);
      margin-block-end: var(--jd-space-0-5);
    }
    /* 칩 배경은 글자색과 같은 등락 훅에서 뽑는다 — success-light/danger-light를 직접
     쓰면 앱이 --jd-finance-*를 덮었을 때 글자만 뒤집히고 배경은 원래 색으로 남아
     빨간 글자에 초록 칩 같은 조합이 나온다. 12%는 -light 토큰의 눈맛에 맞춘 값. */
    jd-stat-card[data-trend="up"] {
      --_jd-stat-trend-bg: color-mix(
        in srgb,
        var(--jd-finance-up, var(--jd-color-success)) 12%,
        transparent
      );
    }
    jd-stat-card[data-trend="down"] {
      --_jd-stat-trend-bg: color-mix(
        in srgb,
        var(--jd-finance-down, var(--jd-color-danger)) 12%,
        transparent
      );
    }
    jd-stat-card[data-trend="flat"] {
      --_jd-stat-trend-bg: var(--jd-color-border-light);
    }

    jd-stat-card[clickable] {
      cursor: pointer;
    }
    jd-stat-card[clickable]:hover {
      background: var(--jd-color-card-hover);
      border-color: var(--jd-color-border);
      box-shadow: var(--jd-shadow-sm);
    }
    jd-stat-card[clickable]:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    @media (prefers-reduced-motion: reduce) {
      jd-stat-card {
        transition: none;
      }
    }
  }
`;
