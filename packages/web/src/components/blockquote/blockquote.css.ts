/**
 * jd-blockquote CSS — v2 composites/Blockquote(좌측 4px 강조선 + pl-4 · filled/callout은
 * p-4 + rounded-md · 본문 이탤릭 · 출처 text-sm muted)의 토큰 번역.
 *
 * v2 `bg-surface-soft`/`bg-primary-soft`는 대응 토큰이 없어 card-hover/primary-light로
 * 옮겼다(code.css.ts·key-cap과 같은 번역). callout의 글자색은 v2가 `text-primary`
 * 원색이었는데 다크에서 3.2:1로 AA 미달이라, foreground와 섞어 양쪽 테마에서 함께
 * 살게 했다(DEC-027 · code.css.ts에서 axe가 실측으로 잡은 것과 같은 결함).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-blockquote { display: block; }

  .jd-blockquote {
    box-sizing: border-box; margin: 0;
    font-family: var(--jd-font-sans);
    font-size: var(--jd-text-lg); line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-foreground);
    border-inline-start: var(--jd-border-heavy) solid var(--jd-color-border);
    padding-inline-start: var(--jd-space-4);
  }
  /* 이탤릭은 본문에만 — 출처까지 기울면 되돌리는 규칙이 또 필요해진다 */
  .jd-blockquote__body { font-style: italic; }

  .jd-blockquote__footer {
    margin-block-start: var(--jd-space-2);
    font-size: var(--jd-text-md);
    color: var(--jd-color-muted);
  }
  .jd-blockquote__footer[hidden] { display: none; }
  /* <cite>의 UA 기본 이탤릭 해제 (v2 not-italic) */
  .jd-blockquote__cite { font-style: normal; }

  jd-blockquote[variant="bordered"] > .jd-blockquote {
    border-inline-start-color: var(--jd-color-primary);
  }
  jd-blockquote[variant="filled"] > .jd-blockquote {
    background: var(--jd-color-card-hover);
    border-inline-start-color: var(--jd-color-primary);
    border-radius: var(--jd-radius-md);
    padding: var(--jd-space-4);
  }
  jd-blockquote[variant="callout"] > .jd-blockquote {
    background: var(--jd-color-primary-light);
    border-inline-start: 0;
    border-radius: var(--jd-radius-md);
    padding: var(--jd-space-4);
    color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
  }
  jd-blockquote[variant="callout"] .jd-blockquote__footer {
    color: color-mix(in srgb, var(--jd-color-primary) 45%, var(--jd-color-foreground));
  }
}`;
