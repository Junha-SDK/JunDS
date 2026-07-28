import { css } from "../../core/styles.js";

/**
 * v2 값: 트랙 h-2(8px) rounded-full 회색, 밴드=tone색 18% 알파, 채움=tone 원색,
 * 마커 2×12px(#0f172a) 정중앙. tone 색은 finance 폴백 체인으로 옮겨 앱 재틴트 허용.
 * overflow visible — 마커(12px)가 트랙(8px)보다 크다.
 */
export default css`
  @layer junds.components {
    jd-position-bar {
      --jd-position-bar-color: var(--jd-finance-up, var(--jd-color-success));
      position: relative;
      display: block;
      /* 자식이 전부 절대배치라 내용 폭이 0이다 — flex/inline 문맥에서 호스트가 접히면
       정중앙 마커 2px 한 줄만 남아 "고장난 것"으로 읽힌다(실측). 바닥을 깔아 둔다. */
      min-width: 4rem;
      height: 0.5rem;
      border-radius: var(--jd-radius-full);
      /* 빈 데이터(low=high=cur=0)일 때 남는 것은 트랙뿐이다. 홈이 파인 면으로 그려 두면
       그 상태가 "구간 없음"으로 읽힌다 — 옅은 실선 한 줄은 결함으로 읽힌다. */
      background: var(--jd-color-control-track);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
      overflow: visible;
    }
    jd-position-bar[tone="down"] {
      --jd-position-bar-color: var(--jd-finance-down, var(--jd-color-danger));
    }

    .jd-position-bar__band {
      position: absolute;
      inset-block-start: 0;
      height: 100%;
      border-radius: var(--jd-radius-full);
      background: color-mix(in srgb, var(--jd-position-bar-color) 22%, transparent);
    }
    .jd-position-bar__fill {
      position: absolute;
      inset-block-start: 0;
      height: 100%;
      border-radius: var(--jd-radius-full);
      background: var(--jd-position-bar-color);
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
    }
    /* 마커는 채움 위에도 올라간다 — 같은 명도끼리 닿으면 사라지므로 면 색 테두리로 뗀다 */
    .jd-position-bar__marker {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      transform: translate(-50%, -50%);
      width: 2px;
      height: 0.75rem;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-foreground);
      box-shadow: 0 0 0 var(--jd-border-thin) var(--jd-color-card), var(--jd-shadow-xs);
    }
  }
`;
