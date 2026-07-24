import { css } from "../../core/styles.js";

/**
 * v2 값: 트리거 pill(px-2.5/py-1, text-sm, border), 선택 시 primary 10%/30% 틴트.
 * 팝업 = 절대배치 flex pill(surface·테두리·shadow-md·p-1), placement top이면 위쪽,
 * bottom이면 아래쪽. 옵션 32px 원형(hover scale 1.25), 선택 항목 primary 15% + 링.
 */
export default css`
@layer junds.components {
  jd-reaction-picker { position: relative; display: inline-block; font-family: var(--jd-font-sans); }

  .jd-reaction-picker__trigger {
    appearance: none; -webkit-appearance: none; margin: 0;
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    padding: var(--jd-space-1) var(--jd-space-2-5);
    border-radius: var(--jd-radius-full);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card); color: var(--jd-color-foreground);
    font-size: var(--jd-text-md); cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
                border-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-reaction-picker__trigger:hover { background: var(--jd-color-card-hover); }
  .jd-reaction-picker__trigger:focus-visible {
    outline: 2px solid var(--jd-color-primary); outline-offset: 2px;
  }
  .jd-reaction-picker__trigger[data-selected] {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-reaction-picker__trigger-label { font-size: var(--jd-text-xs); }
  .jd-reaction-picker__trigger-label[hidden] { display: none; }

  .jd-reaction-picker__menu {
    position: absolute; left: 0; z-index: var(--jd-z-dropdown);
    display: flex; align-items: center; gap: var(--jd-space-0-5);
    padding: var(--jd-space-1);
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    box-shadow: var(--jd-shadow-md);
  }
  .jd-reaction-picker__menu[hidden] { display: none; }
  jd-reaction-picker[placement="top"] .jd-reaction-picker__menu {
    bottom: 100%; margin-bottom: var(--jd-space-1);
  }
  jd-reaction-picker[placement="bottom"] .jd-reaction-picker__menu {
    top: 100%; margin-top: var(--jd-space-1);
  }

  .jd-reaction-picker__option {
    appearance: none; -webkit-appearance: none; margin: 0; padding: 0;
    width: 2rem; height: 2rem;
    display: inline-flex; align-items: center; justify-content: center;
    border: 0; border-radius: var(--jd-radius-full); background: transparent;
    font-size: var(--jd-text-xl); cursor: pointer;
    transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out),
                background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-reaction-picker__option:hover { transform: scale(1.25); }
  .jd-reaction-picker__option:focus-visible {
    outline: 2px solid var(--jd-color-primary); outline-offset: 1px;
  }
  .jd-reaction-picker__option[data-active] {
    background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-reaction-picker__option:hover { transform: none; }
  }
}`;
