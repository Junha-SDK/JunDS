# 00-inventory — JunDS 현행 감사 (Phase 0)

작성일: 2026-07-23 · 기준: `@junds/ui` v2.2.0 (`/Users/junha/develop/jjunhaa/JunDS`) + MySelf 독스 갤러리 (`src/features/docs/components/pages/junds`)
모든 수치는 grep/스크립트 실측. 추정치는 (추정)으로 표기.

> **갱신 이력.** 이 문서는 2026-07-23 Phase 0 감사 스냅샷이다. 이후 배럴이 늘면
> §1 총계와 §3·§4 표를 갱신하고 여기에 델타를 남긴다 — `docs-spec/tools/gen-ledger.mjs`
> 의 `EXPECTED` 가 §1 수치와 1:1이므로 둘이 어긋나면 원장 생성이 실패한다.
>
> - **2026-07-27 · myself-migration** — MySelf(junome.info) 디자인 시스템 흡수로
>   composites 185→**194** (+9: Waveform · AlbumArt · NowPlayingBar · DocPager ·
>   ProjectCard · ScreenshotGrid · SeoHead · TocHeading · GlobalImageLightbox),
>   hooks 55→**61** (+6: useCodeCopy · useJsonLd · useRevealOnScroll ·
>   useDominantColor · useAudioPlayer · useSeo). UI 합계 304→**313**, 원장 445→**460**.
>   갤러리/USAGE 열은 모두 `—` (MySelf 갤러리 스펙 시점 이후 추가분).
>   상세는 `requirements/myself-migration.md`.
> - **2026-07-27 · myself-migration 2차** — 잔여 흡수로 composites 194→**201**
>   (+7: Lyrics · NowPlayingFull · RelatedPosts · DocHero · DocLinks ·
>   GlobeWireframe · BarList), hooks 61→**62** (+1: useUrlFilters).
>   UI 합계 313→**320**, 원장 460→**468**.

## 1. 요약

| 항목                                                       |                                  실측치 | 근거                                                                                    |
| ---------------------------------------------------------- | --------------------------------------: | --------------------------------------------------------------------------------------- |
| 갤러리 Specimen                                            |                                 **188** | `JunDSLive.tsx` + `extra/*.tsx`의 `<Specimen name>` 태그 수 (68+20+25+21+11+13+11+19)   |
| 갤러리가 커버하는 컴포넌트 토큰                            |                                 **208** | 복합 이름("Modal · Drawer · BottomSheet" 등)을 `·` 분해 + 별칭 정규화 후 유니크         |
| USAGE_DATA 키                                              |                                 **211** | `junds-usage.data.ts` (Primitive 40 · Composite 115 · Pattern 24 · Hook 22 · Layout 10) |
| USAGE_ALIAS                                                |                                  **17** | 조회 키 총 228 (211+17)                                                                 |
| 라이브러리 value export 총계                               |                                 **678** | ds/ 12개 배럴 (타입 export 별도 564)                                                    |
| — UI 컴포넌트 (core+layout+primitives+composites+patterns) |                                 **320** | core 13 · layout 12 · primitives 51 · composites 201 · patterns 43                      |
| — hooks (use\*)                                            |                                  **62** | +`invalidateResource` 1                                                                 |
| — finance                                                  |      **86 컴포넌트 + 131 lib + 6 lazy** | UI/도메인 로직 혼재 배럴                                                                |
| — tokens / providers / runtime / utils / auth              |                    24 / 12 / 19 / 9 / 4 | 인프라 계층                                                                             |
| COMPONENTS.md                                              | 137KB · 헤딩 182 (h1 1 · h2 7 · h3 174) | 문서화된 컴포넌트 항목 = h3 174                                                         |

**"219개" 주장과의 차이**: 현행 소스 어디에도 문자열 219는 없다 (독스/갤러리 grep 0건). 실측 스펙트럼은 갤러리 188(Specimen) ~ 208(정규화 토큰) ~ 211(USAGE 키) ~ 228(별칭 포함 조회 키)로, 219는 이 사이에 위치한다. (추정) 과거 세대 갤러리의 항목 수이거나 별칭/복합 스펙 일부만 반영한 시점의 집계로 보이며, 이후 문서에서는 **"갤러리 188 스펙 / USAGE 211 키"를 공식 수치**로 쓴다. 참고로 라이브러리의 실제 UI 컴포넌트는 320개(감사 시점 304 + myself-migration 16, +finance 86)로, 어떤 집계 기준으로도 "전부 라이브"는 아니다 — 5장 gap 참조.

## 2. 의존성 감사

런타임 의존성은 **각각 정확히 1개 파일에만 격리**되어 있다 (ds/ 내 import 파일 수 grep 실측, 테스트 제외).

| 패키지                 | 구분 | import 파일 수 | 위치                      | 바닐라 전환 전략                                                                    |
| ---------------------- | ---- | -------------: | ------------------------- | ----------------------------------------------------------------------------------- |
| clsx ^2.1.1            | dep  |          **1** | `ds/utils/cn.ts`          | 클래스 조합 유틸 자체 구현 (cn은 273개 파일이 사용 — 시그니처 유지하고 내부만 교체) |
| tailwind-merge ^3.5.0  | dep  |          **1** | `ds/utils/cn.ts`          | 동일 — Tailwind 이탈 시 충돌 해소 로직 자체가 불필요해짐                            |
| valibot ^1.3.1         | dep  |          **1** | `ds/runtime/schema.ts`    | 자체 검증 or 제거 (runtime PageDoc 파서 한정 — 코어 컴포넌트는 무관)                |
| lucide-react ^1.14.0   | peer |          **1** | `ds/finance/AppIcon.tsx`  | 자체 SVG 아이콘 셋 (primitives/Icon은 이미 자체 구현, finance만 잔존)               |
| yahoo-finance2 ^3.14.0 | peer |          **1** | `ds/finance/lib/yahoo.ts` | 데이터 패키지 분리 (finance 도메인 전체를 별도 패키지로)                            |

결론: 외부 의존 절단면이 이미 파일 3개(cn.ts, schema.ts, AppIcon.tsx)+데이터 1개(yahoo.ts)로 좁다. 바닐라 재구축의 실질 비용은 의존성이 아니라 **cn() 사용처 273개 파일의 Tailwind 클래스 체계** 자체다.

## 3. 카테고리별 컴포넌트 인벤토리

난이도 기준 — S: 상태 없는 표시용 / M: 상호작용·포커스·애니메이션 / L: 가상스크롤·차트·에디터·복잡 상태머신. iOS의 N/a는 웹 전용 개념에만 부여.
갤러리 O 판정은 Specimen 복합 이름 분해+별칭 정규화 후 매칭 기준.

