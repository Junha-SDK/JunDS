import { css } from "../../core/styles.js";

/**
 * jd-online-status CSS — v2 composites/OnlineStatus.
 *
 * v2 값: 호스트 `inline-flex items-center gap-1.5`, 점 xs 6 / sm 8 / md 10 / lg 12px,
 * `rounded-full border-2 border-background`(border-box라 테두리가 안쪽을 먹는다 — 아바타
 * 위에 얹었을 때 배경과 분리되는 v2 의도 그대로), 라벨 `text-xs text-muted`.
 *
 * 색은 v2 Tailwind 500 리터럴(#22c55e/#f59e0b/#ef4444)을 승계했었다. 접속 상태는
 * 그 자체가 의미축이다 — 온라인=success, 자리 비움=warning, 방해 금지=danger,
 * 오프라인=중립. 리터럴로 두면 같은 화면의 success 뱃지와 초록이 두 개로 갈라지고
 * 브랜드 전환·다크 보정(DEC-027)이 이 점 하나만 비껴간다.
 *
 * 펄스는 v2의 절대배치 ping 레이어(span 1개 추가) 대신 ::before의 box-shadow 확산이다 —
 * 같은 그림에 DOM 0. animate-ping과 같은 1s cubic-bezier(0,0,.2,1) 무한 반복.
 */
export default css`
  @layer junds.components {
    jd-online-status {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      font-family: var(--jd-font-sans);
      /* sm 기본 */
      --_jd-online-size: 8px;
      --_jd-online-ping: 5px;
      /* offline 기본 — 자리는 지키되 말은 하지 않는 중립색 */
      --_jd-online-color: var(--jd-color-muted-light);
    }
    jd-online-status[size="xs"] {
      --_jd-online-size: 6px;
      --_jd-online-ping: 4px;
    }
    jd-online-status[size="md"] {
      --_jd-online-size: 10px;
      --_jd-online-ping: 6px;
    }
    jd-online-status[size="lg"] {
      --_jd-online-size: 12px;
      --_jd-online-ping: 7px;
    }

    jd-online-status[status="online"] {
      --_jd-online-color: var(--jd-color-success);
    }
    jd-online-status[status="away"] {
      --_jd-online-color: var(--jd-color-warning);
    }
    jd-online-status[status="busy"] {
      --_jd-online-color: var(--jd-color-danger);
    }

    jd-online-status::before {
      content: "";
      display: block;
      flex-shrink: 0;
      box-sizing: border-box;
      width: var(--_jd-online-size);
      height: var(--_jd-online-size);
      border-radius: var(--jd-radius-full);
      border: var(--jd-border-medium) solid var(--jd-color-background);
      background: var(--_jd-online-color);
    }

    /* v2와 같이 펄스는 online에서만 보인다 */
    jd-online-status[pulse][status="online"]::before {
      animation: jd-online-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    @keyframes jd-online-ping {
      0% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--_jd-online-color) 50%, transparent);
      }
      70% {
        box-shadow: 0 0 0 var(--_jd-online-ping) transparent;
      }
      100% {
        box-shadow: 0 0 0 0 transparent;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      jd-online-status[pulse][status="online"]::before {
        animation: none;
      }
    }

    .jd-online-status__label {
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    .jd-online-status__label[hidden] {
      display: none;
    }
    .jd-online-status__seen[hidden],
    .jd-online-status__sep[hidden] {
      display: none;
    }
  }
`;
