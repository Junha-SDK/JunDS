/**
 * jd-dropdown CSS — v2 Dropdown 표면 + **메뉴 목록 원형**(ContextMenu·Menubar 공용).
 *
 * v2 값: 메뉴 `mt-1 min-w-[160px] bg-white border border-border rounded-lg shadow-xl
 * shadow-black/15 py-1 animate-fade-in-scale`, 항목 `w-full flex items-center gap-2
 * px-3 py-1.5 text-sm text-left`, 일반 hover `bg-primary/10`, danger `text-danger
 * hover:bg-danger/10`, disabled `opacity-40 cursor-not-allowed`, 아이콘 `w-4 h-4
 * shrink-0`, 구분선 `h-px bg-border my-1`, 단축키 `text-xs text-muted ml-4`.
 *
 * z-index는 --jd-z-popover(60)를 그대로 쓴다. 의미상 --jd-z-dropdown(10)이 맞아
 * 보이지만 그 값은 sticky(20)·header(30) 아래라 헤더 밑으로 숨는다 — v2도 z-50으로
 * 헤더 위에 띄우고 있었다(패리티 우선, 토큰 재정의는 02-tokens 소관).
 *
 * `.jd-dropdown__*`는 ContextMenu·Menubar가 그대로 재사용하는 공용 클래스다
 * (Drawer가 `.jd-modal__panel`을 쓰는 것과 같은 소유 규칙).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-dropdown:not(:defined) { display: inline-block; }
  jd-dropdown:not(:defined) > script { display: none; }
}
@layer junds.components {
  jd-dropdown { position: relative; display: inline-block; }

  /* 파생 기본값(0,1,1) — v2 기본 정렬 right. 디폴트는 attribute로 반영되지 않으므로
     (§1.3) CSS가 담당한다. 명시 align attribute(0,2,0)가 언제나 이긴다. */
  jd-dropdown > .jd-popover__panel {
    left: auto; right: 0; --jd-popover-tx: 0;
    min-width: 10rem;
    padding: var(--jd-space-1) 0;
    border-radius: var(--jd-radius-lg);
    backdrop-filter: none;
  }

  /* ── 메뉴 목록 원형 ── */
  .jd-dropdown__item {
    display: flex; align-items: center; gap: var(--jd-space-2);
    width: 100%; box-sizing: border-box;
    padding: var(--jd-space-1-5) var(--jd-space-3);
    border: 0; background: none; cursor: pointer;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    text-align: start; color: var(--jd-color-foreground);
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-dropdown__item:hover:not(:disabled),
  .jd-dropdown__item:focus-visible {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
  }
  .jd-dropdown__item:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-dropdown__item[data-danger] { color: var(--jd-color-danger-ink); }
  .jd-dropdown__item[data-danger]:hover:not(:disabled),
  .jd-dropdown__item[data-danger]:focus-visible {
    background: color-mix(in srgb, var(--jd-color-danger) 10%, transparent);
  }
  .jd-dropdown__item:disabled { opacity: var(--jd-opacity-40); cursor: not-allowed; }

  .jd-dropdown__icon {
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0; width: 1rem; height: 1rem;
  }
  .jd-dropdown__icon > svg { width: 100%; height: 100%; }
  .jd-dropdown__label { flex: 1 1 auto; min-width: 0; }
  .jd-dropdown__shortcut {
    flex-shrink: 0; margin-inline-start: var(--jd-space-4);
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }

  .jd-dropdown__divider {
    height: var(--jd-border-thin); margin-block: var(--jd-space-1);
    background: var(--jd-color-border);
  }
}`;