난이도 분포 (UI 320개, finance 제외): 바닐라 **S 97 · M 178 · L 43 · N/a 2** / iOS **S 97 · M 190 · L 25 · N/a 6** (차트·가상스크롤·미디어가 네이티브 프레임워크로 강등되어 iOS의 L이 적음). 2026-07-27 myself-migration 16건 반영 — 1차 9건(바닐라 S 4·M 3·N/a 2) + 2차 7건(바닐라 S 5·M 1·L 1).

### core — 13개

스타일 프롭 시스템(styleProps) 기반 레이아웃/타이포 프리미티브. Box가 원형이며 나머지는 파생 — 바닐라에서는 styleProps→CSS 변수/유틸클래스 변환기가 선행 과제.

| 컴포넌트     | 갤러리 | USAGE | 바닐라 | iOS | 비고                                                         |
| ------------ | :----: | :---: | :----: | :-: | ------------------------------------------------------------ |
| Box          |   O    |   O   |   S    |  S  |                                                              |
| Center       |   O    |   O   |   S    |  S  |                                                              |
| CoreDivider  |   —    |   —   |   S    |  S  |                                                              |
| CoreProvider |   —    |   —   |   M    |  M  | 밀도/반경/스페이싱 설정 컨텍스트 — 토큰 시스템으로 흡수 후보 |
| Flex         |   O    |   O   |   S    |  S  |                                                              |
| GridLayout   |   —    |   —   |   S    |  S  |                                                              |
| Group        |   —    |   —   |   S    |  S  |                                                              |
| HStack       |   O    |   O   |   S    |  S  |                                                              |
| Heading      |   O    |   O   |   S    |  S  |                                                              |
| Page         |   —    |   —   |   S    |  S  |                                                              |
| Section      |   —    |   —   |   S    |  S  |                                                              |
| Text         |   O    |   O   |   S    |  S  |                                                              |
| VStack       |   O    |   O   |   S    |  S  |                                                              |

소계: 13개 중 갤러리 7 · USAGE 7 · 양쪽 모두 부재 6

### layout — 12개

core와 역할이 겹치는 별도 레이아웃 계층 (Stack vs HStack/VStack, LayoutDivider vs CoreDivider vs Divider 삼중복). 재구축 시 core로 통합 권장.

| 컴포넌트       | 갤러리 | USAGE | 바닐라 | iOS | 비고 |
| -------------- | :----: | :---: | :----: | :-: | ---- |
| Stack          |   O    |   O   |   S    |  S  |      |
| Grid           |   O    |   O   |   S    |  S  |      |
| Container      |   O    |   O   |   S    |  S  |      |
| Spacer         |   O    |   O   |   S    |  S  |      |
| AppShell       |   —    |   —   |   M    |  M  |      |
| Wrap           |   —    |   —   |   S    |  S  |      |
| SimpleGrid     |   O    |   O   |   S    |  S  |      |
| Show           |   —    |   —   |   M    |  M  |      |
| Hide           |   —    |   —   |   M    |  M  |      |
| AspectRatioBox |   —    |   —   |   S    |  S  |      |
| Overlay        |   —    |   —   |   M    |  M  |      |
| LayoutDivider  |   —    |   —   |   S    |  S  |      |

소계: 12개 중 갤러리 5 · USAGE 5 · 양쪽 모두 부재 7

### primitives — 51개

| 컴포넌트          | 갤러리 | USAGE | 바닐라 | iOS | 비고                                                    |
| ----------------- | :----: | :---: | :----: | :-: | ------------------------------------------------------- |
| Button            |   O    |   O   |   M    |  M  |                                                         |
| Input             |   O    |   O   |   M    |  M  |                                                         |
| Textarea          |   O    |   O   |   M    |  M  |                                                         |
| Badge             |   O    |   O   |   S    |  S  |                                                         |
| Avatar            |   O    |   O   |   S    |  S  |                                                         |
| Spinner           |   O    |   O   |   S    |  S  |                                                         |
| Divider           |   O    |   O   |   S    |  S  |                                                         |
| Toggle            |   O    |   O   |   M    |  M  |                                                         |
| Checkbox          |   O    |   O   |   M    |  M  |                                                         |
| RadioGroup        |   O    |   —   |   M    |  M  |                                                         |
| Label             |   O    |   O   |   S    |  S  |                                                         |
| Tag               |   O    |   O   |   S    |  S  |                                                         |
| IconButton        |   O    |   O   |   M    |  M  |                                                         |
| Kbd               |   O    |   O   |   S    |  S  |                                                         |
| Portal            |   O    |   O   |   M    | N/a | 웹 전용(DOM 이동). 바닐라=appendChild 유틸              |
| VisuallyHidden    |   O    |   O   |   S    |  S  | iOS는 accessibilityLabel로 개념 대체                    |
| Slider            |   O    |   O   |   M    |  M  |                                                         |
| NumberInput       |   O    |   O   |   M    |  M  |                                                         |
| CopyButton        |   O    |   O   |   M    |  M  |                                                         |
| StatusDot         |   O    |   O   |   S    |  S  |                                                         |
| FileUpload        |   O    |   O   |   M    |  M  |                                                         |
| PasswordInput     |   O    |   O   |   M    |  M  |                                                         |
| PinInput          |   O    |   O   |   M    |  M  |                                                         |
| Switch            |   O    |   O   |   M    |  M  |                                                         |
| AspectRatio       |   O    |   O   |   S    |  S  |                                                         |
| ScrollArea        |   —    |   O   |   M    |  S  | iOS는 UIScrollView 기본 동작                            |
| StarRating        |   O    |   O   |   M    |  M  |                                                         |
| BackTop           |   O    |   O   |   M    |  M  |                                                         |
| ErrorBoundary     |   —    |   O   |   M    | N/a | React 전용 개념. 바닐라=try/catch 래퍼, iOS 해당 없음   |
| BatteryIndicator  |   —    |   O   |   S    |  S  |                                                         |
| SeverityBadge     |   —    |   O   |   S    |  S  |                                                         |
| OTPInput          |   O    |   O   |   M    |  M  |                                                         |
| CurrencyInput     |   O    |   O   |   M    |  M  |                                                         |
| PhoneInput        |   O    |   O   |   M    |  M  |                                                         |
| NumberFormatter   |   —    |   O   |   S    |  S  |                                                         |
| AnnouncerProvider |   —    |   —   |   M    |  M  | aria-live 리전. iOS=UIAccessibility.post(.announcement) |
| FocusGuard        |   —    |   O   |   M    | N/a | 포커스 순환 가드 — 바닐라 focus trap 유틸에 흡수        |
| RangeSlider       |   O    |   O   |   M    |  M  |                                                         |
| Link              |   O    |   O   |   S    |  S  |                                                         |
| Image             |   O    |   O   |   M    |  M  |                                                         |
| Code              |   O    |   —   |   S    |  S  |                                                         |
| Mark              |   —    |   —   |   S    |  S  |                                                         |
| Icon              |   O    |   —   |   S    |  S  |                                                         |
| BookmarkButton    |   —    |   —   |   M    |  M  |                                                         |
| LikeButton        |   —    |   —   |   M    |  M  |                                                         |
| FollowButton      |   —    |   —   |   M    |  M  |                                                         |
| MentionChip       |   —    |   —   |   S    |  S  |                                                         |
| Hashtag           |   —    |   —   |   S    |  S  |                                                         |
| Motion            |   —    |   —   |   M    |  M  | 진입 애니메이션 래퍼 — CSS 키프레임 유틸로 전환         |
| Highlight         |   O    |   —   |   S    |  S  |                                                         |
| KeyCap            |   —    |   —   |   S    |  S  |                                                         |

