import { css } from "../../core/styles.js";

/**
 * jd-settings-layout CSS — v2 patterns/SettingsLayout의 토큰 번역.
 *
 * v2 값: 루트 `flex flex-col lg:flex-row min-h-[480px] bg-background`,
 * 사이드바 `border-b lg:border-b-0 lg:border-r border-border bg-surface p-4`(폭 인라인),
 * 제목 `px-2 mb-4 text-sm font-semibold uppercase tracking-wider text-muted`,
 * 내비 `flex flex-col gap-3`, 그룹 `flex flex-col gap-0.5`, 그룹라벨 `px-2 pt-2 text-[10px]`,
 * 항목 `flex items-center gap-2 px-2 py-1.5 rounded-md text-sm`(활성 `bg-primary-soft
 * text-primary font-medium`, 비활성 `hover:bg-surface-soft text-foreground`),
 * 본문 `flex-1 p-6 lg:p-8 overflow-auto`.
 *
 * 색 번역(DEC-025-4/blockquote 선례): bg-surface→card · bg-surface-soft→card-hover ·
 * bg-primary-soft→primary-light. Tailwind text-sm(0.875rem)→--jd-text-md(accordion 선례),
 * tracking-wider(0.05em)는 대응 토큰 없어 리터럴.
 *
 * v2와 다른 점: 사이드바 폭 인라인(모바일에도 220px 고정)은 세로 레이아웃에서 좁은 바가
 * 되는 흠이라, 폭은 데스크톱(≥1024px)에서만 적용하고 모바일은 전폭으로 둔다.
 */
export default css`
  @layer junds.components {
    jd-settings-layout {
      display: flex;
      flex-direction: column;
      min-height: 480px;
      background: var(--jd-color-background);
      font-family: var(--jd-font-sans);
    }

    .jd-settings-layout__sidebar {
      box-sizing: border-box;
      width: 100%;
      padding: var(--jd-space-4);
      background: var(--jd-color-card);
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
    }

    .jd-settings-layout__title {
      padding-inline: var(--jd-space-2);
      margin-bottom: var(--jd-space-4);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--jd-color-muted);
    }
    .jd-settings-layout__title[hidden] {
      display: none;
    }

    .jd-settings-layout__nav {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-3);
    }

    .jd-settings-layout__group {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-0-5);
    }

    .jd-settings-layout__group-label {
      padding-inline: var(--jd-space-2);
      padding-top: var(--jd-space-2);
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--jd-color-muted);
    }

    .jd-settings-layout__item {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      width: 100%;
      padding-inline: var(--jd-space-2);
      padding-block: var(--jd-space-1-5);
      border: 0;
      border-radius: var(--jd-radius-md);
      background: transparent;
      font-family: inherit;
      font-size: var(--jd-text-md);
      text-align: left;
      color: var(--jd-color-foreground);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-settings-layout__item:hover {
      background: var(--jd-color-card-hover);
    }
    .jd-settings-layout__item[aria-selected="true"] {
      background: var(--jd-color-primary-light);
      /* 틴트 위 글자색은 semantic 원색이 아니라 foreground와 섞은 값이다. primary 원색을
       primary-light 위에 그대로 쓰면 대비가 AA 미달(다크에서 특히) — foreground와 섞어
       양쪽 테마에서 함께 살린다(DEC-027 · blockquote/code.css 선례). */
      color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
      font-weight: var(--jd-weight-medium);
    }
    .jd-settings-layout__item:focus-visible {
      outline: var(--jd-border-medium) solid
        color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
      outline-offset: 1px;
    }

    .jd-settings-layout__icon {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
    }
    .jd-settings-layout__icon[hidden] {
      display: none;
    }
    .jd-settings-layout__icon svg {
      width: 1rem;
      height: 1rem;
    }

    .jd-settings-layout__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* basis는 0이 아니라 auto다. 세로 배치(사이드바가 위)에서 flex:1은 본문의 기준
     높이를 0으로 만들고, 호스트의 min-height 480px에서 남은 만큼만 자란다 —
     본문이 그보다 길면 overflow:auto가 남은 내용을 잘라 위쪽만 보였다(실측).
     basis auto면 내용이 자기 높이를 말하고 호스트가 따라 늘어난다(§6). */
    .jd-settings-layout__content {
      flex: 1 1 auto;
      min-width: 0;
      /* 반대로 호스트 높이가 밖에서 고정된 경우에는 줄어들 수 있어야 스크롤이 산다 */
      min-height: 0;
      padding: var(--jd-space-6);
      overflow: auto;
    }
    .jd-settings-layout__panel[hidden] {
      display: none;
    }

    @media (min-width: 1024px) {
      jd-settings-layout {
        flex-direction: row;
      }
      /* 가로 배치 여부는 뷰포트가 정하는데 폭은 부모가 준다 — 넓은 화면의 좁은 칼럼
       안에서 220px 고정 사이드바가 본문 칸을 다 먹었다. 칸의 40%를 상한으로 둬
       본문이 항상 사이드바보다 넓게 남는다(§6). */
      .jd-settings-layout__sidebar {
        flex: 0 0 auto;
        width: min(var(--_jd-settings-sidebar-w, 220px), 40%);
        border-bottom: 0;
        border-right: var(--jd-border-thin) solid var(--jd-color-border);
      }
      .jd-settings-layout__content {
        padding: var(--jd-space-8);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-settings-layout__item {
        transition: none;
      }
    }
  }
`;
