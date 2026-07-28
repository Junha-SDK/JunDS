import { css } from "../../core/styles.js";

/**
 * v2 값: 격자 `grid gap-4` + columns별 `grid-cols-1 sm:grid-cols-2 md:grid-cols-N`
 * (v3는 이 계단을 뷰포트가 아니라 **부모 폭** 기준으로 다시 세웠다 — 아래 격자 주석),
 * 카드 `border rounded-xl p-4 bg-white hover:shadow-md hover:-translate-y-0.5`,
 * variance `border-l-[3px] border-l-amber-400 bg-amber-50/40`,
 * 라벨 `text-[10px] medium uppercase tracking-wider text-muted`(→ 11px 바닥, §9),
 * 값 `text-xl bold tabular-nums`, 변화 배지 `text-xs semibold px-1.5 py-0.5 rounded-md mb-0.5`,
 * 보조문 `text-xs text-muted mt-1`.
 *
 * amber/white 리터럴은 warning·card 토큰으로 — 다크에서도 성립한다(v2는 라이트 전용).
 * 배지 글자색은 jd-badge와 같은 대비 보정 관용구(원색 80~90% + 검정, 다크는 원색 복원).
 */
export default css`
  @layer junds.base {
    jd-comparison-grid:not(:defined) {
      display: grid;
    }
  }
  @layer junds.components {
    /* v2의 sm/md 계단을 **부모 폭 기준**으로 옮겼다. 뷰포트 미디어쿼리는 이 격자가
     좁은 칼럼 안에 놓이면 거짓말을 한다 — 화면이 넓다는 이유로 300px 칸에 4열을 그려
     "12,480,000"과 "원"이 갈라지고 카드가 오른쪽으로 넘쳤다(실측). 하한은 "요청 열
     수로 나눈 폭"과 최소 카드 폭 중 큰 쪽이라, 넓을 때는 정확히 columns 열이다.
     기본 columns=4는 attribute로 반영되지 않으므로(§1.3) base가 담당한다. */
    jd-comparison-grid {
      --jd-cg-gap: var(--jd-space-4);
      --jd-cg-cols: 4;
      --jd-cg-col-min: 14rem;
      display: grid;
      gap: var(--jd-cg-gap);
      grid-template-columns: repeat(
        auto-fit,
        minmax(
          min(
            100%,
            max(
              var(--jd-cg-col-min),
              (100% - (var(--jd-cg-cols) - 1) * var(--jd-cg-gap)) / var(--jd-cg-cols)
            )
          ),
          1fr
        )
      );
      font-family: var(--jd-font-sans);
    }
    jd-comparison-grid[columns="2"] {
      --jd-cg-cols: 2;
    }
    jd-comparison-grid[columns="3"] {
      --jd-cg-cols: 3;
    }

    .jd-comparison-grid__card {
      box-sizing: border-box;
      min-width: 0; /* 격자 자식 기본 min-width:auto가 칸을 밀어내지 못하게(§5) */
      padding: var(--jd-space-4);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      /* 쉬는 상태의 얕은 그림자가 있어야 hover의 shadow-md가 '떠오름'으로 읽힌다(§2) */
      box-shadow: var(--jd-shadow-xs);
      transition: box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
        transform var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-comparison-grid__card:hover {
      box-shadow: var(--jd-shadow-md);
    }
    @media (prefers-reduced-motion: no-preference) {
      .jd-comparison-grid__card:hover {
        transform: translateY(-2px);
      }
    }

    .jd-comparison-grid__card[data-variance] {
      border-inline-start: var(--jd-border-thick) solid var(--jd-color-warning);
      background: color-mix(in srgb, var(--jd-color-warning-light) 40%, var(--jd-color-card));
    }
    .jd-comparison-grid__card[data-variance]:hover {
      box-shadow: 0 4px 6px color-mix(in srgb, var(--jd-color-warning) 25%, transparent),
        var(--jd-shadow-xs);
    }

    /* v2 text-[10px]은 읽기의 바닥(11px, §9) 아래였다 — 토큰 계단으로 올린다 */
    .jd-comparison-grid__label {
      display: block;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-medium);
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wide);
      color: var(--jd-color-muted);
      word-break: keep-all;
    }

    /* 값이 길면 배지가 아래로 내려간다 — 밀어내며 겹치는 것보다 낫다 */
    .jd-comparison-grid__row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--jd-space-2);
      margin-block-start: var(--jd-space-1);
      min-width: 0;
    }

    /* 수치와 단위는 한 덩어리다 — "12,480,000"과 "원"이 갈라지면 다른 수로 읽힌다(§5) */
    .jd-comparison-grid__value {
      font-size: var(--jd-text-2xl); /* v2 text-xl = 1.25rem */
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-tight);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--jd-color-foreground);
    }

    .jd-comparison-grid__change {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      white-space: nowrap;
      margin-block-end: 2px;
      padding: var(--jd-space-0-5) var(--jd-space-1-5);
      border-radius: var(--jd-radius-md);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-normal);
      background: var(--jd-color-border-light);
      color: var(--jd-color-muted);
    }
    .jd-comparison-grid__change[hidden] {
      display: none;
    }
    /* 증감 배지는 등락이다 — success/danger를 직접 칠하면 한국 관례(적상승)로 전환한 앱에서
     이 격자만 옛 색으로 남아 옆의 price-badge와 갈라진다. 훅을 경유하고, -light 짝은
     훅에서 파생할 수 없으므로 같은 색의 옅은 틴트로 만든다(§8). */
    .jd-comparison-grid__change[data-direction="up"] {
      background: color-mix(
        in srgb,
        var(--jd-finance-up, var(--jd-color-success)) 14%,
        transparent
      );
      color: color-mix(
        in srgb,
        var(--jd-finance-up, var(--jd-color-success)) var(--jd-tone-ink-mix),
        var(--jd-tone-ink-toward)
      );
    }
    .jd-comparison-grid__change[data-direction="down"] {
      background: color-mix(
        in srgb,
        var(--jd-finance-down, var(--jd-color-danger)) 14%,
        transparent
      );
      color: color-mix(
        in srgb,
        var(--jd-finance-down, var(--jd-color-danger)) var(--jd-tone-ink-mix),
        var(--jd-tone-ink-toward)
      );
    }

    .jd-comparison-grid__subtext {
      margin: var(--jd-space-1) 0 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      word-break: keep-all;
      overflow-wrap: break-word;
    }
    .jd-comparison-grid__subtext[hidden] {
      display: none;
    }

    /* 시각적으로만 숨긴다 — 색으로만 전달되던 정보의 텍스트 등가물 (jd-visually-hidden 관용구) */
    .jd-comparison-grid__sr {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-comparison-grid__card {
        transition: none;
      }
    }
  }
`;