소계: 51개 중 갤러리 36 · USAGE 38 · 양쪽 모두 부재 9

### composites — 201개

최대 카테고리. 도메인 시리즈(Book*, Photo*, 소셜, 커머스, 차트)가 다수 포함 — 재구축 시 도메인 시리즈의 분리 여부가 스코프를 좌우.

| 컴포넌트             | 갤러리 | USAGE | 바닐라 | iOS | 비고                                                      |
| -------------------- | :----: | :---: | :----: | :-: | --------------------------------------------------------- |
| Accordion            |   O    |   O   |   M    |  M  |                                                           |
| ActionSheet          |   —    |   O   |   M    |  M  |                                                           |
| AddressInput         |   —    |   O   |   M    |  M  |                                                           |
| Affix                |   O    |   O   |   M    |  M  |                                                           |
| Alert                |   O    |   O   |   M    |  M  |                                                           |
| AlertDialog          |   O    |   O   |   M    |  M  |                                                           |
| AnimatedCounter      |   O    |   O   |   M    |  M  |                                                           |
| AudioPlayer          |   O    |   O   |   L    |  M  |                                                           |
| AutoComplete         |   O    |   O   |   M    |  M  |                                                           |
| AutoHideHeader       |   —    |   O   |   M    |  M  |                                                           |
| AutoPlayDemo         |   —    |   O   |   M    |  M  |                                                           |
| AvatarStack          |   O    |   O   |   S    |  S  |                                                           |
| Banner               |   O    |   O   |   M    |  M  |                                                           |
| BentoGrid            |   —    |   O   |   M    |  M  |                                                           |
| BookCard             |   —    |   O   |   S    |  S  |                                                           |
| BottomSheet          |   O    |   O   |   M    |  M  | 드래그 제스처 — iOS는 UISheetPresentationController       |
| Breadcrumb           |   O    |   O   |   S    |  S  |                                                           |
| ButtonGroup          |   O    |   O   |   M    |  M  |                                                           |
| Callout              |   O    |   O   |   S    |  S  |                                                           |
| Card                 |   O    |   O   |   S    |  S  |                                                           |
| Carousel             |   O    |   O   |   L    |  M  |                                                           |
| ChatBubble           |   O    |   O   |   S    |  S  |                                                           |
| CodeEditor           |   O    |   O   |   L    |  L  |                                                           |
| Collapsible          |   O    |   O   |   M    |  M  |                                                           |
| CollectionView       |   —    |   O   |   M    |  M  |                                                           |
| ColorPicker          |   O    |   O   |   L    |  L  |                                                           |
| ColorSwatch          |   —    |   O   |   S    |  S  |                                                           |
| Combobox             |   O    |   O   |   M    |  M  |                                                           |
| CompareSlider        |   —    |   O   |   M    |  M  |                                                           |
| ComparisonGrid       |   —    |   O   |   M    |  M  |                                                           |
| ComponentShowcase    |   —    |   O   |   M    |  M  |                                                           |
| Confetti             |   O    |   O   |   M    |  M  | canvas 파티클 — SSG/헤드리스 환경 주의                    |
| ConfirmDialog        |   —    |   O   |   M    |  M  |                                                           |
| ContextMenu          |   O    |   O   |   M    |  M  |                                                           |
| CopyBlock            |   —    |   O   |   M    |  M  |                                                           |
| CronExpression       |   —    |   O   |   S    |  S  |                                                           |
| DataGrid             |   O    |   O   |   L    |  L  | 가상화+선택+정렬 복합                                     |
| DateInput            |   —    |   O   |   M    |  M  |                                                           |
| DateRangeFilter      |   —    |   O   |   M    |  M  |                                                           |
| DateRangePicker      |   O    |   O   |   L    |  L  |                                                           |
| Descriptions         |   —    |   O   |   S    |  S  |                                                           |
| DetailPanel          |   —    |   O   |   M    |  M  |                                                           |
| Disclosure           |   O    |   —   |   M    |  M  |                                                           |
| DiffViewer           |   O    |   O   |   L    |  L  |                                                           |
| Dock                 |   —    |   O   |   M    |  M  |                                                           |
| Drawer               |   O    |   O   |   M    |  M  | Modal 기반 변형                                           |
| Dropdown             |   O    |   O   |   M    |  M  |                                                           |
| DsToastProvider      |   —    |   —   |   M    |  M  | 명령형 toast() 싱글턴으로 전환 (Provider 불필요)          |
| EmojiPicker          |   O    |   O   |   L    |  L  |                                                           |
| EmptyState           |   O    |   O   |   S    |  S  |                                                           |
| FilterButtonGroup    |   —    |   O   |   M    |  M  |                                                           |
| FloatingActionButton |   —    |   O   |   M    |  M  |                                                           |
| FormField            |   O    |   O   |   M    |  M  |                                                           |
| FunnelChart          |   —    |   O   |   L    |  M  |                                                           |
| GaugeChart           |   —    |   O   |   L    |  M  |                                                           |
| Globe                |   —    |   O   |   L    |  L  |                                                           |
| GradientBorder       |   —    |   O   |   S    |  S  |                                                           |
| Heatmap              |   O    |   O   |   L    |  M  |                                                           |
| HoverCard            |   O    |   O   |   M    |  M  |                                                           |
| ImageCropper         |   O    |   O   |   L    |  M  |                                                           |
| ImageLightbox        |   O    |   O   |   M    |  M  |                                                           |
| InlineEdit           |   O    |   O   |   M    |  M  |                                                           |
| JSONViewer           |   O    |   O   |   M    |  M  |                                                           |
| KeyValueGrid         |   —    |   O   |   S    |  S  |                                                           |
| LoadingOverlay       |   —    |   O   |   M    |  M  |                                                           |
| MarkdownViewer       |   O    |   O   |   L    |  L  |                                                           |
| Marquee              |   O    |   O   |   M    |  M  |                                                           |
| Mention              |   O    |   O   |   M    |  M  |                                                           |
| Menubar              |   —    |   O   |   M    |  M  |                                                           |
| MetricCard           |   O    |   O   |   S    |  S  |                                                           |
| MiniChart            |   O    |   O   |   L    |  M  |                                                           |
| Modal                |   O    |   O   |   M    |  M  | focus trap + scroll lock + portal 조합                    |
| MultiSelect          |   O    |   O   |   M    |  M  |                                                           |
| NavigationMenu       |   —    |   O   |   M    |  M  |                                                           |
| Notification         |   O    |   O   |   M    |  M  |                                                           |
| Onboarding           |   O    |   O   |   M    |  M  |                                                           |
| Pagination           |   O    |   O   |   M    |  M  |                                                           |
| Popover              |   O    |   O   |   M    |  M  |                                                           |
| ProgressBar          |   —    |   —   |   M    |  M  |                                                           |
| ProgressSteps        |   —    |   —   |   M    |  M  |                                                           |
| ProgressRing         |   O    |   O   |   M    |  M  |                                                           |
| PullToRefresh        |   —    |   O   |   M    |  M  | iOS는 UIRefreshControl 네이티브                           |
| QRCode               |   O    |   O   |   L    |  S  | 웹은 인코딩 알고리즘 자체 구현 필요, iOS는 CoreImage 내장 |
| Rating               |   O    |   O   |   M    |  M  |                                                           |
| ReadingTime          |   —    |   O   |   S    |  S  |                                                           |
| Resizable            |   —    |   O   |   M    |  M  |                                                           |
| Result               |   O    |   O   |   S    |  S  |                                                           |
| ScrollSpy            |   O    |   O   |   M    |  M  |                                                           |
| SearchInput          |   O    |   O   |   M    |  M  |                                                           |
| SecurityBadge        |   —    |   O   |   S    |  S  |                                                           |
| SegmentedControl     |   O    |   O   |   M    |  M  |                                                           |
| Select               |   O    |   O   |   M    |  M  |                                                           |
| Sheet                |   —    |   O   |   M    |  M  |                                                           |
| SignaturePad         |   O    |   O   |   L    |  L  |                                                           |
| Skeleton             |   O    |   O   |   S    |  S  |                                                           |
| SkeletonPreset       |   —    |   O   |   S    |  S  |                                                           |
| SplitPane            |   —    |   O   |   M    |  M  |                                                           |
| SpoilerBlock         |   —    |   O   |   M    |  M  |                                                           |
| Spotlight            |   —    |   O   |   M    |  M  |                                                           |
| SpotlightCard        |   —    |   O   |   M    |  M  |                                                           |
| StatCard             |   O    |   O   |   S    |  S  |                                                           |
| Stepper              |   O    |   O   |   M    |  M  |                                                           |
| Sticky               |   —    |   O   |   M    |  M  |                                                           |
| SwipeAction          |   —    |   O   |   M    |  M  | iOS는 UISwipeActionsConfiguration 네이티브                |
| Table                |   O    |   O   |   L    |  L  | 정렬/선택 포함 시 L, 순수 표는 M                          |
| Tabs                 |   O    |   O   |   M    |  M  |                                                           |
| TagInput             |   O    |   O   |   M    |  M  |                                                           |
| TimePicker           |   O    |   O   |   M    |  M  |                                                           |
| Timeline             |   O    |   O   |   S    |  S  |                                                           |
| Tooltip              |   O    |   O   |   M    |  M  |                                                           |
| Transfer             |   —    |   O   |   L    |  L  |                                                           |
| TreeNav              |   —    |   O   |   M    |  M  |                                                           |
| TreeView             |   O    |   O   |   M    |  M  |                                                           |
| TreemapChart         |   —    |   O   |   L    |  L  |                                                           |
| TrustIndicator       |   —    |   O   |   S    |  S  |                                                           |
| Typewriter           |   —    |   O   |   M    |  M  |                                                           |
| VideoPlayer          |   O    |   O   |   L    |  M  |                                                           |
| VirtualScroll        |   —    |   O   |   L    |  M  |                                                           |
| Watermark            |   O    |   O   |   S    |  S  |                                                           |
| Countdown            |   O    |   —   |   M    |  M  |                                                           |
| Clock                |   O    |   —   |   M    |  M  |                                                           |
| PageHeader           |   —    |   —   |   S    |  S  |                                                           |
| AnnouncementBar      |   —    |   —   |   M    |  M  |                                                           |
| ThinkingIndicator    |   —    |   —   |   M    |  M  |                                                           |
| PricingTable         |   O    |   —   |   M    |  M  |                                                           |
| CookieConsent        |   —    |   —   |   M    |  M  |                                                           |
| MonthPicker          |   —    |   —   |   M    |  M  |                                                           |
| YearPicker           |   —    |   —   |   M    |  M  |                                                           |
| Snackbar             |   O    |   —   |   M    |  M  |                                                           |
| Stat                 |   —    |   —   |   S    |  S  |                                                           |
| Blockquote           |   —    |   —   |   S    |  S  |                                                           |
| LoadingButton        |   —    |   —   |   M    |  M  |                                                           |
| LoadingScreen        |   —    |   —   |   S    |  S  |                                                           |
| OfflineIndicator     |   —    |   —   |   M    |  M  |                                                           |
| Hint                 |   —    |   —   |   S    |  S  |                                                           |
| SocialShare          |   —    |   —   |   M    |  M  |                                                           |
| EmojiReaction        |   —    |   —   |   M    |  M  |                                                           |
| OnlineStatus         |   —    |   —   |   S    |  S  |                                                           |
| RadioCardGroup       |   —    |   —   |   M    |  M  |                                                           |
| CheckboxCardGroup    |   —    |   —   |   M    |  M  |                                                           |
| TextareaAutosize     |   —    |   —   |   M    |  M  |                                                           |
| PasswordStrength     |   —    |   —   |   M    |  M  |                                                           |
| ScrollProgress       |   —    |   —   |   M    |  M  |                                                           |
| TableOfContents      |   —    |   —   |   M    |  M  |                                                           |
| LineChart            |   O    |   —   |   L    |  M  |                                                           |
| BarChart             |   —    |   —   |   L    |  M  |                                                           |
| PieChart             |   —    |   —   |   L    |  M  |                                                           |
| TestimonialCard      |   —    |   —   |   S    |  S  |                                                           |
| LogoCloud            |   —    |   —   |   S    |  S  |                                                           |
| Newsletter           |   —    |   —   |   M    |  M  |                                                           |
| CTASection           |   —    |   —   |   S    |  S  |                                                           |
| ProductCard          |   —    |   —   |   M    |  M  |                                                           |
| CartItem             |   —    |   —   |   M    |  M  |                                                           |
| QuantitySelector     |   —    |   —   |   M    |  M  |                                                           |
| PriceDisplay         |   —    |   —   |   S    |  S  |                                                           |
| AreaChart            |   O    |   —   |   L    |  M  |                                                           |
| RadarChart           |   —    |   —   |   L    |  M  |                                                           |
| ScatterPlot          |   —    |   —   |   L    |  M  |                                                           |
| SankeyDiagram        |   —    |   —   |   L    |  L  |                                                           |
| BookShelf            |   —    |   —   |   M    |  M  |                                                           |
| ReadingProgress      |   —    |   —   |   M    |  M  |                                                           |
| ChapterList          |   —    |   —   |   S    |  S  |                                                           |
| ReadingStats         |   —    |   —   |   S    |  S  |                                                           |
| BookCover            |   —    |   —   |   S    |  S  |                                                           |
| ReadingGoal          |   —    |   —   |   M    |  M  |                                                           |
| AnnotationNote       |   —    |   —   |   S    |  S  |                                                           |
| BookRating           |   —    |   —   |   S    |  S  |                                                           |
| PhotoCard            |   —    |   —   |   S    |  S  |                                                           |
| PhotoGrid            |   —    |   —   |   M    |  M  |                                                           |
| PhotoLightbox        |   —    |   —   |   M    |  M  |                                                           |
| PhotoCarousel        |   —    |   —   |   M    |  M  |                                                           |
| ImageCompare         |   —    |   —   |   M    |  M  |                                                           |
| ImageZoom            |   —    |   —   |   M    |  M  |                                                           |
| ExifPanel            |   —    |   —   |   S    |  S  |                                                           |
| PhotoFilters         |   —    |   —   |   M    |  M  |                                                           |
| PhotoUploader        |   —    |   —   |   M    |  M  |                                                           |
| ImageWithFallback    |   —    |   —   |   M    |  M  | MySelf CoverImage와 유사 패턴                             |
| PostCard             |   —    |   —   |   S    |  S  |                                                           |
| CommentThread        |   O    |   —   |   M    |  M  |                                                           |
| ProfileHeader        |   —    |   —   |   S    |  S  |                                                           |
| StoryCircle          |   —    |   —   |   S    |  S  |                                                           |
| ReactionPicker       |   —    |   —   |   M    |  M  |                                                           |
| PollCard             |   —    |   —   |   M    |  M  |                                                           |
| BrandSwitcher        |   —    |   —   |   M    |  M  | BrandProvider 의존                                        |
| SearchBar            |   —    |   —   |   M    |  M  |                                                           |

