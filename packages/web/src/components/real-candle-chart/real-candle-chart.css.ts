/**
 * jd-real-candle-chart CSS — v2 finance/RealCandleChart 헤더의 Tailwind/인라인 번역.
 *
 * v2 값: 헤더 flex justify-between mb-2 px-1, Yahoo 배지 초록 알약, 샘플 배지 soft 알약,
 * 점 6px, 봉수/신선도 11px, 신선도 점은 장중이면 bright.
 * 내부 캔들 차트는 자기 CSS(candle-chart.css)가 칠한다.
 *
 * 배지 두 종은 DEC-044 톤 레시피를 경유한다 — v2가 굳혀 둔 Tailwind 600단 리터럴을
 * 그대로 두면 다크에서 어두운 앵커가 어두운 카드에 얹혀 진흙이 된다. 앵커 하나에서
 * 면과 글자를 파생하면 모드 분기가 컴포넌트에 필요 없다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-real-candle-chart {
      display: block;
      min-width: 0;
      font-family: var(--jd-font-sans);
      --_success: var(--jd-fin-success, var(--jd-color-success));
      --_muted: var(--jd-fin-muted, var(--jd-color-muted));
      --_bright: var(--jd-fin-live-bright, var(--jd-fin-accent, var(--jd-color-primary)));
    }
    jd-real-candle-chart:not(:defined) {
      display: block;
    }

    .jd-real-candle-chart__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      margin-block-end: var(--jd-space-2);
      padding-inline: var(--jd-space-1);
    }
    .jd-real-candle-chart__meta {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      font-size: var(--jd-text-2xs);
      min-width: 0;
      flex-wrap: wrap;
    }

    .jd-real-candle-chart__badge {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      padding: var(--jd-space-1) var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      white-space: nowrap;
      /* 톤 레시피: 앵커 하나에서 면(승강)·테두리·글자를 파생한다 */
      --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
      background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-mix), transparent);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-border-mix), transparent);
      color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
    }
    .jd-real-candle-chart__badge[data-source="yahoo"] {
      --jd-tone: var(--_success);
    }
    .jd-real-candle-chart__badge[data-source="mock"] {
      --jd-tone: var(--jd-color-hue-gray);
    }
    .jd-real-candle-chart__dot {
      width: 6px;
      height: 6px;
      border-radius: var(--jd-radius-full);
      background: currentColor;
      flex-shrink: 0;
    }

    .jd-real-candle-chart__count {
      font-size: var(--jd-text-2xs);
      color: var(--_muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .jd-real-candle-chart__count[hidden] {
      display: none;
    }

    .jd-real-candle-chart__freshness {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--_muted);
      white-space: nowrap;
    }
    .jd-real-candle-chart__freshness[hidden] {
      display: none;
    }
    .jd-real-candle-chart__fresh-dot {
      width: 6px;
      height: 6px;
      border-radius: var(--jd-radius-full);
      background: var(--_muted);
      flex-shrink: 0;
    }
    .jd-real-candle-chart__fresh-dot[data-live="true"] {
      background: var(--_bright);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--_bright) 22%, transparent);
    }

    .jd-real-candle-chart__yahoo {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      flex-shrink: 0;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--_muted);
      text-decoration: none;
      text-underline-offset: 2px;
      white-space: nowrap;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-real-candle-chart__yahoo[hidden] {
      display: none;
    }
    .jd-real-candle-chart__yahoo:hover {
      color: var(--jd-color-foreground);
      text-decoration-line: underline;
    }
    /* 없는 변수(--jd-color-focus)를 참조하던 자리 — 폴백이 없어 outline 선언 자체가
     무효가 되고 링이 아예 그려지지 않았다. 포커스 링은 단일 레시피를 쓴다(DEC-039). */
    .jd-real-candle-chart__yahoo:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
      border-radius: var(--jd-radius-sm);
    }
    .jd-real-candle-chart__ext {
      flex-shrink: 0;
    }

    /* 캔들이 하나도 없으면 SVG는 빈 투명 상자다 — 헤더의 흐린 점만 남아 "고장"으로
     읽힌다. 플롯 영역에 자리(면 + 안쪽 실선)를 깔아 두면 같은 상태가 "데이터 없는
     차트"로 읽히고, 데이터가 있을 때는 캔들 뒤에 눕는 옅은 판이 된다. */
    .jd-real-candle-chart__chart {
      display: block;
      box-sizing: border-box;
      width: 100%;
      max-width: 100%;
      min-height: 7rem;
      border-radius: var(--jd-radius-lg);
      background: color-mix(in srgb, var(--jd-color-card-hover) 70%, transparent);
      box-shadow: inset 0 0 0 var(--jd-border-thin) var(--jd-color-border-light);
    }
    /* 불러오는 중임을 판 자체가 말한다 — 빈 판과 구분되지 않으면 로딩이 정지로 읽힌다 */
    jd-real-candle-chart[loading] .jd-real-candle-chart__chart {
      background-image: var(--jd-gradient-shimmer);
      background-size: 200% 100%;
      background-repeat: no-repeat;
      animation: jd-real-candle-chart-shimmer calc(var(--jd-duration-slower) * 3) linear infinite;
    }
    @keyframes jd-real-candle-chart-shimmer {
      from {
        background-position: -60% 0;
      }
      to {
        background-position: 160% 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .jd-real-candle-chart__yahoo {
        transition: none;
      }
      jd-real-candle-chart[loading] .jd-real-candle-chart__chart {
        animation: none;
      }
    }
  }
`;
