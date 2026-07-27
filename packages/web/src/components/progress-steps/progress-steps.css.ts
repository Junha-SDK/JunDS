import { css } from "../../core/styles.js";

/**
 * v2 값: 원 w-7 h-7(1.75rem) rounded-full text-xs semibold, 완료·현재 =
 * bg-primary/text-white, 예정 = bg-gray-100/text-muted/border, 현재는
 * ring-2 ring-primary/30 ring-offset-1, 라벨 text-[10px] mt-1 whitespace-nowrap
 * (완료는 primary+medium, 그 외 muted), 연결선 h-0.5 flex-1 mx-1
 * (지난 구간 bg-primary, 아니면 bg-gray-200).
 */
export default css`
@layer junds.components {
  jd-progress-steps { display: block; font-family: var(--jd-font-sans); }

  .jd-progress-steps__list {
    display: flex; align-items: flex-start;
    margin: 0; padding: 0; list-style: none;
  }
  .jd-progress-steps__step {
    display: flex; align-items: center; flex: 1 1 0%; min-width: 0;
  }
  .jd-progress-steps__step[data-last] { flex: 0 0 auto; }

  .jd-progress-steps__marker {
    display: flex; flex-direction: column; align-items: center;
  }

  .jd-progress-steps__circle {
    display: flex; align-items: center; justify-content: center;
    width: 1.75rem; height: 1.75rem; flex-shrink: 0; box-sizing: border-box;
    border-radius: var(--jd-radius-full);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums;
    /* 예정 기본 */
    background: var(--jd-progress-steps-track, var(--jd-color-neutral-100));
    color: var(--jd-color-muted);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    transition: background-color var(--jd-duration-normal) var(--jd-easing-default),
                color var(--jd-duration-normal) var(--jd-easing-default);
  }
  .jd-progress-steps__step[data-status="done"] .jd-progress-steps__circle,
  .jd-progress-steps__step[data-status="current"] .jd-progress-steps__circle {
    background: var(--jd-color-primary); color: #fff; border-color: transparent;
  }
  /* v2 ring-2 ring-primary/30 ring-offset-1 — 바깥 흰 링 1px + 색 링 2px */
  .jd-progress-steps__step[data-status="current"] .jd-progress-steps__circle {
    box-shadow: 0 0 0 1px var(--jd-color-background),
                0 0 0 3px color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-progress-steps__circle svg { width: 14px; height: 14px; }

  .jd-progress-steps__label {
    margin-block-start: var(--jd-space-1);
    font-size: 10px; white-space: nowrap; color: var(--jd-color-muted);
  }
  .jd-progress-steps__label[hidden] { display: none; }
  .jd-progress-steps__step[data-status="done"] .jd-progress-steps__label,
  .jd-progress-steps__step[data-status="current"] .jd-progress-steps__label {
    color: var(--jd-color-primary-ink); font-weight: var(--jd-weight-medium);
  }

  .jd-progress-steps__line {
    flex: 1 1 0%; height: 2px; min-width: var(--jd-space-2);
    margin-inline: var(--jd-space-1);
    background: var(--jd-progress-steps-line, var(--jd-color-neutral-200));
    /* 원(1.75rem)의 중심에 맞춘다 — v2는 items-center로 라벨까지 포함한 높이의
       한가운데에 선이 걸려 라벨이 길어지면 선이 내려앉았다 */
    align-self: flex-start; margin-block-start: calc(1.75rem / 2 - 1px);
  }
  .jd-progress-steps__line[hidden] { display: none; }
  .jd-progress-steps__step[data-status="done"] .jd-progress-steps__line {
    background: var(--jd-color-primary);
  }

  /* 상태의 비시각 경로 — 색만으로 전달하지 않는다(WCAG 1.4.1) */
  .jd-progress-steps__status {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  [data-jd-theme="dark"] jd-progress-steps,
  [data-theme="dark"] jd-progress-steps {
    --jd-progress-steps-track: var(--jd-color-border-light);
    --jd-progress-steps-line: var(--jd-color-border);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-progress-steps__circle { transition: none; }
  }
}`;