| Waveform | — | — | M | M | myself-migration — 시드 결정적 파형 + 탐색 슬라이더 |
| AlbumArt | — | — | S | S | myself-migration — 생성 커버 폴백 |
| NowPlayingBar | — | — | M | M | myself-migration — useAudioPlayer 의존 |
| DocPager | — | — | S | S | myself-migration — 이전/다음 문서 |
| ProjectCard | — | — | S | S | myself-migration — 인덱스 행 카드 |
| ScreenshotGrid | — | — | S | S | myself-migration — 깨진 이미지 자동 제외 |
| SeoHead | — | — | N/a | N/a | myself-migration — head 조작, 렌더 없음 (웹 전용) |
| TocHeading | — | — | S | N/a | myself-migration — TocProvider 자기 등록 (React 컨텍스트 전제) |
| GlobalImageLightbox | — | — | M | N/a | myself-migration — document 클릭 위임 (웹 전용) |

| Lyrics | — | — | S | S | myself-migration 2차 — 연 단위 가사 강조 |
| NowPlayingFull | — | — | M | M | myself-migration 2차 — Modal 위 전체 화면 플레이어 |
| RelatedPosts | — | — | S | S | myself-migration 2차 — 연관 글 목록 |
| DocHero | — | — | S | S | myself-migration 2차 — 문서 상단 히어로 |
| DocLinks | — | — | S | S | myself-migration 2차 — 외부 링크 목록 |
| GlobeWireframe | — | — | L | L | myself-migration 2차 — 캔버스 와이어프레임 지구본 |
| BarList | — | — | S | S | myself-migration 2차 — 가로 막대 순위 목록 |

