/**
 * jd-component-showcase 컴포넌트 CSS.
 * v2 ds/composites/ComponentShowcase 시각을 --jd-* 토큰으로 의미 번역:
 *   조작줄 = mb-8 · 세로 gap-4 → sm:가로 between /
 *   검색 = h-11 rounded-2xl pl-11 pr-4 shadow-sm sm:w-72, 아이콘 left-3.5 16px /
 *   칩 = rounded-full px-4 py-1.5 10~12px semibold, 활성=분류색 채움+흰 글자
 *        ("전체"만 bg-foreground/text-background), 카운트 ml-1 opacity-60 /
 *   격자 = gap-6 · 1 → sm:2 → lg:3 → xl:4 (columns 상한) /
 *   카드 = rounded-2xl border shadow-sm, 호버 시 -translate-y-1 + shadow-2xl + 분류 글로우 /
 *   미리보기 = h-[200px] 분류 그라데이션 + 도트 패턴 opacity-.03 + 하단 스크림 h-16 /
 *   정보 = px-4 py-3.5, 제목 text-sm bold tracking-tight, 배지 10px 테두리 pill,
 *          설명 text-xs muted line-clamp-2 / 하단 2px 프라이머리 악센트 라인.
 *
 * 색 재구성 2건:
 *  1. v2는 분류마다 Tailwind 클래스 4벌(badge/gradient/glow/chip)을 따로 적었다.
 *     v3는 카드·칩이 `--jd-component-showcase-accent(-2)` 두 변수만 분류별로 잡고
 *     배지·그라데이션·글로우·칩 채움이 전부 거기서 파생된다 — 분류를 추가하는 소비자는
 *     레이어 밖에서 변수 2개만 덮으면 된다(§4.4).
 *  2. v2의 `from-violet-50`·`from-white/80` 리터럴은 다크 모드에서 흰 판으로 깨졌다.
 *     틴트는 card 토큰과의 color-mix로, 배지 글자는 foreground를 섞어 양쪽 테마에서
 *     대비를 유지한다(jd-emoji-picker 선례).
 *  3. 분류 6종의 accent 3벌(18개)은 v2 Tailwind 500/600/700 리터럴이었다. 분류색은
 *     의미(success/danger)가 아니라 **계열색**이므로 `--jd-color-hue-*`에서 고른다(§8).
 *     accent-strong만 흰 글자가 얹히는 자리(칩 채움)라 4.5:1을 넘는 짙은 단을 고른다 —
 *     amber는 hue-amber(4.1:1)로 모자라 같은 색상축의 hue-orange를 쓴다.
 *     분류 없는 카드의 기본 accent도 muted(회색)라 미리보기가 "빈 회색 판"으로 읽혔다.
 *     기본은 강조색(primary→accent)이고, 칩 채움 폴백만 v2대로 foreground로 남긴다.
 *
 * 실브라우저에서 잡은 함정 2건 (시트에는 한 줄 표식만 남기고 근거는 여기에 — 템플릿
 * 안의 주석은 런타임 시트로 그대로 실려 나가지만 이 헤더는 minify가 걷어간다):
 *  - **열 사다리 특이도**: `:not()`을 둘 단 1024px 규칙(0-3-1)이 1280px 규칙(0-2-1)을
 *    특이도로 이겨 `columns=4`가 3열에서 멎었다. 세 규칙의 조건을 `:where()`로 감싸
 *    (0-1-1)로 맞추면 소스 순서가 사다리를 결정한다. 기반 규칙(0-1-0)보다는 여전히
 *    높으므로 ":where()는 특이도 0이라 진다"는 함정과는 무관하다.
 *  - **등장 애니메이션 축**: 등장(keyframes)과 호버 부상을 둘 다 `translate`로 쓰면
 *    `animation-fill-mode: both`가 채운 값이 일반 선언을 이겨 **호버 부상이 영영
 *    죽는다**. 등장은 `transform`, 호버는 `translate`로 축을 갈라 둔다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-component-showcase {
      /* 분류색 4변수 — 카드·칩이 같은 값을 쓰고, 분류를 추가하는 소비자는
       레이어 밖에서 이 넷만 덮으면 된다(§4.4). 칩 채움(strong/on-accent)은 v2의
       무분류 폴백(bg-foreground/text-background) 그대로 두고, 미리보기 틴트를 만드는
       accent 둘만 강조색으로 올린다 — muted 회색이던 시절 미리보기가 카드 안의
       "빈 자리"로 읽혔다. */
      --jd-component-showcase-accent: var(--jd-color-primary);
      --jd-component-showcase-accent-2: var(--jd-color-accent);
      --jd-component-showcase-accent-strong: var(--jd-color-foreground);
      --jd-component-showcase-on-accent: var(--jd-color-background);
      position: relative;
      display: block;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    /* ── 조작줄 ─────────────────────────────────────────────────────── */
    .jd-component-showcase__controls {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-4);
      margin-block-end: var(--jd-space-8);
    }
    .jd-component-showcase__controls[hidden] {
      display: none;
    }
    @media (min-width: 640px) {
      .jd-component-showcase__controls {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .jd-component-showcase__search {
      position: relative;
      display: block;
    }
    .jd-component-showcase__search[hidden] {
      display: none;
    }

    .jd-component-showcase__search-icon {
      position: absolute;
      inset-inline-start: var(--jd-space-3-5);
      inset-block-start: 50%;
      display: inline-flex;
      translate: 0 -50%;
      color: var(--jd-color-muted);
      pointer-events: none;
    }

    .jd-component-showcase__search-input {
      box-sizing: border-box;
      width: 100%;
      height: 2.75rem; /* v2 h-11 */
      margin: 0;
      padding-inline: 2.75rem var(--jd-space-4); /* v2 pl-11 pr-4 */
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-2xl);
      box-shadow: var(--jd-shadow-sm);
      font-family: inherit;
      font-size: var(--jd-text-md);
      transition: border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    @media (min-width: 640px) {
      .jd-component-showcase__search-input {
        width: 18rem;
      } /* v2 sm:w-72 */
    }
    .jd-component-showcase__search-input::placeholder {
      color: var(--jd-color-muted-light);
    }
    .jd-component-showcase__search-input:focus-visible {
      outline: none;
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
    }

    /* ── 분류 칩 ───────────────────────────────────────────────────── */
    .jd-component-showcase__chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
    }
    .jd-component-showcase__chips[hidden] {
      display: none;
    }

    .jd-component-showcase__chip {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      box-sizing: border-box;
      padding: var(--jd-space-1-5) var(--jd-space-4);
      background: var(--jd-color-card);
      color: var(--jd-color-muted);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-none);
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        color var(--jd-duration-normal) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-component-showcase__chip:hover {
      background: var(--jd-color-card-hover);
      color: var(--jd-color-foreground);
      border-color: color-mix(in srgb, var(--jd-color-foreground) 20%, transparent);
    }
    /* 눌린 면은 빛을 잃는다 — v2에는 :active가 아예 없었다 */
    .jd-component-showcase__chip:active {
      scale: 0.97;
      background: var(--jd-color-border-light);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }

    /* 라디오는 시각적으로만 감춘다 (jd-filter-button-group 관용구) */
    .jd-component-showcase__chip-input {
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
    .jd-component-showcase__chip:has(.jd-component-showcase__chip-input:focus-visible) {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-component-showcase__chip-count {
      opacity: var(--jd-opacity-60);
      font-variant-numeric: tabular-nums;
    }
    .jd-component-showcase__chip-count[hidden] {
      display: none;
    }

    /* 활성 칩: 분류색 채움. "전체"·미지 분류는 변수 기본값이 foreground/background라
     v2의 catChipActive[cat] || "bg-foreground text-background" 폴백과 같아진다.
     (주의: 이 템플릿 안에서는 CSS 주석에도 백틱을 쓸 수 없다 — 리터럴이 끊긴다) */
    .jd-component-showcase__chip[data-active] {
      background: var(--jd-component-showcase-accent-strong);
      border-color: var(--jd-component-showcase-accent-strong);
      color: var(--jd-component-showcase-on-accent);
    }

    /* ── 격자 ───────────────────────────────────────────────────────── */
    .jd-component-showcase__grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--jd-space-6);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .jd-component-showcase__grid[hidden] {
      display: none;
    }

    /* columns는 "상한" — 좁은 화면부터 1 → 2 → 3 → 4로 열린다(v2 gridCls 동형).
     repeat() 반복 수에 calc/min을 못 써 호스트 속성 셀렉터로 분기한다.
     :where()는 세 규칙의 특이도를 맞춰 순서가 사다리를 결정하게 한다(파일 헤더 참조). */
    @media (min-width: 640px) {
      jd-component-showcase:where(:not([columns="1"])) > .jd-component-showcase__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (min-width: 1024px) {
      jd-component-showcase:where(:not([columns="1"], [columns="2"]))
        > .jd-component-showcase__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    @media (min-width: 1280px) {
      jd-component-showcase:where([columns="4"]) > .jd-component-showcase__grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    /* ── 카드 ───────────────────────────────────────────────────────── */
    .jd-component-showcase__card {
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-2xl);
      box-shadow: var(--jd-shadow-sm);
      transition: translate var(--jd-duration-slow) var(--jd-easing-default),
        box-shadow var(--jd-duration-slow) var(--jd-easing-default),
        border-color var(--jd-duration-slow) var(--jd-easing-default);
    }
    .jd-component-showcase__card:is(:hover, :focus-within) {
      z-index: 1;
      translate: 0 -0.25rem; /* v2 -translate-y-1 */
      /* 테두리도 분류색을 따른다 — primary 고정이면 글로우(분류색)와 색이 갈려
       카드 하나가 두 색으로 빛난다 */
      border-color: color-mix(in srgb, var(--jd-component-showcase-accent) 40%, transparent);
      box-shadow: var(--jd-shadow-2xl),
        0 25px 50px -12px color-mix(in srgb, var(--jd-component-showcase-accent) 20%, transparent);
    }
    .jd-component-showcase__card:has(.jd-component-showcase__link:focus-visible) {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    /* 하단 악센트 라인 — v2는 --primary 고정이라 6분류가 전부 같은 보라 선으로 끝났다 */
    .jd-component-showcase__card::after {
      content: "";
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      z-index: 2;
      height: var(--jd-border-medium);
      background: linear-gradient(
        90deg,
        transparent,
        var(--jd-component-showcase-accent),
        transparent
      );
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--jd-duration-slow) var(--jd-easing-ease-out);
    }
    .jd-component-showcase__card:is(:hover, :focus-within)::after {
      opacity: 1;
    }

    /* 분류색(v2 catBadge/catPreviewBg/catGlow/catChipActive 네 맵의 통합).
     accent/accent-2 = 두 색상축의 이웃 — 그라데이션·글로우는 장식이라 3:1이면 된다.
     accent-strong = 흰 글자가 얹히는 유일한 자리(칩 채움·배지 글자 앵커)라 4.5:1을
     넘는 단만 고른다. hue 토큰은 이미 600~700단이라 대개 자기 자신이 strong이고,
     amber만 흰 글자 4.1:1로 모자라 같은 색상축의 hue-orange(5.1:1)를 쓴다(§4 색 대비). */
    jd-component-showcase [data-category="Foundation"] {
      --jd-component-showcase-accent: var(--jd-color-hue-violet);
      --jd-component-showcase-accent-2: var(--jd-color-hue-purple);
      --jd-component-showcase-accent-strong: var(--jd-color-hue-violet);
      --jd-component-showcase-on-accent: #fff;
    }
    jd-component-showcase [data-category="Primitives"] {
      --jd-component-showcase-accent: var(--jd-color-hue-blue);
      --jd-component-showcase-accent-2: var(--jd-color-hue-violet);
      --jd-component-showcase-accent-strong: var(--jd-color-hue-blue);
      --jd-component-showcase-on-accent: #fff;
    }
    jd-component-showcase [data-category="Composites"] {
      --jd-component-showcase-accent: var(--jd-color-hue-green);
      --jd-component-showcase-accent-2: var(--jd-color-hue-teal);
      --jd-component-showcase-accent-strong: var(--jd-color-hue-green);
      --jd-component-showcase-on-accent: #fff;
    }
    jd-component-showcase [data-category="Patterns"] {
      --jd-component-showcase-accent: var(--jd-color-hue-amber);
      --jd-component-showcase-accent-2: var(--jd-color-hue-orange);
      --jd-component-showcase-accent-strong: var(--jd-color-hue-orange);
      --jd-component-showcase-on-accent: #fff;
    }
    jd-component-showcase [data-category="Security"] {
      --jd-component-showcase-accent: var(--jd-color-hue-red);
      --jd-component-showcase-accent-2: var(--jd-color-hue-pink);
      --jd-component-showcase-accent-strong: var(--jd-color-hue-red);
      --jd-component-showcase-on-accent: #fff;
    }
    jd-component-showcase [data-category="Advanced"] {
      --jd-component-showcase-accent: var(--jd-color-hue-rose);
      --jd-component-showcase-accent-2: var(--jd-color-hue-purple);
      --jd-component-showcase-accent-strong: var(--jd-color-hue-rose);
      --jd-component-showcase-on-accent: #fff;
    }

    /* ── 미리보기 영역 ───────────────────────────────────────────────── */
    /* 미리보기는 카드 안에서 가장 넓은 면인데 10% 틴트 한 겹만으로는 "아직 안 채운 자리"로
     읽혔다. 위에서 받는 빛(상단 돔) + 한 단 짙은 대각 틴트 + 정보 영역과의 실낱 경계 —
     세 겹이 있어야 판이 아니라 무대가 된다(§2 채움만 있는 면은 색종이로 읽힌다). */
    .jd-component-showcase__preview {
      position: relative;
      height: 200px; /* v2 h-[200px] */
      overflow: hidden;
      background: radial-gradient(120% 80% at 50% 0%, var(--jd-color-highlight), transparent 62%),
        linear-gradient(
          135deg,
          color-mix(in srgb, var(--jd-component-showcase-accent) 16%, var(--jd-color-card)),
          color-mix(in srgb, var(--jd-component-showcase-accent-2) 16%, var(--jd-color-card))
        );
      box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--jd-color-border) 76%, transparent);
    }

    .jd-component-showcase__pattern {
      position: absolute;
      inset: 0;
      opacity: 0.03;
      background-image: radial-gradient(circle, currentColor 0.5px, transparent 0.5px);
      background-size: 12px 12px;
    }

    .jd-component-showcase__still,
    .jd-component-showcase__demo {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--jd-space-5);
      overflow: hidden;
      pointer-events: none;
      transition: opacity var(--jd-duration-slower) var(--jd-easing-ease-out),
        scale var(--jd-duration-slower) var(--jd-easing-ease-out),
        filter var(--jd-duration-slower) var(--jd-easing-ease-out);
    }
    .jd-component-showcase__still {
      scale: 0.8;
    } /* v2 scale-[0.8] */
    .jd-component-showcase__demo {
      opacity: 0;
      scale: 0.99;
      filter: blur(4px);
    }

    .jd-component-showcase__card[data-has-demo]:is(:hover, :focus-within)
      .jd-component-showcase__still {
      opacity: 0;
      scale: 0.72;
      filter: blur(4px);
    }
    .jd-component-showcase__card[data-has-demo]:is(:hover, :focus-within)
      .jd-component-showcase__demo {
      opacity: 1;
      scale: 0.9;
      filter: blur(0);
    }

    /* 하단 스크림 — v2 from-white/80은 다크에서 흰 띠였다 */
    .jd-component-showcase__scrim {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      height: 4rem;
      background: linear-gradient(
        to top,
        color-mix(in srgb, var(--jd-color-card) 80%, transparent),
        transparent
      );
      pointer-events: none;
      transition: opacity var(--jd-duration-slow) var(--jd-easing-ease-out);
    }
    .jd-component-showcase__card:is(:hover, :focus-within) .jd-component-showcase__scrim {
      opacity: 0;
    }

    .jd-component-showcase__hint {
      position: absolute;
      inset-block-start: var(--jd-space-3);
      inset-inline-end: var(--jd-space-3);
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      padding: var(--jd-space-1) var(--jd-space-2-5);
      background: color-mix(in srgb, var(--jd-color-foreground) 80%, transparent);
      color: var(--jd-color-background);
      border-radius: var(--jd-radius-full);
      backdrop-filter: blur(4px);
      font-size: var(--jd-text-2xs); /* 11px가 하한 — v2 text-[10px]는 읽히지 않는다 */
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-none);
      white-space: nowrap;
      opacity: 0;
      translate: 0 -0.5rem;
      pointer-events: none;
      transition: opacity var(--jd-duration-slow) var(--jd-easing-ease-out),
        translate var(--jd-duration-slow) var(--jd-easing-ease-out);
    }
    .jd-component-showcase__card:is(:hover, :focus-within) .jd-component-showcase__hint {
      opacity: 1;
      translate: 0 0;
    }

    /* ── 정보 영역 ───────────────────────────────────────────────────── */
    .jd-component-showcase__info {
      padding: var(--jd-space-3-5) var(--jd-space-4);
    }
    .jd-component-showcase__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      margin-block-end: var(--jd-space-1);
    }
    .jd-component-showcase__title {
      margin: 0;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-bold);
      letter-spacing: var(--jd-tracking-tight);
      line-height: var(--jd-leading-snug);
    }

    /* 카드 전면을 덮는 링크(stretched link) — 히트 영역은 카드 전체, 접근 이름은 제목 */
    .jd-component-showcase__link {
      display: inline;
      margin: 0;
      padding: 0;
      background: none;
      border: 0;
      color: inherit;
      font: inherit;
      letter-spacing: inherit;
      text-align: start;
      text-decoration: none;
      cursor: pointer;
    }
    .jd-component-showcase__link::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
    }
    .jd-component-showcase__link:focus-visible {
      outline: none;
    }

    .jd-component-showcase__badge {
      flex-shrink: 0;
      padding: var(--jd-space-0-5) var(--jd-space-2);
      background: color-mix(in srgb, var(--jd-component-showcase-accent) 12%, transparent);
      /* v2는 -600 글자색이었다. 짙은 쪽(strong)에 foreground를 섞어 라이트에서는 더 짙게,
       다크에서는 밝게 — 양쪽 테마에서 틴트 배경 대비 4.5:1 유지(§4 색 대비 공식) */
      color: color-mix(
        in srgb,
        var(--jd-component-showcase-accent-strong) 65%,
        var(--jd-color-foreground)
      );
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-component-showcase-accent) 30%, transparent);
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-normal);
      white-space: nowrap;
    }
    .jd-component-showcase__badge[hidden] {
      display: none;
    }

    .jd-component-showcase__desc {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2; /* v2 line-clamp-2 */
      margin: 0;
      overflow: hidden;
      color: var(--jd-color-muted);
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-relaxed);
    }
    .jd-component-showcase__desc[hidden] {
      display: none;
    }

    /* ── 빈 상태 ─────────────────────────────────────────────────────── */
    .jd-component-showcase__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-block: var(--jd-space-24); /* v2 py-24 */
      color: var(--jd-color-muted);
      text-align: center;
    }
    .jd-component-showcase__empty[hidden] {
      display: none;
    }
    .jd-component-showcase__empty-icon {
      display: inline-flex;
      margin-block-end: var(--jd-space-3);
      opacity: var(--jd-opacity-20);
    }
    .jd-component-showcase__empty-title {
      margin: 0;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
    }
    .jd-component-showcase__empty-hint {
      margin-block: var(--jd-space-1) 0;
      margin-inline: 0;
      font-size: var(--jd-text-xs);
    }

    /* 결과 수 통지 — 시각적으로만 숨긴다(jd-visually-hidden 관용구) */
    .jd-component-showcase__status {
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

    /* ── 등장 스태거 ─────────────────────────────────────────────────── */
    @media (prefers-reduced-motion: no-preference) {
      .jd-component-showcase__card {
        animation: jd-component-showcase-in var(--jd-duration-slow) var(--jd-easing-default) both;
        animation-delay: calc(var(--jd-component-showcase-i, 0) * 30ms); /* v2 index*30ms */
      }
    }
    /* 등장은 transform, 호버 부상은 translate — 축을 가른다(파일 헤더 참조) */
    @keyframes jd-component-showcase-in {
      from {
        opacity: 0;
        transform: translateY(0.5rem);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-component-showcase__search-input,
      .jd-component-showcase__chip,
      .jd-component-showcase__card,
      .jd-component-showcase__card::after,
      .jd-component-showcase__still,
      .jd-component-showcase__demo,
      .jd-component-showcase__scrim,
      .jd-component-showcase__hint {
        transition: none;
      }
    }
  }
`;
