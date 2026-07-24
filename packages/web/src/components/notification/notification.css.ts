/**
 * jd-notification CSS — v2 composites/Notification(30% 테두리 + 5% 틴트 카드).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-notification {
    display: flex; gap: var(--jd-space-3); box-sizing: border-box;
    padding: var(--jd-space-4); font-family: var(--jd-font-sans);
    border: var(--jd-border-thin) solid color-mix(in srgb, var(--_jd-noti-color) 30%, transparent);
    border-radius: var(--jd-radius-xl);
    background: color-mix(in srgb, var(--_jd-noti-color) 5%, var(--jd-color-card));
    --_jd-noti-color: var(--jd-color-info);
  }
  jd-notification[hidden] { display: none; }
  jd-notification[variant="success"] { --_jd-noti-color: var(--jd-color-success); }
  jd-notification[variant="warning"] { --_jd-noti-color: var(--jd-color-warning); }
  jd-notification[variant="danger"] { --_jd-noti-color: var(--jd-color-danger); }

  jd-notification > [slot="icon"] {
    display: flex; flex-shrink: 0; margin-block-start: var(--jd-space-0-5);
    color: var(--_jd-noti-color);
  }
  .jd-notification__body { flex: 1; min-width: 0; }
  .jd-notification__title {
    margin: 0; font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  .jd-notification__title[hidden] { display: none; }
  .jd-notification__desc {
    margin: var(--jd-space-0-5) 0 0; font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
  .jd-notification__desc[hidden] { display: none; }
  .jd-notification__extra:not(:empty) { margin-block-start: var(--jd-space-2); }

  .jd-notification__close {
    display: flex; flex-shrink: 0; padding: var(--jd-space-1);
    border: 0; background: none; cursor: pointer;
    color: var(--jd-color-muted); border-radius: var(--jd-radius-md);
  }
  .jd-notification__close:hover { color: var(--jd-color-foreground); }
  .jd-notification__close[hidden] { display: none; }
  .jd-notification__close:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
}`;