소계: 201개 중 갤러리 76 · USAGE 115 · 양쪽 모두 부재 78
(myself-migration 1차 9건 + 2차 7건 추가 — 전부 갤러리·USAGE 부재)

### patterns — 43개

페이지급 조립 패턴. AuthLayout~ForumThread 등 페이지 템플릿류는 갤러리/USAGE 모두 부재.

| 컴포넌트           | 갤러리 | USAGE | 바닐라 | iOS | 비고                                           |
| ------------------ | :----: | :---: | :----: | :-: | ---------------------------------------------- |
| DataTable          |   O    |   O   |   L    |  L  | 밀도 모드·정렬 상태 포함 최상위 표 패턴        |
| FilterBar          |   O    |   O   |   M    |  M  |                                                |
| CommandPalette     |   O    |   O   |   L    |  L  | 퍼지검색+포커스트랩+키보드 내비                |
| DsSidebarProvider  |   —    |   —   |   M    |  M  |                                                |
| DsSidebar          |   —    |   —   |   M    |  M  |                                                |
| SidebarLink        |   —    |   —   |   M    |  M  |                                                |
| SidebarSection     |   —    |   —   |   M    |  M  |                                                |
| DsCalendar         |   —    |   —   |   L    |  L  | 이벤트 캘린더 — 날짜 연산 전면 자체 구현       |
| Kanban             |   O    |   O   |   L    |  L  | DnD 상태머신                                   |
| StatsGrid          |   O    |   O   |   S    |  S  |                                                |
| ActionBar          |   —    |   O   |   M    |  M  |                                                |
| FormBuilder        |   O    |   O   |   L    |  L  | 스키마 주도 폼 — runtime/valibot 결합          |
| InfiniteList       |   O    |   O   |   L    |  M  |                                                |
| VirtualList        |   O    |   O   |   L    |  M  |                                                |
| ChartCard          |   —    |   O   |   M    |  M  |                                                |
| NotificationCenter |   —    |   O   |   M    |  M  |                                                |
| SortableList       |   —    |   O   |   L    |  L  | DnD 재정렬                                     |
| RichTextEditor     |   O    |   O   |   L    |  L  | contentEditable 상태머신 — 전체 중 최고 난도   |
| SecurityChecklist  |   O    |   O   |   M    |  M  |                                                |
| LoginForm          |   O    |   O   |   M    |  M  |                                                |
| Tour               |   O    |   O   |   M    |  M  | 타깃 측정+오버레이 포지셔닝                    |
| FlowDiagram        |   O    |   O   |   L    |  L  |                                                |
| Starfield          |   —    |   O   |   M    |  M  | canvas 애니메이션 — 장식용, 이식 우선순위 낮음 |
| MasonryGrid        |   O    |   O   |   M    |  M  |                                                |
| FormWizard         |   O    |   O   |   M    |  M  | 다단계 상태 + useWizard                        |
| FormArray          |   O    |   O   |   M    |  M  |                                                |
| Form               |   O    |   O   |   M    |  M  | 컨텍스트 기반 폼 상태                          |
| AuthLayout         |   —    |   —   |   S    |  S  |                                                |
| SettingsLayout     |   —    |   —   |   S    |  S  |                                                |
| PricingPage        |   —    |   —   |   M    |  M  |                                                |
| GanttChart         |   —    |   —   |   L    |  L  |                                                |
| HeroSection        |   —    |   —   |   S    |  S  |                                                |
| FeatureGrid        |   —    |   —   |   S    |  S  |                                                |
| FAQ                |   —    |   —   |   M    |  M  |                                                |
| BlogPost           |   —    |   —   |   M    |  M  |                                                |
| BookReader         |   —    |   —   |   L    |  L  |                                                |
| SocialFeed         |   —    |   —   |   M    |  M  |                                                |
| PhotoAlbum         |   —    |   —   |   M    |  M  |                                                |
| ChatThread         |   —    |   —   |   M    |  M  |                                                |
| CalendarMonth      |   —    |   —   |   M    |  M  |                                                |
| EmailInbox         |   —    |   —   |   L    |  L  |                                                |
| ForumThread        |   —    |   —   |   M    |  M  |                                                |
| OnboardingTour     |   —    |   —   |   M    |  M  | Tour 변형                                      |

