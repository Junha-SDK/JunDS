/**
 * jd-button 컴포넌트 CSS (03-web-arch §4.3 규약).
 * v2 ds/primitives/Button의 variant 6종(primary/secondary/danger/ghost/outline/link)
 * × size 4종(xs/sm/md/lg) 시각을 --jd-* 토큰으로 의미 번역(Tailwind 기계 이식 금지).
 * variant/size 분기는 호스트 속성 셀렉터 → 자식 조합자 — update()의 클래스 토글 없음.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-button {
      display: inline-flex;
    }
    jd-button[full-width] {
      display: flex;
    }
    jd-button[full-width] > .jd-button,
    .jd-button[data-jd-full-width="true"] {
      width: 100%;
    }

    /* 기본값(variant=primary·size=md)은 base에 — 디폴트는 attribute로 반영되지
     않으므로(§1.3 reflect는 set 시점) 호스트 속성 셀렉터는 비기본값만 담당한다.
     §4.3 정본 스케치와 동형. */
    .jd-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      margin: 0;
      font-family: var(--jd-font-sans);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-none);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      /* all 금지 — height·padding·font-size까지 대상이 되어 size 전환이 흐르고,
       레이아웃 속성 트랜지션은 매 프레임 리플로우를 만든다 (DEC-039) */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
      /* size 기본 md — v2: 36px */
      height: 2.25rem;
      padding-inline: var(--jd-space-4);
      gap: var(--jd-space-2);
      font-size: var(--jd-text-md);
      border-radius: var(--jd-radius-xl);
      /* variant 기본 primary. 상단 인셋 하이라이트가 '위에서 빛을 받는 면'을 만든다 —
       채움만 있는 버튼은 색종이처럼 읽힌다. */
      background: var(--jd-color-primary);
      color: #fff;
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    /* 호버는 filter: brightness가 아니라 실색 전환 — brightness는 텍스트·스피너까지
     함께 밝혀 흰 글자가 배경에 녹고, GPU 레이어를 새로 만든다. */
    .jd-button:hover {
      background: var(--jd-color-primary-hover);
      box-shadow: 0 4px 12px var(--jd-color-primary-glow), var(--jd-shadow-xs),
        inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-button:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-button:disabled,
    .jd-button[data-jd-disabled="true"] {
      opacity: var(--jd-opacity-40);
      pointer-events: none;
      box-shadow: none;
    }
    .jd-button:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    /* loading ≠ disabled (DEC-039). element.ts가 로딩 중 네이티브 disabled를 켜므로
     (§1.6-1 폼 위임) 위의 :disabled 흐림이 그대로 걸려 '비활성'과 구분되지 않았다.
     로딩은 **작동 중**이라는 신호다 — 색을 유지하고 커서만 진행형으로 바꾼다. */
    jd-button[loading] > .jd-button:disabled,
    .jd-button[data-jd-loading="true"] {
      opacity: 1;
      cursor: progress;
      /* :disabled의 pointer-events:none을 되돌려야 progress 커서가 실제로 보인다.
       클릭은 네이티브 disabled가 이미 막고 있으므로 안전하다. */
      pointer-events: auto;
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }

    /* size — v2: xs 28px / sm 32px / lg 44px (md는 base) */
    jd-button[size="xs"] > .jd-button,
    .jd-button[data-jd-size="xs"] {
      height: 1.75rem;
      padding-inline: var(--jd-space-2-5);
      gap: var(--jd-space-1);
      font-size: var(--jd-text-xs);
      border-radius: var(--jd-radius-lg);
    }
    jd-button[size="sm"] > .jd-button,
    .jd-button[data-jd-size="sm"] {
      height: 2rem;
      padding-inline: var(--jd-space-3-5);
      gap: var(--jd-space-1-5);
      font-size: var(--jd-text-xs);
      border-radius: var(--jd-radius-lg);
    }
    jd-button[size="lg"] > .jd-button,
    .jd-button[data-jd-size="lg"] {
      height: 2.75rem;
      padding-inline: var(--jd-space-6);
      gap: var(--jd-space-2-5);
      font-size: var(--jd-text-lg);
      border-radius: var(--jd-radius-xl);
    }

    /* 비기본 variant — primary의 배경·그림자·필터를 각자 재정의한다 */
    /* secondary */
    jd-button[variant="secondary"] > .jd-button,
    .jd-button[data-jd-variant="secondary"] {
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      box-shadow: var(--jd-shadow-xs);
    }
    jd-button[variant="secondary"] > .jd-button:hover,
    .jd-button[data-jd-variant="secondary"]:hover {
      background: var(--jd-color-card-hover);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
      box-shadow: var(--jd-shadow-sm);
    }
    jd-button[variant="secondary"] > .jd-button:active,
    .jd-button[data-jd-variant="secondary"]:active {
      background: var(--jd-color-border-light);
      box-shadow: none;
      scale: 0.97;
    }

    /* danger */
    jd-button[variant="danger"] > .jd-button,
    .jd-button[data-jd-variant="danger"] {
      background: var(--jd-color-danger);
      color: #fff;
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    jd-button[variant="danger"] > .jd-button:hover,
    .jd-button[data-jd-variant="danger"]:hover {
      /* 글로우는 danger 토큰 파생 — DEC-027 라이트 보정(#c93636)에 자동 추종 */
      background: var(--jd-color-danger-hover);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--jd-color-danger) 25%, transparent),
        var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    jd-button[variant="danger"] > .jd-button:active,
    .jd-button[data-jd-variant="danger"]:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    jd-button[variant="danger"] > .jd-button:focus-visible,
    .jd-button[data-jd-variant="danger"]:focus-visible {
      outline: var(--jd-focus-ring-danger);
    }

    /* ghost — 투명 배경, 호버 시만 배경 */
    jd-button[variant="ghost"] > .jd-button,
    .jd-button[data-jd-variant="ghost"] {
      background: transparent;
      color: var(--jd-color-foreground);
      box-shadow: none;
    }
    jd-button[variant="ghost"] > .jd-button:hover,
    .jd-button[data-jd-variant="ghost"]:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    }
    jd-button[variant="ghost"] > .jd-button:active,
    .jd-button[data-jd-variant="ghost"]:active {
      background: color-mix(in srgb, var(--jd-color-muted) 16%, transparent);
      scale: 0.97;
    }

    /* outline */
    jd-button[variant="outline"] > .jd-button,
    .jd-button[data-jd-variant="outline"] {
      background: transparent;
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      box-shadow: none;
    }
    jd-button[variant="outline"] > .jd-button:hover,
    .jd-button[data-jd-variant="outline"]:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 6%, transparent);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
    }
    jd-button[variant="outline"] > .jd-button:active,
    .jd-button[data-jd-variant="outline"]:active {
      background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
      scale: 0.97;
    }

    /* link — 패딩/높이 없음 */
    jd-button[variant="link"] > .jd-button,
    .jd-button[data-jd-variant="link"] {
      background: transparent;
      box-shadow: none;
      height: auto;
      padding: 0;
      color: var(--jd-color-primary-ink);
      text-underline-offset: 2px;
      text-decoration-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    }
    jd-button[variant="link"] > .jd-button:hover,
    .jd-button[data-jd-variant="link"]:hover {
      text-decoration-line: underline;
      text-decoration-color: var(--jd-color-primary-ink);
    }
    jd-button[variant="link"] > .jd-button:active,
    .jd-button[data-jd-variant="link"]:active {
      scale: none;
    }

    /* spinner — v2: xs 12px / sm 14px / md·lg 16px */
    .jd-button__spinner {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      animation: jd-spin 1s linear infinite;
    }
    jd-button[size="xs"] .jd-button__spinner,
    .jd-button[data-jd-size="xs"] .jd-button__spinner {
      width: 12px;
      height: 12px;
    }
    jd-button[size="sm"] .jd-button__spinner,
    .jd-button[data-jd-size="sm"] .jd-button__spinner {
      width: 14px;
      height: 14px;
    }
    @keyframes jd-spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .jd-button {
        transition: none;
      }
      .jd-button__spinner {
        animation-duration: 1.6s;
      }
    }
  }
`;
