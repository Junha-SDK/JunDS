/**
 * jd-loading-button CSS — 라벨 교체 축만 신규, 나머지는 jd-button 시트를 그대로 쓴다.
 *
 * 파생 CSS 규약(jd-drawer/jd-bottom-sheet 선례): 베이스의 **클래스 규칙**
 * (`.jd-button`, `:hover`, `:disabled`, `:focus-visible`)은 태그와 무관하므로 공짜로
 * 상속되고, **호스트 태그 셀렉터**로 쓰인 분기(variant/size/full-width)만 새 태그로
 * 다시 건다. 값은 button.css.ts와 동일 — 파생이 베이스와 다른 크기·색을 갖지 않는다.
 *
 * 크기 스케일 판단: v2는 Button(32/36/44)과 LoadingButton(32/40/48)이 **같은 위젯의
 * 두 표가 어긋난 상태**였다(LoadingButton은 2.3.0에서 별도 클래스 표로 추가됨).
 * v3에서 LoadingButton은 Button 파생이므로 Button 쪽 스케일로 통일한다 — 같은 size로
 * 나란히 놓았을 때 높이가 어긋나지 않는 것이 파생의 최소 계약이다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-loading-button {
      display: inline-flex;
    }
    jd-loading-button[full-width] {
      display: flex;
    }
    jd-loading-button[full-width] > .jd-button {
      width: 100%;
    }

    /* loading ≠ disabled (DEC-039). 베이스의 이 예외는 jd-button[loading] 이라는
     **태그** 셀렉터라 파생 태그를 놓친다 — 그래서 이 컴포넌트는 정작 자기 존재
     이유인 로딩 상태에서 opacity .4 로 흐려져 '비활성'과 구분되지 않았다(실측).
     로딩은 **작동 중**이라는 신호다 — 색을 유지하고 커서만 진행형으로 바꾼다. */
    jd-loading-button[loading] > .jd-button:disabled {
      opacity: 1;
      cursor: progress;
      /* :disabled의 pointer-events:none을 되돌려야 progress 커서가 실제로 보인다.
       클릭은 네이티브 disabled가 이미 막고 있으므로 안전하다. */
      pointer-events: auto;
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }

    /* size — button.css.ts와 동일(md는 .jd-button base) */
    jd-loading-button[size="xs"] > .jd-button {
      height: 1.75rem;
      padding-inline: var(--jd-space-2-5);
      gap: var(--jd-space-1);
      font-size: var(--jd-text-xs);
      border-radius: var(--jd-radius-lg);
    }
    jd-loading-button[size="sm"] > .jd-button {
      height: 2rem;
      padding-inline: var(--jd-space-3-5);
      gap: var(--jd-space-1-5);
      font-size: var(--jd-text-xs);
      border-radius: var(--jd-radius-lg);
    }
    jd-loading-button[size="lg"] > .jd-button {
      height: 2.75rem;
      padding-inline: var(--jd-space-6);
      gap: var(--jd-space-2-5);
      font-size: var(--jd-text-lg);
      border-radius: var(--jd-radius-xl);
    }

    /* variant — v2 LoadingButton은 primary/secondary/ghost/danger 4종이지만,
     상속된 프로퍼티 표면이 거짓말하지 않도록 jd-button의 6종을 전부 건다. */
    jd-loading-button[variant="secondary"] > .jd-button {
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      box-shadow: var(--jd-shadow-xs);
      filter: none;
    }
    jd-loading-button[variant="secondary"] > .jd-button:hover {
      background: var(--jd-color-card-hover);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    jd-loading-button[variant="secondary"] > .jd-button:active {
      background: var(--jd-color-border-light);
      box-shadow: none;
      scale: 0.98;
    }

    jd-loading-button[variant="danger"] > .jd-button {
      background: var(--jd-color-danger);
      color: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
    jd-loading-button[variant="danger"] > .jd-button:hover {
      box-shadow: 0 4px 12px color-mix(in srgb, var(--jd-color-danger) 25%, transparent),
        0 1px 2px rgba(0, 0, 0, 0.1);
      filter: brightness(1.1);
    }
    jd-loading-button[variant="danger"] > .jd-button:active {
      filter: brightness(0.95);
      scale: 0.98;
    }
    jd-loading-button[variant="danger"] > .jd-button:focus-visible {
      outline-color: color-mix(in srgb, var(--jd-color-danger) 40%, transparent);
    }

    jd-loading-button[variant="ghost"] > .jd-button {
      background: transparent;
      color: var(--jd-color-foreground);
      box-shadow: none;
      filter: none;
    }
    jd-loading-button[variant="ghost"] > .jd-button:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    }
    jd-loading-button[variant="ghost"] > .jd-button:active {
      background: color-mix(in srgb, var(--jd-color-muted) 16%, transparent);
      scale: 0.98;
    }

    jd-loading-button[variant="outline"] > .jd-button {
      background: transparent;
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      box-shadow: none;
      filter: none;
    }
    jd-loading-button[variant="outline"] > .jd-button:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 6%, transparent);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
    }
    jd-loading-button[variant="outline"] > .jd-button:active {
      background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
      scale: 0.98;
    }

    jd-loading-button[variant="link"] > .jd-button {
      background: transparent;
      box-shadow: none;
      filter: none;
      height: auto;
      padding: 0;
      color: var(--jd-color-primary-ink);
      text-underline-offset: 2px;
      text-decoration-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    }
    jd-loading-button[variant="link"] > .jd-button:hover {
      text-decoration-line: underline;
      text-decoration-color: var(--jd-color-primary-ink);
    }
    jd-loading-button[variant="link"] > .jd-button:active {
      scale: none;
    }

    /* 스피너 크기 분기(md·lg는 .jd-button__spinner base가 16px) */
    jd-loading-button[size="xs"] .jd-button__spinner {
      width: 12px;
      height: 12px;
    }
    jd-loading-button[size="sm"] .jd-button__spinner {
      width: 14px;
      height: 14px;
    }

    /* 라벨 교체 — 보이는 칸이 곧 접근 이름이다(display:none은 a11y 트리에서도 제외).
     data-swap = loadingText가 있을 때만 켜진다(없으면 v2처럼 children 유지). */
    jd-loading-button > .jd-button > .jd-loading-button__busy {
      display: none;
    }
    jd-loading-button[loading][data-swap] > .jd-button > .jd-loading-button__label {
      display: none;
    }
    jd-loading-button[loading][data-swap] > .jd-button > .jd-loading-button__busy {
      display: inline;
    }
  }
`;