소계: 43개 중 갤러리 17 · USAGE 22 · 양쪽 모두 부재 21

### finance — 86 컴포넌트 + 131 lib export (요약)

finance는 UI와 도메인 로직(모의 데이터·세금 계산·실시간 틱 스토어)이 한 배럴에 혼재한다. 재구축 시 **패키지 분리 대상**이므로 개별 행 대신 그룹 요약으로 기록한다.

| 그룹               | 개수 | 대표                                                                                  | 바닐라 | iOS | 비고                                                           |
| ------------------ | ---: | ------------------------------------------------------------------------------------- | :----: | :-: | -------------------------------------------------------------- |
| Live\* 실시간 계열 |   15 | LiveOrderBook, LiveStockTable, LiveTicker, LivePrice                                  |   L    |  L  | 틱 구독 스토어(lib/livePrices) 결합 — 상태 계층 분리 선행 필요 |
| 차트               |   12 | CandleChart, RealCandleChart, MarketHeatmap, InvestorFlowChart, DonutChart, Sparkline |   L    |  L  | 캔들/히트맵은 Swift Charts로도 커스텀 드로잉 필요              |
| 도메인 패널/카드   |  ~40 | ConsensusScreener, BacktestRunner, TradeJournal, PortfolioCouncil, FXBoard            |  M~L   | M~L | lib/\* 로직 의존 — 로직은 언어 중립 포팅 가능                  |
| 앱 셸/내비         |  ~12 | AppHeader, BottomNav, Sidebar, TopBar, PageShell, StockTopBar                         |   M    |  M  |                                                                |
| 소형 배지/유틸     |   ~7 | PriceBadge, HotPctChip, DisclosureToneBadge, SegmentedPill                            |   S    |  S  |                                                                |
| lib (비 UI)        |  131 | format, tax, marketHolidays, consensus, backtest, positions                           |   —    |  —  | 순수 로직 — TS→Swift 이식 가능, UI 난이도 산정 제외            |
| lazy 차트 래퍼     |    6 | LazyCandleChart 등                                                                    |   —    |  —  | React.lazy 웹 전용 패턴                                        |

갤러리의 금융 스펙(OrderBook(호가창), TickerTape, Watchlist(관심종목), CandlestickChart, FearGreedGauge, PortfolioDonut, StockQuote, OrderPanel 등)은 finance export명과 1:1 매칭되지 않는 **데모 전용 재구현**이다.

### 기타 계층 (tokens / providers / runtime / utils / auth)

| 계층      | value export | 내용                                                                                                                             | 재구축 관점                                         |
| --------- | -----------: | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| tokens    |           24 | colors·typography·spacing·shadows·radius·animation·zIndex·themes(프리셋/generateTheme)·breakpoints·opacity·borderWidth·gradients | 바닐라의 1차 산출물(CSS 변수화) — 난이도 S          |
| providers |           12 | ThemeProvider, I18nProvider(+en/ja/zh 로케일), BrandProvider                                                                     | 바닐라=DOM 속성+스토어, iOS=Environment             |
| runtime   |           19 | PageDoc 스키마 파서(valibot), 바인딩 평가기, 액션 러너, 레지스트리, Renderer                                                     | 서버 주도 UI 렌더러 — 별도 트랙 (난이도 L)          |
| utils     |            9 | cn, Slot/Slottable, createCompound, polymorphic, raceGuard, contrast(WCAG), zodAdapter                                           | contrast/raceGuard는 언어 중립, Slot류는 React 전용 |
| auth      |            4 | JunDSProvider, useJunDS, useLicenseStatus, withLicense                                                                           | 라이선스 게이트 — 정책 결정 후 이식                 |

## 4. hooks → Behavior 매핑 (62개)

바닐라 규약: `createXxx(element, options): { update?, destroy }` 또는 순수 유틸. 순수 상태 훅은 "N/A — 컴포넌트 내부화".

