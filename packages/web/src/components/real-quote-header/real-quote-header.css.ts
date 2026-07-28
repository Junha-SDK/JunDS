/**
 * jd-real-quote-header CSS — v2 finance/RealQuoteHeader의 Tailwind/인라인 style을 토큰 번역.
 *
 * v2 값: bm-card + border, 헤더 px-4 py-3 border-b, KIS 배지 teal 알약(dot glow),
 * Yahoo 배지 작은 회색 알약, 대표 4칸 grid(2→md:4) px-4 py-3, 보조 6칸 grid(3→md:6)
 * bg-soft border-t, PER/PBR 2칸 border-t. 숫자는 tabular-nums.
 *
 * 등락색은 v2 리터럴(#e11d48/#2563eb)을 걷어내고 --jd-finance-* 훅을 경유한다 —
 * 한국 관례(적상승·청하락)는 앱이 시작 시 1회 덮어써서 얻는 전환이라, 여기에 색을 박으면
 * 같은 화면의 price-badge만 뒤집히고 이 헤더는 옛 색으로 남는다(§8).
 * KIS 배지의 teal 리터럴도 팔레트 밖이라 hue 토큰으로 옮겼다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-real-quote-header {
      display: block;
      box-sizing: border-box;
      /* 열 계단의 기준은 뷰포트가 아니라 이 카드가 실제로 받은 폭이다 — 화면이 넓다는
       이유로 좁은 칼럼 안에서 6열을 그리면 "거래량"과 값이 갈라진다(§5).
       inline-size 컨테이너는 내용이 폭을 정하지 못하므로 폭을 명시적으로 받는다. */
      width: 100%;
      container: jd-rqh / inline-size;
      overflow: hidden;
      border: 1px solid var(--jd-fin-border, var(--jd-color-border));
      border-radius: var(--jd-radius-lg);
      background: var(--jd-fin-card, var(--jd-color-card));
      color: var(--jd-fin-text, var(--jd-color-foreground));
      font-family: var(--jd-font-sans);
      --_up: var(--jd-fin-up, var(--jd-finance-up, var(--jd-color-success)));
      --_down: var(--jd-fin-down, var(--jd-finance-down, var(--jd-color-danger)));
      --_muted: var(--jd-fin-muted, var(--jd-color-muted));
      --_border: var(--jd-fin-border, var(--jd-color-border));
      --_soft: var(--jd-fin-soft-100, var(--jd-color-card-hover));
      --_accent: var(--jd-fin-accent, var(--jd-color-hue-teal));
      /* 배지 글자는 틴트 위에 얹히므로 원색보다 한 계단 진해야 읽힌다 — 전경색과 섞으면
       라이트에선 어두워지고 다크에선 밝아져 두 모드가 같은 규칙으로 성립한다 */
      --_accent-strong: var(
        --jd-fin-accent-strong,
        color-mix(in srgb, var(--jd-color-hue-teal) 72%, var(--jd-color-foreground))
      );
    }
    jd-real-quote-header[hidden],
    jd-real-quote-header:not(:defined) {
      display: none;
    }

    .jd-real-quote-header__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      padding: var(--jd-space-3) var(--jd-space-4);
      border-block-end: 1px solid var(--_border);
    }
    .jd-real-quote-header__titlebar {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-real-quote-header__icon {
      flex-shrink: 0;
      color: var(--_accent-strong);
    }
    .jd-real-quote-header__heading {
      margin: 0;
      font-size: 14px;
      font-weight: 800;
    }

    .jd-real-quote-header__source {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: var(--jd-radius-full);
      white-space: nowrap;
    }
    .jd-real-quote-header__source::before {
      content: "";
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
    }
    .jd-real-quote-header__source[data-source="kis"] {
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: var(--_accent-strong);
      background: color-mix(in srgb, var(--_accent) 14%, transparent);
      border: 1.5px solid color-mix(in srgb, var(--_accent) 45%, transparent);
    }
    .jd-real-quote-header__source[data-source="kis"]::before {
      width: 8px;
      height: 8px;
      background: var(--_accent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--_accent) 18%, transparent);
    }
    .jd-real-quote-header__source[data-source="yahoo"] {
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 700;
      opacity: 0.8;
      color: var(--_muted);
      background: var(--_soft);
      border: 1px solid var(--_border);
    }
    .jd-real-quote-header__source[data-source="yahoo"]::before {
      width: 4px;
      height: 4px;
      background: var(--_muted);
    }

    .jd-real-quote-header__delay {
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 600;
      color: var(--_muted);
    }

    .jd-real-quote-header__kv {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--jd-space-3);
      padding: var(--jd-space-3) var(--jd-space-4);
      font-variant-numeric: tabular-nums;
    }
    .jd-real-quote-header__kv-label {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--_muted);
    }
    /* 수치와 단위는 한 덩어리다 — "71,200"과 "원"이 갈라지면 다른 수로 읽힌다(§5) */
    .jd-real-quote-header__kv-value {
      margin-block-start: 2px;
      font-size: 14px;
      font-weight: 800;
      white-space: nowrap;
      color: var(--jd-fin-text, var(--jd-color-foreground));
    }
    .jd-real-quote-header__kv-value[data-large] {
      font-size: 18px;
    }
    .jd-real-quote-header__kv-value[data-tone="up"] {
      color: var(--_up);
    }
    .jd-real-quote-header__kv-value[data-tone="down"] {
      color: var(--_down);
    }
    .jd-real-quote-header__kv-unit {
      margin-inline-start: 4px;
      font-size: 10.5px;
      font-weight: 600;
      opacity: 0.8;
    }
    .jd-real-quote-header__kv-unit[hidden] {
      display: none;
    }

    .jd-real-quote-header__mini,
    .jd-real-quote-header__ratio {
      display: grid;
      gap: var(--jd-space-3);
      font-size: 11.5px;
      font-variant-numeric: tabular-nums;
      border-block-start: 1px solid var(--_border);
    }
    .jd-real-quote-header__mini {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      padding: 10px var(--jd-space-4);
      background: var(--_soft);
    }
    .jd-real-quote-header__ratio {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      padding: var(--jd-space-2) var(--jd-space-4);
    }
    .jd-real-quote-header__ratio[hidden] {
      display: none;
    }

    .jd-real-quote-header__mini-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
    }
    .jd-real-quote-header__mini-label {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--_muted);
    }
    .jd-real-quote-header__mini-value {
      font-weight: 800;
      white-space: nowrap;
      color: var(--jd-fin-text, var(--jd-color-foreground));
    }
    .jd-real-quote-header__mini-value[data-tone="up"] {
      color: var(--_up);
    }
    .jd-real-quote-header__mini-value[data-tone="down"] {
      color: var(--_down);
    }

    @container jd-rqh (min-width: 44rem) {
      .jd-real-quote-header__kv {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .jd-real-quote-header__mini {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }
    }
  }
`;
