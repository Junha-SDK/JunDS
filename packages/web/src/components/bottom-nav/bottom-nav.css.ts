import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): 탭 = flex-1 세로 icon+label, 아이콘은 size-9 rounded-full pill.
 * 활성 = accent 글자 + accent-soft pill 배경. 라벨 text-[11px] font-semibold.
 * 시트 항목 = px-4 py-3 text-[13.5px] font-bold, 사이 구분선, 활성 accent-strong.
 * 계단 밖 글자 크기(13.5·10.5px)는 토큰 계단으로 올렸다 — 11px이 읽기의 바닥(§9).
 * 시트 오버레이 자체(백드롭·패널)는 jd-bottom-sheet가 칠한다 — 여기선 내용만.
 */
export default css`
  @layer junds.components {
    /* 강조색 기본값은 팔레트 안에 있어야 한다(§8) — v2가 박아 둔 민트(#14b8a6)는
     브랜드 색도 아니고 다크에서 따라오지도 않았다. --jd-fin-accent를 준 앱은 그대로
     그 색을 쓰고, 안 준 앱은 브랜드 primary를 받는다. */
    jd-bottom-nav {
      display: block;
      font-family: var(--jd-font-sans);
      --_accent: var(--jd-fin-accent, var(--jd-color-primary));
      --_accent-strong: var(--jd-fin-accent-strong, var(--jd-color-primary-hover));
      --_accent-soft: var(--jd-fin-accent-soft, var(--jd-color-primary-light));
      --_surface: var(--jd-fin-surface, var(--jd-color-card));
      --_text: var(--jd-fin-text, var(--jd-color-foreground));
      --_muted: var(--jd-fin-muted, var(--jd-color-muted));
      --_border: var(--jd-fin-border, var(--jd-color-border));
    }

    /* ── 탭바 ── */
    .jd-bottom-nav__bar {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      gap: var(--jd-space-1);
      padding: var(--jd-space-2) var(--jd-space-2)
        max(env(safe-area-inset-bottom), var(--jd-space-1-5));
      background: var(--_surface);
      border-block-start: var(--jd-border-thin) solid var(--_border);
    }
    .jd-bottom-nav__tab {
      /* flex-basis 0 + min-width 0 — 기본 min-width:auto면 라벨이 칸을 밀어내 항목마다
       폭이 달라진다. 0에서 출발해 균등하게 나눠 갖는다(§5). */
      flex: 1 1 0;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--jd-space-1);
      padding: var(--jd-space-1) 0;
      appearance: none;
      border: 0;
      background: transparent;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      font-family: inherit;
      transition: scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-bottom-nav__tab-icon {
      display: grid;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
      color: var(--_muted);
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out),
        background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    /* 누를 수 있는 것은 세 상태를 다 갖는다(§1) — v2에는 hover도 active도 없었다.
     선택 표시([data-active])와 특정도가 같으므로 **뒤에 오는 쪽이 이긴다** — 선택된
     탭을 가리켰을 때 옅은 호버색으로 내려앉지 않게 선택 규칙을 뒤에 둔다. */
    .jd-bottom-nav__tab:hover .jd-bottom-nav__tab-icon {
      color: var(--_accent);
      background: color-mix(in srgb, var(--_accent) 10%, transparent);
    }
    .jd-bottom-nav__tab:hover .jd-bottom-nav__tab-label {
      color: var(--_accent);
    }
    .jd-bottom-nav__tab:active {
      scale: 0.97;
    }
    .jd-bottom-nav__tab[data-active] .jd-bottom-nav__tab-icon {
      color: var(--_accent);
      background: var(--_accent-soft);
    }
    /* 내비 라벨은 접히지 않는다 — "포트폴리오"가 두 줄이 되면 항목 높이가 어긋난다.
     11px은 읽기의 바닥이라 더 줄일 수 없으므로(§9) 자간을 좁혀 폭을 번다. */
    .jd-bottom-nav__tab-label {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--jd-text-2xs);
      letter-spacing: var(--jd-tracking-tight);
      font-weight: var(--jd-weight-semibold);
      color: var(--_muted);
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-bottom-nav__tab[data-active] .jd-bottom-nav__tab-label {
      color: var(--_accent);
    }
    .jd-bottom-nav__tab:focus-visible {
      /* 바 안쪽이라 바깥으로 나가는 링은 잘린다 — offset을 안으로 접는다 */
      outline: var(--jd-focus-ring);
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
      border-radius: var(--jd-radius-md);
    }

    /* ── 더보기 시트 내용 ── */
    .jd-bottom-nav__sheet-body {
      padding: 0 var(--jd-space-3) var(--jd-space-2);
    }
    .jd-bottom-nav__sheet-section {
      margin-block-end: var(--jd-space-3);
    }
    .jd-bottom-nav__sheet-title {
      padding: 0 var(--jd-space-3);
      margin-block-end: var(--jd-space-1-5);
      /* 10.5px은 읽기의 바닥(11px, §9) 아래였다 */
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      letter-spacing: var(--jd-tracking-wider);
      color: var(--_muted);
    }
    .jd-bottom-nav__sheet-list {
      margin: 0;
      padding: 0;
      list-style: none;
      border: var(--jd-border-thin) solid var(--_border);
      border-radius: var(--jd-radius-2xl);
      overflow: hidden;
    }
    .jd-bottom-nav__sheet-item {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      padding: var(--jd-space-3) var(--jd-space-4);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-bold);
      text-decoration: none;
      color: var(--_text);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-bottom-nav__sheet-list > li + li > .jd-bottom-nav__sheet-item {
      border-block-start: var(--jd-border-thin) solid var(--_border);
    }
    /* 시트 항목도 누를 수 있다 — 세 상태를 다 준다(§1). 선택 표시와 특정도가 같아
     뒤에 오는 쪽이 이기므로 [data-active]를 마지막에 둔다. */
    .jd-bottom-nav__sheet-item:hover {
      background: color-mix(in srgb, var(--_accent) 8%, transparent);
    }
    .jd-bottom-nav__sheet-item:active {
      background: color-mix(in srgb, var(--_accent) 14%, transparent);
    }
    .jd-bottom-nav__sheet-item:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
    }
    .jd-bottom-nav__sheet-item[data-active] {
      background: var(--_accent-soft);
      color: var(--_accent-strong);
    }
    .jd-bottom-nav__sheet-icon {
      display: grid;
      place-items: center;
      width: var(--jd-space-5);
      flex-shrink: 0;
      color: var(--_muted);
    }
    .jd-bottom-nav__sheet-item[data-active] .jd-bottom-nav__sheet-icon {
      color: var(--_accent-strong);
    }
    .jd-bottom-nav__sheet-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-bottom-nav__sheet-desc {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-medium);
      color: var(--_muted);
      flex-shrink: 1;
      min-width: 0;
      max-width: 11.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-bottom-nav__tab,
      .jd-bottom-nav__tab-icon,
      .jd-bottom-nav__tab-label,
      .jd-bottom-nav__sheet-item {
        transition: none;
      }
    }
  }
`;
