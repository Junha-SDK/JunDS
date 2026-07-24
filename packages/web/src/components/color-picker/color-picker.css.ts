/**
 * jd-color-picker 컴포넌트 CSS.
 * v2 ds/composites/ColorPicker 시각을 --jd-* 토큰으로 의미 번역:
 *   트리거 = h-9 px-3 gap-2 border bg-card rounded-lg, 열림/포커스 시
 *   border-primary + 3px primary-glow 링 / 팝업 = bg-card·border·rounded-lg·
 *   shadow-lg·p-3 + fade-in-scale / 프리셋 = 6열 gap-1.5, 28px rounded-md,
 *   선택 시 border-primary + ring-2 primary/30, hover scale-110 /
 *   입력줄 = 상단 구분선 + 28px 미리보기 + h-7 텍스트 입력.
 *
 * 팝업 위치(top/left)는 뷰포트 클램프 결과라 JS가 인라인으로 채운다 — 그 외
 * 분기는 전부 속성 셀렉터다(§4.3).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-color-picker {
    position: relative;
    display: inline-block;
    font-family: var(--jd-font-sans);
  }

  /* ── 트리거 ── */
  .jd-color-picker__trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--jd-space-2);
    box-sizing: border-box;
    height: 2.25rem;
    margin: 0;
    padding-inline: var(--jd-space-3);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    font-family: inherit;
    font-size: var(--jd-text-md);
    line-height: var(--jd-leading-none);
    cursor: pointer;
    transition: all var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-color-picker__trigger:hover { background: var(--jd-color-card-hover); }
  .jd-color-picker__trigger:focus-visible {
    outline: none;
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-color-picker__trigger:disabled {
    opacity: var(--jd-opacity-50);
    cursor: not-allowed;
  }
  jd-color-picker[open] > .jd-color-picker__trigger {
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }

  /* 트리거·입력줄이 함께 쓰는 색 미리보기 (배경색은 데이터 — JS 인라인) */
  .jd-color-picker__preview {
    flex-shrink: 0;
    box-sizing: border-box;
    width: 1.25rem;
    height: 1.25rem;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-sm);
  }
  .jd-color-picker__input-row > .jd-color-picker__preview {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--jd-radius-md);
  }

  /* ── 팝업 ── */
  .jd-color-picker__popup {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--jd-z-popover);
    box-sizing: border-box;
    padding: var(--jd-space-3);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    box-shadow: var(--jd-shadow-lg);
  }
  .jd-color-picker__popup[hidden] { display: none; }

  .jd-color-picker__presets {
    display: grid;
    grid-template-columns: repeat(6, 1.75rem);
    gap: var(--jd-space-1-5);
  }

  /* ── 프리셋 스와치 (네이티브 radio 위임 — 라디오는 시각적으로만 감춘다) ── */
  .jd-color-picker__swatch {
    position: relative;
    display: inline-flex;
    box-sizing: border-box;
    width: 1.75rem;
    height: 1.75rem;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-md);
    cursor: pointer;
    transition:
      transform var(--jd-duration-fast) var(--jd-easing-ease-out),
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-color-picker__swatch:hover { transform: scale(1.1); }
  .jd-color-picker__swatch[data-selected] {
    border-color: var(--jd-color-primary);
    box-shadow: 0 0 0 var(--jd-border-medium)
      color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-color-picker__swatch-chip {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: calc(var(--jd-radius-md) - var(--jd-border-thin));
  }
  .jd-color-picker__swatch-input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
  .jd-color-picker__swatch:has(.jd-color-picker__swatch-input:focus-visible) {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 2px;
  }

  /* ── HEX 입력줄 ── */
  .jd-color-picker__input-row {
    display: flex;
    align-items: center;
    gap: var(--jd-space-2);
    margin-block-start: var(--jd-space-2);
    padding-block-start: var(--jd-space-2);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-color-picker__input-row[hidden] { display: none; }

  .jd-color-picker__hex {
    flex: 1 1 auto;
    min-width: 0;
    box-sizing: border-box;
    height: 1.75rem;
    margin: 0;
    padding-inline: var(--jd-space-2);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-md);
    font-family: var(--jd-font-mono);
    font-size: var(--jd-text-md);
  }
  .jd-color-picker__hex:focus {
    outline: none;
    border-color: var(--jd-color-primary);
  }
  .jd-color-picker__hex::placeholder {
    color: color-mix(in srgb, var(--jd-color-muted-light) 60%, transparent);
  }

  @media (prefers-reduced-motion: no-preference) {
    jd-color-picker[open] > .jd-color-picker__popup {
      animation: jd-color-picker-pop var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
  }
  @keyframes jd-color-picker-pop {
    from { opacity: 0; transform: scale(.96); }
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-color-picker__trigger,
    .jd-color-picker__swatch { transition: none; }
    .jd-color-picker__swatch:hover { transform: none; }
  }
}`;
