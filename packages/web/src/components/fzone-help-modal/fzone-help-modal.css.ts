/**
 * jd-fzone-help-modal CSS — v2 finance/FZoneHelpModal 토큰 번역.
 * 패널 표면·백드롭·크기(lg)는 jd-modal 시트를 그대로 쓰고, 여기서는 안내 콘텐츠의
 * 타이포·틴트만 정의한다. 색은 노드별 --tab/--accent 커스텀 프로퍼티 경유(color-mix).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-fzone-help-modal:not(:defined) { display: none; }

  .jd-fzone-help__header {
    position: sticky; top: 0; z-index: 1;
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-3);
    padding: var(--jd-space-4) var(--jd-space-5); flex-shrink: 0;
    background: var(--jd-color-card);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-fzone-help__title { margin: 0; font-size: var(--jd-text-lg); font-weight: var(--jd-weight-bold); }
  .jd-fzone-help__close {
    display: flex; padding: var(--jd-space-1); border: 0; background: none;
    color: var(--jd-color-muted); cursor: pointer; border-radius: var(--jd-radius-md);
  }
  .jd-fzone-help__close:hover { color: var(--jd-color-foreground); background: var(--jd-color-card-hover); }
  .jd-fzone-help__close:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-fzone-help__scroll { display: block; }

  /* Hero */
  .jd-fzone-help__hero {
    padding: var(--jd-space-5) var(--jd-space-6);
    background: var(--jd-color-surface);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-fzone-help__hero-row { display: flex; align-items: flex-start; gap: var(--jd-space-4); }
  .jd-fzone-help__hero-icon {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 3.5rem; height: 3.5rem; font-size: 28px;
    border-radius: var(--jd-radius-2xl); background: var(--jd-color-warning); color: #fff;
  }
  .jd-fzone-help__hero-text { min-width: 0; }
  .jd-fzone-help__hero-head { margin: 0; font-size: 18px; font-weight: var(--jd-weight-bold); line-height: var(--jd-leading-tight); }
  .jd-fzone-help__hero-sub {
    margin: var(--jd-space-1-5) 0 0; font-size: 13px; line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-muted);
  }
  .jd-fzone-help__hero-strong { color: var(--jd-color-foreground); font-weight: var(--jd-weight-bold); }
  .jd-fzone-help__chips { display: flex; flex-wrap: wrap; gap: var(--jd-space-2); margin-block-start: var(--jd-space-4); }
  .jd-fzone-help__chip {
    font-size: 11px; font-weight: var(--jd-weight-bold); padding: 3px 10px;
    /* 틴트 위 글자는 foreground 쪽으로 섞어 대비 확보 */
    border-radius: var(--jd-radius-full); color: color-mix(in srgb, var(--tab, var(--jd-color-accent)) 65%, var(--jd-color-foreground));
    background: color-mix(in srgb, var(--tab, var(--jd-color-accent)) 12%, transparent);
    border: var(--jd-border-thin) solid color-mix(in srgb, var(--tab, var(--jd-color-accent)) 20%, transparent);
  }

  .jd-fzone-help__sections { padding: var(--jd-space-5); }

  .jd-fzone-help__section { margin-block-start: var(--jd-space-5); }
  .jd-fzone-help__section:first-child { margin-block-start: 0; }
  .jd-fzone-help__section-title {
    display: flex; align-items: center; gap: var(--jd-space-2);
    margin: 0 0 var(--jd-space-3); font-size: 13.5px; font-weight: var(--jd-weight-bold);
  }
  .jd-fzone-help__section-icon {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 22px; height: 22px; font-size: 12px; border-radius: var(--jd-radius-md);
    background: color-mix(in srgb, var(--accent, var(--jd-color-accent)) 12%, transparent);
  }

  /* 카드 읽는 법 */
  .jd-fzone-help__read-grid { display: grid; grid-template-columns: 1fr; gap: var(--jd-space-2-5); }
  .jd-fzone-help__read-card {
    padding: var(--jd-space-2-5) var(--jd-space-3-5); border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border); background: var(--jd-color-card);
  }
  .jd-fzone-help__read-head { display: flex; align-items: center; gap: 6px; margin-block-end: var(--jd-space-1); }
  .jd-fzone-help__read-dot { width: 6px; height: 6px; border-radius: var(--jd-radius-full); background: var(--tab, var(--jd-color-accent)); flex-shrink: 0; }
  .jd-fzone-help__read-title { font-size: 12.5px; font-weight: var(--jd-weight-bold); }
  .jd-fzone-help__read-body { margin: 0; font-size: 12px; line-height: var(--jd-leading-relaxed); color: var(--jd-color-muted); }

  /* 탭별 의미 */
  .jd-fzone-help__tabs { display: flex; flex-direction: column; gap: var(--jd-space-3); }
  .jd-fzone-help__tab {
    border-radius: var(--jd-radius-xl); overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-fzone-help__tab[data-first] {
    border-color: color-mix(in srgb, var(--tab) 33%, transparent);
    box-shadow: 0 4px 14px color-mix(in srgb, var(--tab) 10%, transparent);
  }
  .jd-fzone-help__tab-head {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2-5) var(--jd-space-3-5);
    background: color-mix(in srgb, var(--tab) 6%, transparent);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-fzone-help__tab-emoji {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 30px; height: 30px; font-size: 16px; border-radius: var(--jd-radius-lg);
    background: var(--tab); color: #fff;
  }
  .jd-fzone-help__tab-pill {
    font-size: 11px; font-weight: var(--jd-weight-bold); padding: 2px 10px;
    /* 원색 배경 + 흰 글자 → 배경을 foreground 쪽 80% 혼합으로 어둡혀 대비 확보 */
    border-radius: var(--jd-radius-full); background: color-mix(in srgb, var(--tab) 80%, var(--jd-color-foreground)); color: #fff;
  }
  .jd-fzone-help__tab-current {
    font-size: 10px; font-weight: var(--jd-weight-bold); padding: 1px 6px;
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-success-light);
    color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground)); display: none;
  }
  .jd-fzone-help__tab[data-first] .jd-fzone-help__tab-current { display: inline-block; }
  .jd-fzone-help__tab-headline {
    font-size: 13px; font-weight: var(--jd-weight-bold); margin-inline-start: var(--jd-space-1);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-fzone-help__tab-body { padding: var(--jd-space-3) var(--jd-space-3-5); }
  .jd-fzone-help__tab-oneliner { margin: 0; font-size: 12.5px; line-height: var(--jd-leading-relaxed); color: var(--jd-color-muted); }
  .jd-fzone-help__tab-bullets { list-style: none; margin: var(--jd-space-2) 0 0; padding: 0; display: flex; flex-direction: column; gap: var(--jd-space-1-5); }
  .jd-fzone-help__tab-bullet { display: flex; gap: var(--jd-space-2); font-size: 12.5px; line-height: var(--jd-leading-relaxed); }
  .jd-fzone-help__tab-bullet-dot { flex-shrink: 0; width: 6px; height: 6px; border-radius: var(--jd-radius-full); background: var(--tab); margin-block-start: 7px; }
  .jd-fzone-help__tab-example {
    display: flex; gap: var(--jd-space-2); margin-block-start: var(--jd-space-3);
    padding: var(--jd-space-2) var(--jd-space-3); font-size: 12px; line-height: var(--jd-leading-relaxed);
    border-radius: var(--jd-radius-lg);
    background: color-mix(in srgb, var(--tab) 4%, transparent);
    border: var(--jd-border-thin) dashed color-mix(in srgb, var(--tab) 33%, transparent);
  }
  .jd-fzone-help__tab-example-label { flex-shrink: 0; min-width: 32px; font-size: 10.5px; font-weight: var(--jd-weight-bold); color: color-mix(in srgb, var(--tab) 65%, var(--jd-color-foreground)); }
  .jd-fzone-help__tab-example-text { color: var(--jd-color-foreground); }

  /* 용어 사전 */
  .jd-fzone-help__term-grid { display: grid; grid-template-columns: 1fr; gap: var(--jd-space-2); }
  .jd-fzone-help__term {
    display: flex; gap: var(--jd-space-2-5); padding: var(--jd-space-2) var(--jd-space-3);
    border-radius: var(--jd-radius-lg); background: var(--jd-color-surface);
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-fzone-help__term-pill {
    align-self: flex-start; flex-shrink: 0; white-space: nowrap;
    font-size: 10.5px; font-weight: var(--jd-weight-bold); padding: 2px 8px;
    border-radius: var(--jd-radius-full); color: color-mix(in srgb, var(--tab, var(--jd-color-accent)) 65%, var(--jd-color-foreground));
    background: color-mix(in srgb, var(--tab, var(--jd-color-accent)) 12%, transparent);
  }
  .jd-fzone-help__term-meaning { font-size: 12px; line-height: var(--jd-leading-snug); color: var(--jd-color-foreground); }

  .jd-fzone-help__disclaimer {
    display: flex; gap: var(--jd-space-2); margin-block-start: var(--jd-space-5);
    padding: var(--jd-space-2-5) var(--jd-space-3); font-size: 11.5px; line-height: var(--jd-leading-relaxed);
    border-radius: var(--jd-radius-lg); background: var(--jd-color-warning-light);
    border: var(--jd-border-thin) solid color-mix(in srgb, var(--jd-color-warning) 30%, transparent);
    color: color-mix(in srgb, var(--jd-color-warning) 45%, var(--jd-color-foreground));
  }
  .jd-fzone-help__disclaimer-icon { flex-shrink: 0; }

  @media (min-width: 40rem) {
    .jd-fzone-help__read-grid, .jd-fzone-help__term-grid { grid-template-columns: 1fr 1fr; }
  }
}`;
