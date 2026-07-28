import { css } from "../../core/styles.js";

/**
 * v2 값 번역: 루트 space-y-3, 칸 행 flex gap-2 + flex-1 min-w-0,
 * 라벨 10px semibold muted uppercase mb-1, 칸 h-8 px-2 text-sm 가운데정렬
 * border-border rounded-lg + focus:border-primary + mono tabular-nums,
 * 요약 행 px-3 py-2 bg-gray-50 rounded-lg (v2가 다크에서만 --dm-surface-raised로 갈아탔던
 * 자리는 양 모드를 함께 표현하는 card-hover 한 줄로 접었다),
 * 원문 text-xs muted mono flex-1, 요약 text-xs primary medium.
 * 클래스 접두는 태그 축약형 `.jd-cron__*` (battery-indicator의 `.jd-battery__*` 선례).
 * 가산 1건: v2의 `outline-none + 1px 테두리 색 변경`만으로는 포커스 가시성이 약해
 * 포커스 링 단일 레시피(--jd-focus-ring, DEC-039)를 얹었다 — jd-text-field와 같은 관용구.
 */
export default css`
  @layer junds.components {
    jd-cron-expression {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-3);
      font-family: var(--jd-font-sans);
    }

    .jd-cron__fields {
      display: flex;
      gap: var(--jd-space-2);
    }
    .jd-cron__field {
      flex: 1 1 0%;
      min-width: 0;
    }

    /* v2 text-[10px] → 2xs(11px). 칸이 좁다고 글자를 줄이면 라벨이 읽히지 않는다 —
     11px 아래로는 내려가지 않는다. 라벨은 한 줄로 유지한다(접히면 칸 높이가 어긋난다). */
    .jd-cron__label {
      display: block;
      margin-bottom: var(--jd-space-1);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wide);
      color: var(--jd-color-muted);
      white-space: nowrap;
    }

    .jd-cron__input {
      box-sizing: border-box;
      width: 100%;
      height: 2rem;
      margin: 0;
      padding-inline: var(--jd-space-2);
      text-align: center;
      font-family: var(--jd-font-mono);
      font-size: var(--jd-text-sm);
      font-variant-numeric: tabular-nums;
      color: var(--jd-color-foreground);
      background: var(--jd-color-control-surface);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      transition: border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    /* 호버 피드백 — 입력면에 호버 상태가 없으면 '쓸 수 있는 곳'이라는 신호가 없다
     (jd-text-field와 같은 관용구) */
    .jd-cron__input:hover:not(:disabled):not(:focus) {
      border-color: var(--jd-color-neutral-300);
      background: var(--jd-color-control-surface-hover);
    }
    /* 링은 DEC-039 두 줄 관용구로 — 이전의 outline:none + 옅은 box-shadow(알파 0.18)는
     흰 면 위에서 1.3:1이라 포커스가 어디 있는지 보이지 않았다 */
    .jd-cron__input:focus {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
      border-color: var(--jd-color-primary);
    }
    /* opacity를 걸면 테두리·글자가 함께 흐려져 '고장난 칸'으로 읽힌다 → 면을 실색으로 낮춘다 */
    .jd-cron__input:disabled {
      cursor: not-allowed;
      color: var(--jd-color-muted);
      background: var(--jd-color-control-surface-muted);
      border-color: var(--jd-color-border-light);
    }

    /* 요약 행은 "앱의 본문"이지 어두운 크롬이 아니다 — 다크 분기로 surface-raised를
     따로 부르던 자리를 card-hover 한 줄로 접었다. card-hover는 양 모드에서 이미
     카드보다 한 단 눌린 면이라(#f9f8fc / #1c1932) 결과 색은 그대로이고, 모드가 늘 때
     이 컴포넌트가 다시 갈라지지 않는다(DEC-044). */
    .jd-cron__summary {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-3);
      background: var(--jd-color-card-hover);
      border: var(--jd-border-thin) solid var(--jd-color-border-light);
      border-radius: var(--jd-radius-lg);
    }

    .jd-cron__value {
      flex: 1 1 0%;
      min-width: 0;
      overflow-wrap: anywhere;
      font-family: var(--jd-font-mono);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    .jd-cron__desc {
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-primary-ink);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-cron__input {
        transition: none;
      }
    }
  }
`;
