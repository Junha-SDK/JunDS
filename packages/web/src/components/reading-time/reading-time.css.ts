import { css } from "../../core/styles.js";

/**
 * v2 값 번역: `inline-flex items-center gap-1.5 text-sm text-neutral-500`,
 * 가운뎃점 text-neutral-300, 난이도 font-medium + green/yellow/red-600.
 * 색은 무명 Tailwind 팔레트 리터럴 대신 의미 토큰(success·warning·danger)으로 옮기고,
 * 라이트에서는 DEC-027 관용구(원색을 검정 쪽으로 섞어 본문 AA 확보)를 적용한다 —
 * 흰 배경 위 green-600은 3.0:1로 본문 대비에 미달했다. 다크는 원색 복원.
 */
export default css`
  @layer junds.components {
    jd-reading-time {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
    }

    .jd-reading-time__sep {
      color: var(--jd-color-muted-light);
    }
    .jd-reading-time__sep[hidden],
    .jd-reading-time__level[hidden] {
      display: none;
    }

    .jd-reading-time__level {
      font-weight: var(--jd-weight-medium);
    }
    .jd-reading-time__level[data-level="basic"] {
      color: color-mix(
        in srgb,
        var(--jd-color-success) var(--jd-tone-ink-mix),
        var(--jd-tone-ink-toward)
      );
    }
    .jd-reading-time__level[data-level="intermediate"] {
      color: color-mix(
        in srgb,
        var(--jd-color-warning) var(--jd-tone-ink-mix),
        var(--jd-tone-ink-toward)
      );
    }
    .jd-reading-time__level[data-level="advanced"] {
      color: color-mix(
        in srgb,
        var(--jd-color-danger) var(--jd-tone-ink-mix),
        var(--jd-tone-ink-toward)
      );
    }

    /* 스크린리더 전용 접두("난이도 ") — visually-hidden과 같은 clip-path 관용구 */
    .jd-reading-time__sr {
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
  }
`;
