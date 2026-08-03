import { css } from "../../core/styles.js";

/**
 * v2 값: variant 7종(색/10% 배경 + 15% 인셋 링 = color-mix 관용구), size 3종
 * (sm 11px/rounded-md · md 12px/rounded-lg · lg 14px), dot 6px, 카운트 모드
 * 20px 원형 danger. 색은 전부 DEC-044 톤 레시피 파생 — 리터럴 팔레트 없음.
 * sm 10px·카운트 10px은 §9 하한(2xs = 11px) 위로 올렸다.
 */
export default css`
  @layer junds.components {
    jd-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      font-family: var(--jd-font-sans);
      font-weight: var(--jd-weight-semibold);
      letter-spacing: var(--jd-tracking-wide);
      white-space: nowrap;
      /* size 기본 md */
      padding: var(--jd-space-1) var(--jd-space-2-5);
      font-size: var(--jd-text-xs);
      border-radius: var(--jd-radius-lg);
      /* variant 기본 default — gray. DEC-044 톤 레시피: 변종은 앵커 한 줄만 바꾸고
       배경·글자·인셋 링은 여기 세 줄이 공식으로 파생한다(base.css --jd-tone-*).
       variant 7종 × 모드 2 = 14가지를 손으로 적던 것이 한 벌로 줄었다. */
      --jd-tone: var(--jd-color-hue-gray);
      /* 11~14px 배지 글자는 일반 본문보다 엄격한 대비가 필요하다. 앵커색을 그대로
       많이 쓰지 않고 잉크 쪽 비율을 늘려 success/warning/info도 AA를 넘긴다. */
      --jd-tone-ink-mix: 68%;
      /* 기본 12%는 gray 앵커에서 배경과 구분되지 않아 배지가 "평평한 회색 알약"으로
       읽혔다(실측). 의미색 -light 짝과 같은 무게가 되도록 한 단 올린다. */
      --jd-tone-bg-mix: 18%;
      --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
      background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-mix), transparent);
      color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
      /* 채움 + 인셋 링만으로는 면이 서지 않는다(§2) — 위에서 받는 빛 한 겹과
       바닥 그림자를 더해 종잇조각이 아니라 얹힌 칩으로 읽히게 한다. */
      box-shadow: 0 0 0 var(--jd-border-thin) inset
          color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-border-mix), transparent),
        inset 0 1px 0 var(--jd-color-highlight), var(--jd-shadow-xs);
    }
    jd-badge[size="sm"] {
      padding: var(--jd-space-0-5) var(--jd-space-2);
      /* 2xs(11px)가 하한이다 — 10px 배지는 §9 미달이었다 */
      font-size: var(--jd-text-2xs);
      border-radius: var(--jd-radius-md);
    }
    jd-badge[size="lg"] {
      padding: var(--jd-space-1) var(--jd-space-3);
      font-size: var(--jd-text-md);
    }

    jd-badge[variant="primary"] {
      --jd-tone: var(--jd-color-primary);
    }
    jd-badge[variant="success"] {
      --jd-tone: var(--jd-color-success);
    }
    jd-badge[variant="warning"] {
      --jd-tone: var(--jd-color-warning);
    }
    jd-badge[variant="danger"] {
      --jd-tone: var(--jd-color-danger);
    }
    jd-badge[variant="info"] {
      --jd-tone: var(--jd-color-info);
    }
    jd-badge[variant="outline"] {
      background: transparent;
      color: var(--jd-color-foreground);
      box-shadow: none;
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }

    /* dot — DOM 없이 ::before. 틴트가 아니라 앵커 원색이라 변종 분기가 필요 없다 */
    jd-badge[dot]::before {
      content: "";
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-tone);
    }
    jd-badge[dot][variant="outline"]::before {
      background: var(--jd-color-foreground);
    }

    /* 카운트 모드 — 원형 danger (v2 동형). 원은 18px에서 20px로 키웠다:
     글자 하한이 11px(§9)이라 18px 원 안에서는 "99+"가 테두리에 닿았다. */
    jd-badge[data-count-mode] {
      justify-content: center;
      padding: 0 var(--jd-space-1-5);
      min-width: 1.25rem;
      height: 1.25rem;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-danger);
      color: #fff;
      /* 알림 배지는 늘 다른 것 위에 얹힌다 — 면과 빛을 유지해야 떠 있는 것으로 읽힌다 */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      font-variant-numeric: tabular-nums;
      font-size: var(--jd-text-2xs);
      letter-spacing: var(--jd-tracking-normal);
    }
  }
`;
