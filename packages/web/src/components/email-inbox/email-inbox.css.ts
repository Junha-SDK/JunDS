import { css } from "../../core/styles.js";

/**
 * v2 매핑: grid [200px 360px 1fr] h-640 rounded-xl border bg-surface, 폴더/리스트/본문 3열,
 * lg 미만은 리스트 1열(폴더·본문 숨김). 폴더 active=primary/10, 안읽음 카운트 pill,
 * 리스트 항목 border-b + unread 점·굵기, 별표 amber, 본문 헤더 + prose 본문.
 *
 * ⚠️ v2의 `surface`는 카드색이었다. v3 --jd-color-surface(#161329)는 라이트에서도 어두운
 * 크롬 전용이라 그대로 옮기면 목록·미리보기가 검은 판이 되고, 그 위에 모드추종 잉크가
 * 얹혀 제목·본문이 사라진다(실측). 메일함은 크롬이 아니라 **앱의 본문**이므로 card 가
 * 맞다 — VISUAL-BAR §4. 한 톤 뜬 면(hover·라벨 pill)은 card-hover / muted 혼합으로 얻는다.
 */
export default css`
  @layer junds.components {
    jd-email-inbox {
      display: grid;
      grid-template-columns: 1fr;
      height: 640px;
      box-sizing: border-box; /* height + border 병용 — 실측 640px 유지(DEC-014-9) */
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
      background: var(--jd-color-card);
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    @media (min-width: 1024px) {
      jd-email-inbox {
        grid-template-columns: 200px 360px 1fr;
      }
    }

    /* 폴더 패널 */
    .jd-email-inbox__folders {
      display: none;
      border-right: var(--jd-border-thin) solid var(--jd-color-border);
      padding: var(--jd-space-2);
      overflow-y: auto;
      overscroll-behavior-y: contain;
      scrollbar-width: thin;
    }
    @media (min-width: 1024px) {
      .jd-email-inbox__folders {
        display: block;
      }
    }
    .jd-email-inbox__folder-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .jd-email-inbox__folder {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-3);
      border: 0;
      background: transparent;
      cursor: pointer;
      border-radius: var(--jd-radius-md);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-foreground);
      text-align: left;
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-email-inbox__folder:not([data-active]):hover {
      background: var(--jd-color-card-hover);
    }
    .jd-email-inbox__folder[data-active] {
      background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
      color: var(--jd-color-primary-ink);
      font-weight: var(--jd-weight-semibold);
    }
    .jd-email-inbox__folder[data-active]:hover {
      background: color-mix(in srgb, var(--jd-color-primary) 16%, transparent);
    }
    /* 선택 여부와 무관하게 눌린다 — [data-active] 뒤에 둬야 덮이지 않는다(§1) */
    .jd-email-inbox__folder:active {
      scale: 0.98;
    }
    /* 오프셋은 음수 — 패널이 overflow:hidden 이라 바깥으로 그린 링은 잘려 사라진다 */
    .jd-email-inbox__folder:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
    }
    .jd-email-inbox__folder-label {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-email-inbox__folder-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-email-inbox__folder-count {
      flex-shrink: 0;
      font-size: var(--jd-text-2xs);
      padding: 0 var(--jd-space-1-5);
      border-radius: var(--jd-radius-full);
      font-variant-numeric: tabular-nums;
      background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
      color: var(--jd-color-primary-ink);
    }

    /* 리스트 패널 */
    .jd-email-inbox__list {
      display: flex;
      flex-direction: column;
      min-height: 0;
      border-right: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-email-inbox__search {
      padding: var(--jd-space-2);
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-email-inbox__search-input {
      width: 100%;
      height: 2.25rem;
      padding: 0 var(--jd-space-3);
      font-size: var(--jd-text-sm);
      font-family: inherit;
      color: inherit;
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-md);
      background: var(--jd-color-control-surface);
      transition: border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    /* outline을 지우면 같은 규칙 안에서 대체 표시를 준다 — 테두리색만으로는
       색각 이상 사용자에게 포커스가 보이지 않는다(§1) */
    .jd-email-inbox__search-input:focus-visible {
      outline: none;
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-email-inbox__items {
      flex: 1;
      overflow-y: auto;
      overscroll-behavior-y: contain;
      scrollbar-width: thin;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .jd-email-inbox__item {
      width: 100%;
      padding: var(--jd-space-2-5) var(--jd-space-3);
      text-align: left;
      border: 0;
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border-light);
      background: var(--jd-color-card);
      cursor: pointer;
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
      display: flex;
      align-items: flex-start;
      gap: var(--jd-space-2);
    }
    .jd-email-inbox__item:not([data-active]):hover {
      background: var(--jd-color-card-hover);
    }
    .jd-email-inbox__item[data-active] {
      background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    }
    .jd-email-inbox__item[data-active]:hover {
      background: color-mix(in srgb, var(--jd-color-primary) 16%, transparent);
    }
    /* 목록 행은 scale로 눌리면 이웃 행과 어긋나 보인다 — 눌린 면은 빛만 잃는다(§1).
       [data-active] 뒤에 둬야 선택된 행에서도 눌림이 보인다. */
    .jd-email-inbox__item:active {
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-email-inbox__item:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
    }
    .jd-email-inbox__item-dot {
      width: 6px;
      height: 6px;
      border-radius: var(--jd-radius-full);
      margin-top: 6px;
      flex-shrink: 0;
      background: transparent;
    }
    .jd-email-inbox__item[data-unread] .jd-email-inbox__item-dot {
      background: var(--jd-color-primary);
    }
    .jd-email-inbox__item-main {
      min-width: 0;
      flex: 1;
    }
    .jd-email-inbox__item-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--jd-space-2);
    }
    .jd-email-inbox__item-from {
      font-size: var(--jd-text-sm);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-email-inbox__item[data-unread] .jd-email-inbox__item-from {
      font-weight: var(--jd-weight-semibold);
    }
    .jd-email-inbox__item-time {
      flex-shrink: 0;
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .jd-email-inbox__item-subject {
      margin: 0;
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-email-inbox__item[data-unread] .jd-email-inbox__item-subject {
      color: var(--jd-color-foreground);
      font-weight: var(--jd-weight-medium);
    }
    .jd-email-inbox__item-preview {
      margin: 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-email-inbox__star {
      flex-shrink: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
      padding: 0;
      font-size: var(--jd-text-sm);
      /* muted-light는 라이트에서 2.7:1 — 아이콘 어포던스로도 흐리다(§9) */
      color: var(--jd-color-muted);
      line-height: var(--jd-leading-none);
      border-radius: var(--jd-radius-sm);
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-email-inbox__star:hover {
      color: var(--jd-color-warning);
    }
    .jd-email-inbox__star:active {
      scale: 0.9;
    }
    .jd-email-inbox__star[data-on] {
      color: var(--jd-color-warning);
    }
    .jd-email-inbox__star:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    /* 본문 패널 */
    .jd-email-inbox__reader {
      display: none;
      flex-direction: column;
      min-height: 0;
    }
    @media (min-width: 1024px) {
      .jd-email-inbox__reader {
        display: flex;
      }
    }
    .jd-email-inbox__reader-header {
      padding: var(--jd-space-4);
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-email-inbox__reader-subject {
      margin: 0;
      font-size: var(--jd-text-lg);
      font-weight: var(--jd-weight-semibold);
    }
    .jd-email-inbox__reader-meta {
      margin-top: var(--jd-space-2);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    .jd-email-inbox__reader-avatar {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--jd-radius-full);
      object-fit: cover;
    }
    .jd-email-inbox__reader-avatar--ph {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
      color: var(--jd-color-primary-ink);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-semibold);
    }
    .jd-email-inbox__reader-from {
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
    }
    .jd-email-inbox__reader-labels {
      margin-top: var(--jd-space-2);
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-1);
    }
    .jd-email-inbox__reader-label {
      display: inline-flex;
      align-items: center;
      padding: var(--jd-space-0-5) var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-2xs);
      background: color-mix(in srgb, var(--jd-color-muted) 14%, var(--jd-color-card));
      color: var(--jd-color-foreground);
    }
    .jd-email-inbox__reader-body {
      flex: 1;
      overflow-y: auto;
      overscroll-behavior-y: contain;
      scrollbar-width: thin;
      padding: var(--jd-space-4);
      font-size: var(--jd-text-sm);
      line-height: var(--jd-leading-relaxed);
    }
    .jd-email-inbox__reader-body p {
      margin: 0 0 var(--jd-space-4);
      white-space: pre-wrap;
    }
    .jd-email-inbox__reader-fallback {
      color: var(--jd-color-muted);
    }

    /* 빈 상태 공용 */
    .jd-email-inbox__list-empty,
    .jd-email-inbox__reader-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: var(--jd-space-1);
      padding: var(--jd-space-8) var(--jd-space-4);
    }
    .jd-email-inbox__list-empty[hidden] {
      display: none;
    }
    .jd-email-inbox__empty-icon {
      font-size: var(--jd-text-3xl);
    }
    .jd-email-inbox__empty-title {
      margin: 0;
      font-weight: var(--jd-weight-semibold);
    }
    .jd-email-inbox__empty-desc {
      margin: 0;
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-email-inbox__item,
      .jd-email-inbox__folder,
      .jd-email-inbox__star,
      .jd-email-inbox__search-input {
        transition: none;
      }
    }
  }
`;