| Hook                      | USAGE | 바닐라 Behavior API                                                       | iOS 등가물                                                                  |
| ------------------------- | :---: | ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| useBreakpoint             |   O   | createBreakpointObserver(options): { get, subscribe, destroy }            | UITraitCollection.horizontalSizeClass / @Environment(\.horizontalSizeClass) |
| useBreakpointValue        |   —   | 위 observer + resolveBreakpointValue(map) 유틸                            | 동일 (size class 분기)                                                      |
| useClickOutside           |   O   | createClickOutside(element, onOutside): { destroy }                       | N/A — 시트/팝오버가 시스템 dismiss 처리                                     |
| useClipboard              |   —   | copyText(text): Promise<boolean> 유틸 (copied 상태는 컴포넌트 내부화)     | UIPasteboard.general                                                        |
| useCopyToClipboard        |   O   | copyText와 통합 (중복 훅)                                                 | UIPasteboard.general                                                        |
| useCountUp                |   —   | createCountUp(element, options): { update, destroy }                      | TimelineView / CADisplayLink                                                |
| useDebounce               |   O   | debounce(fn, ms) 순수 유틸                                                | Combine .debounce / Task.sleep                                              |
| useDisclosure             |   O   | N/A — 컴포넌트 내부화 (open 상태)                                         | @State                                                                      |
| useElementSize            |   O   | createSizeObserver(element, cb): { destroy } (ResizeObserver)             | GeometryReader / viewDidLayoutSubviews                                      |
| useEventListener          |   O   | on(target, type, fn): off 유틸                                            | target-action / NotificationCenter                                          |
| useFocusMode              |   —   | createFocusMode(root, options): { toggle, destroy }                       | 커스텀 (몰입 모드 상태)                                                     |
| useForm                   |   O   | createForm(formEl, rules): { validate, values, reset, destroy }           | 자체 폼 모델 (@Observable)                                                  |
| useIdle                   |   —   | createIdleWatcher(options): { subscribe, destroy }                        | 사용자 이벤트 후킹 커스텀                                                   |
| useIntersectionObserver   |   O   | createInViewObserver(element, options): { destroy }                       | onAppear / willDisplay                                                      |
| useInterval               |   O   | createInterval(fn, ms): { stop } 유틸                                     | Timer.scheduledTimer                                                        |
| useKeyboard               |   O   | createKeyHandler(element, map): { destroy }                               | UIKeyCommand / onKeyPress                                                   |
| useLocalStorage           |   —   | createStoredValue(key, initial): { get, set, subscribe }                  | @AppStorage / UserDefaults                                                  |
| useLongPress              |   O   | createLongPress(element, options): { destroy }                            | UILongPressGestureRecognizer                                                |
| useMediaQuery             |   O   | createMediaQueryWatcher(query): { matches, subscribe, destroy }           | UITraitCollection / @Environment                                            |
| useMounted                |   —   | N/A — React 렌더 수명 개념, 바닐라 무의미                                 | N/A                                                                         |
| useNetworkStatus          |   —   | createNetworkWatcher(): { status, subscribe, destroy }                    | NWPathMonitor                                                               |
| usePanelResize            |   —   | createPanelResize(handle, panel, options): { destroy }                    | 커스텀 팬 제스처                                                            |
| usePrefersColorScheme     |   —   | createColorSchemeWatcher(): { scheme, subscribe, destroy }                | @Environment(\.colorScheme)                                                 |
| usePrevious               |   O   | N/A — 컴포넌트 내부화                                                     | N/A                                                                         |
| useReducedMotion          |   O   | createReducedMotionWatcher(): { subscribe, destroy }                      | UIAccessibility.isReduceMotionEnabled                                       |
| useScrollSpy              |   O   | createScrollSpy(sections, options): { active, subscribe, destroy }        | UIScrollViewDelegate 오프셋 판정                                            |
| useSteps                  |   O   | N/A — 순수 상태 훅, 컴포넌트 내부화                                       | @State / Observable                                                         |
| useThrottle               |   O   | throttle(fn, ms) 순수 유틸                                                | Combine .throttle                                                           |
| useToggle                 |   —   | N/A — 순수 상태 훅                                                        | @State                                                                      |
| useWindowScroll           |   —   | createScrollWatcher(window): { position, subscribe, destroy }             | UIScrollViewDelegate                                                        |
| useHotkeys                |   —   | createHotkeys(map, options): { destroy }                                  | UIKeyCommand                                                                |
| useFocusTrap              |   O   | createFocusTrap(container, options): { activate, deactivate, destroy }    | N/A — accessibilityViewIsModal이 시스템 처리                                |
| useScrollLock             |   —   | lockScroll(): unlock 유틸                                                 | isScrollEnabled = false                                                     |
| useDocumentTitle          |   —   | setDocumentTitle(title, options) 유틸                                     | navigationItem.title                                                        |
| useFavicon                |   —   | setFavicon(href) 유틸                                                     | N/A — 웹 전용                                                               |
| useFullscreen             |   —   | createFullscreen(element): { enter, exit, destroy }                       | fullScreenCover / present                                                   |
| useResizeObserver         |   —   | createSizeObserver와 통합                                                 | GeometryReader                                                              |
| useTimeout                |   O   | createTimeout(fn, ms): { clear } 유틸                                     | Task.sleep / asyncAfter                                                     |
| useAsync                  |   —   | N/A — 상태 훅 (필요 시 runTask(fn, callbacks) 유틸)                       | Task + async/await                                                          |
| useIsomorphicLayoutEffect |   —   | N/A — React SSR 전용 개념                                                 | N/A                                                                         |
| useUpdateEffect           |   —   | N/A — React 전용 개념                                                     | N/A                                                                         |
| useGeolocation            |   —   | createGeolocationWatcher(options): { subscribe, destroy }                 | CLLocationManager                                                           |
| useSessionStorage         |   O   | createStoredValue(storage: session) 변형                                  | 메모리 캐시                                                                 |
| useCookie                 |   —   | cookie get/set 유틸                                                       | HTTPCookieStorage                                                           |
| useHover                  |   —   | createHoverWatcher(element): { subscribe, destroy }                       | UIHoverGestureRecognizer (iPad)                                             |
| useFocusVisible           |   —   | createFocusVisible(element): { destroy }                                  | N/A — 포커스링 개념 없음                                                    |
| useInfiniteFeed           |   —   | createInfiniteFeed(container, loadMore): { destroy }                      | prefetching DataSource                                                      |
| useReadingProgress        |   —   | createReadingProgress(article, cb): { destroy }                           | UIScrollViewDelegate 비율 계산                                              |
| useImagePreload           |   —   | preloadImages(urls): Promise 유틸                                         | URLSession / Kingfisher prefetch                                            |
| useResource               |   —   | createResource(key, fetcher): { read, invalidate, subscribe } 캐시 스토어 | 자체 캐시 레이어 (actor)                                                    |
| useMutation               |   —   | runMutation(fn, callbacks) 유틸 (상태 내부화)                             | Task                                                                        |
| useOptimisticState        |   —   | N/A — 상태 패턴, 스토어 계층으로 내부화                                   | Observable 패턴                                                             |
| useAnimationFrame         |   —   | createRafLoop(cb): { start, stop }                                        | CADisplayLink                                                               |
| useKeyboardShortcut       |   —   | createHotkeys와 통합 (중복 훅)                                            | UIKeyCommand                                                                |
| useWindowSize             |   O   | createWindowSizeWatcher(): { size, subscribe, destroy }                   | GeometryReader / windowScene                                                |

| useCodeCopy | — | enhanceCodeBlocks(root, options): { destroy } | N/A — 웹 DOM 보강 전용 |
| useJsonLd | — | setJsonLd(key, data): { destroy } 유틸 | N/A — 웹 SEO 전용 |
| useRevealOnScroll | — | createRevealObserver(root, options): { destroy } | .onAppear + withAnimation |
| useDominantColor | — | extractDominantColor(src): Promise<{tint, deep}> 유틸 | UIImage 평균색 / CIAreaAverage |
| useAudioPlayer | — | createAudioPlayer(el, tracks): { play, toggle, seek, subscribe, destroy } | AVAudioPlayer / AVQueuePlayer |
| useSeo | — | applySeo(options): { restore } 유틸 | N/A — 웹 전용 |

