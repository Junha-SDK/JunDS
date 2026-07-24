/**
 * jd-code CSS — v2 primitives/Code(variant 5종 × size 3종)의 토큰 번역.
 * v2 bg-surface-soft/primary-soft는 대응 토큰이 없어 card-hover/primary-light로 근사
 * (B4 KeyCap과 같은 번역 — G2 색 어휘 재심의 목록).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-code { display: inline; }

  .jd-code {
    display: inline-flex; align-items: center; vertical-align: middle;
    font-family: var(--jd-font-mono);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-sm);
    background: var(--jd-color-card-hover); color: var(--jd-color-foreground);
    /* size 기본 md — v2 12px / 6px 10px */
    font-size: 12px; padding: var(--jd-space-0-5) var(--jd-space-1-5);
  }

  jd-code[size="sm"] .jd-code { font-size: 11px; padding: 0 var(--jd-space-1); }
  jd-code[size="lg"] .jd-code { font-size: 13px; padding: var(--jd-space-1) var(--jd-space-2); }

  jd-code[variant="primary"] .jd-code {
    background: var(--jd-color-primary-light); color: var(--jd-color-primary);
    border-color: color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  /* 글자색은 semantic 원색이 아니라 foreground와 섞은 값이다. 원색(success #2f8f57 ·
     warning #b7791f)을 10% 틴트 위에 그대로 쓰면 3.2~3.6:1로 AA 미달 — axe 게이트가
     실측으로 잡았다(v2 text-success/warning도 같은 결함을 갖고 있었다).
     foreground와 섞으면 라이트에선 어두워지고 다크에선 밝아져 양쪽 테마가 함께 산다. */
  jd-code[variant="success"] .jd-code {
    background: color-mix(in srgb, var(--jd-color-success) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground));
    border-color: color-mix(in srgb, var(--jd-color-success) 30%, transparent);
  }
  jd-code[variant="warning"] .jd-code {
    background: color-mix(in srgb, var(--jd-color-warning) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-warning) 65%, var(--jd-color-foreground));
    border-color: color-mix(in srgb, var(--jd-color-warning) 30%, transparent);
  }
  jd-code[variant="danger"] .jd-code {
    background: color-mix(in srgb, var(--jd-color-danger) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-danger) 65%, var(--jd-color-foreground));
    border-color: color-mix(in srgb, var(--jd-color-danger) 30%, transparent);
  }
}`;
