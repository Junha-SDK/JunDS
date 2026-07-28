import { css } from "../../core/styles.js";

/**
 * v2 매핑: max-w-2xl 중앙, 스토리 바 = overflow-x-auto + border-b, 스토리 링 그라디언트,
 * 게시물 divide-y(리스트 항목 사이 구분선), sentinel 중앙 정렬 spinner/끝 문구.
 */
export default css`
  @layer junds.components {
    jd-social-feed {
      display: block;
      max-width: 42rem;
      margin-inline: auto;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    /* 스토리 줄은 부모 폭을 넘는 게 정상이다 — 잘린 채 끝나는 것과 굴릴 수 있는 것은
     다르다. 가장자리 마스크가 '오른쪽에 더 있다'를 말하고, overscroll 가둠이
     페이지 뒤로가기 제스처를 막는다. */
    .jd-social-feed__stories {
      padding: var(--jd-space-3) var(--jd-space-2);
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      -webkit-mask-image: linear-gradient(90deg, #000 0 calc(100% - 24px), transparent);
      mask-image: linear-gradient(90deg, #000 0 calc(100% - 24px), transparent);
    }
    .jd-social-feed__stories-list {
      display: flex;
      align-items: flex-start;
      gap: var(--jd-space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .jd-social-feed__story {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: var(--jd-space-1);
      width: 4rem;
      flex-shrink: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    /* 링만 있고 반응이 없으면 누를 수 있는 것으로 읽히지 않는다 */
    .jd-social-feed__story:hover .jd-social-feed__story-name {
      color: var(--jd-color-foreground);
    }
    .jd-social-feed__story:active {
      scale: 0.96;
    }
    .jd-social-feed__story:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
      border-radius: var(--jd-radius-md);
    }
    .jd-social-feed__story-ring {
      display: inline-flex;
      padding: 2px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-gradient-sunset);
      transition: box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-social-feed__story:hover .jd-social-feed__story-ring {
      box-shadow: var(--jd-shadow-sm);
    }
    .jd-social-feed__story[data-state="seen"] .jd-social-feed__story-ring {
      background: var(--jd-color-border);
    }
    .jd-social-feed__story[data-state="live"] .jd-social-feed__story-ring {
      background: var(--jd-color-danger);
    }
    /* 아바타 테두리는 링과 사진 사이를 벌리는 '바탕 틈'이라 피드 배경색이어야 한다 —
     surface(라이트에서도 어두운 크롬)를 쓰면 밝은 피드에서 검은 테가 둘러진다. */
    .jd-social-feed__story-avatar {
      width: 3.25rem;
      height: 3.25rem;
      border-radius: var(--jd-radius-full);
      object-fit: cover;
      display: block;
      border: 2px solid var(--jd-color-card);
      background: var(--jd-color-neutral-100);
    }
    .jd-social-feed__story-avatar--ph {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--jd-color-primary-ink);
      font-weight: var(--jd-weight-semibold);
      font-size: var(--jd-text-lg);
    }
    .jd-social-feed__story-name {
      max-width: 100%;
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }

    .jd-social-feed__list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .jd-social-feed__item {
      padding: var(--jd-space-3) 0;
    }
    .jd-social-feed__item + .jd-social-feed__item {
      border-top: var(--jd-border-thin) solid var(--jd-color-border);
    }

    .jd-social-feed__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-16) var(--jd-space-4);
    }
    .jd-social-feed__empty-icon {
      font-size: var(--jd-text-4xl);
    }
    .jd-social-feed__empty-title {
      margin: 0;
      font-weight: var(--jd-weight-semibold);
    }
    .jd-social-feed__empty-desc {
      margin: 0;
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
    }

    .jd-social-feed__sentinel {
      padding: var(--jd-space-6) 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--jd-color-muted);
    }
    .jd-social-feed__end {
      margin: 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    .jd-social-feed__spinner {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--jd-color-primary-ink);
      animation: jd-social-feed-spin 0.7s linear infinite;
    }
    @keyframes jd-social-feed-spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .jd-social-feed__spinner {
        animation-duration: 1.6s;
      }
      .jd-social-feed__story,
      .jd-social-feed__story-ring,
      .jd-social-feed__story-name {
        transition: none;
      }
      .jd-social-feed__story:active {
        scale: none;
      }
    }
  }
`;
