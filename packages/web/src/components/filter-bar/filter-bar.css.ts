import { css } from "../../core/styles.js";

/**
 * jd-filter-bar CSS — v2 patterns/FilterBar 번역.
 * v2 값: 컨테이너 `flex items-center gap-2 flex-wrap`, 검색 래퍼 `w-64`,
 * Input `size sm` + leftSlot 돋보기, 초기화는 Button `ghost xs` + 배지
 * `ml-1 bg-primary text-white text-[10px] rounded-full w-4 h-4`, 액션 `ml-auto`.
 */
export default css`
  @layer junds.components {
    jd-filter-bar {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      flex-wrap: wrap;
      font-family: var(--jd-font-sans);
    }
    jd-filter-bar > [hidden] {
      display: none;
    }

    /* ── 검색 (v2 w-64 = 16rem) ── */
    .jd-filter-bar__search {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 16rem;
      max-width: 100%;
      color: var(--jd-color-muted);
    }
    .jd-filter-bar__search-icon {
      position: absolute;
      inset-inline-start: var(--jd-space-2-5);
      pointer-events: none;
    }
    .jd-filter-bar__input {
      width: 100%;
      box-sizing: border-box;
      height: var(--jd-space-8);
      padding-inline: calc(var(--jd-space-2-5) + 14px + var(--jd-space-2)) var(--jd-space-2-5);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-foreground);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      outline: none;
      transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-filter-bar__input::placeholder {
      color: var(--jd-color-muted-light);
    }
    .jd-filter-bar__input:focus-visible {
      border-color: var(--jd-color-primary);
      box-shadow: 0 0 0 var(--jd-border-medium)
        color-mix(in srgb, var(--jd-color-primary) 35%, transparent);
    }

    /* ── 초기화 (v2 ghost xs) ── */
    .jd-filter-bar__reset {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      height: var(--jd-space-8);
      padding-inline: var(--jd-space-2-5);
      margin: 0;
      font: inherit;
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
      background: none;
      border: 0;
      border-radius: var(--jd-radius-lg);
      cursor: pointer;
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out),
        background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-filter-bar__reset:hover {
      color: var(--jd-color-foreground);
      background: var(--jd-color-card-hover);
    }
    .jd-filter-bar__reset:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: 1px;
    }
    /* v2 배지 — 원형 pill */
    .jd-filter-bar__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      line-height: 1;
      /* 솔리드 primary 위 글자는 흰색 고정 — button/chat-bubble/pagination과 동일 관용구.
       primary는 테마 불변(#5b4cc7)이라 --jd-color-background(다크에서 #0c0a14)를 쓰면
       다크에서 대비가 ~2.96:1로 깨진다(v2 FilterBar 배지 bg-primary text-white). */
      color: #fff;
      background: var(--jd-color-primary);
      border-radius: var(--jd-radius-full);
    }

    /* ── 액션 (v2 ml-auto) ── */
    .jd-filter-bar__actions {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      margin-inline-start: auto;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-filter-bar__input,
      .jd-filter-bar__reset {
        transition: none;
      }
    }
  }
`;
