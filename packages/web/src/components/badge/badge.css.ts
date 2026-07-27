import { css } from "../../core/styles.js";

/**
 * v2 값: variant 7종(색/10% 배경 + 15% 인셋 링 = color-mix 관용구), size 3종
 * (sm 10px/rounded-md · md 12px/rounded-lg · lg 14px), dot 6px, 카운트 모드
 * 18px 원형 danger. gray·blue 계 리터럴은 v2 Tailwind 승계(G2 gray 어휘).
 */
export default css`
@layer junds.components {
  jd-badge {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-semibold);
    letter-spacing: var(--jd-tracking-wide); white-space: nowrap;
    /* size 기본 md */
    padding: var(--jd-space-1) var(--jd-space-2-5);
    font-size: var(--jd-text-xs); border-radius: var(--jd-radius-lg);
    /* variant 기본 default — gray. DEC-044 톤 레시피: 변종은 앵커 한 줄만 바꾸고
       배경·글자·인셋 링은 여기 세 줄이 공식으로 파생한다(base.css --jd-tone-*).
       variant 7종 × 모드 2 = 14가지를 손으로 적던 것이 한 벌로 줄었다. */
    --jd-tone: var(--jd-color-hue-gray);
    /* 10~12px 배지 글자는 일반 본문보다 엄격한 대비가 필요하다. 앵커색을 그대로
       많이 쓰지 않고 잉크 쪽 비율을 늘려 success/warning/info도 AA를 넘긴다. */
    --jd-tone-ink-mix: 68%;
    --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
    background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-mix), transparent);
    color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
    box-shadow: 0 0 0 1px inset color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-border-mix), transparent);
  }
  jd-badge[size="sm"] {
    padding: var(--jd-space-0-5) var(--jd-space-2);
    font-size: 10px; border-radius: var(--jd-radius-md);
  }
  jd-badge[size="lg"] {
    padding: var(--jd-space-1) var(--jd-space-3);
    font-size: var(--jd-text-md);
  }

  jd-badge[variant="primary"] { --jd-tone: var(--jd-color-primary); }
  jd-badge[variant="success"] { --jd-tone: var(--jd-color-success); }
  jd-badge[variant="warning"] { --jd-tone: var(--jd-color-warning); }
  jd-badge[variant="danger"] { --jd-tone: var(--jd-color-danger); }
  jd-badge[variant="info"] { --jd-tone: var(--jd-color-info); }
  jd-badge[variant="outline"] {
    background: transparent; color: var(--jd-color-foreground);
    box-shadow: none; border: var(--jd-border-thin) solid var(--jd-color-border);
  }

  /* dot — DOM 없이 ::before. 틴트가 아니라 앵커 원색이라 변종 분기가 필요 없다 */
  jd-badge[dot]::before {
    content: ""; flex-shrink: 0;
    width: 6px; height: 6px; border-radius: var(--jd-radius-full);
    background: var(--jd-tone);
  }
  jd-badge[dot][variant="outline"]::before { background: var(--jd-color-foreground); }

  /* 카운트 모드 — 원형 danger (v2 동형) */
  jd-badge[data-count-mode] {
    justify-content: center; padding: 0 var(--jd-space-1);
    min-width: 18px; height: 18px; border-radius: var(--jd-radius-full);
    background: var(--jd-color-danger); color: #fff;
    box-shadow: none; font-variant-numeric: tabular-nums; font-size: 10px;
  }
}`;
