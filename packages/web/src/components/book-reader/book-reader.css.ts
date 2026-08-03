import { css } from "../../core/styles.js";

/**
 * v2 매핑: bg-surface min-h-screen, sticky 헤더(surface/90 backdrop-blur + border-b),
 * 상단 2px 스크롤바, max-w-6xl 컨테이너, lg에서 [260px 1fr] 2열(toc-open일 때),
 * 목차 sticky top-24, 본문 prose. 토글/북마크/닫기 = 32px 정사각 hover 버튼.
 *
 * v3 교정: v2의 `bg-surface`는 밝은 카드면을 뜻했지만 v3의 surface는 **라이트에서도
 * 어두운** 리더 캔버스다(DEC-044). 그 위의 잉크·테두리·강조색은 전부 on-surface 계열에서
 * 다시 뽑는다 — 이름만 옮겨 오면 라이트 모드에서 본문이 통째로 사라진다.
 */
export default css`
  @layer junds.components {
    /* 리더 캔버스는 모드와 무관하게 어두운 면이다(DEC-044) — 종이 대신 밤을 깐다.
     그래서 그 위의 잉크·테두리·구분선은 모드를 따라가면 안 된다: foreground를 쓰면
     라이트 모드에서 검은 글자가 검은 면에 얹혀 본문이 통째로 사라진다.
     강조색도 같은 이유로 이 면 위에서 다시 조제한다 — primary(#5b4cc7)는 이 캔버스에서
     2.2:1, 기본 포커스 링은 1.4:1이라 사실상 보이지 않는다. 잉크 쪽으로 들어 올린
     accent 하나를 만들어 진행바·북마크·활성 목차·포커스 링이 함께 쓴다. 링은 색 변수만
     갈아 끼우므로 안쪽 규칙은 DEC-039 두 줄 관용구를 그대로 유지한다. */
    jd-book-reader {
      position: relative;
      display: block;
      min-height: 100vh;
      background: var(--jd-color-surface);
      font-family: var(--jd-font-sans);
      color: var(--jd-color-on-surface);
      --jd-book-reader-accent: color-mix(
        in srgb,
        var(--jd-color-accent) 70%,
        var(--jd-color-on-surface)
      );
      --jd-color-ring-primary: color-mix(
        in srgb,
        var(--jd-book-reader-accent) 65%,
        transparent
      );
    }

    .jd-book-reader__progressbar {
      position: fixed;
      inset-block-start: 0;
      inset-inline: 0;
      height: 2px;
      z-index: var(--jd-z-sticky);
      background: transparent;
    }
    .jd-book-reader__progressbar-fill {
      display: block;
      height: 100%;
      width: 0%;
      background: var(--jd-book-reader-accent);
      transition: width var(--jd-duration-fast) var(--jd-easing-linear);
    }

    .jd-book-reader__header {
      position: sticky;
      inset-block-start: 0;
      z-index: var(--jd-z-header);
      background: color-mix(in srgb, var(--jd-color-surface) 90%, transparent);
      backdrop-filter: blur(8px);
      /* 어두운 면 위의 구분선은 border 토큰이 아니라 잉크에서 뽑는다 */
      border-bottom: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-on-surface) 14%, transparent);
    }
    .jd-book-reader__topbar {
      max-width: 72rem;
      margin-inline: auto;
      padding: var(--jd-space-2) var(--jd-space-4);
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }
    .jd-book-reader__toc-toggle,
    .jd-book-reader__bookmark,
    .jd-book-reader__close {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: transparent;
      cursor: pointer;
      border-radius: var(--jd-radius-md);
      color: var(--jd-color-on-surface);
      font-size: var(--jd-text-md);
      transition: background var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-book-reader__toc-toggle:hover,
    .jd-book-reader__bookmark:hover,
    .jd-book-reader__close:hover {
      background: color-mix(in srgb, var(--jd-color-on-surface) 12%, transparent);
    }
    /* 눌린 면은 빛을 잃는다 — 세 버튼 모두 v2에 :active가 아예 없었다 */
    .jd-book-reader__toc-toggle:active,
    .jd-book-reader__bookmark:active,
    .jd-book-reader__close:active {
      scale: 0.97;
      background: color-mix(in srgb, var(--jd-color-on-surface) 18%, transparent);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-book-reader__toc-toggle:focus-visible,
    .jd-book-reader__bookmark:focus-visible,
    .jd-book-reader__close:focus-visible,
    .jd-book-reader__toc-link:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    /* v2 병렬: 핸들러가 있을 때만 노출(bookmarkable / closable) */
    .jd-book-reader__bookmark {
      display: none;
    }
    .jd-book-reader__close {
      display: none;
    }
    jd-book-reader[bookmarkable] .jd-book-reader__bookmark {
      display: inline-flex;
    }
    jd-book-reader[closable] .jd-book-reader__close {
      display: inline-flex;
    }
    jd-book-reader[bookmarked] .jd-book-reader__bookmark {
      color: var(--jd-book-reader-accent);
    }

    .jd-book-reader__titles {
      min-width: 0;
      flex: 1;
    }
    .jd-book-reader__title {
      margin: 0;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .jd-book-reader__author {
      margin: 0;
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-on-surface-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .jd-book-reader__pageprogress {
      max-width: 72rem;
      margin-inline: auto;
      padding: 0 var(--jd-space-4) var(--jd-space-2);
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }
    .jd-book-reader__pagebar {
      flex: 1;
      height: 4px;
      border-radius: var(--jd-radius-full);
      /* 트랙도 어두운 면 위의 잉크에서 뽑는다 — border-light는 라이트 모드에서
       거의 흰색이라 이 캔버스에서 홀로 튄다 */
      background: color-mix(in srgb, var(--jd-color-on-surface) 16%, transparent);
      overflow: hidden;
    }
    .jd-book-reader__pagebar-fill {
      display: block;
      height: 100%;
      width: 0%;
      background: var(--jd-book-reader-accent);
      transition: width var(--jd-duration-normal) var(--jd-easing-default);
    }
    .jd-book-reader__pagelabel {
      flex-shrink: 0;
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-on-surface-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .jd-book-reader__layout {
      max-width: 72rem;
      margin-inline: auto;
      padding: var(--jd-space-6) var(--jd-space-4);
      display: grid;
      gap: var(--jd-space-6);
    }
    .jd-book-reader__toc {
      display: none;
    }
    @media (min-width: 1024px) {
      jd-book-reader[toc-open] .jd-book-reader__layout {
        grid-template-columns: 260px 1fr;
      }
      jd-book-reader[toc-open] .jd-book-reader__toc {
        display: block;
        position: sticky;
        inset-block-start: 6rem;
        align-self: start;
        max-height: calc(100vh - 7rem);
        overflow-y: auto;
        padding-right: var(--jd-space-2);
      }
    }

    .jd-book-reader__toc-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .jd-book-reader__toc-list .jd-book-reader__toc-list {
      padding-left: var(--jd-space-3);
    }
    .jd-book-reader__toc-link {
      display: block;
      padding: var(--jd-space-1-5) var(--jd-space-2);
      border-radius: var(--jd-radius-md);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-on-surface-muted);
      text-decoration: none;
      transition: background var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-book-reader__toc-link:hover {
      background: color-mix(in srgb, var(--jd-color-on-surface) 12%, transparent);
      color: var(--jd-color-on-surface);
    }
    .jd-book-reader__toc-link:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-book-reader__toc-link[data-active] {
      background: color-mix(in srgb, var(--jd-book-reader-accent) 16%, transparent);
      color: var(--jd-book-reader-accent);
      font-weight: var(--jd-weight-medium);
    }

    .jd-book-reader__body {
      min-width: 0;
      line-height: var(--jd-leading-relaxed);
    }
    .jd-book-reader__body > :first-child {
      margin-top: 0;
    }
    .jd-book-reader__body h2 {
      font-size: var(--jd-text-2xl);
      font-weight: var(--jd-weight-semibold);
      margin: var(--jd-space-8) 0 var(--jd-space-3);
    }
    .jd-book-reader__body h3 {
      font-size: var(--jd-text-xl);
      font-weight: var(--jd-weight-semibold);
      margin: var(--jd-space-6) 0 var(--jd-space-2);
    }
    .jd-book-reader__body p {
      margin: 0 0 var(--jd-space-4);
    }
    .jd-book-reader__body a {
      color: var(--jd-book-reader-accent);
      text-underline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-book-reader__progressbar-fill,
      .jd-book-reader__pagebar-fill,
      .jd-book-reader__toc-toggle,
      .jd-book-reader__bookmark,
      .jd-book-reader__close,
      .jd-book-reader__toc-link {
        transition: none;
      }
    }
  }
`;
