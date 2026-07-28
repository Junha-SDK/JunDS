/**
 * jd-disclosures CSS — v2 finance/DisclosuresClient 토큰 번역.
 * v2 값: 요약 카드 좌측 accent 3px 보더, bm-card 검색 바, 스크롤 칩(active면 accent 배경+
 * 흰 글자), 빈 상태 중앙 정렬. accent는 노드별 --accent 커스텀 프로퍼티 경유.
 * 타임라인·태그 크롬은 각각 jd-timeline/jd-tag 시트가 담당한다(합성).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-disclosures {
      display: block;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    jd-disclosures:not(:defined) {
      display: block;
    }

    /* 요약 */
    .jd-disclosures__summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--jd-space-3);
      margin-block-start: var(--jd-space-1);
    }
    .jd-disclosures__card {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      padding: var(--jd-space-3) var(--jd-space-4);
      background: var(--jd-color-card);
      border-radius: var(--jd-radius-xl);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-inline-start: 3px solid var(--accent, var(--jd-color-accent));
    }
    .jd-disclosures__card-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      font-size: 18px;
      border-radius: var(--jd-radius-xl);
      background: color-mix(in srgb, var(--accent, var(--jd-color-accent)) 12%, transparent);
    }
    .jd-disclosures__card-text {
      min-width: 0;
    }
    /* 10.5px는 §9 하한(11px) 아래다 — 요약 카드 라벨은 본문 정보다 */
    .jd-disclosures__card-label {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-disclosures__card-value {
      font-size: var(--jd-text-xl);
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      /* 원색 그대로면 sky/warning/info가 흰 카드에서 대비 미달 → foreground 쪽으로 섞는다 */
      color: color-mix(
        in srgb,
        var(--accent, var(--jd-color-accent)) 65%,
        var(--jd-color-foreground)
      );
    }
    .jd-disclosures__card-hint {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
      white-space: nowrap;
    }

    /* 검색 */
    .jd-disclosures__search {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      margin-block-start: var(--jd-space-3);
      padding: var(--jd-space-2);
      background: var(--jd-color-card);
      border-radius: var(--jd-radius-xl);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      transition: border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    /* 입력이 outline: none 이라 포커스 표시는 감싼 바가 대신 진다 — 대체 없이 지우면
       키보드 사용자에게서 커서를 빼앗는 것이다(§1) */
    .jd-disclosures__search:focus-within {
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-disclosures__search-icon {
      flex-shrink: 0;
      font-size: var(--jd-text-md);
    }
    .jd-disclosures__search-input {
      flex: 1;
      min-width: 0;
      border: 0;
      background: transparent;
      outline: none;
      padding: var(--jd-space-1-5) 0;
      font: inherit;
      font-size: var(--jd-text-sm);
      color: var(--jd-color-foreground);
    }
    .jd-disclosures__search-input::placeholder {
      color: var(--jd-color-muted);
    }
    /* --jd-color-surface 는 라이트에서도 어두운 크롬용이다 — 흰 검색 바 안의 작은 지우기
       칩에 쓰면 검은 알약 위에 모드추종 잉크가 얹혀 라이트에서 글자가 사라진다(§4).
       카드 위 "한 톤 뜬 면"은 muted 혼합으로 만든다. */
    .jd-disclosures__search-clear {
      flex-shrink: 0;
      border: 0;
      cursor: pointer;
      padding: var(--jd-space-1) var(--jd-space-2-5);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      border-radius: var(--jd-radius-full);
      background: color-mix(in srgb, var(--jd-color-muted) 14%, var(--jd-color-card));
      color: var(--jd-color-muted);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-disclosures__search-clear[hidden] {
      display: none;
    }
    .jd-disclosures__search-clear:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 22%, var(--jd-color-card));
      color: var(--jd-color-foreground);
    }
    .jd-disclosures__search-clear:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-disclosures__search-clear:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    /* 분류 칩 — overflow-x:auto 는 세로축도 함께 스크롤 컨테이너로 만든다. 여백이 없으면
       칩 자신과 포커스 링이 위아래로 잘려 나가고(실측), 블록 시작 방향 오버플로는
       스크롤로도 되돌릴 수 없다. 안쪽 여백으로 링이 살 자리를 준다. */
    .jd-disclosures__chips {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      margin-block-start: var(--jd-space-2);
      padding-block: var(--jd-space-1-5);
      overflow-x: auto;
      /* 행 끝에서 멈춘 스크롤이 페이지를 이어서 밀지 않게 한다(§6) */
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
      /* 오른쪽 끝을 흐려 "더 있다"를 알린다 — 잘린 채 끝나는 것과 굴릴 수 있는 것은 다르다 */
      -webkit-mask-image: linear-gradient(90deg, #000 0 calc(100% - 24px), transparent);
      mask-image: linear-gradient(90deg, #000 0 calc(100% - 24px), transparent);
    }
    .jd-disclosures__chip {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      padding: var(--jd-space-1-5) var(--jd-space-3);
      font: inherit;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-bold);
      white-space: nowrap;
      cursor: pointer;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-card);
      color: color-mix(
        in srgb,
        var(--accent, var(--jd-color-foreground)) 65%,
        var(--jd-color-foreground)
      );
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--accent, var(--jd-color-border)) 33%, transparent);
      box-shadow: var(--jd-shadow-xs);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-disclosures__chip:not([data-active]):hover {
      background: var(--jd-color-card-hover);
      border-color: color-mix(in srgb, var(--accent, var(--jd-color-border)) 55%, transparent);
    }
    .jd-disclosures__chip[data-active] {
      /* 원색 배경 + 흰 글자 → 배경을 foreground 쪽 80% 혼합으로 어둡혀 대비 확보 */
      background: color-mix(
        in srgb,
        var(--accent, var(--jd-color-foreground)) 80%,
        var(--jd-color-foreground)
      );
      color: #fff;
      border-color: transparent;
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-disclosures__chip[data-active]:hover {
      background: color-mix(
        in srgb,
        var(--accent, var(--jd-color-foreground)) 60%,
        var(--jd-color-foreground)
      );
    }
    /* 선택 여부와 무관하게 눌린 면은 빛을 잃는다 — [data-active] 뒤에 둬야 덮이지 않는다(§1) */
    .jd-disclosures__chip:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    /* 행이 스크롤 컨테이너라 바깥 아웃라인은 잘린다 — 링을 그림자로 준다(§1) */
    .jd-disclosures__chip:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-disclosures__chip-count {
      font-variant-numeric: tabular-nums;
      /* 10.5px는 §9 하한(11px) 아래다 */
      font-size: var(--jd-text-2xs);
      opacity: var(--jd-opacity-80);
    }

    /* 목록 */
    .jd-disclosures__list {
      display: block;
      margin-block-start: var(--jd-space-3);
      padding: var(--jd-space-4);
      background: var(--jd-color-card);
      border-radius: var(--jd-radius-xl);
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-disclosures__desc {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
      margin-block-start: var(--jd-space-1);
    }
    .jd-disclosures__desc-meta {
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
    }

    .jd-disclosures__empty {
      padding: var(--jd-space-10) 0;
      text-align: center;
    }
    .jd-disclosures__empty[hidden] {
      display: none;
    }
    .jd-disclosures__empty-icon {
      font-size: var(--jd-text-4xl);
    }
    .jd-disclosures__empty-title {
      margin: var(--jd-space-1-5) 0 0;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-foreground);
    }
    .jd-disclosures__empty-sub {
      margin: var(--jd-space-0-5) 0 0;
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
    }

    .jd-disclosures__note {
      margin: var(--jd-space-3) 0 0;
      padding-inline: var(--jd-space-1);
      font-size: var(--jd-text-2xs);
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted);
    }

    .jd-disclosures__sr {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    @media (min-width: 48rem) {
      .jd-disclosures__summary {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-disclosures__chip,
      .jd-disclosures__search,
      .jd-disclosures__search-clear {
        transition: none;
      }
    }
  }
`;