| useUrlFilters | — | createUrlFilters(defaults, opts): { get, set, reset, subscribe, destroy } | N/A — 웹 URL 상태 전용 |

집계: 62개 중 바닐라 Behavior/유틸로 존속 51 · N/A(내부화/React 전용) 11.
(myself-migration 1차 6건 + 2차 1건 추가 — 존속 5 · N/A 2)

중복 통합 후보: useClipboard=useCopyToClipboard, useHotkeys=useKeyboardShortcut, useElementSize=useResizeObserver, useBreakpoint 계열=useMediaQuery 파생.

## 5. 갤러리 vs 라이브러리 gap (이후 문서화 대상)

라이브러리에 존재하지만 갤러리 스펙(정규화)과 USAGE 어디에도 없는 컴포넌트/훅. **총 105개 컴포넌트 + 27개 훅**.

| 카테고리   | 개수 | 목록                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ---: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| core       |    6 | CoreDivider, CoreProvider, GridLayout, Group, Page, Section                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| layout     |    7 | AppShell, Wrap, Show, Hide, AspectRatioBox, Overlay, LayoutDivider                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| primitives |    9 | AnnouncerProvider, Mark, BookmarkButton, LikeButton, FollowButton, MentionChip, Hashtag, Motion, KeyCap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| composites |   62 | DsToastProvider, ProgressBar, ProgressSteps, PageHeader, AnnouncementBar, ThinkingIndicator, CookieConsent, MonthPicker, YearPicker, Stat, Blockquote, LoadingButton, LoadingScreen, OfflineIndicator, Hint, SocialShare, EmojiReaction, OnlineStatus, RadioCardGroup, CheckboxCardGroup, TextareaAutosize, PasswordStrength, ScrollProgress, TableOfContents, BarChart, PieChart, TestimonialCard, LogoCloud, Newsletter, CTASection, ProductCard, CartItem, QuantitySelector, PriceDisplay, RadarChart, ScatterPlot, SankeyDiagram, BookShelf, ReadingProgress, ChapterList, ReadingStats, BookCover, ReadingGoal, AnnotationNote, BookRating, PhotoCard, PhotoGrid, PhotoLightbox, PhotoCarousel, ImageCompare, ImageZoom, ExifPanel, PhotoFilters, PhotoUploader, ImageWithFallback, PostCard, ProfileHeader, StoryCircle, ReactionPicker, PollCard, BrandSwitcher, SearchBar |
| patterns   |   21 | DsSidebarProvider, DsSidebar, SidebarLink, SidebarSection, DsCalendar, AuthLayout, SettingsLayout, PricingPage, GanttChart, HeroSection, FeatureGrid, FAQ, BlogPost, BookReader, SocialFeed, PhotoAlbum, ChatThread, CalendarMonth, EmailInbox, ForumThread, OnboardingTour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| hooks      |   27 | useBreakpointValue, useClipboard, useFocusMode, useMounted, usePanelResize, usePrefersColorScheme, useWindowScroll, useHotkeys, useScrollLock, useDocumentTitle, useFavicon, useFullscreen, useResizeObserver, useAsync, useIsomorphicLayoutEffect, useUpdateEffect, useGeolocation, useCookie, useFocusVisible, useInfiniteFeed, useReadingProgress, useImagePreload, useResource, useMutation, useOptimisticState, useAnimationFrame, useKeyboardShortcut                                                                                                                                                                                                                                                                                                                                                                                                                       |

관찰: gap의 최대 덩어리는 composites의 도메인 시리즈(Book* 8, Photo/Image* 10, 소셜 7, 커머스/마케팅 9, 차트 4)와 patterns의 페이지 템플릿(21개 중 대부분)이다. 즉 **범용 코어는 문서화가 거의 완료**됐고, 미문서 영역은 도메인 특화 층에 집중 — 재구축 스코프 결정(코어만 vs 도메인 포함)과 직결된다. 역방향 특이점: USAGE 키 "Calendar"는 라이브러리 export명이 아니다(실제 export는 DsCalendar) — 재구축 시 명명 정합 필요. finance 86개는 전량 갤러리/USAGE 부재(데모 재구현만 존재).

## 6. 리스크 — 이식이 특히 어려운 상위 10

| #   | 컴포넌트                                                                                                           | 이유                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| 1   | RichTextEditor                                                                                                     | contentEditable 편집 상태머신 + 셀렉션/커맨드 동기화. 바닐라·iOS 모두 최고 난도                |
| 2   | DataGrid / DataTable                                                                                               | 가상화·정렬·선택·밀도 모드가 결합된 복합 상태. Table까지 3중 구현 존재 — 통합 재설계 필요      |
| 3   | 차트군 20+종 (Line/Bar/Pie/Area/Radar/Scatter/Sankey/Treemap/Funnel/Gauge/Heatmap/Globe/Gantt/Flow + finance 캔들) | SVG/캔버스 드로잉 전면 재구현. iOS는 Swift Charts로 일부 강등되나 Sankey/Treemap/캔들은 커스텀 |
| 4   | finance Live\* 실시간 계열                                                                                         | UI가 틱 구독 스토어(livePrices 등 클라 상태)와 강결합 — 상태 계층을 먼저 분리해야 이식 가능    |
| 5   | CodeEditor / MarkdownViewer / DiffViewer                                                                           | 파싱+하이라이트+스크롤 동기화. 자체 구현 시 토크나이저부터                                     |
| 6   | Kanban / SortableList / Transfer                                                                                   | 드래그 앤 드롭 상태머신 + 접근성(키보드 DnD)                                                   |
| 7   | CommandPalette                                                                                                     | 퍼지 검색+포커스 트랩+키보드 내비+포털의 결합체                                                |
| 8   | DsCalendar / CalendarMonth / DateRangePicker                                                                       | 날짜 연산·로케일·이벤트 배치 — 라이브러리 없이 전부 자체 구현                                  |
| 9   | Form / FormBuilder / FormWizard + runtime(PageDoc Renderer)                                                        | 스키마 주도 폼과 valibot 제거가 맞물림. Renderer는 사실상 미니 프레임워크                      |
| 10  | ImageCropper / SignaturePad / ColorPicker                                                                          | 포인터 지오메트리+캔버스. iOS는 PencilKit/네이티브 픽커로 일부 대체                            |

횡단 리스크: (1) cn() 273개 파일 = Tailwind 체계 탈피가 컴포넌트 수보다 큰 작업량, (2) core/layout/primitives의 Divider·Grid·AspectRatio 등 삼중복 명명 — 재구축 전 단일화 결정 필요, (3) SSG 헤드리스 렌더 제약(갤러리 운영 경험상 render 단계 브라우저 API 금지)이 바닐라 API 설계에도 동일 적용.
