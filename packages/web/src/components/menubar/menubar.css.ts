/**
 * jd-menubar CSS — v2 Menubar 표면의 토큰 번역.
 *
 * v2 값: 바 `flex items-center gap-0 bg-surface border border-border rounded-lg
 * px-1 py-0.5 select-none`, 버튼 `px-3 py-1.5 text-sm font-medium rounded-md`,
 * 열림 `bg-gray-100 text-foreground` / 평상 `text-muted hover:text-foreground
 * hover:bg-gray-50`, 메뉴 `absolute top-full left-0 mt-1 min-w-[200px] bg-surface
 * border border-border rounded-lg shadow-lg py-1 z-50`.
 *
 * ⚠️ v2의 `bg-surface`는 Tailwind 테마에서 `--color-surface: var(--card)`로 정의된
 * **카드색**이다(실측). v3 토큰 --jd-color-surface(#161329)는 사이드바용 잉크색이라
 * 그대로 쓰면 메뉴바가 새까매진다 — 의미 번역은 --jd-color-card가 맞다.
 * 중립 회색 hover(gray-50/100)는 카드 hover / 옅은 경계 토큰으로 옮겼다.
 *
 * 항목 스타일(.jd-dropdown__*)은 jd-dropdown 시트가 소유한다 — element.ts가 두 시트를
 * 함께 채택한다(dist/css/menubar.css 단독 로드는 불완전).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-menubar:not(:defined) { display: flex; }
  jd-menubar:not(:defined) > script { display: none; }
}
@layer junds.components {
  jd-menubar {
    display: flex; align-items: center;
    padding: var(--jd-space-0-5) var(--jd-space-1);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    font-family: var(--jd-font-sans);
    user-select: none;
  }

  .jd-menubar__group { position: relative; }

  .jd-menubar__button {
    padding: var(--jd-space-1-5) var(--jd-space-3);
    border: 0; background: none; cursor: pointer;
    font-family: inherit; font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-muted);
    border-radius: var(--jd-radius-md);
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-menubar__button:hover {
    color: var(--jd-color-foreground); background: var(--jd-color-card-hover);
  }
  .jd-menubar__button:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-menubar__group[data-open] > .jd-menubar__button {
    color: var(--jd-color-foreground); background: var(--jd-color-border-light);
  }

  .jd-menubar__menu {
    position: absolute; top: 100%; left: 0;
    z-index: var(--jd-z-popover);
    min-width: 12.5rem;
    margin-block-start: var(--jd-space-1);
    padding: var(--jd-space-1) 0;
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    box-shadow: var(--jd-shadow-lg);
  }
  .jd-menubar__menu[hidden] { display: none; }

  @media (prefers-reduced-motion: no-preference) {
    .jd-menubar__group[data-open] > .jd-menubar__menu {
      animation: jd-menubar-in var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
  }
  @keyframes jd-menubar-in { from { opacity: 0; scale: 0.98; } }
}`;
