# Changelog

> 모든 변경 사항은 [Keep a Changelog](https://keepachangelog.com/) 형식을 따른다.
> 버전 번호는 [SemVer](https://semver.org/)를 따른다.

## [Unreleased]

### Added — 레이아웃 자유도 · compound 규약 · 노코드 런타임 (2026-08-03)

- **`Switcher` 레이아웃 프리미티브** — 미디어쿼리 없이 자기 컨테이너 폭 기준으로
  가로↔세로 접힘 (`threshold` 토큰/px, `limit`). 웹 CE `jd-switcher` / iOS
  `JdSwitcher` 의 React 대응물. 쇼케이스 Layout Lab(`framework/layout-lab`)과
  `ResizableFrame` 으로 폭을 바꿔가며 관찰 가능.
- **`asChild` 위임 37종 확대** — children 직속 root 는 Slot 치환, 내부 구조
  root 는 `Slottable` 패턴. `DsSidebar` 는 `Provider`/`Link`/`Section` compound
  멤버 표면 추가. `createCompound` 는 dev 에서 중복 멤버 키 warn + sub-member
  `asChild` 사용 시 에러를 낸다.
- **노코드 런타임 마감** — `parseNodePatch`(부분 patch 검증), MCP
  `validate_page_doc`/`apply_page_patch`, 루트 barrel 네임스페이스
  `export * as runtime`.
- **`useForm.setError`** — 외부(서버) 검증 실패를 필드 에러로 통보.

### Fixed (2026-08-03)

- `ProgressRing` 에 접근 가능한 이름 추가 (`aria-label`, 기본 "진행률") —
  axe `aria-progressbar-name` serious 위반 해소.
- `BookReader` 빈 `chapters` 가드 — null 렌더 + dev 경고.
- 리포 typecheck 403건 → 0 — `packages/web/dist` 타입 이중 포함 제거.

### Changed — BREAKING (v3 웹 스타일 프롭 어휘, DEC-045)

스타일 프롭의 `radius` / `fontSize` / `shadow` / `zIndex`가 v2 리터럴 척도를 버리고
`tokens/*.json` 정본을 가리킨다. **이름은 같지만 값이 한 칸씩 달라진다.**

v2는 `ds/tokens/*`(정본)와 `ds/core/styleProps.ts`(별개 리터럴) 두 벌의 어휘를 들고
있었고 v3 초기 이식이 그 분열까지 옮겼다. 그래서 `<jd-image radius="md">`(6px)와
`<jd-box radius="md">`(8px)가 한 화면에서 다른 곡률로 그려졌고, iOS는 생성기를 통해
`tokens/*.json`만 읽으므로 웹 스타일 프롭만 홀로 어긋나 있었다.

| 축       | v2 스타일 프롭                                  | v3 (= 토큰 = iOS)                     |
| -------- | ----------------------------------------------- | ------------------------------------- |
| radius   | `xs`4 `sm`6 `md`8 `lg`12 `xl`16 `2xl`20 `3xl`24 | `sm`4 `md`6 `lg`8 `xl`12 `2xl`16      |
| fontSize | `sm`0.875 `md`1 `lg`1.125 …                     | `sm`0.8125 `md`0.875 `lg`1 …          |
| zIndex   | `dropdown`1000 … `tooltip`1700                  | `dropdown`10 … `tooltip`80            |
| shadow   | 1겹 rgba 리터럴                                 | `var(--jd-shadow-*)` (2겹, 다크 대응) |

- 마이그레이션: `radius`는 이름을 한 칸 내리고(`md`→`lg`), `fontSize`는 `sm` 이상을
  한 칸 올린다(`md`→`lg`). `shadow`/`zIndex`는 이름 그대로 값만 바뀐다.
- 제거된 이름(`radius="xs"|"3xl"`, `fontSize="6xl"`, `zIndex="docked"|"banner"`,
  `shadow="inner"`)은 조용히 대체되지 않고 콘솔 경고 후 무시된다.
- 회귀 방지: `packages/web/__tests__/token-vocabulary.test.ts`가 "토큰 이름 전량이
  같은 이름의 변수를 가리킨다"를 예외 없이 검증한다.

### Added

- **의도 기반 레이아웃 프리미티브** (DEC-052) — 웹 `<jd-split>` · `<jd-switcher>` ·
  `<jd-sidebar-layout>`, UIKit `JdSplitView` · `JdSwitcherView` ·
  `JdSidebarLayoutView`, SwiftUI `JdSplit` · `JdSwitcher` · `JdSidebarLayout`.
  셋 다 미디어 쿼리 없이 **자기가 놓인 자리의 폭**을 보고 꺾이므로, 브레이크포인트를
  고르지 않아도 되고 사이드바 안에 중첩해도 맞게 동작한다.
- **한 줄 배치 헬퍼** (DEC-053) — `jdCenter(in:)` · `jdPin(to:edges:padding:)` ·
  `jdBelow(_:gap:)` · `jdAfter(_:gap:)` · `jdAspect(_:)` + `jdFill`의 `JdGap` 오버로드.
  부모를 인자로 받아 `addSubview`를 스스로 하므로 순서를 틀려 크래시할 여지가 없다.
- **`tokens/container.json`** — 본문 폭 상한이 CSS·Swift·v2에 각각 손으로 적혀 있던
  것을 생성기로 흡수. `--jd-container-*` / `JdToken.Container` / `CONTAINER_SIZES`.
- **`packages/web/src/core/tokens.generated.ts`** — `@media` 조건과 JS 폭 비교처럼
  `var()`를 못 쓰는 자리를 위한 수치. `style-props.ts`의 손복사 브레이크포인트 표 제거.
- **`.ai/layout-map.json`** (DEC-054) — 레이아웃 의도 → 3플랫폼 API 대응표.
  적힌 심볼이 실제로 존재하는지 `npm run layout-map:check`가 검증한다.

### Added — 레이아웃 DSL 표현력·근거 (DEC-055 · 056 · 057)

- **다축을 상대 뷰의 같은 축에 붙인다** — `$0.leading.trailing.equal(to: other)`.
  이전에는 `equal(to: other.jd.leading)`뿐이라 여러 축을 체이닝하면 전부 상대의 leading
  으로 가 폭이 0이 됐다. 앵커를 여럿 체이닝한 채 단일 앵커를 주면 DEBUG에서 잡는다.
- **베이스라인 앵커** `firstBaseline` / `lastBaseline` — 크기가 다른 글자를 나란히 놓을 때
  centerY로 맞추면 글자가 떠 보인다. 진단 identifier에도 이름이 찍힌다.
- **커스텀 `UILayoutGuide` 참조** — `guide.jd`. 여백 규칙을 한 번 정의해 여러 뷰가
  공유할 때 더미 뷰보다 싸다(그리기·접근성 트리에 안 올라간다).
- **비교 벤치마크** — 같은 100행 화면을 JunDS DSL / 원시 `NSLayoutAnchor` / 프레임 직접
  배치 셋으로 짜고 나란히 잰다. 세 방식이 **같은 프레임을 만드는지** 먼저 확인한 뒤 잰다.
  실측(iPhone 17 시뮬레이터·디버그, 중앙값): DSL 3.57ms · 앵커 2.91ms · 프레임 0.24ms.
  → DSL 오버헤드 약 **1.23배**(뷰당 ~6.6µs), Auto Layout vs 프레임 약 **12배**.
- **오버헤드 상한을 CI가 지킨다** — 절대 초는 기기마다 흔들리므로 같은 프로세스에서 잰
  **비율**을 고정한다(원시 앵커 대비 2.0배 미만). 이 선이 깨지면 소비자가 성능을 이유로
  DSL을 버릴 명분이 생기므로, 그 전에 잡는다.
- **RTL·동적 타입 회귀 테스트** — `inset` 부호 반전이 RTL에서도 안쪽을 좁히는지,
  `jdAfter`가 읽기 방향을 따르는지, 프레임 배치 뷰(`JdWrapView`)가 뒤집히는지,
  글자를 키웠을 때 의도 프리미티브가 잘리지 않고 높이로 늘어나는지.

### Added — 컬렉션·검증 (DEC-058 · 059)

- **`JdCollectionLayout`** — `UICollectionViewCompositionalLayout`과 **경쟁하지 않고 얹는**
  어댑터. `JdGap`·`JdBreakpoint`로 `NSCollectionLayoutSection`을 만든다.
  `.list` · `.grid(columns:)` · `.adaptiveGrid(minItemWidth:)` 셋, 그리고
  `NSCollectionLayoutEnvironment.jdIsAtLeast(_:)`.
  `adaptiveGrid`는 최소 셀 폭만 주면 열 수가 **컨테이너 폭**에서 따라 나온다
  (웹 `repeat(auto-fill, minmax(…))` 동형). 이게 없으면 화면의 절반은 `JdGap.md`로,
  컬렉션은 `NSDirectionalEdgeInsets(top: 16, …)`로 적히며 간격이 어긋나기 시작한다.
  원시 섹션을 돌려주므로 부족하면 받아서 마저 손볼 수 있다 — 감싸서 막지 않는다.
- **SwiftUI `Layout` 3종 테스트** — 폭 제안을 바꿔 가며 실제 전환을 확인한다(9건).
- **웹 e2e** — 실제 브라우저에서 꺾임을 확인한다(chromium·webkit·firefox 27건).
  결정적 실험 하나가 들어 있다: **넓은 뷰포트 안 좁은 부모**에서 접히는가.
  미디어 쿼리로 짰다면 여기서 안 접히고 찌그러진다.
- **`.ai/layout-map.json` 역방향 검사** — 정방향(표→소스)만 보면 "적힌 것은 맞지만 빠진
  게 있다"를 못 잡는다. `JdBox` 계열을 상속하는 컴포넌트가 대응표에도
  `NOT_A_LAYOUT_INTENT`에도 없으면 실패하므로, 새 컨테이너를 추가할 때 **판단을 미룰 수
  없다**.
- **`scripts/codemod-token-vocabulary.mjs`** — DEC-045 이름 이동 자동 변환.
  값이 보존되는 이름으로만 옮기고, 토큰 척도에 없는 값(`radius="3xl"` 등)과 동적 값은
  건드리지 않고 보고한다. **멱등이 아니다**(이동 후 이름도 유효한 v2 이름이라 다시 돌면
  또 밀린다) — 그래서 커밋되지 않은 변경이 있으면 `--write`가 멈춘다.

### Added — 호출부 표면·코드 스타일 (DEC-060 · 061)

- **제약에도 토큰을 강제한다** — `inset(.md)` · `offset(.sm)`. 스택의 `spacing`은
  `JdGap`으로 막아 뒀는데 제약의 `inset`·`offset`은 원시 CGFloat를 받고 있었다.
  같은 화면에서 여백이 반은 토큰, 반은 숫자로 적히던 구멍이다.
- **축·변 묶음** — `$0.horizontal` / `$0.vertical`, `NSDirectionalRectEdge.horizontal` /
  `.vertical`. `$0.leading.trailing`을 매번 적게 하면 결국 한쪽을 빼먹는다.
- **`env.jdAdaptiveGrid(minItemWidth:)`** — 클로저가 이미 주는 `env`를 다시
  `environment: env`로 넘기던 잡음 제거.
- **포매터 도입** — `.swift-format`(swift-format 6.2) + `.prettierrc`.
  `npm run format` / `format:check` / `format:all`.
  기본은 **`main` 대비 변경분만** — 전면 적용은 `--all`로 독립 커밋을 만든다
  (처음 들이면 Swift 4,589건 · JS/TS 597파일이 한 번에 바뀐다).
  생성물(`tokens.css`·`*.generated.*`·CEM)은 생성기가 형식을 소유하므로 제외한다.

### Fixed — 포매터 도입 중 드러난 것

- **`release/CHECKLIST.md`를 Prettier가 손상시킨다** — 리스트 항목 안 코드펜스에서
  비멱등이라 실행할 때마다 백틱을 하나씩 늘린다(``` → ```` → `````).
  `.prettierignore`로 제외했다.
- **CSS 텍스트를 공백까지 단언하던 테스트 5건** — 포매터를 들이자 한꺼번에 깨졌는데
  깨진 이유가 동작이 아니라 들여쓰기였다. `__tests__/css-text.ts`의 `squish`로
  공백 무관 비교로 바꿨다 — 선언이 사라지거나 값이 바뀌면 여전히 실패한다.

### Changed

- **`JdSwitcherView`가 폭 기반 축 전환의 정본이다.** `JdAdaptiveStackView`는 구현체로
  남는다 — 이름이 배치 개념이 아니라 구현(스택)을 가리키고, 임계값을 원시 CGFloat로
  받아 `JdBreakpoint` 어휘 밖으로 샜다. `RECIPES.md`를 새 API로 갱신했다.
- **`multiplier` 주석 정정** — "update에서 변경 시 remake 필요"로만 적혀 있었으나,
  Key에 multiplier가 있어 **`layout` 재호출이 이미 처리한다**(회귀 테스트로 고정).
  못 바꾸는 것은 `update`뿐이고 그건 "상수만 갱신" 계약 그대로다.

### Fixed

- **iOS `jdShow`/`jdHide`가 숨겨진 뒤 돌아오지 못하던 문제** (DEC-048) — 자기 폭을
  자기가 재는 구조라 숨김 상태(0×0)에서는 폭 증가를 관측할 수 없었고, 탈출구가 크기
  클래스 변화뿐이라 iPad 분할 화면을 1/3→1/2로 끄는 것처럼 크기 클래스가 그대로인
  폭 변화에서 숨은 채로 굳었다. 컨테이너가 폭을 내려주는 `.jdLayoutContext()`를
  더하고 자기측정은 폴백으로 남겼다.
- **`jd.layout` 재호출 시 `priority` 변경이 무시되던 문제** (DEC-013 보정 2) —
  기존 제약을 찾으면 `constant`만 갱신하고 끝냈다. required 경계를 넘는 변경은
  UIKit이 제자리 수정을 막으므로 폐기 후 재생성한다.
- **Layout 계층 동시성 격리** — `StrictConcurrency`가 켜져 있는데 `@MainActor`가
  없었고, associated object 키가 Swift 6에서 전역 가변 상태로 진단됐다.

## [2.5.0] — 2026-05-06

프레임워크 수준의 폭과 깊이로 확장. 4개 축(테마/데이터/모션/폼) + 6개 신규 패턴

- 9개 신규 훅 + 9개 신규 primitive/composite + 4개 로케일 + CLI 도구.

### Added

#### 멀티 브랜드 시스템

- `BrandProvider` + `useBrand` 훅 (`ds/providers/BrandProvider.tsx`)
- 5개 브랜드 프리셋: Default · Ocean · Forest · Sunset · Midnight (`ds/tokens/brands.ts`)
- `BrandSwitcher` (chips/list/select) 3가지 변형 UI
- `applyBrand()` / `restoreBrand()` 함수 — 4축 묶음(color theme + radius +
  density + font) 일괄 전환

#### 데이터 레이어 훅

- `useResource(key, fetcher, opts)` — SWR 스타일 모듈 캐시 + revalidate +
  windowFocus + invalidation (`ds/hooks/useResource.ts`)
- `useMutation(fn, { invalidates })` — POST/PUT/DELETE + 자동 캐시 무효화
- `useOptimisticState(initial)` — 옵티미스틱 업데이트 + 자동 rollback
- `invalidateResource(key)` — 외부 트리거 invalidation

#### 모션 추상

- `<Motion preset="…">` primitive — 8개 진입 프리셋 (fade/fade-up/down/scale/
  slide-up/down/left/right) + `prefers-reduced-motion` 자동 게이트
- `useAnimationFrame(cb)` — RAF 루프 + 자동 cleanup
- `app/globals.css`에 `@keyframes mFade*`, `mSlide*`, `mMarquee*` 추가

#### 신규 패턴 (6개)

- `BookReader` — 좌측 챕터 목차 + 본문 + 상단 진행률/북마크
- `SocialFeed` — 스토리 바 + 무한 스크롤 + EmptyState
- `PhotoAlbum` — 태그 필터 + 그리드 + 라이트박스 자동 연결
- `ChatThread` — 메시지 그룹핑 + 좌/우 정렬 + 읽음/타이핑/실패
- `CalendarMonth` — 월 그리드 + 이벤트 + 키보드 화살표/Home/End/PageUp/PageDown
- `EmailInbox` — 3-pane (폴더/리스트/본문) + 검색·별표 + 모바일 1-pane
- `VideoPlayer` — 재생/시크/볼륨/풀스크린/캡션 + 키보드(Space/K/←/→/↑/↓/M/F)
- `ForumThread` — 질문/답변 + 투표 + 채택 + 1단계 답글
- `OnboardingTour` — 스팟라이트 + 말풍선 + 키보드(Esc/←/→/Enter)

#### 신규 컴포넌트 (book/photo/sns + 일반)

**책(10):** BookCard, BookShelf, BookCover, BookRating, ReadingProgress,
ReadingGoal, ReadingStats, ChapterList, AnnotationNote, BookmarkButton (primitive)

**사진(10):** PhotoCard, PhotoGrid, PhotoLightbox, PhotoCarousel, ImageCompare,
ImageZoom, ExifPanel, PhotoFilters, PhotoUploader, ImageWithFallback

**SNS(10):** PostCard, CommentThread, ProfileHeader, StoryCircle, ReactionPicker,
PollCard, LikeButton, FollowButton, MentionChip, Hashtag (primitives)

**일반(5):** Highlight, Marquee, KeyCap (primitives), SearchBar (composite),
BrandSwitcher (composite)

#### 신규 훅 (9개)

- `useReadingProgress` — 스크롤 % + 활성 헤딩 추적
- `useImagePreload` — 다음 사진 백그라운드 프리로드
- `useInfiniteFeed` — cursor 페이지네이션 + 동시 호출 가드
- `useResource`, `useMutation`, `useOptimisticState`
- `useAnimationFrame`
- `useKeyboardShortcut` — "mod+k", "?", "ArrowUp" 등, Mac/Win 자동 매핑
- `useWindowSize` — SSR-safe

#### i18n

- 새 로케일 2개: 일본어(`jaLocale`) + 중국어(`zhLocale`)
- 14개 신규 ARIA fallback 키 (photo/sns/book 도메인)

#### CLI 도구

- `npm run doctor` — 환경/메타/게이트 일관성 18개 항목 진단
- `npm run add <Name>` — 컴포넌트 추가 단계별 안내 (kind 자동 추론)
- `npm run create-app <dir>` — 새 Next.js 프로젝트 부트스트랩 (브랜드+로케일 옵션)
- `npm run audit:compound` — `requirements/compound-api.md` 마이그레이션 현황 보고

#### 인프라

- `scripts/check-bundle-budget.mjs` — kind별 gzip 한도 검증 (CI 게이트)
- `scripts/validate-search-dictionary.mjs` — 쇼케이스 ↔ 사전 동기화 검증
- `scripts/scan-ssr-rsc.mjs` — `'use client'` 일관성 검사 (CI strict)
- `scripts/scan-motion-rtl.mjs` — motion-reduce / RTL 누락 advisory
- `audit:a11y:strict` — critical/serious 0건 강제

#### 신규 요구사항 문서 (7개)

- `book-domain` · `photo-domain` · `sns-domain` (도메인 의도/스코프)
- `multi-brand-theming` · `forms` · `data-layer` · `motion` (아키텍처 축)
- 인덱스 표 자동 정렬 — 9 → 16 clean

#### 신규 레시피 (17개)

- 도메인: book-reader-page, photo-album-page, social-feed, user-profile,
  story-bar, chat-app, calendar-page, email-app
- 마케팅: marketing-landing, pricing-page-full, product-detail, blog-article,
  charts-dashboard, checkout-flow
- 기술: rhf-zod-form, form-validation, brand-switching

### Changed

- `ds/__tests__/a11y/audit.test.tsx` — 옵션 prop이라도 `aria-label`/`children`
  자동 주입해 실사용 시뮬레이션 정확도 향상
- `app/globals.css` `@theme inline`에 `--color-surface`, `--color-surface-soft`
  매핑 추가 (이전 미정의 `bg-surface*` 클래스 정상화)
- `FormWizard` — 빈 `steps[]` 가드 + dev 경고로 crash 방지
- 9개 컴포넌트(ScrollProgress/Slider/Switch/DetailPanel/NotificationCenter/
  FileUpload/CodeEditor/DateRangeFilter/Transfer/LoadingButton)의 한국어
  fallback을 `useT()`로 변환

### Fixed

- a11y critical/serious 위반 22 → 0
  - DetailPanel 닫기 버튼 `aria-label`
  - Transfer 좌/우 이동 버튼 동적 `aria-label`
  - NotificationCenter 벨 버튼 `aria-label` + `aria-expanded`
  - ScrollProgress / Slider / Switch / RangeSlider — fallback `aria-label`
  - LoadingButton — children/aria-label 둘 다 없을 때 자동 fallback
  - DataTable — 잘못된 `role="grid"` (rowgroup 자식 없음) → `role="region"`
  - CodeEditor / DateRangeFilter / FileUpload — input에 `aria-label` 포워딩
- `ImageZoom` — `role="img"` 컨테이너에 인터랙티브 버튼 중첩 → `<figure>` + alt 적용
- `PhotoUploader` — `role="button"` div 안 hidden input 중첩 → input을 형제로 분리
- `PhotoCarousel` — `photos` 길이가 줄어 index 오버플로 시 자동 0 reset
- `Mention` 네임 충돌 (primitive vs composite) → primitive를 `MentionChip`으로 리네임

### 게이트 결과

| 검사          | 이전 (2.4.0) | 현재 (2.5.0)        |
| ------------- | ------------ | ------------------- |
| 컴포넌트 수   | 233          | **279+**            |
| props 수      | 1371         | **1608+**           |
| 테스트        | 628          | **673+**            |
| a11y critical | 20           | **0**               |
| a11y serious  | 2            | **0**               |
| 요구사항 문서 | 9            | **16**              |
| 레시피        | 9            | **26**              |
| 로케일        | 2 (ko/en)    | **4 (ko/en/ja/zh)** |
| 브랜드 프리셋 | 1            | **5**               |
| CLI 명령      | 0            | **4**               |

## [2.4.0] — 2026-04-29

- 4개 패턴 추가 (AuthLayout, GanttChart, PricingPage, SettingsLayout)
- `useFocusTrap` 훅
- 10종 composite 정식 구현 (no-code Renderer 정비)

## [2.3.0] — 2026-04-15

- no-code 런타임 개시
- composite/pattern 기본 라인업 정비

## [2.2.0]

- 라이브러리 본체 안정화
- 카테고리 (primitives/composites/patterns) 구조 확립
