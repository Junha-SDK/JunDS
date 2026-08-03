# junDS — 디자인 시스템 컴포넌트 레퍼런스

> 이 문서는 `.ai/props.json`과 컴포넌트 소스의 JSDoc을 토대로 자동 생성됩니다.
> **수정하지 마세요.** 컴포넌트 props를 변경하면 `npm run extract-props && npm run docs:components`를 실행하세요.

총 **295개** 컴포넌트 — Primitives 48 · Composites 188 · Patterns 40.

## 목차

- [사용법](#사용법)
- [유틸리티](#유틸리티)
- [공용 Hooks](#공용-hooks)
- [Primitives](#primitives)
  - [AspectRatio](#aspectratio)
  - [Avatar](#avatar)
  - [BackTop](#backtop)
  - [Badge](#badge)
  - [BatteryIndicator](#batteryindicator)
  - [BookmarkButton](#bookmarkbutton)
  - [Button](#button)
  - [Checkbox](#checkbox)
  - [Code](#code)
  - [CopyButton](#copybutton)
  - [CurrencyInput](#currencyinput)
  - [Divider](#divider)
  - [ErrorBoundary](#errorboundary)
  - [FileUpload](#fileupload)
  - [FocusGuard](#focusguard)
  - [FollowButton](#followbutton)
  - [Hashtag](#hashtag)
  - [Highlight](#highlight)
  - [Icon](#icon)
  - [IconButton](#iconbutton)
  - [Image](#image)
  - [Input](#input)
  - [Kbd](#kbd)
  - [KeyCap](#keycap)
  - [Label](#label)
  - [LikeButton](#likebutton)
  - [Link](#link)
  - [Mark](#mark)
  - [MentionChip](#mentionchip)
  - [Motion](#motion)
  - [NumberFormatter](#numberformatter)
  - [NumberInput](#numberinput)
  - [OTPInput](#otpinput)
  - [PasswordInput](#passwordinput)
  - [PhoneInput](#phoneinput)
  - [PinInput](#pininput)
  - [Portal](#portal)
  - [RangeSlider](#rangeslider)
  - [ScrollArea](#scrollarea)
  - [SeverityBadge](#severitybadge)
  - [Slider](#slider)
  - [Spinner](#spinner)
  - [StarRating](#starrating)
  - [StatusDot](#statusdot)
  - [Switch](#switch)
  - [Tag](#tag)
  - [Textarea](#textarea)
  - [Toggle](#toggle)
- [Composites](#composites)
  - [Accordion](#accordion)
  - [ActionSheet](#actionsheet)
  - [AddressInput](#addressinput)
  - [Affix](#affix)
  - [AlbumArt](#albumart)
  - [Alert](#alert)
  - [AlertDialog](#alertdialog)
  - [AnimatedCounter](#animatedcounter)
  - [AnnotationNote](#annotationnote)
  - [AnnouncementBar](#announcementbar)
  - [AreaChart](#areachart)
  - [AudioPlayer](#audioplayer)
  - [AutoComplete](#autocomplete)
  - [AutoHideHeader](#autohideheader)
  - [AutoPlayDemo](#autoplaydemo)
  - [AvatarStack](#avatarstack)
  - [Banner](#banner)
  - [BarChart](#barchart)
  - [BentoGrid](#bentogrid)
  - [Blockquote](#blockquote)
  - [BookCard](#bookcard)
  - [BookCover](#bookcover)
  - [BookRating](#bookrating)
  - [BookShelf](#bookshelf)
  - [BottomSheet](#bottomsheet)
  - [BrandSwitcher](#brandswitcher)
  - [Breadcrumb](#breadcrumb)
  - [ButtonGroup](#buttongroup)
  - [Callout](#callout)
  - [Card](#card)
  - [Carousel](#carousel)
  - [CartItem](#cartitem)
  - [ChapterList](#chapterlist)
  - [ChatBubble](#chatbubble)
  - [CheckboxCardGroup](#checkboxcardgroup)
  - [Clock](#clock)
  - [CodeEditor](#codeeditor)
  - [Collapsible](#collapsible)
  - [CollectionView](#collectionview)
  - [ColorPicker](#colorpicker)
  - [ColorSwatch](#colorswatch)
  - [Combobox](#combobox)
  - [CommentThread](#commentthread)
  - [CompareSlider](#compareslider)
  - [ComparisonGrid](#comparisongrid)
  - [ComponentShowcase](#componentshowcase)
  - [Confetti](#confetti)
  - [ConfirmDialog](#confirmdialog)
  - [ContextMenu](#contextmenu)
  - [CookieConsent](#cookieconsent)
  - [CopyBlock](#copyblock)
  - [Countdown](#countdown)
  - [CronExpression](#cronexpression)
  - [CTASection](#ctasection)
  - [DataGrid](#datagrid)
  - [DateInput](#dateinput)
  - [DateRangeFilter](#daterangefilter)
  - [DateRangePicker](#daterangepicker)
  - [Descriptions](#descriptions)
  - [DetailPanel](#detailpanel)
  - [DiffViewer](#diffviewer)
  - [Disclosure](#disclosure)
  - [Dock](#dock)
  - [DocPager](#docpager)
  - [Drawer](#drawer)
  - [Dropdown](#dropdown)
  - [EmojiPicker](#emojipicker)
  - [EmojiReaction](#emojireaction)
  - [EmptyState](#emptystate)
  - [ExifPanel](#exifpanel)
  - [FilterButtonGroup](#filterbuttongroup)
  - [FloatingActionButton](#floatingactionbutton)
  - [FormField](#formfield)
  - [FunnelChart](#funnelchart)
  - [GaugeChart](#gaugechart)
  - [Globe](#globe)
  - [GradientBorder](#gradientborder)
  - [Heatmap](#heatmap)
  - [Hint](#hint)
  - [HoverCard](#hovercard)
  - [ImageCompare](#imagecompare)
  - [ImageCropper](#imagecropper)
  - [ImageLightbox](#imagelightbox)
  - [ImageWithFallback](#imagewithfallback)
  - [ImageZoom](#imagezoom)
  - [InlineEdit](#inlineedit)
  - [JSONViewer](#jsonviewer)
  - [KeyValueGrid](#keyvaluegrid)
  - [LineChart](#linechart)
  - [LoadingButton](#loadingbutton)
  - [LoadingOverlay](#loadingoverlay)
  - [LoadingScreen](#loadingscreen)
  - [LogoCloud](#logocloud)
  - [MarkdownViewer](#markdownviewer)
  - [Marquee](#marquee)
  - [Mention](#mention)
  - [Menubar](#menubar)
  - [MetricCard](#metriccard)
  - [MiniChart](#minichart)
  - [Modal](#modal)
  - [MonthPicker](#monthpicker)
  - [MultiSelect](#multiselect)
  - [NavigationMenu](#navigationmenu)
  - [Newsletter](#newsletter)
  - [Notification](#notification)
  - [NowPlayingBar](#nowplayingbar)
  - [OfflineIndicator](#offlineindicator)
  - [Onboarding](#onboarding)
  - [OnlineStatus](#onlinestatus)
  - [PageHeader](#pageheader)
  - [Pagination](#pagination)
  - [PasswordStrength](#passwordstrength)
  - [PhotoCard](#photocard)
  - [PhotoCarousel](#photocarousel)
  - [PhotoFilters](#photofilters)
  - [PhotoGrid](#photogrid)
  - [PhotoLightbox](#photolightbox)
  - [PhotoUploader](#photouploader)
  - [PieChart](#piechart)
  - [PollCard](#pollcard)
  - [Popover](#popover)
  - [PostCard](#postcard)
  - [PriceDisplay](#pricedisplay)
  - [PricingTable](#pricingtable)
  - [ProductCard](#productcard)
  - [ProfileHeader](#profileheader)
  - [ProgressRing](#progressring)
  - [ProjectCard](#projectcard)
  - [PullToRefresh](#pulltorefresh)
  - [QRCode](#qrcode)
  - [QuantitySelector](#quantityselector)
  - [RadarChart](#radarchart)
  - [RadioCardGroup](#radiocardgroup)
  - [Rating](#rating)
  - [ReactionPicker](#reactionpicker)
  - [ReadingGoal](#readinggoal)
  - [ReadingProgress](#readingprogress)
  - [ReadingStats](#readingstats)
  - [ReadingTime](#readingtime)
  - [Resizable](#resizable)
  - [Result](#result)
  - [SankeyDiagram](#sankeydiagram)
  - [ScatterPlot](#scatterplot)
  - [ScreenshotGrid](#screenshotgrid)
  - [ScrollProgress](#scrollprogress)
  - [ScrollSpy](#scrollspy)
  - [SearchBar](#searchbar)
  - [SearchInput](#searchinput)
  - [SecurityBadge](#securitybadge)
  - [SegmentedControl](#segmentedcontrol)
  - [Select](#select)
  - [Sheet](#sheet)
  - [SignaturePad](#signaturepad)
  - [Skeleton](#skeleton)
  - [SkeletonPreset](#skeletonpreset)
  - [Snackbar](#snackbar)
  - [SocialShare](#socialshare)
  - [SplitPane](#splitpane)
  - [SpoilerBlock](#spoilerblock)
  - [Spotlight](#spotlight)
  - [SpotlightCard](#spotlightcard)
  - [Stat](#stat)
  - [StatCard](#statcard)
  - [Stepper](#stepper)
  - [Sticky](#sticky)
  - [StoryCircle](#storycircle)
  - [SwipeAction](#swipeaction)
  - [Table](#table)
  - [TableOfContents](#tableofcontents)
  - [Tabs](#tabs)
  - [TagInput](#taginput)
  - [TestimonialCard](#testimonialcard)
  - [TextareaAutosize](#textareaautosize)
  - [ThinkingIndicator](#thinkingindicator)
  - [Timeline](#timeline)
  - [TimePicker](#timepicker)
  - [Tooltip](#tooltip)
  - [Transfer](#transfer)
  - [TreemapChart](#treemapchart)
  - [TreeNav](#treenav)
  - [TreeView](#treeview)
  - [TrustIndicator](#trustindicator)
  - [Typewriter](#typewriter)
  - [VideoPlayer](#videoplayer)
  - [VirtualScroll](#virtualscroll)
  - [Watermark](#watermark)
  - [Waveform](#waveform)
  - [YearPicker](#yearpicker)
- [Patterns](#patterns)
  - [ActionBar](#actionbar)
  - [AuthLayout](#authlayout)
  - [BlogPost](#blogpost)
  - [BookReader](#bookreader)
  - [Calendar](#calendar)
  - [CalendarMonth](#calendarmonth)
  - [ChartCard](#chartcard)
  - [ChatThread](#chatthread)
  - [CommandPalette](#commandpalette)
  - [DataTable](#datatable)
  - [EmailInbox](#emailinbox)
  - [FAQ](#faq)
  - [FeatureGrid](#featuregrid)
  - [FilterBar](#filterbar)
  - [FlowDiagram](#flowdiagram)
  - [Form](#form)
  - [FormArray](#formarray)
  - [FormBuilder](#formbuilder)
  - [FormWizard](#formwizard)
  - [ForumThread](#forumthread)
  - [GanttChart](#ganttchart)
  - [HeroSection](#herosection)
  - [InfiniteList](#infinitelist)
  - [Kanban](#kanban)
  - [LoginForm](#loginform)
  - [MasonryGrid](#masonrygrid)
  - [NotificationCenter](#notificationcenter)
  - [OnboardingTour](#onboardingtour)
  - [PhotoAlbum](#photoalbum)
  - [PricingPage](#pricingpage)
  - [RichTextEditor](#richtexteditor)
  - [SecurityChecklist](#securitychecklist)
  - [SettingsLayout](#settingslayout)
  - [Sidebar](#sidebar)
  - [SocialFeed](#socialfeed)
  - [SortableList](#sortablelist)
  - [Starfield](#starfield)
  - [StatsGrid](#statsgrid)
  - [Tour](#tour)
  - [VirtualList](#virtuallist)

## 사용법

```tsx
// 개별 import (권장 — 트리쉐이킹)
import { Button } from "@/ds/primitives/Button";
import { Modal } from "@/ds/composites/Modal";
import { DataTable } from "@/ds/patterns/DataTable";

// barrel import
import { Button, Modal, DataTable } from "@/ds";
```

## 유틸리티

| 이름 | 경로 | 설명 |
|------|------|------|
| `cn()` | `@/ds/utils/cn` | clsx + twMerge. 조건부 클래스 병합 |

## 공용 Hooks

모든 hook은 `@/ds/hooks`에서 import. 자세한 시그니처는 소스의 JSDoc을 참고하세요.

| Hook | Description |
|------|-------------|
| `useAnimationFrame` |  |
| `useAsync` | Promise 호출 상태 관리 + 마지막 호출만 반영하는 race-condition 가드. |
| `useAudioPlayer` | 재생 목록 하나를 굴리는 오디오 재생 엔진 훅. |
| `useBreakpoint` | 현재 브레이크포인트 감지 훅 |
| `useBreakpointValue` |  |
| `useClickOutside` | ref 외부 클릭 감지 |
| `useClipboard` | 클립보드 읽기/쓰기 훅 |
| `useCodeCopy` | 이미 커밋된 DOM 안의 코드 블록마다 "복사" 버튼을 주입하는 훅. |
| `useCookie` | 쿠키 read/write 훅 (consent storage, locale, theme 등). |
| `useCopyToClipboard` | 클립보드 복사 훅 |
| `useCountUp` | 숫자 카운트업 애니메이션 훅 |
| `useDebounce` | 디바운스 훅 — 값 변경을 지연시킵니다 |
| `useDisclosure` | open/close 상태 관리 (모달, 드로어 등) |
| `useDocumentTitle` | document.title 동기화. |
| `useDominantColor` | 이미지에서 대표색 한 쌍(밝은 `tint` / 어두운 `deep`)을 뽑아내는 훅. |
| `useElementSize` |  |
| `useEventListener` |  |
| `useFavicon` | favicon 동적 변경 (status badge / unread count 표시 용도). |
| `useFocusMode` | 포커스 모드(사이드바·목차를 숨기고 본문에만 집중) 상태 관리 훅. |
| `useFocusTrap` | Tab/Shift+Tab을 컨테이너 내부에 가두는 포커스 트랩. |
| `useFocusVisible` | 키보드 사용자 여부 추적 (CSS :focus-visible 폴리필 보조). |
| `useForm` |  |
| `useFullscreen` | Fullscreen API 래퍼 (특정 element 또는 document 단위). |
| `useGeolocation` | 브라우저 Geolocation API 래퍼 (1회 조회 또는 watch). |
| `useHotkeys` | 키보드 단축키 (콤보 지원: "mod+k", "shift+?", "ctrl+alt+l"). |
| `useHover` | 요소 hover 상태 추적 (CSS :hover로 안 되는 React 분기에 사용). |
| `useIdle` |  |
| `useImagePreload` | 이미지 URL 배열을 백그라운드에서 미리 로드한다. 라이트박스 prev/next 등에서 |
| `useInfiniteFeed` | 무한 피드 훅 — cursor 기반 페이지네이션 + 중복 dedupe + 동시 호출 가드. |
| `useIntersectionObserver` |  |
| `useInterval` |  |
| `useIsomorphicLayoutEffect` | SSR-safe layout effect (서버에서는 useEffect, 브라우저에서는 useLayoutEffect). |
| `useJsonLd` | schema.org JSON-LD 를 `<head>` 에 주입하고 언마운트 시 제거하는 훅. |
| `useKeyboard` | 키보드 단축키 바인딩 |
| `useKeyboardShortcut` | 키보드 단축키 등록. "Cmd+K"는 Mac에서 ⌘K, Windows에서 Ctrl+K로 자동 매핑. |
| `useLocalStorage` | localStorage 동기화 상태 훅 |
| `useLongPress` |  |
| `useMediaQuery` | 미디어 쿼리 매칭 상태 반환 |
| `useMounted` |  |
| `useMutation` |  |
| `useNetworkStatus` |  |
| `useOptimisticState` |  |
| `usePanelResize` | 패널 리사이즈 훅 |
| `usePrefersColorScheme` |  |
| `usePrevious` |  |
| `useReadingProgress` | 글 읽기 진행률 + 현재 보이는 헤딩 추적. |
| `useReducedMotion` | prefers-reduced-motion 감지 |
| `useResizeObserver` | ResizeObserver 기반 요소 크기 추적 (border-box 기준). |
| `useResource` | 외부에서 캐시 무효화. 같은 key의 모든 구독자가 재검증 트리거. |
| `useRevealOnScroll` | 스크롤 진입 시 자식 요소에 `is-visible` 클래스를 붙여 주는 훅. |
| `useScrollLock` | body 스크롤을 잠금. Modal/Drawer/Lightbox 등에서 사용. |
| `useScrollSpy` | 스크롤 위치 기반 활성 섹션 감지 훅 |
| `useSeo` | 페이지 단위 SEO 메타태그를 `<head>` 에 반영하는 훅. |
| `useSessionStorage` | sessionStorage 동기화 훅 (탭 단위 영속). |
| `useSteps` |  |
| `useThrottle` |  |
| `useTimeout` | setTimeout의 React-friendly 버전. callback이 stale 되지 않음. |
| `useToggle` | 불린 토글 훅 |
| `useUpdateEffect` | useEffect와 동일하나 마운트 시점은 건너뛰고 deps 갱신부터 동작. |
| `useWindowScroll` |  |
| `useWindowSize` | 현재 window 크기. SSR-safe (마운트 전에는 0/0). resize 이벤트로 자동 갱신. |

## Primitives

### AspectRatio

*stable* · *v2.2.0* — `layout`

종횡비 유지 컨테이너

**Import:** `import { AspectRatio } from "@/ds/primitives/AspectRatio";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `ratio` | `number` |  | 가로:세로 비율 (기본값 16/9) |
| `children` | `ReactNode` | ✓ | 자식 요소 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<AspectRatio ratio={16 / 9}>
  <img src="/photo.jpg" className="object-cover w-full h-full" />
</AspectRatio>
<AspectRatio ratio={1}>
  <div>정사각형</div>
</AspectRatio>
```

---

### Avatar

*stable* · *v2.2.0* — `data-display`

아바타 컴포넌트

**Import:** `import { Avatar } from "@/ds/primitives/Avatar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `name` | `string` |  | 이름 (이니셜 자동 추출) |
| `src` | `string` |  | 이미지 URL |
| `size` | `AvatarSize` |  | 아바타 크기 |
| `status` | `"online" \| "offline" \| "away" \| "busy"` |  | 온라인/오프라인 상태 점 |

**Example**

```tsx
<Avatar name="김준하" size="md" status="online" />
<Avatar src="/photo.jpg" size="lg" />
```

---

### BackTop

*stable* · *v2.2.0* — `navigation`

상단으로 이동 버튼

**Import:** `import { BackTop } from "@/ds/primitives/BackTop";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `threshold` | `number` |  | 버튼이 나타나기 시작하는 스크롤 임계값(px) |
| `className` | `string` |  | 추가 클래스 |
| `children` | `ReactNode` |  | 버튼 내부 커스텀 콘텐츠 |

**Example**

```tsx
<BackTop threshold={300} />
```

---

### Badge

*stable* · *v2.2.0* — `data-display`

상태나 카테고리를 표시하는 작은 라벨.

**Import:** `import { Badge } from "@/ds/primitives/Badge";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `BadgeVariant` |  | 뱃지 색상 변형. |
| `size` | `BadgeSize` |  | 뱃지 크기. |
| `dot` | `boolean` |  | 라벨 왼쪽에 작은 색상 점을 표시합니다. |
| `count` | `number` |  | 숫자 카운트 모드. |
| `maxCount` | `number` |  | 최대 표시 숫자. |
| `icon` | `ReactNode` |  | 라벨 왼쪽에 표시되는 아이콘. |

**Example**

```tsx
<Badge variant="success" dot>활성</Badge>
<Badge count={42} maxCount={99} />
```

---

### BatteryIndicator

*stable* · *v2.2.0* — `data-display`

배터리 인디케이터

**Import:** `import { BatteryIndicator } from "@/ds/primitives/BatteryIndicator";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` | ✓ | 0-100 퍼센트 |
| `autoColor` | `boolean` |  | 상태에 따른 색상 자동 적용 (>70 green, >30 yellow, else red) |
| `color` | `"primary" \| "success" \| "warning" \| "danger"` |  | 수동 색상 |
| `label` | `string` |  | 라벨 |
| `size` | `"sm" \| "md" \| "lg"` |  | 크기 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<BatteryIndicator value={75} autoColor />
<BatteryIndicator value={30} color="warning" size="lg" label="배터리" />
```

---

### BookmarkButton

*stable* · *v2.4.0* — `book` `control`

북마크 토글.

**Import:** `import { BookmarkButton } from "@/ds/primitives/BookmarkButton";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `bookmarked` | `boolean` | ✓ |  |
| `onChange` | `(bookmarked: boolean) => void` | ✓ |  |
| `size` | `number` |  |  |

**Example**

```tsx
<BookmarkButton bookmarked={saved} onChange={setSaved} />
```

---

### Button

*stable* · *v2.2.0* — `form` `control`

범용 버튼 컴포넌트

**Import:** `import { Button } from "@/ds/primitives/Button";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `ButtonVariant` |  | 버튼 스타일 변형. |
| `size` | `ButtonSize` |  | 버튼 크기. 높이, 패딩, 폰트 크기, 아이콘 크기를 결정합니다. |
| `loading` | `boolean` |  | 로딩 상태를 표시합니다. |
| `leftIcon` | `ReactNode` |  | 버튼 텍스트 왼쪽에 표시할 아이콘입니다. |
| `rightIcon` | `ReactNode` |  | 버튼 텍스트 오른쪽에 표시할 아이콘입니다. |
| `fullWidth` | `boolean` |  | 부모 너비를 100% 채웁니다. |
| `asChild` | `boolean` |  | Radix-style Slot 위임. `true`이면 Button은 자체 `<button>`을 렌더하지 |
| `type` | `"button" \| "submit" \| "reset"` |  | 네이티브 버튼 타입입니다. |

**Example**

```tsx
<Button variant="primary" size="md">저장</Button>
<Button variant="danger" loading>삭제 중...</Button>
```

---

### Checkbox

*stable* · *v2.2.0* — `form` `input`

체크박스

**Import:** `import { Checkbox } from "@/ds/primitives/Checkbox";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `label` | `string` |  | 레이블 |
| `indeterminate` | `boolean` |  | 부분 선택 상태 |
| `size` | `"sm" \| "md"` |  | 크기 |

**Example**

```tsx
<Checkbox label="동의합니다" checked={ok} onChange={...} />
```

---

### Code

*stable* · *v2.3.0* — `data-display`

인라인 코드 프리미티브 (Kbd 보조).

**Import:** `import { Code } from "@/ds/primitives/Code";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `CodeVariant` |  | 색상 변형 |
| `size` | `CodeSize` |  | 크기 |

**Example**

```tsx
<Code>npm install</Code>
<Code variant="danger">deprecated</Code>
```

---

### CopyButton

*stable* · *v2.2.0* — `form` `control`

클립보드 복사 버튼

**Import:** `import { CopyButton } from "@/ds/primitives/CopyButton";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `text` | `string` | ✓ | 클립보드에 복사할 텍스트 |
| `copiedLabel` | `string` |  | 복사 후 표시 텍스트 |
| `label` | `string` |  | 기본 표시 텍스트 |
| `variant` | `"button" \| "icon"` |  | 버튼 표시 형태 |
| `size` | `"sm" \| "md"` |  | 버튼 크기 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<CopyButton text="복사할 텍스트" />
<CopyButton text={code} variant="button" label="코드 복사" />
```

---

### CurrencyInput

*stable* · *v2.2.0* — `form` `input`

통화 단위 + 숫자 자동 포맷이 적용된 금액 입력 필드.

**Import:** `import { CurrencyInput } from "@/ds/primitives/CurrencyInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` |  | 숫자 값 |
| `onChange` | `(value: number) => void` |  | 값 변경 콜백 |
| `currency` | `string` |  | ISO 4217 통화 코드 |
| `locale` | `string` |  | BCP 47 로케일 |
| `size` | `"sm" \| "md" \| "lg"` |  | 입력 필드 크기 |
| `error` | `boolean` |  | 에러 상태 표시 |

**Example**

```tsx
<CurrencyInput value={amount} onChange={setAmount} currency="KRW" />
```

---

### Divider

*stable* · *v2.2.0* — `layout`

구분선

**Import:** `import { Divider } from "@/ds/primitives/Divider";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `orientation` | `"horizontal" \| "vertical"` |  | 구분선 방향 |
| `label` | `string` |  | 구분선 위에 라벨 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Divider />
<Divider label="또는" />
<Divider orientation="vertical" />
```

---

### ErrorBoundary

*stable* · *v2.2.0* — `feedback`

하위 컴포넌트의 렌더링 오류를 잡아 폴백 UI로 대체하는 에러 경계.

**Import:** `import { ErrorBoundary } from "@/ds/primitives/ErrorBoundary";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 보호할 자식 트리 |
| `fallback` | `ReactNode \| ((error: Error, reset: () => void) => ReactNode)` |  | 에러 시 표시할 대체 UI 또는 렌더 함수 |
| `onError` | `(error: Error, errorInfo: ErrorInfo) => void` |  | 에러 발생 시 호출되는 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ErrorBoundary fallback={<p>문제가 발생했어요</p>}>
  <App />
</ErrorBoundary>
```

---

### FileUpload

*stable* · *v2.2.0* — `form` `input`

파일 업로드 (드래그 앤 드롭 + 클릭)

**Import:** `import { FileUpload } from "@/ds/primitives/FileUpload";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `onFiles` | `(files: File[]) => void` | ✓ | 선택된 파일 콜백 |
| `accept` | `string` |  | 허용할 파일 MIME 패턴 |
| `multiple` | `boolean` |  | 다중 선택 허용 |
| `maxSize` | `number` |  | 파일당 최대 크기(바이트) |
| `disabled` | `boolean` |  | 비활성화 상태 |
| `trigger` | `ReactNode` |  | 커스텀 트리거 (없으면 드롭존) |
| `description` | `string` |  | 드롭존 설명 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FileUpload onFiles={handleFiles} accept="image/*" multiple maxSize={5*1024*1024} />
```

---

### FocusGuard

*stable* · *v2.2.0* — `accessibility`

지정 영역 내부에 포커스를 가두는(trap) 래퍼. 모달·드로어 등에 사용합니다.

**Import:** `import { FocusGuard } from "@/ds/primitives/FocusGuard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 포커스를 가둘 자식 트리 |
| `active` | `boolean` |  | 포커스 트랩 활성화 여부 |
| `autoFocus` | `boolean` |  | 마운트 시 첫 요소에 자동 포커스 |
| `returnFocus` | `boolean` |  | 언마운트 시 이전 포커스 복원 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FocusGuard active={open} returnFocus>
  <DialogContent />
</FocusGuard>
```

---

### FollowButton

*stable* · *v2.4.0* — `sns` `control`

팔로우 토글 — 상태별 라벨 + hover 시 언팔로우 강조.

**Import:** `import { FollowButton } from "@/ds/primitives/FollowButton";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `following` | `boolean` | ✓ | 팔로우 상태 |
| `onChange` | `(following: boolean) => void` | ✓ | 변경 콜백 |
| `size` | `"sm" \| "md" \| "lg"` |  | 크기 |
| `unfollowOnHover` | `boolean` |  | 팔로우 후 hover 시 "언팔로우" 라벨 노출 |
| `followLabel` | `string` |  | 팔로우 라벨 |
| `followingLabel` | `string` |  | 팔로잉 라벨 |
| `unfollowLabel` | `string` |  | 언팔로우 라벨 (hover 시) |

**Example**

```tsx
<FollowButton following={f} onChange={setF} unfollowOnHover />
```

---

### Hashtag

*stable* · *v2.4.0* — `sns` `content`

해시태그 칩 — `#tag` 링크 + (선택) 인기 표시 / 게시물 수.

**Import:** `import { Hashtag } from "@/ds/primitives/Hashtag";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `tag` | `string` | ✓ | # 없는 태그 (예: "design") |
| `trending` | `boolean` |  | 인기 태그 강조 |
| `count` | `number` |  | 게시물 수 (있으면 옆에 표시) |

**Example**

```tsx
<Hashtag tag="디자인시스템" trending count={3214} href="/tag/디자인시스템" />
```

---

### Highlight

*stable* · *v2.5.0* — `content`

검색어를 강조해 표시. SearchBar/CommandPalette 결과 강조에 사용.

**Import:** `import { Highlight } from "@/ds/primitives/Highlight";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `text` | `string` | ✓ | 본문 텍스트 |
| `query` | `string` | ✓ | 강조할 검색어 (대소문자 무시) |
| `variant` | `"primary" \| "yellow" \| "underline"` |  | 강조 스타일 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Highlight text="JunDS 디자인 시스템" query="디자인" variant="primary" />
```

---

### Icon

*stable* · *v2.3.0* — `data-display`

SVG 아이콘 표준 wrapper. 외부 아이콘 셋과 통일된 props 표면.

**Import:** `import { Icon } from "@/ds/primitives/Icon";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `size` | `IconSize` |  | 아이콘 크기 (토큰 또는 px 숫자) |
| `color` | `string` |  | 색상 (currentColor 기본) |
| `label` | `string` |  | aria-label (없으면 aria-hidden=true) |
| `children` | `ReactNode` | ✓ | SVG 내부 path/group |

**Example**

```tsx
<Icon size="md" label="검색"><path d="..." /></Icon>
```

---

### IconButton

*stable* · *v2.2.0* — `form` `control`

아이콘 전용 버튼

**Import:** `import { IconButton } from "@/ds/primitives/IconButton";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `icon` | `ReactNode` | ✓ | 표시할 아이콘 |
| `variant` | `IconButtonVariant` |  | 버튼 변형 |
| `size` | `IconButtonSize` |  | 버튼 크기 |
| `label` | `string` | ✓ | 접근성 라벨 |

**Example**

```tsx
<IconButton icon={<CloseIcon />} label="닫기" variant="ghost" />
```

---

### Image

*stable* · *v2.3.0* — `media`

로드 실패/로딩 상태를 처리하는 이미지 프리미티브.

**Import:** `import { Image } from "@/ds/primitives/Image";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `fit` | `ImageFit` |  | object-fit 모드 |
| `radius` | `"sm" \| "md" \| "lg" \| "none" \| "full"` |  | 라운드 코너 |
| `ratio` | `string` |  | 종횡비 (예: "16/9", "1/1") |
| `placeholder` | `ReactNode` |  | 로딩 중 placeholder |
| `fallback` | `ReactNode` |  | 로드 실패 시 fallback |

**Example**

```tsx
<Image src="/x.png" alt="x" ratio="16/9" radius="md" />
```

---

### Input

*stable* · *v2.2.0* — `form` `input`

텍스트 입력 컴포넌트.

**Import:** `import { Input } from "@/ds/primitives/Input";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `size` | `InputSize` |  | 입력 필드의 높이 및 텍스트 크기. |
| `error` | `boolean` |  | 유효성 검증 실패 시 에러 상태를 표시합니다. |
| `leftSlot` | `ReactNode` |  | 입력 필드 왼쪽에 배치할 아이콘이나 요소. |
| `rightSlot` | `ReactNode` |  | 입력 필드 오른쪽에 배치할 아이콘이나 요소. |
| `placeholder` | `string` |  | 입력 필드에 힌트 텍스트를 표시합니다. |
| `disabled` | `boolean` |  | 입력 필드를 비활성화합니다. |
| `className` | `string` |  | 입력 필드에 추가할 CSS 클래스. |
| `wrapperClassName` | `string` |  | 좌우 슬롯이 있을 때 생성되는 바깥 래퍼에 추가할 CSS 클래스입니다. |

**Example**

```tsx
// 에러 상태
<Input error placeholder="필수 입력" />
```

---

### Kbd

*stable* · *v2.2.0* — `data-display`

키보드 단축키 표시

**Import:** `import { Kbd } from "@/ds/primitives/Kbd";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `keys` | `Array<string>` |  | 키 조합 (배열이면 + 로 연결) |

**Example**

```tsx
<Kbd keys={["⌘", "K"]} />
```

---

### KeyCap

*stable* · *v2.5.0* — `content`

키보드 키 모양 칩 — 단축키 안내, ⌘K 같은 명령 표기.

**Import:** `import { KeyCap } from "@/ds/primitives/KeyCap";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 키 라벨 (예: "K", "↵", "⌘", "?") |
| `size` | `"sm" \| "md" \| "lg"` |  | 크기 |
| `variant` | `"default" \| "primary" \| "muted"` |  | 시각 변형 |
| `pressed` | `boolean` |  | 활성 상태 (눌린 모양) |

**Example**

```tsx
<span>검색 <KeyCap>⌘</KeyCap><KeyCap>K</KeyCap></span>
  <KeyCap variant="primary" size="lg">↵</KeyCap>
```

---

### Label

*stable* · *v2.2.0* — `form`

폼 라벨

**Import:** `import { Label } from "@/ds/primitives/Label";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `required` | `boolean` |  | 필수 입력 표시(*) |

**Example**

```tsx
<Label htmlFor="name" required>이름</Label>
```

---

### LikeButton

*stable* · *v2.4.0* — `sns` `control`

좋아요 토글 — 활성화 시 하트 채움 + 살짝 스케일 애니메이션.

**Import:** `import { LikeButton } from "@/ds/primitives/LikeButton";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `liked` | `boolean` | ✓ | 좋아요 활성 상태 |
| `onChange` | `(liked: boolean) => void` | ✓ | 토글 콜백 |
| `count` | `number` |  | 좋아요 수 (옆에 표시) |
| `size` | `"sm" \| "md" \| "lg"` |  | 크기 |

**Example**

```tsx
<LikeButton liked={liked} onChange={setLiked} count={likes} />
```

---

### Link

*stable* · *v2.3.0* — `navigation`

라우터-aware 앵커 프리미티브. 외부/내부 링크를 한 컴포넌트로 표현.

**Import:** `import { Link } from "@/ds/primitives/Link";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `LinkVariant` |  | 색상 변형 |
| `underline` | `LinkUnderline` |  | 밑줄 스타일 |
| `external` | `boolean` |  | 외부 링크 (target=_blank + rel + 아이콘) |
| `children` | `ReactNode` |  | 링크 컨텐츠 |

**Example**

```tsx
<Link href="/docs" underline="hover">문서 보기</Link>
<Link href="https://example.com" external>외부</Link>
```

---

### Mark

*stable* · *v2.3.0* — `data-display`

텍스트 하이라이트 프리미티브 (검색결과/강조).

**Import:** `import { Mark } from "@/ds/primitives/Mark";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `color` | `MarkColor` |  | 형광펜 색상 |
| `underline` | `boolean` |  | 밑줄형 (배경 대신 underline) |

**Example**

```tsx
<p>이건 <Mark>중요</Mark>한 문장</p>
```

---

### MentionChip

*stable* · *v2.4.0* — `sns` `content`

멘션 칩 — `@username` 링크 + (선택) 인증 마크. composite/Mention(에디터)과

**Import:** `import { MentionChip } from "@/ds/primitives/MentionChip";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `handle` | `string` | ✓ | @ 없는 사용자 핸들 (예: "junha") |
| `label` | `string` |  | 표시 라벨 (기본 |
| `verified` | `boolean` |  | 인증 사용자 표시 |

**Example**

```tsx
<MentionChip handle="junha" verified href="/u/junha" />
```

---

### Motion

*stable* · *v2.5.0* — `motion` `layout`

모션 wrapper — CSS keyframe 기반 8가지 진입 프리셋. `prefers-reduced-motion`

**Import:** `import { Motion } from "@/ds/primitives/Motion";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `preset` | `MotionPreset` |  | 애니메이션 프리셋 |
| `delay` | `number` |  | 진입 지연 (ms) |
| `respectReducedMotion` | `boolean` |  | prefers-reduced-motion 대응 (기본 true: 즉시 표시) |
| `once` | `boolean` |  | 한 번만 실행 vs 매 마운트 (기본 단일 실행) |
| `children` | `ReactNode` |  | 자식 (애니메이트할 컨텐츠) |

**Example**

```tsx
<Motion preset="fade-up" delay={100}>
    <Card>안녕하세요</Card>
  </Motion>
```

---

### NumberFormatter

*stable* · *v2.2.0* — `data-display`

로케일 기반 숫자/통화/퍼센트 포맷 텍스트.

**Import:** `import { NumberFormatter } from "@/ds/primitives/NumberFormatter";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` | ✓ | 포맷할 숫자 값 |
| `format` | `"decimal" \| "currency" \| "percent" \| "compact"` |  | 출력 포맷 종류 |
| `currency` | `string` |  | ISO 4217 통화 코드 |
| `locale` | `string` |  | BCP 47 로케일 |
| `decimals` | `number` |  | 소수점 자릿수 |
| `prefix` | `string` |  | 값 앞에 붙일 문자열 |
| `suffix` | `string` |  | 값 뒤에 붙일 문자열 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<NumberFormatter value={1234567} format="currency" currency="KRW" />
```

---

### NumberInput

*stable* · *v2.2.0* — `form` `input`

숫자 입력 (증감 버튼 포함)

**Import:** `import { NumberInput } from "@/ds/primitives/NumberInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` |  | 현재 숫자 값 |
| `onChange` | `(value: number) => void` |  | 값 변경 콜백 |
| `min` | `number` |  | 허용 최소값 |
| `max` | `number` |  | 허용 최대값 |
| `step` | `number` |  | 증감 단위 |
| `error` | `boolean` |  | 에러 상태 표시 |
| `size` | `"sm" \| "md" \| "lg"` |  | 입력 필드 크기 |
| `hideControls` | `boolean` |  | +/- 버튼 숨김 |

**Example**

```tsx
<NumberInput value={count} onChange={setCount} min={0} max={100} step={5} />
```

---

### OTPInput

*stable* · *v2.2.0* — `form` `input`

6자리 일회용 비밀번호(OTP) 입력기.

**Import:** `import { OTPInput } from "@/ds/primitives/OTPInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `length` | `number` |  | OTP 자릿수 |
| `onComplete` | `(code: string) => void` |  | 모든 자릿수 입력 완료 시 호출 |
| `onChange` | `(code: string) => void` |  | 값 변경 콜백 |
| `error` | `boolean` |  | 에러 상태 표시 |
| `disabled` | `boolean` |  | 비활성화 상태 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<OTPInput length={6} onComplete={(code) => verify(code)} />
```

---

### PasswordInput

*stable* · *v2.2.0* — `form` `input`

보안 비밀번호 입력

**Import:** `import { PasswordInput } from "@/ds/primitives/PasswordInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `error` | `boolean` |  | 에러 상태 |
| `showStrength` | `boolean` |  | 비밀번호 강도 표시 |
| `showRules` | `boolean` |  | 규칙 체크리스트 표시 |
| `rules` | `Array<PasswordRule>` |  | 커스텀 규칙 (기본: 8자, 대문자, 소문자, 숫자, 특수문자) |
| `size` | `"sm" \| "md" \| "lg"` |  | 크기 |

**Example**

```tsx
<PasswordInput showStrength showRules placeholder="비밀번호" />
```

---

### PhoneInput

*stable* · *v2.2.0* — `form` `input`

국가 코드 선택이 포함된 전화번호 입력기.

**Import:** `import { PhoneInput } from "@/ds/primitives/PhoneInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` |  | 숫자만 포함된 현재 값 |
| `onChange` | `(value: string, fullNumber: string) => void` |  | 값 변경 콜백 (digits, 국가코드 포함 전체 번호) |
| `defaultCountry` | `"KR" \| "US" \| "JP" \| "CN" \| "GB"` |  | 초기 선택 국가 |
| `size` | `"sm" \| "md" \| "lg"` |  | 입력 필드 크기 |
| `error` | `boolean` |  | 에러 상태 표시 |

**Example**

```tsx
<PhoneInput value={phone} onChange={setPhone} defaultCountry="KR" />
```

---

### PinInput

*stable* · *v2.2.0* — `form` `input`

PIN / OTP 입력

**Import:** `import { PinInput } from "@/ds/primitives/PinInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `length` | `number` |  | 자릿수 |
| `onComplete` | `(value: string) => void` |  | 완료 콜백 |
| `onChange` | `(value: string) => void` |  | 값 변경 콜백 |
| `masked` | `boolean` |  | 마스킹 (●) |
| `error` | `boolean` |  | 에러 상태 표시 |
| `disabled` | `boolean` |  | 비활성화 상태 |
| `numeric` | `boolean` |  | 숫자만 |
| `className` | `string` |  | 추가 클래스 |
| `inputAriaLabel` | `(index: number, length: number) => string` |  | 각 입력 칸의 접근성 라벨 (기본: "N번째 자리") |

**Example**

```tsx
<PinInput length={6} masked onComplete={verifyOTP} />
<PinInput length={4} numeric onComplete={verifyPin} />
```

---

### Portal

*stable* · *v2.2.0* — `overlay`

React Portal 래퍼

**Import:** `import { Portal } from "@/ds/primitives/Portal";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 포털로 렌더링할 자식 요소 |
| `container` | `Element` |  | 마운트 대상 (기본: document.body) |

**Example**

```tsx
<Portal><ModalContent /></Portal>
```

---

### RangeSlider

*stable* · *v2.2.0* — `form` `input`

두 핸들로 최소/최대 범위를 지정하는 슬라이더.

**Import:** `import { RangeSlider } from "@/ds/primitives/RangeSlider";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `min` | `number` |  | 허용 최소값 |
| `max` | `number` |  | 허용 최대값 |
| `step` | `number` |  | 증감 단위 |
| `value` | `[number, number]` | ✓ | 현재 값 [최솟값, 최댓값] |
| `onChange` | `(value: [number, number]) => void` | ✓ | 값 변경 콜백 |
| `disabled` | `boolean` |  | 비활성화 상태 |
| `showValues` | `boolean` |  | 양 끝 숫자 라벨 표시 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<RangeSlider value={[20, 80]} onChange={setRange} min={0} max={100} />
```

---

### ScrollArea

*stable* · *v2.2.0* — `layout`

커스텀 스크롤 영역

**Import:** `import { ScrollArea } from "@/ds/primitives/ScrollArea";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 자식 요소 |
| `className` | `string` |  | 추가 클래스 |
| `maxHeight` | `string \| number` |  | 최대 높이 |
| `orientation` | `ScrollOrientation` |  | 스크롤 방향 |

**Example**

```tsx
<ScrollArea maxHeight={300}>
  <p>긴 내용...</p>
</ScrollArea>
<ScrollArea orientation="horizontal" maxHeight="200px">
  <div className="flex gap-4">...</div>
</ScrollArea>
```

---

### SeverityBadge

*stable* · *v2.2.0* — `data-display`

심각도 뱃지

**Import:** `import { SeverityBadge } from "@/ds/primitives/SeverityBadge";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `severity` | `Severity` | ✓ | 심각도 수준 |
| `children` | `ReactNode` | ✓ | 뱃지 내용 |
| `dot` | `boolean` |  | 작은 점만 표시 |
| `size` | `"sm" \| "md"` |  | 크기 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SeverityBadge severity="ok">정상</SeverityBadge>
<SeverityBadge severity="danger" dot>오류</SeverityBadge>
```

---

### Slider

*stable* · *v2.2.0* — `form` `input`

슬라이더/레인지

**Import:** `import { Slider } from "@/ds/primitives/Slider";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` |  | 현재 값 |
| `onChange` | `(value: number) => void` |  | 값 변경 콜백 |
| `min` | `number` |  | 허용 최소값 |
| `max` | `number` |  | 허용 최대값 |
| `step` | `number` |  | 증감 단위 |
| `disabled` | `boolean` |  | 비활성화 상태 |
| `showValue` | `boolean` |  | 값 표시 |
| `formatValue` | `(value: number) => string` |  | 포맷 함수 |
| `marks` | `Array<{ value: number; label?: string; }>` |  | 마크 표시 |
| `color` | `"primary" \| "success" \| "warning" \| "danger"` |  | 색상 |
| `size` | `"sm" \| "md"` |  | 슬라이더 크기 |
| `className` | `string` |  | 추가 클래스 |
| `aria-label` | `string` |  | 스크린리더용 라벨 (기본 "슬라이더") |
| `aria-labelledby` | `string` |  | 라벨 엘리먼트의 id 참조 |

**Example**

```tsx
<Slider value={50} onChange={setValue} min={0} max={100} showValue />
<Slider marks={[{value:0,label:"0%"},{value:50,label:"50%"},{value:100,label:"100%"}]} />
```

---

### Spinner

*stable* · *v2.2.0* — `feedback`

로딩 스피너

**Import:** `import { Spinner } from "@/ds/primitives/Spinner";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `size` | `SpinnerSize` |  | 스피너 크기 |
| `color` | `SpinnerColor` |  | 스피너 색상 |
| `className` | `string` |  | 추가 클래스 |
| `label` | `string` |  | 접근성 라벨 |

**Example**

```tsx
<Spinner size="md" />
```

---

### StarRating

*stable* · *v2.2.0* — `form` `input`

별점 입력

**Import:** `import { StarRating } from "@/ds/primitives/StarRating";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` | ✓ | 현재 값 |
| `onChange` | `(value: number) => void` |  | 값 변경 핸들러 |
| `max` | `number` |  | 최대 별 개수 |
| `size` | `StarRatingSize` |  | 크기 |
| `readonly` | `boolean` |  | 읽기 전용 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<StarRating value={3} onChange={setRating} />
<StarRating value={4.5} max={5} readonly />
```

---

### StatusDot

*stable* · *v2.2.0* — `data-display`

상태 표시 점

**Import:** `import { StatusDot } from "@/ds/primitives/StatusDot";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `status` | `StatusDotStatus` |  | 상태 종류 |
| `label` | `string` |  | 점 옆에 표시할 라벨 |
| `size` | `"sm" \| "md" \| "lg"` |  | 점 크기 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<StatusDot status="success" label="온라인" />
<StatusDot status="danger" label="오프라인" />
```

---

### Switch

*stable* · *v2.2.0* — `form` `input`

iOS 스타일 스위치

**Import:** `import { Switch } from "@/ds/primitives/Switch";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `checked` | `boolean` | ✓ | 체크 상태 |
| `onChange` | `(checked: boolean) => void` | ✓ | 상태 변경 핸들러 |
| `disabled` | `boolean` |  | 비활성화 |
| `size` | `SwitchSize` |  | 크기 |
| `label` | `string` |  | 레이블 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Switch checked={on} onChange={setOn} label="알림 수신" />
<Switch checked={on} onChange={setOn} size="lg" />
```

---

### Tag

*stable* · *v2.2.0* — `data-display`

태그/칩

**Import:** `import { Tag } from "@/ds/primitives/Tag";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `color` | `TagColor` |  | 태그 색상 |
| `closable` | `boolean` |  | 닫기 버튼 표시 |
| `onClose` | `() => void` |  | 닫기 버튼 클릭 콜백 |

**Example**

```tsx
<Tag color="blue">프론트엔드</Tag>
<Tag color="red" closable onClose={handleRemove}>긴급</Tag>
```

---

### Textarea

*stable* · *v2.2.0* — `form` `input`

텍스트영역 컴포넌트

**Import:** `import { Textarea } from "@/ds/primitives/Textarea";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `error` | `boolean` |  | 에러 상태를 시각적으로 표시하고 `aria-invalid="true"`를 설정합니다. |
| `autoResize` | `boolean` |  | 내용 높이에 맞춰 입력 영역을 자동으로 늘립니다. |
| `showCount` | `boolean` |  | `maxLength` 기준 현재 글자 수를 표시합니다. |

**Example**

```tsx
<Textarea autoResize placeholder="설명을 입력하세요" maxLength={500} showCount />
```

---

### Toggle

*stable* · *v2.2.0* — `form` `control`

토글 스위치

**Import:** `import { Toggle } from "@/ds/primitives/Toggle";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `checked` | `boolean` |  | 체크 상태 |
| `onChange` | `(checked: boolean) => void` |  | 상태 변경 콜백 |
| `size` | `ToggleSize` |  | 토글 크기 |
| `disabled` | `boolean` |  | 비활성화 상태 |
| `label` | `string` |  | 옆에 표시할 라벨 |
| `aria-label` | `string` |  | 시각 라벨이 없을 때 사용할 접근성 라벨 (기본: label 사용) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Toggle checked={on} onChange={setOn} label="알림" />
```

## Composites

### Accordion

*stable* · *v2.2.0* — `disclosure`

아코디언

**Import:** `import { Accordion } from "@/ds/composites/Accordion";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<AccordionItem>` | ✓ | 아코디언 항목 목록 |
| `single` | `boolean` |  | 하나만 열기 모드 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Accordion items={[{key:"1",title:"FAQ",content:<p>답변</p>}]} />
```

---

### ActionSheet

*stable* · *v2.2.0* — `overlay`

모바일 친화적인 하단 액션 시트. 여러 액션을 리스트로 노출합니다.

**Import:** `import { ActionSheet } from "@/ds/composites/ActionSheet";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` | ✓ | 열림 상태 |
| `onClose` | `() => void` | ✓ | 닫기 콜백 |
| `title` | `string` |  | 상단 제목 |
| `actions` | `Array<ActionSheetAction>` | ✓ | 액션 목록 |
| `cancelLabel` | `string` |  | 취소 버튼 라벨 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ActionSheet
  open={open}
  onClose={() => setOpen(false)}
  actions={[{ label: "삭제", onClick: handleDelete, variant: "danger" }]}
/>
```

---

### AddressInput

*stable* · *v2.2.0* — `form` `input`

주소 검색 자동완성 입력기.

**Import:** `import { AddressInput } from "@/ds/composites/AddressInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `onSelect` | `(address: { zonecode: string; address: string; detail: string; }) => void` |  | 주소 선택 콜백 |
| `placeholder` | `string` |  | 주소 입력 플레이스홀더 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<AddressInput onSelect={(addr) => setAddress(addr)} placeholder="주소 검색" />
```

---

### Affix

*stable* · *v2.2.0* — `layout`

스크롤 시 지정 위치에 고정되는 컨테이너.

**Import:** `import { Affix } from "@/ds/composites/Affix";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 자식 요소 |
| `position` | `{ top?: number; bottom?: number; left?: number; right?: number; }` |  | 화면 고정 좌표 |
| `zIndex` | `number` |  | z-index 값 |
| `className` | `string` |  | 추가 클래스 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<Affix position="top" zIndex={50}>
  <Toolbar />
</Affix>
```

---

### AlbumArt

*stable* · *v2.3.0* — `media` `audio`

앨범/트랙 커버. 이미지가 없거나 깨지면 시드에서 만든 커버로 대신한다.

**Import:** `import { AlbumArt } from "@/ds/composites/AlbumArt";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `src` | `string` |  | 커버 이미지 URL. 없거나 로드에 실패하면 생성 커버로 폴백한다 |
| `seed` | `string` | ✓ | 생성 커버의 시드 (제목 + 아티스트 등). 같은 시드는 언제나 같은 커버가 된다 |
| `alt` | `string` |  | 접근성 이름. 비워 두면(기본) 장식으로 보고 스크린리더에서 숨긴다 — |
| `glyph` | `string` |  | 생성 커버 가운데에 놓을 글리프 (기본 `"♪"`) |
| `size` | `string \| number` |  | 한 변의 크기 (px 또는 CSS 길이, 기본 `"100%"`) |
| `radius` | `"sm" \| "md" \| "lg" \| "none" \| "full"` |  | 모서리 둥글기 (기본 `"md"`) |

**Example**

```tsx
<AlbumArt src={track.cover} seed={`${track.title}-${track.artist}`} size={56} />
```

---

### Alert

*stable* · *v2.2.0* — `feedback`

알림 메시지 컴포넌트.

**Import:** `import { Alert } from "@/ds/composites/Alert";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `AlertVariant` |  | 알림 스타일 변형. |
| `title` | `string` |  | 알림 제목 (선택). |
| `children` | `ReactNode` | ✓ | 알림 본문 내용. |
| `icon` | `ReactNode` |  | 커스텀 아이콘. |
| `onClose` | `() => void` |  | 닫기 버튼 클릭 시 호출되는 콜백. |
| `className` | `string` |  | 루트 요소에 추가할 CSS 클래스 |

**Example**

```tsx
<Alert variant="success" title="완료">작업이 성공했습니다.</Alert>
<Alert variant="danger" onClose={dismiss}>오류가 발생했습니다.</Alert>
```

---

### AlertDialog

*stable* · *v2.2.0* — `overlay` `feedback`

경고 다이얼로그 (배경 클릭으로 닫기 불가)

**Import:** `import { AlertDialog } from "@/ds/composites/AlertDialog";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` | ✓ | 열림 상태 |
| `onConfirm` | `() => void` | ✓ | 확인 콜백 |
| `onCancel` | `() => void` | ✓ | 취소 콜백 |
| `title` | `string` | ✓ | 다이얼로그 제목 |
| `description` | `string` | ✓ | 다이얼로그 본문 설명 |
| `confirmLabel` | `string` |  | 확인 버튼 라벨 |
| `cancelLabel` | `string` |  | 취소 버튼 라벨 |
| `variant` | `"warning" \| "danger" \| "info"` |  | 알림 유형 |
| `loading` | `boolean` |  | 로딩 상태 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<AlertDialog
  open={show}
  onConfirm={handleConfirm}
  onCancel={() => setShow(false)}
  title="삭제하시겠습니까?"
  description="이 작업은 되돌릴 수 없습니다."
  variant="danger"
/>
```

---

### AnimatedCounter

*stable* · *v2.2.0* — `data-display`

숫자가 부드럽게 증가/감소하며 표시되는 카운터.

**Import:** `import { AnimatedCounter } from "@/ds/composites/AnimatedCounter";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` | ✓ | 표시할 숫자 값 |
| `duration` | `number` |  | 애니메이션 지속 시간(ms) |
| `decimals` | `number` |  | 소수점 자릿수 |
| `prefix` | `string` |  | 숫자 앞 접두어 |
| `suffix` | `string` |  | 숫자 뒤 접미어 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<AnimatedCounter value={1234} duration={1500} suffix="원" />
```

---

### AnnotationNote

*stable* · *v2.4.0* — `book` `content`

본문 하이라이트 + 사용자 메모 카드.

**Import:** `import { AnnotationNote } from "@/ds/composites/AnnotationNote";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `quote` | `ReactNode` | ✓ |  |
| `note` | `ReactNode` |  |  |
| `createdAt` | `string \| Date` |  |  |
| `page` | `number` |  |  |
| `color` | `AnnotationColor` |  |  |
| `onDelete` | `() => void` |  |  |
| `onClick` | `() => void` |  |  |
| `className` | `string` |  |  |

**Example**

```tsx
<AnnotationNote quote="삶은…" note="중요" page={142} color="yellow" createdAt="2026-04-30" />
```

---

### AnnouncementBar

*stable* · *v2.3.0* — `feedback`

사이트 최상단 공지바 (Banner와 달리 sticky/dismissible 영속).

**Import:** `import { AnnouncementBar } from "@/ds/composites/AnnouncementBar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `message` | `ReactNode` | ✓ | 메시지 본문 |
| `ctaLabel` | `string` |  | 우측 CTA 텍스트 |
| `ctaHref` | `string` |  | CTA 링크 |
| `onCta` | `() => void` |  | CTA 클릭 핸들러 (href 없을 때) |
| `variant` | `AnnouncementVariant` |  | 색상 톤 |
| `dismissible` | `boolean` |  | 닫기 가능 여부 |
| `storageKey` | `string` |  | localStorage 영속 키 (있으면 닫기 상태 기억) |
| `icon` | `ReactNode` |  | 좌측 아이콘 |
| `onDismiss` | `() => void` |  | 닫힘 콜백 |

**Example**

```tsx
<AnnouncementBar message="🎉 신규 기능" ctaLabel="자세히" ctaHref="/x" storageKey="ann-2026" />
```

---

### AreaChart

*stable* · *v2.3.0* — `chart`

SVG 영역 차트 (overlap 또는 stacked).

**Import:** `import { AreaChart } from "@/ds/composites/AreaChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `labels` | `Array<string>` |  | x축 라벨 |
| `series` | `Array<AreaSeries>` | ✓ | 시리즈 |
| `width` | `number` |  | 너비 |
| `height` | `number` |  | 높이 |
| `mode` | `AreaMode` |  | 다중 시리즈 모드 |
| `smooth` | `boolean` |  | 부드러운 곡선 |
| `showGrid` | `boolean` |  | 그리드 |
| `showYAxis` | `boolean` |  | Y축 라벨 |
| `showXAxis` | `boolean` |  | X축 라벨 |
| `fillOpacity` | `number` |  | 영역 투명도 |

**Example**

```tsx
<AreaChart labels={["1","2","3"]} series={[{name:"a",data:[10,20,15]}]} mode="stacked" />
```

---

### AudioPlayer

*stable* · *v2.2.0* — `media`

오디오 플레이백 컨트롤(재생/정지/시킹)이 포함된 플레이어.

**Import:** `import { AudioPlayer } from "@/ds/composites/AudioPlayer";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `src` | `string` | ✓ | 오디오 URL |
| `title` | `string` |  | 트랙 제목 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<AudioPlayer src="/audio/song.mp3" title="My Song" />
```

---

### AutoComplete

*stable* · *v2.2.0* — `form` `input`

자동완성 입력

**Import:** `import { AutoComplete } from "@/ds/composites/AutoComplete";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` | ✓ | 입력 값 |
| `onChange` | `(value: string) => void` | ✓ | 입력 변경 콜백 |
| `options` | `Array<AutoCompleteOption>` | ✓ | 자동완성 옵션 목록 |
| `onSelect` | `(option: AutoCompleteOption) => void` |  | 옵션 선택 콜백 |
| `placeholder` | `string` |  | 플레이스홀더 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `loading` | `boolean` |  | 비동기 로딩 상태 |
| `emptyMessage` | `string` |  | 결과 없을 때 메시지 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<AutoComplete value={v} onChange={setV} options={options} onSelect={handleSelect} placeholder="검색..." />
```

---

### AutoHideHeader

*stable* · *v2.2.0* — `navigation`

자동 숨김 헤더 컴포넌트

**Import:** `import { AutoHideHeader } from "@/ds/composites/AutoHideHeader";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `React.ReactNode` | ✓ | 자식 요소 |
| `threshold` | `number` |  | 스크롤 감지 임계값 (px) |
| `height` | `number` |  | 헤더 높이 (px) |
| `className` | `string` |  | 추가 클래스 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
```tsx
<AutoHideHeader threshold={8} height={64}>
  <nav>...</nav>
</AutoHideHeader>
```
```

---

### AutoPlayDemo

*stable* · *v2.2.0* — `misc`

자동 순환 데모

**Import:** `import { AutoPlayDemo } from "@/ds/composites/AutoPlayDemo";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `frames` | `Array<ReactNode>` | ✓ | 순환할 프레임들 (각 프레임은 ReactNode) |
| `interval` | `number` |  | 프레임 전환 간격 (ms) |
| `transition` | `"none" \| "fade" \| "scale" \| "slide-up" \| "slide-left" \| "crossfade"` |  | 전환 애니메이션 |
| `duration` | `number` |  | 전환 지속 시간 (ms) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<AutoPlayDemo
  frames={[
    <Button variant="primary">Primary</Button>,
    <Button variant="danger">Danger</Button>,
    <Button variant="ghost">Ghost</Button>,
  ]}
  interval={1000}
  transition="fade"
/>
```

---

### AvatarStack

*stable* · *v2.2.0* — `data-display`

아바타 스택 (겹쳐진 그룹)

**Import:** `import { AvatarStack } from "@/ds/composites/AvatarStack";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `names` | `Array<string>` | ✓ | 표시할 이름 목록 |
| `max` | `number` |  | 최대 표시 수 |
| `size` | `AvatarSize` |  | 아바타 크기 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<AvatarStack names={["김준하","이서연","박민수","최유진","정다은"]} max={3} />
```

---

### Banner

*stable* · *v2.2.0* — `feedback`

배너 알림 컴포넌트

**Import:** `import { Banner } from "@/ds/composites/Banner";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 자식 요소 |
| `variant` | `"success" \| "warning" \| "danger" \| "info"` |  | 배너 유형 |
| `dismissible` | `boolean` |  | 닫기 버튼 표시 여부 |
| `icon` | `ReactNode` |  | 좌측 아이콘 |
| `action` | `ReactNode` |  | 우측 액션 영역 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Banner variant="info" dismissible>중요한 공지사항입니다.</Banner>
```

---

### BarChart

*stable* · *v2.3.0* — `chart`

경량 SVG 막대 차트 (vertical/horizontal, grouped/stacked).

**Import:** `import { BarChart } from "@/ds/composites/BarChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `labels` | `Array<string>` | ✓ | 카테고리 라벨 |
| `series` | `Array<BarSeries>` | ✓ | 시리즈 |
| `width` | `number` |  | 너비 |
| `height` | `number` |  | 높이 |
| `orientation` | `BarOrientation` |  | 방향 |
| `mode` | `BarMode` |  | 다중 시리즈 모드 |
| `showGrid` | `boolean` |  | 그리드 표시 |
| `showValues` | `boolean` |  | 값 라벨 |

**Example**

```tsx
<BarChart labels={["A","B","C"]} series={[{name:"매출", data:[10,30,20]}]} />
```

---

### BentoGrid

*stable* · *v2.2.0* — `layout`

BentoGrid 컴포넌트

**Import:** `import { BentoGrid } from "@/ds/composites/BentoGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 자식 요소 |
| `cols` | `number` |  | 그리드 열 수 |
| `gap` | `number` |  | 셀 간격(rem 단위 4배수) |
| `className` | `string` |  | 추가 클래스 |

---

### Blockquote

*stable* · *v2.3.0* — `data-display`

인용문 블록.

**Import:** `import { Blockquote } from "@/ds/composites/Blockquote";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `BlockquoteVariant` |  | 변형 |
| `cite` | `ReactNode` |  | 인용 출처 (예: "— 알베르트 아인슈타인") |
| `children` | `ReactNode` | ✓ | 인용 본문 |

**Example**

```tsx
<Blockquote cite="아인슈타인">상상력은 지식보다 중요하다.</Blockquote>
```

---

### BookCard

*stable* · *v2.2.0* — `layout`

책 표지 + 제목 + 저자 정보를 담은 책 형태의 카드.

**Import:** `import { BookCard } from "@/ds/composites/BookCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `string` | ✓ | 작품 제목 |
| `author` | `string` |  | 저자명 |
| `coverImage` | `string` |  | 커버 이미지 URL |
| `locked` | `boolean` |  | 잠금 상태 |
| `kind` | `string` |  | 작품 유형 |
| `onClick` | `() => void` |  | 카드 클릭 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<BookCard title="Atomic Design" author="Brad Frost" coverImage="/cover.jpg" />
```

---

### BookCover

*stable* · *v2.4.0* — `book` `media`

책 표지 — 단독 시각 또는 BookCard 내부에서 사용.

**Import:** `import { BookCover } from "@/ds/composites/BookCover";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `src` | `string` |  |  |
| `title` | `string` | ✓ |  |
| `author` | `string` |  |  |
| `size` | `BookCoverSize` |  |  |
| `effect` | `BookCoverEffect` |  |  |
| `hue` | `string` |  |  |

**Example**

```tsx
<BookCover src="/cover.jpg" title="모비 딕" size="lg" effect="tilt" />
<BookCover title="에세이" author="저자" hue="from-purple-500 to-fuchsia-500" effect="spine" />
```

---

### BookRating

*stable* · *v2.4.0* — `book` `rating`

책 평점 — 평균 + 별 + (선택) 점수 분포 막대.

**Import:** `import { BookRating } from "@/ds/composites/BookRating";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` | ✓ |  |
| `max` | `number` |  |  |
| `reviews` | `number` |  |  |
| `distribution` | `Array<number>` |  |  |
| `compact` | `boolean` |  |  |
| `className` | `string` |  |  |

**Example**

```tsx
<BookRating value={4.3} reviews={1820} distribution={[20,40,180,520,1060]} />
```

---

### BookShelf

*stable* · *v2.4.0* — `book` `layout`

책장 — 동일한 너비 그리드로 책 카드를 정렬한다.

**Import:** `import { BookShelf } from "@/ds/composites/BookShelf";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 책 항목 (`BookCard` 등) |
| `columns` | `5 \| 3 \| 4 \| 6 \| 8` |  | 행당 책 수 (기본 5) |
| `variant` | `BookShelfVariant` |  | 시각 변형 |
| `label` | `ReactNode` |  | 책장 라벨 (선반 위 카테고리) |

**Example**

```tsx
<BookShelf label="베스트셀러" columns={5}>
  <BookCard title="..." author="..." coverImage="..." />
  …
</BookShelf>
```

---

### BottomSheet

*stable* · *v2.2.0* — `overlay`

화면 하단에서 슬라이드 업되는 시트형 모달.

**Import:** `import { BottomSheet } from "@/ds/composites/BottomSheet";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` | ✓ | 열림 상태 |
| `onClose` | `() => void` | ✓ | 닫기 콜백 |
| `title` | `string` |  | 상단 제목 |
| `children` | `ReactNode` | ✓ | 시트 본문 |
| `height` | `"full" \| "auto" \| "half"` |  | 시트 높이 모드 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<BottomSheet open={open} onClose={() => setOpen(false)} title="옵션">
  <Menu />
</BottomSheet>
```

---

### BrandSwitcher

*stable* · *v2.5.0* — `theme` `control`

브랜드 전환 UI — `BrandProvider` 안에서 사용하면 자동으로 현재 브랜드를

**Import:** `import { BrandSwitcher } from "@/ds/composites/BrandSwitcher";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `"chips" \| "list" \| "select"` |  | 시각 변형 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<BrandProvider>
    <BrandSwitcher variant="chips" />
    <App />
  </BrandProvider>
```

---

### Breadcrumb

*stable* · *v2.2.0* — `navigation`

브레드크럼 네비게이션

**Import:** `import { Breadcrumb } from "@/ds/composites/Breadcrumb";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<BreadcrumbItem>` | ✓ | 경로 항목 목록 |
| `separator` | `ReactNode` |  | 항목 사이 구분자 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Breadcrumb items={[{label:"홈",href:"/"},{label:"프로젝트",href:"/projects"},{label:"설정"}]} />
```

---

### ButtonGroup

*stable* · *v2.2.0* — `form` `control`

버튼 그룹

**Import:** `import { ButtonGroup } from "@/ds/composites/ButtonGroup";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 자식 버튼 요소 |
| `separated` | `boolean` |  | 버튼 간 구분선 |
| `fullWidth` | `boolean` |  | 전체 너비 |
| `className` | `string` |  | 추가 클래스 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<ButtonGroup>
  <Button variant="secondary">왼쪽</Button>
  <Button variant="secondary">중앙</Button>
  <Button variant="secondary">오른쪽</Button>
</ButtonGroup>
```

---

### Callout

*stable* · *v2.2.0* — `feedback`

강조성 메시지 박스(정보/경고/팁 등)를 표시합니다.

**Import:** `import { Callout } from "@/ds/composites/Callout";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `"success" \| "warning" \| "danger" \| "info" \| "warn" \| "note" \| "tip"` |  | 콜아웃 유형. |
| `title` | `string` |  | 제목 |
| `children` | `React.ReactNode` | ✓ | 본문 내용 |
| `collapsible` | `boolean` |  | 접기/펼치기 가능 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Callout variant="info" title="알려드립니다">
  본문 내용을 입력하세요.
</Callout>
```

---

### Card

*stable* · *v2.2.0* — `layout`

Card 컴포넌트

**Import:** `import { Card } from "@/ds/composites/Card";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `hoverable` | `boolean` |  | 호버 시 카드에 시각적 피드백을 부여합니다. |
| `noPadding` | `boolean` |  | 카드 내부 패딩을 제거합니다. |
| `className` | `string` |  | 카드 루트 요소에 추가할 CSS 클래스. |
| `asChild` | `boolean` |  | 자식 엘리먼트로 렌더 위임 (Radix-style asChild). |

---

### Carousel

*stable* · *v2.2.0* — `media`

캐러셀

**Import:** `import { Carousel } from "@/ds/composites/Carousel";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `Array<ReactNode>` | ✓ | 슬라이드 항목 |
| `autoPlay` | `boolean` |  | 자동 재생 |
| `interval` | `number` |  | 자동 재생 간격 (ms) |
| `showDots` | `boolean` |  | 하단 도트 표시 |
| `showArrows` | `boolean` |  | 좌우 화살표 표시 |
| `loop` | `boolean` |  | 무한 반복 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Carousel showDots showArrows autoPlay interval={3000}>
  <img src="/a.jpg" /><img src="/b.jpg" />
</Carousel>
```

---

### CartItem

*stable* · *v2.3.0* — `ecommerce`

장바구니 아이템 행 (이미지 + 정보 + 수량조절 + 가격 + 삭제).

**Import:** `import { CartItem } from "@/ds/composites/CartItem";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `ReactNode` | ✓ | 상품명 |
| `variant` | `ReactNode` |  | 옵션/사이즈/색상 등 보조 정보 |
| `image` | `string` |  | 썸네일 URL |
| `price` | `ReactNode` | ✓ | 단가 |
| `subtotal` | `ReactNode` |  | 합계 (수량 × 단가) |
| `quantity` | `number` | ✓ | 수량 |
| `onQuantityChange` | `(q: number) => void` |  | 수량 변경 콜백 |
| `min` | `number` |  | 최소 수량 |
| `max` | `number` |  | 최대 수량 (재고) |
| `onRemove` | `() => void` |  | 삭제 콜백 (있으면 X 버튼 노출) |
| `disabled` | `boolean` |  | 비활성 (품절 등) |

**Example**

```tsx
<CartItem title="셔츠" image="/x.jpg" price="₩29,000" quantity={2} subtotal="₩58,000" onQuantityChange={...} onRemove={...} />
```

---

### ChapterList

*stable* · *v2.4.0* — `book` `navigation`

챕터 목차 — 활성/완독/잠금 + 트리.

**Import:** `import { ChapterList } from "@/ds/composites/ChapterList";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `chapters` | `Array<Chapter>` | ✓ |  |
| `activeId` | `string` |  |  |
| `completedIds` | `ReadonlyArray<string> \| Set<string>` |  |  |
| `onSelect` | `(chapter: Chapter) => void` |  |  |
| `className` | `string` |  |  |

**Example**

```tsx
<ChapterList chapters={data} activeId="ch-3" completedIds={["ch-1","ch-2"]} onSelect={goTo} />
```

---

### ChatBubble

*stable* · *v2.2.0* — `data-display`

채팅 메시지 말풍선.

**Import:** `import { ChatBubble } from "@/ds/composites/ChatBubble";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 메시지 본문 |
| `sender` | `string` |  | 보낸 사람 이름 |
| `avatar` | `ReactNode` |  | 아바타 요소 |
| `timestamp` | `string` |  | 타임스탬프 텍스트 |
| `side` | `"left" \| "right"` |  | 말풍선 정렬 위치 |
| `variant` | `"default" \| "primary"` |  | 말풍선 스타일 변형 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ChatBubble sender="홍길동" side="left" timestamp="오후 3:24">
  안녕하세요!
</ChatBubble>
```

---

### CheckboxCardGroup

*stable* · *v2.3.0* — `input`

체크박스 카드 그룹 — 다중 선택 가능한 풍부한 카드.

**Import:** `import { CheckboxCardGroup } from "@/ds/composites/CheckboxCardGroup";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `options` | `Array<CheckboxCardOption>` | ✓ | 옵션 |
| `value` | `Array<string>` |  | 선택값 |
| `defaultValue` | `Array<string>` |  | 기본값 |
| `onChange` | `(values: string[]) => void` |  | 변경 콜백 |
| `columns` | `number` |  | 컬럼 수 |
| `max` | `number` |  | 최대 선택 개수 |

**Example**

```tsx
<CheckboxCardGroup options={[{value:"a",title:"옵션 A"}]} onChange={console.log} />
```

---

### Clock

*stable* · *v2.3.0* — `data-display`

라이브 시계 (디지털/아날로그).

**Import:** `import { Clock } from "@/ds/composites/Clock";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `mode` | `ClockMode` |  | 표시 형식 |
| `hour24` | `boolean` |  | 24시간제 (digital 전용) |
| `showSeconds` | `boolean` |  | 초 표시 여부 |
| `timeZone` | `string` |  | 시간대 (IANA, 예: "Asia/Seoul") |
| `size` | `number` |  | 아날로그 크기(px) |

**Example**

```tsx
<Clock mode="digital" showSeconds />
<Clock mode="analog" size={140} timeZone="America/New_York" />
```

---

### CodeEditor

*stable* · *v2.2.0* — `form` `input`

신택스 하이라이팅이 적용된 코드 편집기.

**Import:** `import { CodeEditor } from "@/ds/composites/CodeEditor";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` | ✓ | 편집기 코드 값 |
| `onChange` | `(value: string) => void` |  | 값 변경 콜백 |
| `language` | `string` |  | 언어 라벨 (상단 표시) |
| `readOnly` | `boolean` |  | 읽기 전용 여부 |
| `lineNumbers` | `boolean` |  | 줄 번호 표시 여부 |
| `minHeight` | `number` |  | 최소 높이(px) |
| `className` | `string` |  | 추가 클래스 |
| `aria-label` | `string` |  | 스크린리더용 라벨 (기본 "코드 편집기") |

**Example**

```tsx
<CodeEditor value={code} onChange={setCode} language="typescript" lineNumbers />
```

---

### Collapsible

*stable* · *v2.2.0* — `disclosure`

접기/펼치기 컴포넌트 (단일 항목)

**Import:** `import { Collapsible } from "@/ds/composites/Collapsible";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` |  | 열림 상태 (controlled) |
| `onOpenChange` | `(open: boolean) => void` |  | 열림 상태 변경 콜백 |
| `trigger` | `ReactNode` | ✓ | 트리거 요소 |
| `children` | `ReactNode` | ✓ | 펼쳐졌을 때 보여줄 내용 |
| `defaultOpen` | `boolean` |  | 초기 열림 상태 (uncontrolled) |
| `className` | `string` |  | 추가 클래스 |
| `aria-label` | `string` |  | 트리거가 텍스트가 아닌 경우 사용할 접근성 라벨 |

**Example**

```tsx
<Collapsible trigger={<span>더보기</span>}>
  <p>숨겨진 내용</p>
</Collapsible>
```

---

### CollectionView

*stable* · *v2.2.0* — `data`

검색·필터·뷰 전환을 지원하는 컬렉션 뷰어.

**Import:** `import { CollectionView } from "@/ds/composites/CollectionView";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<CollectionItem>` | ✓ | 컬렉션 항목 목록 |
| `view` | `"list" \| "grid"` |  | 뷰 모드 |
| `searchable` | `boolean` |  | 검색 가능 |
| `filterable` | `boolean` |  | 카테고리 필터 |
| `columns` | `2 \| 3 \| 4` |  | 그리드 컬럼 수 |
| `emptyMessage` | `string` |  | 빈 상태 메시지 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<CollectionView items={items} view="grid" searchable filterable />
```

---

### ColorPicker

*stable* · *v2.2.0* — `form` `input`

색상 선택기

**Import:** `import { ColorPicker } from "@/ds/composites/ColorPicker";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` | ✓ | 선택된 HEX 색상 |
| `onChange` | `(color: string) => void` | ✓ | 색상 변경 콜백 |
| `presets` | `Array<string>` |  | 프리셋 색상 배열 |
| `showInput` | `boolean` |  | HEX 입력 필드 표시 여부 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ColorPicker value={color} onChange={setColor} showInput />
```

---

### ColorSwatch

*stable* · *v2.2.0* — `data-display`

색상 팔레트에서 색을 선택하는 스와치.

**Import:** `import { ColorSwatch } from "@/ds/composites/ColorSwatch";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `colors` | `Array<string>` | ✓ | 표시할 색상 목록 |
| `selected` | `string` |  | 선택된 색상 |
| `onSelect` | `(color: string) => void` |  | 색상 선택 콜백 |
| `size` | `"sm" \| "md" \| "lg"` |  | 스와치 크기 |
| `showLabel` | `boolean` |  | 선택된 색상의 HEX 라벨 표시 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ColorSwatch colors={["#f00", "#0f0", "#00f"]} selected={color} onSelect={setColor} />
```

---

### Combobox

*stable* · *v2.2.0* — `form` `input`

콤보박스 (자동완성 + 셀렉트 + 생성)

**Import:** `import { Combobox } from "@/ds/composites/Combobox";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `options` | `Array<ComboboxOption>` | ✓ | 선택 옵션 목록 |
| `value` | `string` |  | 선택된 값 |
| `onChange` | `(value: string) => void` |  | 값 변경 콜백 |
| `onInputChange` | `(query: string) => void` |  | 입력 변경 콜백 (async 검색용) |
| `placeholder` | `string` |  | 플레이스홀더 |
| `creatable` | `boolean` |  | 새 값 생성 허용 |
| `onCreateLabel` | `string` |  | 새 값 생성 라벨 |
| `loading` | `boolean` |  | 비동기 로딩 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `error` | `boolean` |  | 에러 상태 |
| `emptyMessage` | `string` |  | 결과 없을 때 메시지 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Combobox options={users} value={v} onChange={setV} creatable placeholder="사용자 검색..." />
```

---

### CommentThread

*stable* · *v2.4.0* — `sns` `content`

중첩 댓글 스레드 — 좋아요/답글 + 깊이 제한.

**Import:** `import { CommentThread } from "@/ds/composites/CommentThread";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `comments` | `Array<Comment>` | ✓ |  |
| `onToggleLike` | `(commentId: string) => void` |  | 좋아요 토글 |
| `onReply` | `(commentId: string) => void` |  | 답글 작성 콜백 |
| `maxDepth` | `number` |  | 최대 표시 깊이 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<CommentThread comments={comments} onToggleLike={…} onReply={…} maxDepth={3} />
```

---

### CompareSlider

*stable* · *v2.2.0* — `media`

두 이미지를 좌/우로 비교하는 슬라이더.

**Import:** `import { CompareSlider } from "@/ds/composites/CompareSlider";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `before` | `string` | ✓ | Before 이미지 URL |
| `after` | `string` | ✓ | After 이미지 URL |
| `beforeLabel` | `string` |  | Before 라벨 |
| `afterLabel` | `string` |  | After 라벨 |
| `initialPosition` | `number` |  | 초기 슬라이더 위치(%) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<CompareSlider before="/before.jpg" after="/after.jpg" beforeLabel="이전" afterLabel="이후" />
```

---

### ComparisonGrid

*stable* · *v2.2.0* — `data`

비교 지표 그리드

**Import:** `import { ComparisonGrid } from "@/ds/composites/ComparisonGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `cards` | `Array<ComparisonCard>` | ✓ | 비교 카드 목록 |
| `columns` | `2 \| 3 \| 4` |  | 그리드 컬럼 수 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ComparisonGrid
  cards={[
    { key: "total", label: "전체", value: 1200 },
    { key: "diff", label: "차이", value: 3, hasVariance: true, change: { value: "+3", direction: "up" } },
  ]}
/>
```

---

### ComponentShowcase

*stable* · *v2.2.0* — `misc`

검색·필터·그리드/리스트 뷰를 갖춘 컴포넌트 카탈로그.

**Import:** `import { ComponentShowcase } from "@/ds/composites/ComponentShowcase";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<ShowcaseItem>` | ✓ | 쇼케이스 항목 목록 |
| `searchable` | `boolean` |  | 검색 입력 표시 여부 |
| `filterable` | `boolean` |  | 카테고리 필터 표시 여부 |
| `columns` | `2 \| 3 \| 4` |  | 그리드 컬럼 수 |
| `onItemClick` | `(item: ShowcaseItem) => void` |  | 항목 클릭 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ComponentShowcase items={items} searchable columns={3} />
```

---

### Confetti

*stable* · *v2.2.0* — `feedback`

축하/완료 시점에 화면을 가득 채우는 색종이 효과.

**Import:** `import { Confetti } from "@/ds/composites/Confetti";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `active` | `boolean` | ✓ | 활성화 여부 |
| `count` | `number` |  | 파티클 수 |
| `duration` | `number` |  | 애니메이션 지속 시간(ms) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Confetti active={success} count={150} duration={3000} />
```

---

### ConfirmDialog

*stable* · *v2.2.0* — `overlay` `feedback`

확인 다이얼로그

**Import:** `import { ConfirmDialog } from "@/ds/composites/ConfirmDialog";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` | ✓ | 열림 상태 |
| `onClose` | `() => void` | ✓ | 닫기 콜백 |
| `onConfirm` | `() => void` | ✓ | 확인 콜백 |
| `title` | `string` | ✓ | 다이얼로그 제목 |
| `description` | `ReactNode` |  | 본문 설명 |
| `confirmLabel` | `string` |  | 확인 버튼 텍스트 |
| `cancelLabel` | `string` |  | 취소 버튼 텍스트 |
| `danger` | `boolean` |  | 위험 액션 여부 |
| `loading` | `boolean` |  | 로딩 상태 |

**Example**

```tsx
<ConfirmDialog
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="정말 삭제하시겠습니까?"
  description="이 작업은 되돌릴 수 없습니다."
  danger
  confirmLabel="삭제"
/>
```

---

### ContextMenu

*stable* · *v2.2.0* — `overlay` `navigation`

우클릭 컨텍스트 메뉴

**Import:** `import { ContextMenu } from "@/ds/composites/ContextMenu";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<ContextMenuItem>` | ✓ | 메뉴 항목 목록 |
| `children` | `ReactNode` | ✓ | 우클릭 영역(자식) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ContextMenu items={[{ key: "copy", label: "복사", shortcut: "Ctrl+C" }]}>
  <div>우클릭 영역</div>
</ContextMenu>
```

---

### CookieConsent

*stable* · *v2.3.0* — `compliance`

GDPR/CCPA 쿠키 동의 배너.

**Import:** `import { CookieConsent } from "@/ds/composites/CookieConsent";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `message` | `ReactNode` |  | 메시지 본문 |
| `categories` | `Array<CookieCategory>` |  | 카테고리 (custom 모드) |
| `acceptLabel` | `string` |  | "모두 수락" 라벨 |
| `rejectLabel` | `string` |  | "필수만" 라벨 |
| `customizeLabel` | `string` |  | "맞춤설정" 라벨 (categories 있을 때) |
| `policyHref` | `string` |  | 정책 링크 |
| `storageKey` | `string` |  | localStorage 키 |
| `position` | `"bottom" \| "bottom-left" \| "bottom-right"` |  | 위치 |
| `onConsent` | `(categories: Record<string, boolean>) => void` |  | 동의 결과 콜백 |

**Example**

```tsx
<CookieConsent message="이 사이트는 쿠키를 사용합니다" policyHref="/privacy" />
```

---

### CopyBlock

*stable* · *v2.2.0* — `data-display`

코드 블록 + 복사 버튼이 포함된 코드 미리보기.

**Import:** `import { CopyBlock } from "@/ds/composites/CopyBlock";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `code` | `string` | ✓ | 표시할 코드 텍스트 |
| `language` | `string` |  | 언어 라벨 |
| `showLineNumbers` | `boolean` |  | 줄 번호 표시 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<CopyBlock code={"npm install @junds/ui"} language="bash" />
```

---

### Countdown

*stable* · *v2.3.0* — `feedback`

카운트다운 타이머. 1초 간격으로 갱신.

**Import:** `import { Countdown } from "@/ds/composites/Countdown";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `to` | `string \| number \| Date` | ✓ | 만료 시각 (Date 또는 ISO 문자열 또는 timestamp) |
| `format` | `CountdownFormat` |  | 표시 형식 |
| `labels` | `{ d?: string; h?: string; m?: string; s?: string; }` |  | 일/시/분/초 라벨 |
| `onComplete` | `() => void` |  | 만료 시 콜백 |
| `completedContent` | `ReactNode` |  | 만료 시 표시할 내용 |

**Example**

```tsx
<Countdown to="2026-12-31T23:59:59Z" onComplete={() => alert('done')} />
```

---

### CronExpression

*stable* · *v2.2.0* — `form` `input`

cron 표현식을 시각적으로 편집하는 입력기.

**Import:** `import { CronExpression } from "@/ds/composites/CronExpression";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` | ✓ | Cron 표현식 값 |
| `onChange` | `(value: string) => void` | ✓ | 값 변경 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<CronExpression value={cron} onChange={setCron} />
```

---

### CTASection

*stable* · *v2.3.0* — `marketing`

강조형 CTA 섹션 (랜딩 페이지 하단 행동 유도).

**Import:** `import { CTASection } from "@/ds/composites/CTASection";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `CTAVariant` |  | 변형 |
| `title` | `ReactNode` | ✓ | 메인 제목 |
| `description` | `ReactNode` |  | 부제 |
| `primaryCta` | `CTAButton` |  | Primary CTA |
| `secondaryCta` | `CTAButton` |  | Secondary CTA |
| `media` | `ReactNode` |  | 우측 미디어 (split 전용) |

**Example**

```tsx
<CTASection variant="gradient" title="지금 시작하세요" primaryCta={{label:"무료 가입"}} />
```

---

### DataGrid

*stable* · *v2.2.0* — `data`

페이징·선택이 지원되는 데이터 그리드.

**Import:** `import { DataGrid } from "@/ds/composites/DataGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `Array<T>` | ✓ | 표 행 데이터 |
| `columns` | `Array<DataGridColumn<T>>` | ✓ | 열 정의 |
| `pageSize` | `number` |  | 페이지당 행 수 |
| `selectable` | `boolean` |  | 행 선택 가능 여부 |
| `onSelect` | `(selected: T[]) => void` |  | 선택 변경 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<DataGrid data={rows} columns={cols} pageSize={20} selectable onSelect={setSelected} />
```

---

### DateInput

*stable* · *v2.2.0* — `form` `input`

날짜 입력

**Import:** `import { DateInput } from "@/ds/composites/DateInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `error` | `boolean` |  | 에러 상태 |
| `onClear` | `() => void` |  | 값 초기화 콜백 |

**Example**

```tsx
<DateInput value={date} onChange={e => setDate(e.target.value)} onClear={() => setDate("")} />
```

---

### DateRangeFilter

*stable* · *v2.2.0* — `form` `input`

날짜 범위 필터

**Import:** `import { DateRangeFilter } from "@/ds/composites/DateRangeFilter";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `startDate` | `string` | ✓ | 시작일 (YYYY-MM-DD) |
| `endDate` | `string` | ✓ | 종료일 (YYYY-MM-DD) |
| `onStartChange` | `(date: string) => void` | ✓ | 시작일 변경 콜백 |
| `onEndChange` | `(date: string) => void` | ✓ | 종료일 변경 콜백 |
| `onApply` | `() => void` | ✓ | 조회(적용) 콜백 |
| `onReset` | `() => void` |  | 초기화 콜백 |
| `presets` | `Array<DatePreset>` |  | 프리셋 버튼 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<DateRangeFilter
  startDate={start}
  endDate={end}
  onStartChange={setStart}
  onEndChange={setEnd}
  onApply={handleApply}
  onReset={handleReset}
/>
```

---

### DateRangePicker

*stable* · *v2.2.0* — `form` `input`

날짜 범위 선택기

**Import:** `import { DateRangePicker } from "@/ds/composites/DateRangePicker";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `DateRange` | ✓ | 선택된 날짜 범위 |
| `onChange` | `(range: DateRange) => void` | ✓ | 범위 변경 콜백 |
| `placeholder` | `string` |  | 플레이스홀더 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `minDate` | `Date` |  | 선택 가능한 최소 날짜 |
| `maxDate` | `Date` |  | 선택 가능한 최대 날짜 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<DateRangePicker value={range} onChange={setRange} />
```

---

### Descriptions

*stable* · *v2.2.0* — `data-display`

디스크립션 — 키-값 쌍 표시 컴포넌트

**Import:** `import { Descriptions } from "@/ds/composites/Descriptions";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<DescriptionItem>` | ✓ | 키-값 항목 목록 |
| `title` | `string` |  | 상단 제목 |
| `columns` | `number` |  | 한 행에 표시할 컬럼 수 |
| `bordered` | `boolean` |  | 테두리 표시 여부 |
| `layout` | `"horizontal" \| "vertical"` |  | 라벨/값 레이아웃 방향 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Descriptions
  title="사용자 정보"
  items={[
    { key:"name", label:"이름", value:"홍길동" },
    { key:"email", label:"이메일", value:"hong@example.com" },
  ]}
  columns={2}
  bordered
/>
```

---

### DetailPanel

*stable* · *v2.2.0* — `data-display`

디테일 패널

**Import:** `import { DetailPanel } from "@/ds/composites/DetailPanel";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` | ✓ | 열림 상태 |
| `onClose` | `() => void` | ✓ | 닫기 콜백 |
| `title` | `string` | ✓ | 패널 제목 |
| `subtitle` | `string` |  | 부제목 |
| `status` | `"success" \| "warning" \| "danger" \| "info"` |  | 상태 배지 |
| `tabs` | `Array<DetailPanelTab>` |  | 탭 목록 |
| `children` | `ReactNode` |  | 탭이 없을 때 표시할 본문 |
| `width` | `number` |  | 패널 너비(px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<DetailPanel
  open={isOpen}
  onClose={close}
  title="주문 상세"
  subtitle="주문번호 #12345"
  status="success"
  tabs={[
    { key: "info", label: "정보", content: <InfoContent /> },
    { key: "history", label: "이력", content: <HistoryContent />, badge: 3 },
  ]}
/>
```

---

### DiffViewer

*stable* · *v2.2.0* — `data-display`

두 텍스트 간 차이를 강조 표시하는 diff 뷰어.

**Import:** `import { DiffViewer } from "@/ds/composites/DiffViewer";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `oldText` | `string` | ✓ | 이전 텍스트 |
| `newText` | `string` | ✓ | 새 텍스트 |
| `oldTitle` | `string` |  | 이전 제목 라벨 |
| `newTitle` | `string` |  | 새 제목 라벨 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<DiffViewer oldText={prev} newText={next} oldTitle="v1" newTitle="v2" />
```

---

### Disclosure

*stable* · *v2.3.0* — `disclosure` `layout`

단일 토글 가능한 패널을 위한 compound 컴포넌트.

**Import:** `import { Disclosure } from "@/ds/composites/Disclosure";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `defaultOpen` | `boolean` |  | 초기 열림 상태 (uncontrolled). |
| `open` | `boolean` |  | 외부에서 제어할 때의 열림 상태 (controlled). `onOpenChange`와 함께 사용. |
| `onOpenChange` | `(open: boolean) => void` |  | 열림 상태가 바뀌면 호출됩니다 (uncontrolled / controlled 양쪽). |
| `asChild` | `boolean` |  | Radix-style Slot 위임. `true`이면 Disclosure 루트가 자체 `<div>` 대신 |
| `children` | `ReactNode` | ✓ |  |

**Example**

```tsx
<Disclosure defaultOpen={false}>
    <Disclosure.Trigger className="font-semibold">자세히 보기</Disclosure.Trigger>
    <Disclosure.Content>여기에 숨겨진 내용이 들어갑니다.</Disclosure.Content>
  </Disclosure>
```

---

### Dock

*stable* · *v2.2.0* — `navigation`

Dock 컴포넌트

**Import:** `import { Dock } from "@/ds/composites/Dock";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 도크 아이템 (DockItem) |
| `magnification` | `number` |  | 호버 시 확대 배율 |
| `className` | `string` |  | 추가 클래스 |

---

### DocPager

*stable* · *v2.3.0* — `navigation` `content`

문서 하단의 이전/다음 문서 내비게이션.

**Import:** `import { DocPager } from "@/ds/composites/DocPager";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `prev` | `DocPagerEntry \| null` |  | 이전 문서 (없으면 자리만 비워 다음 문서가 오른쪽에 남는다) |
| `next` | `DocPagerEntry \| null` |  | 다음 문서 |
| `prevLabel` | `string` |  | 이전 쪽 라벨 (기본 `"이전 문서"`) |
| `nextLabel` | `string` |  | 다음 쪽 라벨 (기본 `"다음 문서"`) |
| `ariaLabel` | `string` |  | nav 의 접근성 라벨 |
| `renderLink` | `(props: { href: string; className: string; children: ReactNode; }) => ReactNode` |  | 링크 렌더러. Next.js `<Link>` 나 react-router `<Link>` 를 쓰려면 넘긴다. |

**Example**

```tsx
// Next.js 라우터와 함께
<DocPager next={next} renderLink={({ href, className, children }) => (
  <Link href={href} className={className}>{children}</Link>
)} />
```

---

### Drawer

*stable* · *v2.2.0* — `overlay`

슬라이드 인 패널 (Drawer / Sheet)

**Import:** `import { Drawer } from "@/ds/composites/Drawer";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` | ✓ | 열림 상태 |
| `onClose` | `() => void` | ✓ | 닫기 콜백 |
| `side` | `DrawerSide` |  | 열리는 방향 |
| `size` | `DrawerSize` |  | 드로어 크기 |
| `title` | `string` |  | 헤더 제목 |
| `children` | `ReactNode` | ✓ | 본문 콘텐츠 |
| `footer` | `ReactNode` |  | 푸터 영역 |
| `dismissible` | `boolean` |  | 외부 클릭/ESC로 닫기 허용 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Drawer open={isOpen} onClose={close} side="right" title="필터">
  <FilterContent />
</Drawer>
```

---

### Dropdown

*stable* · *v2.2.0* — `overlay` `navigation`

드롭다운 메뉴

**Import:** `import { Dropdown } from "@/ds/composites/Dropdown";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `trigger` | `ReactNode` | ✓ | 트리거 요소 |
| `items` | `Array<DropdownItem>` | ✓ | 메뉴 항목 목록 |
| `onSelect` | `(key: string) => void` | ✓ | 항목 선택 콜백 |
| `align` | `"left" \| "right"` |  | 정렬 방향 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Dropdown trigger={<IconButton icon={<MoreIcon />} label="메뉴" />} items={[...]} onSelect={handleAction} />
```

---

### EmojiPicker

*stable* · *v2.2.0* — `form` `input`

카테고리별 이모지를 선택할 수 있는 피커.

**Import:** `import { EmojiPicker } from "@/ds/composites/EmojiPicker";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `onSelect` | `(emoji: string) => void` | ✓ | 이모지 선택 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<EmojiPicker onSelect={(emoji) => append(emoji)} />
```

---

### EmojiReaction

*stable* · *v2.3.0* — `social`

Slack/GitHub 스타일 이모지 반응 바.

**Import:** `import { EmojiReaction } from "@/ds/composites/EmojiReaction";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `reactions` | `Array<EmojiReactionItem>` | ✓ | 반응 목록 |
| `onToggle` | `(emoji: string) => void` |  | 반응 토글 |
| `onAddReaction` | `() => void` |  | + 버튼 클릭 (이모지 피커 열기) |
| `showAddButton` | `boolean` |  | + 버튼 노출 |

**Example**

```tsx
<EmojiReaction reactions={[{emoji:"👍", count:3, reactedByMe:true}]} onToggle={console.log} />
```

---

### EmptyState

*stable* · *v2.2.0* — `feedback`

빈 상태 표시

**Import:** `import { EmptyState } from "@/ds/composites/EmptyState";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `icon` | `ReactNode` |  | 표시할 아이콘 |
| `title` | `string` | ✓ | 제목 텍스트 |
| `description` | `string` |  | 설명 텍스트 |
| `action` | `ReactNode` |  | 하단 액션 버튼 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<EmptyState title="업무가 없습니다" description="새 업무를 추가해보세요" action={<Button>추가</Button>} />
```

---

### ExifPanel

*stable* · *v2.4.0* — `photo` `data-display`

EXIF 패널 — 카메라/렌즈/노출 정보 표시.

**Import:** `import { ExifPanel } from "@/ds/composites/ExifPanel";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `ExifData` | ✓ | EXIF 메타데이터 |
| `compact` | `boolean` |  | 컴팩트 표시 (단일 라인) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ExifPanel data={{ camera:"Sony α7 IV", lens:"24-70 GM", focalLength:"50mm", aperture:"f/2.8", shutter:"1/250", iso:200 }} />
```

---

### FilterButtonGroup

*stable* · *v2.2.0* — `form` `control`

필터 버튼 그룹

**Import:** `import { FilterButtonGroup } from "@/ds/composites/FilterButtonGroup";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `options` | `Array<FilterOption>` | ✓ | 필터 옵션 목록 |
| `value` | `string` | ✓ | 선택된 값 |
| `onChange` | `(key: string) => void` | ✓ | 값 변경 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FilterButtonGroup
  options={[
    { key: "all", label: "전체", count: 120 },
    { key: "active", label: "활성", count: 85 },
    { key: "inactive", label: "비활성", count: 35 },
  ]}
  value={filter}
  onChange={setFilter}
/>
```

---

### FloatingActionButton

*stable* · *v2.2.0* — `form` `control`

플로팅 액션 버튼 (FAB)

**Import:** `import { FloatingActionButton } from "@/ds/composites/FloatingActionButton";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `actions` | `Array<FloatingAction>` | ✓ | 표시할 액션 목록 |
| `position` | `"bottom-left" \| "bottom-right" \| "top-right" \| "top-left"` |  | 위치 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FloatingActionButton
  actions={[
    { key: "add", icon: <PlusIcon />, label: "추가", onClick: handleAdd },
    { key: "edit", icon: <EditIcon />, label: "편집", onClick: handleEdit, variant: "secondary" },
  ]}
  position="bottom-right"
/>
```

---

### FormField

*stable* · *v2.2.0* — `form`

폼 필드 래퍼 (Label + Input + Error + Hint)

**Import:** `import { FormField } from "@/ds/composites/FormField";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `label` | `string` |  | 필드 라벨 |
| `required` | `boolean` |  | 필수 여부 |
| `error` | `string` |  | 에러 메시지 |
| `hint` | `string` |  | 힌트 텍스트 |
| `htmlFor` | `string` |  | 라벨이 가리킬 입력 요소의 id. |
| `children` | `ReactNode` | ✓ | 입력 요소. |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FormField label="이름" required error={errors.name} hint="실명을 입력하세요.">
  <Input />
</FormField>
```

---

### FunnelChart

*stable* · *v2.2.0* — `chart`

단계별 전환율을 시각화하는 퍼널 차트.

**Import:** `import { FunnelChart } from "@/ds/composites/FunnelChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `Array<{ label: string; value: number; color?: string; }>` | ✓ | 퍼널 단계 데이터 |
| `height` | `number` |  | 차트 높이(px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FunnelChart data={[{ label: "방문", value: 1000 }, { label: "구매", value: 200 }]} />
```

---

### GaugeChart

*stable* · *v2.2.0* — `chart`

반원형 게이지로 단일 값을 시각화합니다.

**Import:** `import { GaugeChart } from "@/ds/composites/GaugeChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` | ✓ | 현재 값 |
| `min` | `number` |  | 최솟값 |
| `max` | `number` |  | 최댓값 |
| `label` | `string` |  | 중앙 라벨 |
| `size` | `number` |  | 차트 크기(px) |
| `segments` | `Array<{ color: string; from: number; to: number; }>` |  | 구간별 색상 정의 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<GaugeChart value={72} min={0} max={100} label="진행률" />
```

---

### Globe

*stable* · *v2.2.0* — `data-display`

회전하는 인터랙티브 3D 지구본.

**Import:** `import { Globe } from "@/ds/composites/Globe";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `size` | `number` |  | 글로브 크기(px) |
| `color` | `string` |  | 기본 색상 |
| `dotColor` | `string` |  | 점 색상 |
| `speed` | `number` |  | 회전 속도 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Globe size={400} dotColor="var(--accent)" speed={0.5} />
```

---

### GradientBorder

*stable* · *v2.2.0* — `layout`

그라디언트 테두리 효과를 가진 래퍼.

**Import:** `import { GradientBorder } from "@/ds/composites/GradientBorder";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 감싸질 콘텐츠 |
| `gradient` | `string` |  | 그라디언트 색상 배열 |
| `borderWidth` | `number` |  | 테두리 두께(px) |
| `rounded` | `string` |  | 모서리 둥글기 |
| `animated` | `boolean` |  | 애니메이션 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<GradientBorder gradient="purple-pink" rounded animated>
  <Card>...</Card>
</GradientBorder>
```

---

### Heatmap

*stable* · *v2.2.0* — `chart`

2차원 데이터를 색 강도로 표현하는 히트맵.

**Import:** `import { Heatmap } from "@/ds/composites/Heatmap";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `Array<{ date: string; value: number; }>` | ✓ | 히트맵 셀 데이터 |
| `colorScale` | `Array<string>` |  | 색상 스케일 |
| `cellSize` | `number` |  | 셀 크기(px) |
| `gap` | `number` |  | 셀 간격(px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Heatmap data={matrix} colorScale="blue" cellSize={12} />
```

---

### Hint

*stable* · *v2.3.0* — `feedback`

인라인 보조 텍스트 (form 도움말, 미세 안내).

**Import:** `import { Hint } from "@/ds/composites/Hint";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `HintVariant` |  | 변형 |
| `icon` | `ReactNode` |  | 좌측 아이콘 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |
| `children` | `ReactNode` | ✓ | 본문 |

**Example**

```tsx
<Hint variant="info">8자 이상 입력해주세요</Hint>
```

---

### HoverCard

*stable* · *v2.2.0* — `overlay`

호버 카드

**Import:** `import { HoverCard } from "@/ds/composites/HoverCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `trigger` | `ReactNode` | ✓ | 트리거 요소 |
| `children` | `ReactNode` | ✓ | 호버 시 표시할 콘텐츠 |
| `side` | `"left" \| "right" \| "bottom" \| "top"` |  | 표시 방향 |
| `openDelay` | `number` |  | 열림 지연(ms) |
| `closeDelay` | `number` |  | 닫힘 지연(ms) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<HoverCard trigger={<span>@사용자</span>} side="bottom">
  <div>사용자 프로필 미리보기</div>
</HoverCard>
```

---

### ImageCompare

*stable* · *v2.4.0* — `photo` `media`

이미지 비교 — 슬라이더로 before/after 분할 비교.

**Import:** `import { ImageCompare } from "@/ds/composites/ImageCompare";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `beforeSrc` | `string` | ✓ | 이전 이미지 |
| `afterSrc` | `string` | ✓ | 이후 이미지 |
| `beforeAlt` | `string` | ✓ | 이전 alt |
| `afterAlt` | `string` | ✓ | 이후 alt |
| `initialSplit` | `number` |  | 초기 분할 비율 (0-100) |
| `aspectRatio` | `string` |  | 종횡비 |
| `showLabels` | `boolean` |  | 라벨 표시 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ImageCompare beforeSrc="/old.jpg" afterSrc="/new.jpg" beforeAlt="원본" afterAlt="보정" />
```

---

### ImageCropper

*stable* · *v2.2.0* — `media`

이미지를 잘라내는 크로퍼.

**Import:** `import { ImageCropper } from "@/ds/composites/ImageCropper";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `src` | `string` | ✓ | 이미지 소스 URL |
| `aspectRatio` | `number` |  | 크롭 영역 종횡비 |
| `onCrop` | `(dataUrl: string) => void` |  | 크롭 결과 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ImageCropper src={imageUrl} aspectRatio={1} onCrop={setCropped} />
```

---

### ImageLightbox

*stable* · *v2.2.0* — `media` `overlay`

이미지를 클릭해 확대 보기를 띄우는 라이트박스.

**Import:** `import { ImageLightbox } from "@/ds/composites/ImageLightbox";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `src` | `string` | ✓ | 이미지 URL |
| `alt` | `string` |  | 대체 텍스트 |
| `children` | `React.ReactNode` |  | 썸네일 클릭 시 확대 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ImageLightbox src="/photo.jpg" alt="사진" />
```

---

### ImageWithFallback

*stable* · *v2.4.0* — `photo` `media`

이미지 + 스켈레톤 + 에러 폴백 — 로드 실패 시 대체 이미지/플레이스홀더 표시.

**Import:** `import { ImageWithFallback } from "@/ds/composites/ImageWithFallback";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `fallbackSrc` | `string` |  | 대체 이미지 URL |
| `fallback` | `ReactNode` |  | 대체 이미지 대신 렌더할 노드 (`fallbackSrc` 보다 우선) |
| `showSkeleton` | `boolean` |  | 로딩 중 스켈레톤 표시 |
| `aspectRatio` | `string` |  | 종횡비 |
| `containerClassName` | `string` |  | 컨테이너 클래스 |
| `retry` | `number` |  | 로드 실패 시 빠른 재시도 횟수 (기본 0 = 재시도 안 함). |
| `revive` | `boolean` |  | 폴백이 뜬 뒤에도 백그라운드에서 소생을 계속 시도할지 (기본 false). |

**Example**

```tsx
// 외부 호스트 이미지 — 흔들려도 끝까지 되살린다
<ImageWithFallback src={cover} retry={3} revive fallback={<CategoryLabel />} />
```

---

### ImageZoom

*stable* · *v2.4.0* — `photo` `media`

이미지 줌 — 더블클릭 확대, 드래그 이동, 스크롤 줌.

**Import:** `import { ImageZoom } from "@/ds/composites/ImageZoom";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `src` | `string` | ✓ |  |
| `alt` | `string` | ✓ |  |
| `maxZoom` | `number` |  | 최대 확대 배율 |
| `minZoom` | `number` |  | 최소 확대 배율 |
| `aspectRatio` | `string` |  | 종횡비 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ImageZoom src="/full.jpg" alt="작품 전체" maxZoom={5} />
```

---

### InlineEdit

*stable* · *v2.2.0* — `form` `input`

클릭으로 인라인 편집 모드로 전환되는 텍스트.

**Import:** `import { InlineEdit } from "@/ds/composites/InlineEdit";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` | ✓ | 현재 값 |
| `onChange` | `(value: string) => void` | ✓ | 값 변경 콜백 |
| `placeholder` | `string` |  | 빈 값일 때 표시할 안내 문구 |
| `disabled` | `boolean` |  | 편집 비활성화 여부 |
| `as` | `"span" \| "h1" \| "h2" \| "h3" \| "p"` |  | 렌더링할 태그 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<InlineEdit value={title} onChange={setTitle} placeholder="제목을 입력하세요" />
```

---

### JSONViewer

*stable* · *v2.2.0* — `data-display`

JSON 데이터를 트리 구조로 펼쳐서 보여주는 뷰어.

**Import:** `import { JSONViewer } from "@/ds/composites/JSONViewer";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `unknown` | ✓ | 표시할 JSON 데이터 |
| `initialExpanded` | `boolean` |  | 초기 펼침 상태 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<JSONViewer data={response} initialExpanded />
```

---

### KeyValueGrid

*stable* · *v2.2.0* — `data-display`

키-값 그리드

**Import:** `import { KeyValueGrid } from "@/ds/composites/KeyValueGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<KeyValueItem>` | ✓ | 표시할 키-값 항목 목록 |
| `columns` | `2 \| 3 \| 4` |  | 그리드 열 수 |
| `bordered` | `boolean` |  | 테두리 스타일 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<KeyValueGrid
  items={[
    { key: "name", label: "이름", value: "홍길동" },
    { key: "email", label: "이메일", value: "hong@example.com" },
  ]}
  columns={2}
  bordered
/>
```

---

### LineChart

*stable* · *v2.3.0* — `chart`

경량 SVG 라인 차트 (외부 라이브러리 X). 다중 시리즈, 영역 채움, 부드러운 곡선 지원.

**Import:** `import { LineChart } from "@/ds/composites/LineChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `labels` | `Array<string>` |  | x 축 라벨 |
| `series` | `Array<LineSeries>` | ✓ | 시리즈 (단일/다중) |
| `width` | `number` |  | 너비 |
| `height` | `number` |  | 높이 |
| `showYAxis` | `boolean` |  | Y축 라벨 표시 |
| `showXAxis` | `boolean` |  | X축 라벨 표시 |
| `showGrid` | `boolean` |  | 그리드 표시 |
| `showDots` | `boolean` |  | 점 표시 |
| `smooth` | `boolean` |  | 곡선 보간 |

**Example**

```tsx
<LineChart labels={["1월","2월","3월"]} series={[{name:"매출", data:[10,20,15]}]} />
```

---

### LoadingButton

*stable* · *v2.3.0* — `input`

로딩 상태를 가진 버튼 (네트워크 호출 중 자동 비활성).

**Import:** `import { LoadingButton } from "@/ds/composites/LoadingButton";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `loading` | `boolean` |  | 로딩 상태 |
| `loadingText` | `ReactNode` |  | 로딩 중 표시할 텍스트 (없으면 기존 children 유지) |
| `variant` | `LoadingButtonVariant` |  | 변형 |
| `size` | `LoadingButtonSize` |  | 크기 |
| `fullWidth` | `boolean` |  | full-width |
| `leftIcon` | `ReactNode` |  | 좌측 아이콘 |

**Example**

```tsx
<LoadingButton loading={isSubmitting} loadingText="저장 중...">저장</LoadingButton>
```

---

### LoadingOverlay

*stable* · *v2.2.0* — `feedback` `overlay`

로딩 중 자식 영역 위에 덮이는 오버레이.

**Import:** `import { LoadingOverlay } from "@/ds/composites/LoadingOverlay";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `active` | `boolean` | ✓ | 로딩 활성 여부 |
| `children` | `ReactNode` | ✓ | 자식 요소 |
| `label` | `string` |  | 로딩 라벨 텍스트 |
| `blur` | `boolean` |  | 배경 블러 효과 적용 여부 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<LoadingOverlay active={loading} label="불러오는 중...">
  <Content />
</LoadingOverlay>
```

---

### LoadingScreen

*stable* · *v2.3.0* — `feedback`

풀페이지 또는 컨테이너 로딩 화면 (앱 부팅, 라우트 전환 등).

**Import:** `import { LoadingScreen } from "@/ds/composites/LoadingScreen";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `LoadingScreenVariant` |  | 표시 종류 |
| `message` | `ReactNode` |  | 메시지 |
| `progress` | `number` |  | 진행률 (0-100, undefined면 indeterminate) |
| `fullscreen` | `boolean` |  | 풀스크린 (기본 true) |
| `transparent` | `boolean` |  | 배경 투명 |
| `logo` | `ReactNode` |  | 로고/커스텀 컨텐츠 (variant=logo) |

**Example**

```tsx
<LoadingScreen message="데이터를 불러오는 중..." progress={42} />
```

---

### LogoCloud

*stable* · *v2.3.0* — `marketing`

"사용 중인 회사들" 로고 클라우드 (랜딩 신뢰도 섹션).

**Import:** `import { LogoCloud } from "@/ds/composites/LogoCloud";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `ReactNode` |  | 섹션 라벨 |
| `logos` | `Array<LogoItem>` | ✓ | 로고 목록 |
| `columns` | `5 \| 3 \| 4 \| 6` |  | 컬럼 수 |
| `grayscale` | `boolean` |  | 그레이스케일 |
| `layout` | `LogoCloudLayout` |  | 레이아웃 |

**Example**

```tsx
<LogoCloud title="신뢰받는 파트너" logos={[{name:"Acme",src:"/a.svg"}]} columns={5} grayscale />
```

---

### MarkdownViewer

*stable* · *v2.2.0* — `data-display`

마크다운 텍스트를 HTML 로 렌더링합니다.

**Import:** `import { MarkdownViewer } from "@/ds/composites/MarkdownViewer";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `content` | `string` | ✓ | 마크다운 원문 텍스트 |
| `allowHtml` | `boolean` |  | 원문의 raw HTML 을 그대로 통과시킬지 (기본 false). |
| `breaks` | `boolean` |  | 줄바꿈 하나를 `<br>` 로 취급할지 (기본 false). |
| `kinsoku` | `boolean` |  | 금칙처리 적용 여부 (기본 false). |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
// 한국어 장문 — 금칙처리를 켠다
<MarkdownViewer content={chapter.body} kinsoku />
```

---

### Marquee

*stable* · *v2.2.0* — `data-display`

가로 방향으로 무한 스크롤되는 텍스트/요소 표시기.

**Import:** `import { Marquee } from "@/ds/composites/Marquee";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 흐를 콘텐츠 |
| `speed` | `number` |  | 한 바퀴 도는 속도(초) |
| `direction` | `"left" \| "right"` |  | 흐름 방향 |
| `pauseOnHover` | `boolean` |  | 호버 시 일시 정지 여부 |
| `gap` | `number` |  | 항목 사이 간격(px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Marquee speed={20} pauseOnHover>
  <span>NEW</span><span>SALE</span>
</Marquee>
```

---

### Mention

*stable* · *v2.2.0* — `form` `input`

**Import:** `import { Mention } from "@/ds/composites/Mention";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` | ✓ | 입력 값 |
| `onChange` | `(value: string) => void` | ✓ | 값 변경 콜백 |
| `users` | `Array<MentionUser>` | ✓ | 사용자 목록 |
| `trigger` | `string` |  | 트리거 문자 |
| `placeholder` | `string` |  | 플레이스홀더 텍스트 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Mention value={text} onChange={setText} users={users} trigger="@" />
```

---

### Menubar

*stable* · *v2.2.0* — `navigation`

메뉴바

**Import:** `import { Menubar } from "@/ds/composites/Menubar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<MenubarItem>` | ✓ | 메뉴 바 항목 목록 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Menubar items={[{key:"file",label:"파일",items:[{key:"new",label:"새 파일",shortcut:"⌘N"}]}]} />
```

---

### MetricCard

*stable* · *v2.2.0* — `data-display`

지표 카드 컴포넌트

**Import:** `import { MetricCard } from "@/ds/composites/MetricCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `label` | `string` | ✓ | 지표 라벨 |
| `value` | `string \| number` | ✓ | 표시할 값 |
| `change` | `number` |  | 변동률(%) |
| `changeLabel` | `string` |  | 변동률 옆 보조 텍스트 |
| `sparkline` | `Array<number>` |  | 미니 차트용 데이터 |
| `icon` | `ReactNode` |  | 우측 아이콘 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<MetricCard label="매출" value="1,200만" change={12.5} changeLabel="전월 대비" />
```

---

### MiniChart

*stable* · *v2.2.0* — `chart`

카드 안에 들어갈 작은 미니 차트(스파크라인).

**Import:** `import { MiniChart } from "@/ds/composites/MiniChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `Array<number>` | ✓ | 차트 데이터 배열 |
| `type` | `"line" \| "bar" \| "area"` |  | 차트 종류 |
| `width` | `number` |  | 차트 너비(px) |
| `height` | `number` |  | 차트 높이(px) |
| `color` | `string` |  | 선/막대 색상 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<MiniChart data={[5, 8, 12, 9, 14]} type="line" color="var(--info)" />
```

---

### Modal

*stable* · *v2.2.0* — `overlay`

Modal 컴포넌트

**Import:** `import { Modal } from "@/ds/composites/Modal";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` | ✓ | 모달의 표시 여부를 제어합니다. |
| `onClose` | `() => void` | ✓ | 모달을 닫아야 할 때 호출되는 콜백. |
| `size` | `ModalSize` |  | 모달 콘텐츠 영역의 최대 너비. |
| `dismissible` | `boolean` |  | 백드롭(오버레이) 클릭으로 모달을 닫을 수 있는지 여부. |
| `children` | `ReactNode` | ✓ | 모달 내부에 렌더링할 콘텐츠. |
| `className` | `string` |  | 모달 콘텐츠 영역에 추가할 CSS 클래스. |
| `asChild` | `boolean` |  | 콘텐츠 패널을 자식 엘리먼트로 렌더 위임합니다 (Radix-style asChild). |

---

### MonthPicker

*stable* · *v2.3.0* — `input`

연-월 선택기 (12개월 그리드 + 연도 네비게이션).

**Import:** `import { MonthPicker } from "@/ds/composites/MonthPicker";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `MonthPickerValue` |  | 현재 선택값 |
| `defaultValue` | `MonthPickerValue` |  | 기본값 |
| `onChange` | `(v: MonthPickerValue) => void` |  | 변경 콜백 |
| `min` | `string` |  | 최소 (yyyy-mm) |
| `max` | `string` |  | 최대 (yyyy-mm) |
| `monthLabels` | `Array<string>` |  | 월 이름 라벨 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<MonthPicker defaultValue={{ year: 2026, month: 4 }} onChange={console.log} />
```

---

### MultiSelect

*stable* · *v2.2.0* — `form` `input`

다중 선택 컴포넌트

**Import:** `import { MultiSelect } from "@/ds/composites/MultiSelect";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `options` | `Array<MultiSelectOption>` | ✓ | 선택 옵션 목록 |
| `value` | `Array<string>` | ✓ | 선택된 값 목록 |
| `onChange` | `(value: string[]) => void` | ✓ | 값 변경 콜백 |
| `placeholder` | `string` |  | 플레이스홀더 텍스트 |
| `searchable` | `boolean` |  | 검색 입력 표시 여부 |
| `maxDisplay` | `number` |  | 한 번에 표시할 최대 태그 수 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `error` | `boolean` |  | 오류 상태 표시 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<MultiSelect options={opts} value={selected} onChange={setSelected} searchable />
```

---

### NavigationMenu

*stable* · *v2.2.0* — `navigation`

네비게이션 메뉴

**Import:** `import { NavigationMenu } from "@/ds/composites/NavigationMenu";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<NavMenuItem>` | ✓ | 메뉴 항목 목록 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<NavigationMenu items={[{key:"home",label:"홈",href:"/"},{key:"products",label:"제품",children:[{key:"a",label:"A",href:"/a"}]}]} />
```

---

### Newsletter

*stable* · *v2.3.0* — `marketing`

뉴스레터 구독 폼 (Mailchimp/Beehiiv/Substack 통합용).

**Import:** `import { Newsletter } from "@/ds/composites/Newsletter";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `ReactNode` |  | 제목 |
| `description` | `ReactNode` |  | 부제 |
| `placeholder` | `string` |  | 인풋 placeholder |
| `submitLabel` | `string` |  | 버튼 라벨 |
| `successMessage` | `ReactNode` |  | 성공 메시지 |
| `errorMessage` | `ReactNode` |  | 에러 메시지 |
| `consentLabel` | `ReactNode` |  | 개인정보 동의 라벨 |
| `requireConsent` | `boolean` |  | 동의 필수 여부 |
| `onSubscribe` | `(email: string) => Promise<void> \| void` |  | 제출 핸들러 (Promise 반환) |
| `variant` | `"stacked" \| "card" \| "inline"` |  | 레이아웃 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<Newsletter title="업데이트 받기" onSubscribe={async (email) => api.subscribe(email)} />
```

---

### Notification

*stable* · *v2.2.0* — `feedback`

상단에 잠깐 떠오르는 알림 카드.

**Import:** `import { Notification } from "@/ds/composites/Notification";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `string` | ✓ | 알림 제목 |
| `description` | `string` |  | 보조 설명 |
| `variant` | `"success" \| "warning" \| "danger" \| "info"` |  | 알림 유형 |
| `icon` | `ReactNode` |  | 좌측 아이콘 |
| `action` | `ReactNode` |  | 하단 액션 영역 |
| `onClose` | `() => void` |  | 닫기 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Notification title="저장 완료" description="변경사항이 저장되었습니다." variant="success" />
```

---

### NowPlayingBar

*stable* · *v2.3.0* — `media` `audio`

하단 고정 재생 바 — 커버·곡 정보·파형 스크러버·이전/재생/다음.

**Import:** `import { NowPlayingBar } from "@/ds/composites/NowPlayingBar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `player` | `AudioPlayerState` | ✓ | `useAudioPlayer()` 가 돌려준 상태 |
| `onExpand` | `() => void` |  | 커버를 눌렀을 때 (전체 화면 플레이어 열기 등). 없으면 커버는 버튼이 아니다 |
| `errorMessage` | `string` |  | 트랙 로드 실패 시 아티스트 자리에 보여줄 문구 |
| `bars` | `number` |  | 파형 막대 개수 (기본 72) |
| `actions` | `ReactNode` |  | 바 오른쪽 끝에 덧붙일 내용 (볼륨 슬라이더·반복 버튼 등) |
| `fixed` | `boolean` |  | 화면 하단에 고정할지 (기본 true) |

**Example**

```tsx
```tsx
const player = useAudioPlayer(tracks);
<NowPlayingBar player={player} onExpand={() => setFullscreen(true)} />
```
```

---

### OfflineIndicator

*stable* · *v2.3.0* — `feedback`

네트워크 오프라인 상태 표시 (자동 복구 알림 포함).

**Import:** `import { OfflineIndicator } from "@/ds/composites/OfflineIndicator";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `offlineMessage` | `ReactNode` |  | 오프라인 메시지 |
| `onlineMessage` | `ReactNode` |  | 복구 메시지 (잠깐 표시) |
| `onlineFlashDuration` | `number` |  | 복구 메시지 표시 시간(ms) |
| `position` | `"bottom" \| "top"` |  | 위치 |

**Example**

```tsx
<OfflineIndicator />
```

---

### Onboarding

*stable* · *v2.2.0* — `overlay` `navigation`

단계별 튜토리얼/온보딩 플로우.

**Import:** `import { Onboarding } from "@/ds/composites/Onboarding";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `steps` | `Array<OnboardingStep>` | ✓ | 단계 목록 |
| `onComplete` | `(stepId: string) => void` |  | 단계 완료 콜백 |
| `onFinish` | `() => void` |  | 모든 단계 완료 후 호출 |
| `title` | `string` |  | 카드 제목 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Onboarding steps={steps} onComplete={() => router.push("/home")} />
```

---

### OnlineStatus

*stable* · *v2.3.0* — `social`

사용자 온라인 상태 인디케이터.

**Import:** `import { OnlineStatus } from "@/ds/composites/OnlineStatus";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `status` | `OnlineStatusValue` | ✓ | 상태 |
| `size` | `OnlineStatusSize` |  | 크기 |
| `showLabel` | `boolean` |  | 라벨 표시 |
| `pulse` | `boolean` |  | 펄스 애니메이션 (online에만) |
| `lastSeenAt` | `string \| Date` |  | 마지막 활동 시각 (offline일 때 표시) |
| `labels` | `Partial<Record<OnlineStatusValue, string>>` |  | 커스텀 라벨 매핑 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<OnlineStatus status="online" showLabel pulse />
<OnlineStatus status="offline" lastSeenAt={lastSeenDate} showLabel />
```

---

### PageHeader

*stable* · *v2.3.0* — `layout`

표준 페이지 헤더: breadcrumb + title + actions + footer.

**Import:** `import { PageHeader } from "@/ds/composites/PageHeader";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `ReactNode` | ✓ | 메인 제목 |
| `description` | `ReactNode` |  | 부제 / 설명 |
| `breadcrumb` | `Array<PageHeaderBreadcrumb>` |  | 브레드크럼 |
| `onBack` | `() => void` |  | 좌측 뒤로가기 핸들러 |
| `actions` | `ReactNode` |  | 우측 액션 영역 |
| `avatar` | `ReactNode` |  | 좌측 아바타/아이콘 영역 |
| `footer` | `ReactNode` |  | 하단 탭/메타 영역 |
| `divider` | `boolean` |  | 구분선 표시 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<PageHeader title="사용자" breadcrumb={[{label:"홈",href:"/"},{label:"사용자"}]} actions={<Button>추가</Button>} />
```

---

### Pagination

*stable* · *v2.2.0* — `navigation`

페이지네이션

**Import:** `import { Pagination } from "@/ds/composites/Pagination";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `page` | `number` | ✓ | 현재 페이지 |
| `totalPages` | `number` | ✓ | 전체 페이지 수 |
| `onChange` | `(page: number) => void` | ✓ | 페이지 변경 콜백 |
| `siblings` | `number` |  | 보여줄 페이지 수 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Pagination page={1} totalPages={10} onChange={setPage} />
```

---

### PasswordStrength

*stable* · *v2.3.0* — `input`

비밀번호 강도 미터 + 규칙 체크리스트.

**Import:** `import { PasswordStrength } from "@/ds/composites/PasswordStrength";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `password` | `string` | ✓ | 비밀번호 |
| `rules` | `Array<PasswordRule>` |  | 규칙 (없으면 기본 5종) |
| `showLabel` | `boolean` |  | 라벨 노출 (very weak / weak / ...) |
| `showChecklist` | `boolean` |  | 규칙 체크리스트 노출 |
| `onChange` | `(level: StrengthLevel, passedRules: string[]) => void` |  | 강도 변경 콜백 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<PasswordStrength password={pw} showChecklist />
```

---

### PhotoCard

*stable* · *v2.4.0* — `photo` `media`

사진 카드 — 이미지 + 캡션 + 좋아요/댓글 메타.

**Import:** `import { PhotoCard } from "@/ds/composites/PhotoCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `src` | `string` | ✓ | 사진 URL |
| `alt` | `string` | ✓ | alt 텍스트 (a11y 필수) |
| `title` | `ReactNode` |  | 캡션 |
| `meta` | `ReactNode` |  | 부가 정보 (위치, 날짜 등) |
| `likes` | `number` |  | 좋아요 수 |
| `comments` | `number` |  | 댓글 수 |
| `aspectRatio` | `string` |  | 종횡비 (CSS aspect-ratio 표현) |
| `interactive` | `boolean` |  | 호버 시 살짝 떠오르는 효과 |
| `badge` | `ReactNode` |  | 우상단 배지 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<PhotoCard src="/p.jpg" alt="해변" title="동해" meta="2026.04" likes={142} comments={8} interactive />
```

---

### PhotoCarousel

*stable* · *v2.4.0* — `photo` `media`

사진 슬라이드쇼 — 자동재생/수동 컨트롤/키보드 지원.

**Import:** `import { PhotoCarousel } from "@/ds/composites/PhotoCarousel";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `photos` | `Array<CarouselPhoto>` | ✓ |  |
| `autoPlayMs` | `number` |  | 자동 재생 (ms 단위, 0=꺼짐) |
| `showIndicators` | `boolean` |  | 인디케이터 점 표시 |
| `aspectRatio` | `string` |  | 종횡비 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<PhotoCarousel photos={photos} autoPlayMs={4000} />
```

---

### PhotoFilters

*stable* · *v2.4.0* — `photo` `control`

사진 필터 스트립 — 썸네일 미리보기 + 라벨, 가로 스크롤.

**Import:** `import { PhotoFilters } from "@/ds/composites/PhotoFilters";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `previewSrc` | `string` | ✓ | 미리보기 이미지 (썸네일) |
| `filters` | `Array<PhotoFilter>` | ✓ | 필터 목록 |
| `activeId` | `string` |  | 활성 필터 id |
| `onChange` | `(id: string) => void` | ✓ | 변경 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<PhotoFilters previewSrc={src} filters={defaultPhotoFilters} activeId={f} onChange={setF} />
```

---

### PhotoGrid

*stable* · *v2.4.0* — `photo` `layout`

사진 그리드 — uniform(균등), masonry(폭만 같음), mosaic(첫 항목 강조).

**Import:** `import { PhotoGrid } from "@/ds/composites/PhotoGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 사진 카드들 |
| `layout` | `PhotoGridLayout` |  | 레이아웃 모드 |
| `columns` | `5 \| 2 \| 3 \| 4` |  | 컬럼 수 |
| `gap` | `2 \| 3 \| 4 \| 1` |  | 간격 (Tailwind gap 키) |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<PhotoGrid layout="masonry" columns={4} gap={2}>
  {photos.map((p) => <PhotoCard key={p.id} {...p} />)}
</PhotoGrid>
```

---

### PhotoLightbox

*stable* · *v2.4.0* — `photo` `overlay`

사진 라이트박스 — 키보드 화살표/Esc 지원하는 풀스크린 뷰어.

**Import:** `import { PhotoLightbox } from "@/ds/composites/PhotoLightbox";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `photos` | `Array<LightboxPhoto>` | ✓ | 표시 사진 목록 |
| `index` | `number` | ✓ | 현재 인덱스 (controlled) |
| `onIndexChange` | `(index: number) => void` | ✓ | 인덱스 변경 콜백 |
| `onClose` | `() => void` | ✓ | 닫기 콜백 |
| `open` | `boolean` | ✓ | 열림 상태 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<PhotoLightbox open={open} photos={photos} index={i} onIndexChange={setI} onClose={()=>setOpen(false)} />
```

---

### PhotoUploader

*stable* · *v2.4.0* — `photo` `form` `input`

사진 업로더 — 드래그/클릭 + 미리보기 그리드 + 개수 제한.

**Import:** `import { PhotoUploader } from "@/ds/composites/PhotoUploader";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `onAdd` | `(photos: PhotoPreview[]) => void` | ✓ | 새 파일들이 추가될 때 호출 |
| `onRemove` | `(id: string) => void` |  | 한 항목 제거 |
| `photos` | `Array<PhotoPreview>` |  | 현재 선택된 항목들 (controlled 미리보기) |
| `maxCount` | `number` |  | 최대 개수 |
| `maxSize` | `number` |  | 파일당 최대 크기(바이트) |
| `accept` | `string` |  | accept (기본 image/*) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<PhotoUploader photos={photos} onAdd={(p) => setPhotos([...photos, ...p])} onRemove={(id) => …} maxCount={9} />
```

---

### PieChart

*stable* · *v2.3.0* — `chart`

경량 SVG 파이/도넛 차트.

**Import:** `import { PieChart } from "@/ds/composites/PieChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `Array<PieSlice>` | ✓ | 데이터 |
| `size` | `number` |  | 크기(px) |
| `innerRatio` | `number` |  | 도넛 모드 (안쪽 비율 0~1) |
| `showLegend` | `boolean` |  | 범례 표시 |
| `centerLabel` | `string` |  | 가운데 라벨 (도넛) |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<PieChart data={[{label:"A", value:30},{label:"B", value:70}]} innerRatio={0.6} centerLabel="100%" />
```

---

### PollCard

*stable* · *v2.4.0* — `sns` `content`

투표 카드 — 단일 선택 + 결과 막대 + 마감 표시.

**Import:** `import { PollCard } from "@/ds/composites/PollCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `question` | `ReactNode` | ✓ | 질문 |
| `options` | `Array<PollOption>` | ✓ | 옵션 |
| `votedId` | `string \| null` |  | 사용자가 투표한 옵션 id (null 이면 미투표) |
| `onVote` | `(id: string) => void` |  | 투표 콜백 |
| `closesIn` | `string` |  | 마감까지 남은 텍스트 |
| `alwaysShowResults` | `boolean` |  | 결과를 항상 보여줄지 (false면 투표 후만) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<PollCard question="가장 좋아하는 색은?" options={opts} votedId={voted} onVote={v} closesIn="2일 남음" />
```

---

### Popover

*stable* · *v2.2.0* — `overlay`

팝오버

**Import:** `import { Popover } from "@/ds/composites/Popover";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `trigger` | `ReactNode` | ✓ | 트리거 요소 |
| `content` | `ReactNode` | ✓ | 팝오버 내용 |
| `align` | `"left" \| "right" \| "center"` |  | 가로 정렬 |
| `side` | `"bottom" \| "top"` |  | 노출 방향 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Popover trigger={<Button>열기</Button>} content={<div>내용</div>} />
```

---

### PostCard

*stable* · *v2.4.0* — `sns` `content`

SNS 게시물 카드 — 작성자 + 본문 + 미디어 + 액션 바.

**Import:** `import { PostCard } from "@/ds/composites/PostCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `author` | `PostAuthor` | ✓ | 작성자 |
| `content` | `ReactNode` | ✓ | 본문 (텍스트/JSX) |
| `createdAt` | `string \| Date` |  | 작성 시각 |
| `media` | `ReactNode` |  | 첨부 미디어 (image url 또는 children) |
| `likes` | `number` |  | 좋아요 수 |
| `comments` | `number` |  | 댓글 수 |
| `shares` | `number` |  | 공유 수 |
| `onLike` | `() => void` |  | 좋아요 콜백 (있으면 좋아요 버튼 노출) |
| `onComment` | `() => void` |  | 댓글 콜백 |
| `onShare` | `() => void` |  | 공유 콜백 |
| `liked` | `boolean` |  | 좋아요 활성 상태 |
| `onClick` | `() => void` |  | 클릭 가능한 카드 (전체 클릭) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<PostCard author={u} content="새 사진!" media={<img src="..." />} createdAt={t} likes={42} comments={8} liked onLike={…} />
```

---

### PriceDisplay

*stable* · *v2.3.0* — `ecommerce`

가격 표시 — 통화 포맷 + 할인 원가 + 할인율 자동 계산.

**Import:** `import { PriceDisplay } from "@/ds/composites/PriceDisplay";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string \| number` | ✓ | 현재가 (숫자 또는 미리 포맷된 문자열) |
| `original` | `string \| number` |  | 원가 (할인 표시용) |
| `currency` | `string` |  | 통화 코드 (Intl.NumberFormat) — value가 숫자일 때만 사용 |
| `locale` | `string` |  | 로케일 |
| `suffix` | `string` |  | 단위 접미사 (예: "/월") |
| `size` | `PriceSize` |  | 크기 |
| `showDiscount` | `boolean` |  | 할인 라벨 자동 계산 노출 |
| `layout` | `PriceLayout` |  | 레이아웃 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<PriceDisplay value={29000} original={49000} currency="KRW" showDiscount />
```

---

### PricingTable

*stable* · *v2.3.0* — `marketing`

요금제 카드 그리드. SaaS / 마케팅 페이지용.

**Import:** `import { PricingTable } from "@/ds/composites/PricingTable";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `plans` | `Array<PricingPlan>` | ✓ | 플랜 목록 |
| `columns` | `number` |  | 컬럼 수 (기본 자동) |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<PricingTable plans={[{ id:"free", name:"Free", price:"$0", features:["1 user"]}, ...]} />
```

---

### ProductCard

*stable* · *v2.3.0* — `ecommerce`

e-commerce 상품 카드 (이미지 + 가격 + 평점 + 위시 + 장바구니).

**Import:** `import { ProductCard } from "@/ds/composites/ProductCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `ReactNode` | ✓ | 상품명 |
| `image` | `string` |  | 이미지 URL |
| `imageRatio` | `string` |  | 종횡비 |
| `price` | `ReactNode` | ✓ | 가격 표시 (PriceDisplay 또는 ReactNode) |
| `rating` | `number` |  | 평점 (0~5) |
| `reviewCount` | `number` |  | 리뷰 수 |
| `badge` | `ReactNode` |  | 좌상단 배지 |
| `brand` | `string` |  | 카테고리/브랜드 |
| `onWishlist` | `() => void` |  | 위시리스트 추가 (없으면 버튼 미노출) |
| `wishlisted` | `boolean` |  | 위시리스트에 들어있는지 |
| `onAddToCart` | `() => void` |  | 장바구니 담기 |
| `addToCartLabel` | `string` |  | 장바구니 담기 라벨 |
| `disabled` | `boolean` |  | 비활성 (품절 등) |
| `outOfStockLabel` | `string` |  | 품절 텍스트 |
| `onClick` | `() => void` |  | 카드 클릭 (상세 이동) |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<ProductCard title="셔츠" image="/p.jpg" price="₩29,000" rating={4.5} reviewCount={128} onAddToCart={()=>{}} />
```

---

### ProfileHeader

*stable* · *v2.4.0* — `sns` `layout`

SNS 프로필 헤더 — 배너 + 아바타 + 통계 + 액션.

**Import:** `import { ProfileHeader } from "@/ds/composites/ProfileHeader";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `avatar` | `string` |  | 프로필 이미지 URL |
| `banner` | `string` |  | 배너(커버) 이미지 URL |
| `name` | `string` | ✓ | 표시 이름 |
| `handle` | `string` |  | @핸들 |
| `bio` | `ReactNode` |  | 자기소개 |
| `location` | `string` |  | 위치 |
| `joinedAt` | `string` |  | 가입일 또는 시작 시각 |
| `stats` | `Array<{ label: string; value: string \| number; href?: string; }>` |  | 통계 항목 |
| `actions` | `ReactNode` |  | 우측 액션 (FollowButton 등) |
| `verified` | `boolean` |  | 인증 배지 표시 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ProfileHeader name="준하" handle="junha" banner="/banner.jpg" avatar="/me.jpg" verified
  stats={[{label:"팔로워",value:"3.2k"},{label:"팔로잉",value:148},{label:"게시물",value:512}]}
  actions={<FollowButton following={f} onChange={setF} />} />
```

---

### ProgressRing

*stable* · *v2.2.0* — `feedback`

원형 진행률 표시기.

**Import:** `import { ProgressRing } from "@/ds/composites/ProgressRing";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` | ✓ | 진행 값 |
| `max` | `number` |  | 최댓값 |
| `size` | `number` |  | 링 크기(px) |
| `strokeWidth` | `number` |  | 선 두께(px) |
| `color` | `string` |  | 진행 색상 |
| `trackColor` | `string` |  | 트랙 배경 색상 |
| `children` | `ReactNode` |  | 중앙에 표시할 콘텐츠 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ProgressRing value={75} max={100} size={64} strokeWidth={6} />
```

---

### ProjectCard

*stable* · *v2.3.0* — `content` `navigation`

프로젝트 한 줄 카드 — 아이콘·제목·설명·뱃지·연도·화살표.

**Import:** `import { ProjectCard } from "@/ds/composites/ProjectCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `string` | ✓ | 프로젝트명 |
| `subtitle` | `string` |  | 한 줄 설명 |
| `icon` | `string` |  | 아이콘/썸네일 URL |
| `iconNode` | `ReactNode` |  | 이미지 대신 넣을 아이콘 노드 (`icon` 보다 우선) |
| `meta` | `string` |  | 오른쪽 끝에 놓을 연도·기간 라벨 |
| `badges` | `ReactNode` |  | 제목 옆/오른쪽에 붙일 뱃지들 ("App Store", "OSS" 등) |
| `href` | `string` |  | 이동할 URL. 주면 카드 전체가 링크가 된다 |
| `external` | `boolean` |  | 외부 링크로 열지 (`target="_blank"` + rel) |
| `onPrefetch` | `() => void` |  | 호버·포커스·터치 시작 시 호출 — 상세 페이지 청크를 미리 받아 둘 때 쓴다. |
| `arrow` | `boolean` |  | 오른쪽 끝 화살표 표시 (기본: `href` 가 있으면 true) |
| `variant` | `ProjectCardVariant` |  | `row` 는 목록용 촘촘한 한 줄, `feature` 는 대표작을 조금 크게 보여주는 형태. |
| `renderLink` | `(props: { href: string; className: string; children: ReactNode; }) => ReactNode` |  | 링크 렌더러. Next.js `<Link>` 나 react-router `<Link>` 를 쓰려면 넘긴다. |

**Example**

```tsx
<ProjectCard
  title="JunDS" subtitle="디자인 시스템" icon="/icons/junds.svg"
  meta="2024—" href="/docs/junds" badges={<Badge>OSS</Badge>}
/>
```

---

### PullToRefresh

*stable* · *v2.2.0* — `feedback`

아래로 당겨서 새로고침하는 인터랙션 래퍼.

**Import:** `import { PullToRefresh } from "@/ds/composites/PullToRefresh";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 자식 요소 |
| `onRefresh` | `() => Promise<void>` | ✓ | 새로고침 트리거 콜백 |
| `threshold` | `number` |  | 새로고침 임계 거리(px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<PullToRefresh onRefresh={async () => await reload()}>
  <List />
</PullToRefresh>
```

---

### QRCode

*stable* · *v2.2.0* — `data-display`

주어진 값으로 QR 코드를 그립니다.

**Import:** `import { QRCode } from "@/ds/composites/QRCode";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` | ✓ | 인코딩할 값 |
| `size` | `number` |  | 코드 크기(px) |
| `color` | `string` |  | 모듈 색상 |
| `bgColor` | `string` |  | 배경 색상 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<QRCode value="https://junds.dev" size={160} />
```

---

### QuantitySelector

*stable* · *v2.3.0* — `ecommerce`

단독 수량 선택기 (CartItem 외에도 단일 사용 가능).

**Import:** `import { QuantitySelector } from "@/ds/composites/QuantitySelector";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` |  | 현재 값 (controlled) |
| `defaultValue` | `number` |  | 기본값 |
| `onChange` | `(q: number) => void` |  | 변경 콜백 |
| `min` | `number` |  | 최소 |
| `max` | `number` |  | 최대 (재고) |
| `step` | `number` |  | 증감 단위 |
| `disabled` | `boolean` |  | 비활성 |
| `size` | `QuantitySize` |  | 크기 |
| `editable` | `boolean` |  | input 직접 편집 허용 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<QuantitySelector defaultValue={1} max={10} onChange={console.log} />
```

---

### RadarChart

*stable* · *v2.3.0* — `chart`

SVG 레이더(스파이더) 차트 — 다축 비교용.

**Import:** `import { RadarChart } from "@/ds/composites/RadarChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `axes` | `Array<string>` | ✓ | 축 라벨 (3개 이상 권장) |
| `series` | `Array<RadarSeries>` | ✓ | 시리즈 (각 데이터 길이는 axes.length와 같아야 함) |
| `size` | `number` |  | 크기(px, 정사각) |
| `max` | `number` |  | 최대값 (스케일 기준, 미설정이면 자동) |
| `gridSteps` | `number` |  | 그리드 단계 |
| `fillOpacity` | `number` |  | 영역 채움 투명도 |
| `showDots` | `boolean` |  | 점 표시 |
| `showLegend` | `boolean` |  | 범례 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<RadarChart axes={["속도","품질","가격","UX","지원"]} series={[{name:"A",data:[3,5,4,5,2]}]} max={5} />
```

---

### RadioCardGroup

*stable* · *v2.3.0* — `input`

라디오 카드 그룹 — 옵션을 풍부한 카드로 표현 (요금제, 결제수단 등).

**Import:** `import { RadioCardGroup } from "@/ds/composites/RadioCardGroup";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `options` | `Array<RadioCardOption>` | ✓ | 옵션 목록 |
| `value` | `string` |  | 선택값 |
| `defaultValue` | `string` |  | 기본값 |
| `onChange` | `(value: string) => void` |  | 변경 콜백 |
| `name` | `string` |  | name (form 통합) |
| `columns` | `number` |  | 컬럼 수 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<RadioCardGroup options={[{value:"a",title:"기본",description:"가벼운 시작"}, ...]} />
```

---

### Rating

*stable* · *v2.2.0* — `form` `input`

평점 입력 컴포넌트

**Import:** `import { Rating } from "@/ds/composites/Rating";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` | ✓ | 현재 평점 값 |
| `onChange` | `(value: number) => void` |  | 값 변경 콜백 |
| `max` | `number` |  | 최대 별 개수 |
| `half` | `boolean` |  | 0.5 단위 평점 허용 여부 |
| `size` | `"sm" \| "md" \| "lg"` |  | 별 크기 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `readOnly` | `boolean` |  | 읽기 전용 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Rating value={3} onChange={setValue} max={5} half />
```

---

### ReactionPicker

*stable* · *v2.4.0* — `sns` `control`

리액션 피커 — 트리거 클릭 시 이모지 바, 단일 선택 토글.

**Import:** `import { ReactionPicker } from "@/ds/composites/ReactionPicker";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `emojis` | `Array<string>` |  | 사용 가능한 이모지 (기본 6종) |
| `value` | `string \| null` |  | 선택된 이모지 (단일 선택형) |
| `onChange` | `(emoji: string \| null) => void` |  | 변경 콜백 |
| `triggerLabel` | `string` |  | 트리거 라벨 (없으면 + 아이콘) |
| `placement` | `"bottom" \| "top"` |  | 위치 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ReactionPicker value={r} onChange={setR} />
```

---

### ReadingGoal

*stable* · *v2.4.0* — `book` `feedback`

독서 목표 — 원형 진행률.

**Import:** `import { ReadingGoal } from "@/ds/composites/ReadingGoal";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `current` | `number` | ✓ |  |
| `target` | `number` | ✓ |  |
| `unit` | `string` |  |  |
| `label` | `string` |  |  |
| `size` | `number` |  |  |
| `thickness` | `number` |  |  |
| `className` | `string` |  |  |

**Example**

```tsx
<ReadingGoal current={23} target={50} unit="권" label="2026 목표" size={140} />
```

---

### ReadingProgress

*stable* · *v2.4.0* — `book` `feedback`

독서 진행률 — 현재/총 페이지, 챕터, 남은 시간 표시.

**Import:** `import { ReadingProgress } from "@/ds/composites/ReadingProgress";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `currentPage` | `number` | ✓ | 현재 페이지 (1-base) |
| `totalPages` | `number` | ✓ | 총 페이지 |
| `chapter` | `string` |  | 챕터 제목 (선택) |
| `remainingMinutes` | `number` |  | 예상 남은 시간(분) |
| `compact` | `boolean` |  | 컴팩트 모드 (한 줄) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ReadingProgress currentPage={86} totalPages={312} chapter="3장. 노이즈" remainingMinutes={42} />
```

---

### ReadingStats

*stable* · *v2.4.0* — `book` `data-display`

독서 통계 — 오늘/스트릭/누적/시간.

**Import:** `import { ReadingStats } from "@/ds/composites/ReadingStats";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `pagesToday` | `number` | ✓ |  |
| `pagesGoal` | `number` |  |  |
| `streakDays` | `number` | ✓ |  |
| `booksCompleted` | `number` | ✓ |  |
| `totalMinutes` | `number` | ✓ |  |
| `className` | `string` |  |  |

**Example**

```tsx
<ReadingStats pagesToday={42} pagesGoal={50} streakDays={12} booksCompleted={37} totalMinutes={2840} />
```

---

### ReadingTime

*stable* · *v2.2.0* — `data-display`

읽기 시간 추정 컴포넌트

**Import:** `import { ReadingTime } from "@/ds/composites/ReadingTime";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `content` | `string` | ✓ | 텍스트 내용 (HTML 또는 plain text) |
| `format` | `"short" \| "long"` |  | 표시 형식 |
| `showDifficulty` | `boolean` |  | 난이도 표시 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
```tsx
<ReadingTime content={htmlContent} format="long" showDifficulty />
// 출력: "약 3분 소요 · 중급"

<ReadingTime content={plainText} format="short" />
// 출력: "3분 읽기"
```
```

---

### Resizable

*stable* · *v2.2.0* — `layout`

리사이저블

**Import:** `import { Resizable } from "@/ds/composites/Resizable";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `[ReactNode, ReactNode]` | ✓ | 두 개의 패널 (튜플) |
| `direction` | `"horizontal" \| "vertical"` |  | 분할 방향 |
| `defaultSize` | `number` |  | 첫 번째 패널의 기본 크기 (퍼센트) |
| `minSize` | `number` |  | 최소 크기 (퍼센트) |
| `maxSize` | `number` |  | 최대 크기 (퍼센트) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Resizable direction="horizontal" defaultSize={30}>
  <div>왼쪽</div>
  <div>오른쪽</div>
</Resizable>
```

---

### Result

*stable* · *v2.2.0* — `feedback`

결과 페이지 컴포넌트

**Import:** `import { Result } from "@/ds/composites/Result";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `status` | `"success" \| "warning" \| "info" \| "error" \| "404" \| "403"` | ✓ | 결과 상태 |
| `title` | `string` | ✓ | 결과 제목 |
| `description` | `string` |  | 보조 설명 |
| `extra` | `ReactNode` |  | 하단 액션 영역 |
| `icon` | `ReactNode` |  | 커스텀 아이콘 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Result status="success" title="결제가 완료되었습니다" description="주문 내역을 확인해주세요" extra={<Button>홈으로</Button>} />
```

---

### SankeyDiagram

*stable* · *v2.3.0* — `chart`

간단한 Sankey 다이어그램 (자동 컬럼 배치 + 베지어 링크).

**Import:** `import { SankeyDiagram } from "@/ds/composites/SankeyDiagram";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `nodes` | `Array<SankeyNode>` | ✓ | 노드 |
| `links` | `Array<SankeyLink>` | ✓ | 링크 (source/target은 node id) |
| `width` | `number` |  | 너비 |
| `height` | `number` |  | 높이 |
| `nodeWidth` | `number` |  | 노드 폭 |
| `nodeGap` | `number` |  | 노드 사이 간격 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<SankeyDiagram nodes={[{id:"A"},{id:"B"},{id:"C"}]} links={[{source:"A",target:"B",value:30},{source:"A",target:"C",value:10}]} />
```

---

### ScatterPlot

*stable* · *v2.3.0* — `chart`

SVG 산점도 / 버블 차트 (point.size 지정 시 버블).

**Import:** `import { ScatterPlot } from "@/ds/composites/ScatterPlot";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `series` | `Array<ScatterSeries>` | ✓ | 시리즈 |
| `width` | `number` |  | 너비 |
| `height` | `number` |  | 높이 |
| `xDomain` | `[number, number]` |  | X축 도메인 (자동) |
| `yDomain` | `[number, number]` |  | Y축 도메인 (자동) |
| `showGrid` | `boolean` |  | 그리드 |
| `showYAxis` | `boolean` |  | Y축 라벨 |
| `showXAxis` | `boolean` |  | X축 라벨 |
| `showLegend` | `boolean` |  | 범례 |
| `defaultPointSize` | `number` |  | 기본 점 크기 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<ScatterPlot series={[{name:"A", data:[{x:1,y:2},{x:3,y:5}]}]} />
```

---

### ScreenshotGrid

*stable* · *v2.3.0* — `content` `media`

문서용 스크린샷 그리드. 로드에 실패한 이미지는 조용히 목록에서 뺀다.

**Import:** `import { ScreenshotGrid } from "@/ds/composites/ScreenshotGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `images` | `Array<string>` | ✓ | 이미지 경로 목록. 절대 URL 이 아니면 `basePath` 가 앞에 붙는다 |
| `basePath` | `string` |  | 상대 경로 앞에 붙일 접두사 (예: `"/docs/img/"`) |
| `alt` | `(src: string, index: number) => string` |  | 이미지 alt 를 만드는 함수 (기본: 빈 문자열 = 장식으로 취급) |
| `columns` | `2 \| 3 \| 4` |  | 컬럼 수 (기본 3) |
| `onSelect` | `(src: string, index: number) => void` |  | 이미지 클릭 핸들러 — 라이트박스를 열 때 쓴다 |

**Example**

```tsx
<ScreenshotGrid images={["home.png", "detail.png"]} basePath="/docs/img/" />
```

---

### ScrollProgress

*stable* · *v2.3.0* — `feedback`

페이지 읽기 진행률 바 (블로그 / 긴 문서).

**Import:** `import { ScrollProgress } from "@/ds/composites/ScrollProgress";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `position` | `"bottom" \| "top"` |  | 위치 |
| `color` | `string` |  | 색상 (CSS 값) |
| `thickness` | `number` |  | 두께(px) |
| `target` | `HTMLElement \| null` |  | 추적 대상 (없으면 window) |
| `aria-label` | `string` |  | 스크린리더용 라벨 (기본 "페이지 스크롤 진행률") |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<ScrollProgress position="top" color="var(--primary)" thickness={3} />
```

---

### ScrollSpy

*stable* · *v2.2.0* — `navigation`

스크롤 위치 기반 네비게이션 인디케이터

**Import:** `import { ScrollSpy } from "@/ds/composites/ScrollSpy";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `sections` | `Array<ScrollSpySection>` | ✓ | 추적할 섹션 목록 |
| `offset` | `number` |  | 활성 판정 오프셋(px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ScrollSpy sections={[{ key: "intro", label: "소개", targetId: "section-intro" }]} />
```

---

### SearchBar

*stable* · *v2.5.0* — `form` `input`

검색 입력 — 디바운스 + 단축키 포커스 + 클리어 버튼.

**Import:** `import { SearchBar } from "@/ds/composites/SearchBar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` |  | 입력값 (controlled) |
| `defaultValue` | `string` |  | 초기값 (uncontrolled) |
| `onChange` | `(value: string) => void` |  | 입력 변경 (즉시) |
| `onSearch` | `(value: string) => void` |  | 디바운스된 변경 콜백 (실 검색 호출에 사용) |
| `debounceMs` | `number` |  | 디바운스 ms (기본 250) |
| `placeholder` | `string` |  | 플레이스홀더 |
| `focusShortcut` | `string \| false` |  | 단축키로 포커스 이동 (예: "mod+k", false면 비활성) |
| `endSlot` | `ReactNode` |  | 우측 슬롯 (단축키 힌트 등) |
| `size` | `"sm" \| "md" \| "lg"` |  | 크기 |
| `disabled` | `boolean` |  | disabled |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SearchBar
    focusShortcut="mod+k"
    onSearch={(q) => setQuery(q)}
    endSlot={<><KeyCap>⌘</KeyCap><KeyCap>K</KeyCap></>}
  />
```

---

### SearchInput

*stable* · *v2.2.0* — `form` `input`

검색 입력 컴포넌트

**Import:** `import { SearchInput } from "@/ds/composites/SearchInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` |  | 입력 값 |
| `onChange` | `(value: string) => void` |  | 값 변경 콜백 |
| `onSearch` | `(value: string) => void` |  | 검색 실행 콜백 (debounce 적용) |
| `placeholder` | `string` |  | 플레이스홀더 텍스트 |
| `debounce` | `number` |  | 디바운스 지연(ms) |
| `loading` | `boolean` |  | 로딩 상태 표시 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `size` | `"sm" \| "md" \| "lg"` |  | 입력 크기 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SearchInput value={query} onChange={setQuery} onSearch={handleSearch} placeholder="검색..." />
```

---

### SecurityBadge

*stable* · *v2.2.0* — `data-display`

보안 레벨 뱃지

**Import:** `import { SecurityBadge } from "@/ds/composites/SecurityBadge";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `level` | `SecurityLevel` | ✓ | 보안 레벨 |
| `label` | `string` |  | 사용자 정의 라벨 |
| `showIcon` | `boolean` |  | 아이콘 표시 |
| `size` | `"sm" \| "md" \| "lg"` |  | 뱃지 크기 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SecurityBadge level="safe" />
<SecurityBadge level="critical" label="비밀번호 취약" />
```

---

### SegmentedControl

*stable* · *v2.2.0* — `form` `control`

세그먼티드 컨트롤 — iOS 스타일 버튼 그룹 탭 선택기

**Import:** `import { SegmentedControl } from "@/ds/composites/SegmentedControl";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `options` | `Array<SegmentOption>` | ✓ | 세그먼트 옵션 목록 |
| `value` | `string` | ✓ | 선택된 값 |
| `onChange` | `(value: string) => void` | ✓ | 값 변경 콜백 |
| `size` | `"sm" \| "md" \| "lg"` |  | 크기 |
| `fullWidth` | `boolean` |  | 컨테이너 가로 채우기 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SegmentedControl
  options={[{key:"list",label:"목록"},{key:"grid",label:"그리드"}]}
  value={view}
  onChange={setView}
/>
```

---

### Select

*stable* · *v2.2.0* — `form` `input`

옵션 목록에서 하나를 고르는 셀렉트.

**Import:** `import { Select } from "@/ds/composites/Select";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `options` | `Array<SelectOption<T>>` | ✓ | 선택 가능한 옵션 목록. |
| `value` | `T` |  | 현재 선택된 값. |
| `onChange` | `(value: T) => void` |  | 옵션이 선택될 때 호출되는 콜백. |
| `placeholder` | `string` |  | 값이 선택되지 않았을 때 표시되는 안내 텍스트. |
| `disabled` | `boolean` |  | 컴포넌트 전체 비활성화 여부. |
| `error` | `boolean` |  | 에러 상태 표시 여부. |
| `size` | `"sm" \| "md" \| "lg"` |  | 셀렉트 크기. |
| `searchable` | `boolean` |  | 검색 기능 활성화 여부. |
| `className` | `string` |  | 루트 요소에 추가할 CSS 클래스 |
| `fullWidth` | `boolean` |  | 전체 너비 사용 여부. |

**Example**

```tsx
<Select options={options} value={value} onChange={setValue} placeholder="선택하세요" />
```

---

### Sheet

*stable* · *v2.2.0* — `overlay`

모바일 바텀 시트 (드래그로 닫기 지원)

**Import:** `import { Sheet } from "@/ds/composites/Sheet";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` | ✓ | 열림 상태 |
| `onClose` | `() => void` | ✓ | 닫기 콜백 |
| `children` | `ReactNode` | ✓ | 시트 본문 |
| `title` | `string` |  | 헤더 제목 |
| `snapPoints` | `Array<number>` |  | 스냅 포인트(vh 단위 배열) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Sheet open={isOpen} onClose={close} title="옵션">
  <p>시트 내용</p>
</Sheet>
```

---

### SignaturePad

*stable* · *v2.2.0* — `form` `input`

마우스/터치로 서명을 그리는 패드.

**Import:** `import { SignaturePad } from "@/ds/composites/SignaturePad";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `onSave` | `(dataUrl: string) => void` |  | 저장 콜백 (data URL 전달) |
| `width` | `number` |  | 패드 너비(px) |
| `height` | `number` |  | 패드 높이(px) |
| `strokeColor` | `string` |  | 선 색상 |
| `strokeWidth` | `number` |  | 선 두께(px) |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SignaturePad onSave={(dataUrl) => upload(dataUrl)} width={400} height={200} />
```

---

### Skeleton

*stable* · *v2.2.0* — `feedback`

스켈레톤 로딩

**Import:** `import { Skeleton } from "@/ds/composites/Skeleton";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `"text" \| "circle" \| "rect"` |  | 스켈레톤 모양 |
| `width` | `string \| number` |  | 너비 |
| `height` | `string \| number` |  | 높이 |
| `lines` | `number` |  | 텍스트 변형의 줄 수 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Skeleton variant="text" lines={3} />
<Skeleton variant="circle" width={40} height={40} />
<Skeleton variant="rect" width="100%" height={200} />
```

---

### SkeletonPreset

*stable* · *v2.2.0* — `feedback`

카드/리스트/프로필 등 자주 쓰는 스켈레톤 프리셋.

**Import:** `import { SkeletonPreset } from "@/ds/composites/SkeletonPreset";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `"card" \| "list" \| "table" \| "profile" \| "article"` | ✓ | 프리셋 종류 |
| `rows` | `number` |  | 행 수 (table/list 변형) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SkeletonPreset variant="card" rows={3} />
```

---

### Snackbar

*stable* · *v2.3.0* — `feedback`

짧은 알림(스낵바) — Toast보다 가볍고 단일/액션 중심.

**Import:** `import { Snackbar } from "@/ds/composites/Snackbar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `open` | `boolean` | ✓ | 표시 여부 |
| `message` | `ReactNode` | ✓ | 메시지 |
| `variant` | `SnackbarVariant` |  | 변형 |
| `position` | `SnackbarPosition` |  | 위치 |
| `duration` | `number` |  | 자동 닫힘(ms), 0 이면 수동 |
| `actionLabel` | `string` |  | 우측 액션 라벨 (예: "실행 취소") |
| `onAction` | `() => void` |  | 액션 클릭 콜백 |
| `onClose` | `() => void` |  | 닫힘 콜백 |

**Example**

```tsx
<Snackbar open={open} message="저장됨" actionLabel="실행 취소" onAction={undo} onClose={() => setOpen(false)} />
```

---

### SocialShare

*stable* · *v2.3.0* — `marketing`

소셜 공유 버튼 그룹 (X / Facebook / LinkedIn / Kakao / Telegram / WhatsApp / Email / 복사).

**Import:** `import { SocialShare } from "@/ds/composites/SocialShare";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `url` | `string` | ✓ | 공유할 URL |
| `title` | `string` |  | 공유 제목/본문 |
| `platforms` | `Array<SocialPlatform>` |  | 노출할 플랫폼 |
| `size` | `"sm" \| "md" \| "lg"` |  | 크기 |
| `shape` | `"circle" \| "square"` |  | 동그라미 vs 사각형 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<SocialShare url="https://example.com" title="JunDS!" />
```

---

### SplitPane

*stable* · *v2.2.0* — `layout`

좌/우(또는 상/하)로 크기 조절 가능한 분할 패널.

**Import:** `import { SplitPane } from "@/ds/composites/SplitPane";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `left` | `ReactNode` | ✓ | 왼쪽(또는 위쪽) 패널 |
| `right` | `ReactNode` | ✓ | 오른쪽(또는 아래쪽) 패널 |
| `direction` | `"horizontal" \| "vertical"` |  | 분할 방향 |
| `defaultSize` | `number` |  | 기본 크기(%) |
| `minSize` | `number` |  | 최소 크기(%) |
| `maxSize` | `number` |  | 최대 크기(%) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SplitPane left={<FileTree />} right={<Editor />} direction="horizontal" defaultSize={240} />
```

---

### SpoilerBlock

*stable* · *v2.2.0* — `disclosure`

블러 처리된 콘텐츠를 클릭으로 노출하는 스포일러 블록.

**Import:** `import { SpoilerBlock } from "@/ds/composites/SpoilerBlock";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `type` | `"spoiler" \| "caution" \| "youth"` |  | 스포일러 종류. `youth` 는 `caution` 의 별칭 — |
| `label` | `string` |  | 공개 버튼 라벨 |
| `notice` | `React.ReactNode` |  | 버튼 위에 띄울 안내 문구 (기본: 종류별 기본 문구). |
| `onReveal` | `() => void` |  | 내용을 공개했을 때 호출 (분석 이벤트·부모 상태 반영 등) |
| `children` | `React.ReactNode` | ✓ | 가려질 콘텐츠 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SpoilerBlock type="blur" label="스포일러 보기">
  숨겨진 내용
</SpoilerBlock>
```

---

### Spotlight

*stable* · *v2.2.0* — `overlay` `navigation`

포커스 하이라이트 오버레이

**Import:** `import { Spotlight } from "@/ds/composites/Spotlight";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `target` | `string` | ✓ | 강조할 대상 셀렉터 |
| `active` | `boolean` | ✓ | 활성화 여부 |
| `padding` | `number` |  | 컷아웃 여백(px) |
| `className` | `string` |  | 추가 클래스 |
| `children` | `ReactNode` |  | 컷아웃 아래에 표시할 콘텐츠 |

**Example**

```tsx
<Spotlight target="#important-section" active={isHighlighted} padding={8} />
```

---

### SpotlightCard

*stable* · *v2.2.0* — `layout`

마우스 위치에 스포트라이트 글로우가 따라오는 카드.

**Import:** `import { SpotlightCard } from "@/ds/composites/SpotlightCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 카드 내부 콘텐츠 |
| `spotlightColor` | `string` |  | 스포트라이트 색상 |
| `spotlightSize` | `number` |  | 스포트라이트 반경(px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SpotlightCard spotlightColor="rgba(59,130,246,0.2)" spotlightSize={300}>
  <Card>...</Card>
</SpotlightCard>
```

---

### Stat

*stable* · *v2.3.0* — `data-display`

단일 메트릭 표시 (StatCard보다 가벼움, 인라인 사용 가능).

**Import:** `import { Stat } from "@/ds/composites/Stat";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `label` | `ReactNode` | ✓ | 라벨 |
| `value` | `ReactNode` | ✓ | 값 |
| `unit` | `string` |  | 보조 단위/접미사 |
| `change` | `number` |  | 변화율 (%) |
| `trend` | `StatTrend` |  | 트렌드 (자동 계산되지만 override 가능) |
| `hint` | `ReactNode` |  | 부가 설명 |
| `align` | `"left" \| "center"` |  | 레이아웃 정렬 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<Stat label="MAU" value="12,800" change={5.2} />
```

---

### StatCard

*stable* · *v2.2.0* — `data-display`

통계 카드

**Import:** `import { StatCard } from "@/ds/composites/StatCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `label` | `string` | ✓ | 지표 라벨 |
| `value` | `string \| number` | ✓ | 표시할 값 |
| `change` | `string` |  | 변화량 (+12%, -5 등) |
| `trend` | `"neutral" \| "up" \| "down"` |  | 변화 방향 |
| `icon` | `ReactNode` |  | 우측 아이콘 |
| `description` | `string` |  | 부가 설명 |
| `onClick` | `() => void` |  | 클릭 가능 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<StatCard label="총 업무" value={142} change="+12%" trend="up" />
<StatCard label="완료율" value="78%" change="-3%" trend="down" />
```

---

### Stepper

*stable* · *v2.2.0* — `navigation`

스텝퍼 — 단계별 진행 표시 컴포넌트

**Import:** `import { Stepper } from "@/ds/composites/Stepper";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `steps` | `Array<StepItem>` | ✓ | 단계 목록 |
| `current` | `number` | ✓ | 현재 단계 인덱스 |
| `direction` | `"horizontal" \| "vertical"` |  | 진행 방향 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Stepper steps={[{key:"1",title:"정보 입력"},{key:"2",title:"확인"},{key:"3",title:"완료"}]} current={1} />
```

---

### Sticky

*stable* · *v2.2.0* — `layout`

스크롤 시 지정 위치에 달라붙는 sticky 래퍼.

**Import:** `import { Sticky } from "@/ds/composites/Sticky";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 고정될 콘텐츠 |
| `top` | `number` |  | 상단 오프셋(px) |
| `zIndex` | `number` |  | z-index 값 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Sticky top={64} zIndex={10}>
  <Toolbar />
</Sticky>
```

---

### StoryCircle

*stable* · *v2.4.0* — `sns` `media`

스토리 링 — Instagram 스타일 그라디언트 링 + 상태.

**Import:** `import { StoryCircle } from "@/ds/composites/StoryCircle";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `name` | `string` | ✓ | 사용자 표시 이름 |
| `avatar` | `string` |  | 아바타 이미지 URL |
| `state` | `StoryRingState` |  | 링 상태 |
| `size` | `number` |  | 크기 (px) |
| `onClick` | `() => void` |  | 클릭 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<StoryCircle name="준하" avatar="/me.jpg" state="unread" onClick={openStory} />
```

---

### SwipeAction

*stable* · *v2.2.0* — `form` `control`

좌/우로 스와이프 시 액션이 노출되는 행 래퍼.

**Import:** `import { SwipeAction } from "@/ds/composites/SwipeAction";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 자식 콘텐츠 |
| `leftActions` | `Array<{ label: string; color: string; onClick: () => void; }>` |  | 왼쪽 스와이프 시 노출할 액션 목록 |
| `rightActions` | `Array<{ label: string; color: string; onClick: () => void; }>` |  | 오른쪽 스와이프 시 노출할 액션 목록 |
| `threshold` | `number` |  | 스와이프 임계 거리(px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SwipeAction
  leftActions={[{ label: "보관", onClick: archive }]}
  rightActions={[{ label: "삭제", onClick: remove, variant: "danger" }]}
>
  <ListItem />
</SwipeAction>
```

---

### Table

*stable* · *v2.2.0* — `data`

컬럼 정의 + 데이터 행으로 구성된 기본 테이블.

**Import:** `import { Table } from "@/ds/composites/Table";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `columns` | `Array<TableColumn<T>>` | ✓ | 컬럼 정의 |
| `data` | `Array<T>` | ✓ | 테이블 데이터 |
| `striped` | `boolean` |  | 줄무늬 스타일 |
| `hoverable` | `boolean` |  | 호버 효과 |
| `compact` | `boolean` |  | 콤팩트 모드 |
| `size` | `"sm" \| "md" \| "lg"` |  | 행 크기 |
| `stickyHeader` | `boolean` |  | 헤더 고정 (스크롤 시 상단에 고정) |
| `maxHeight` | `string \| number` |  | 테이블 최대 높이 (stickyHeader와 함께 사용) |
| `bordered` | `boolean` |  | 셀 테두리 표시 |
| `className` | `string` |  | 추가 클래스 |
| `onRowClick` | `(row: T, index: number) => void` |  | 행 클릭 핸들러 |
| `emptyMessage` | `string` |  | 데이터가 없을 때 표시할 메시지 |

**Example**

```tsx
<Table columns={columns} data={rows} striped hoverable />
```

---

### TableOfContents

*stable* · *v2.3.0* — `navigation`

자동 생성 목차 (헤딩 수집 + IntersectionObserver 기반 활성 항목 추적).

**Import:** `import { TableOfContents } from "@/ds/composites/TableOfContents";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<TocItem>` |  | 명시적 항목 (없으면 selector로 자동 수집) |
| `selector` | `string` |  | 자동 수집할 헤딩 셀렉터 |
| `rootSelector` | `string` |  | 컨테이너 셀렉터 (없으면 document) |
| `exclude` | `string` |  | 수집에서 제외할 헤딩 셀렉터. |
| `observe` | `boolean` |  | 본문이 늦게 도착하는 경우(lazy import / Suspense / 스트리밍)를 대비해 |
| `activeTracking` | `boolean` |  | 활성 항목 추적 활성화 |
| `title` | `string` |  | 상단 라벨 |
| `smooth` | `boolean` |  | 클릭 시 부드러운 스크롤 |
| `scrollOffset` | `number` |  | 스크롤 시 헤딩 위에 남길 여백 (px). 고정 헤더 높이만큼 주면 된다 |
| `onItemsChange` | `(items: TocItem[]) => void` |  | 수집된 항목이 바뀔 때 호출 (바깥에서 "목차 없음" UI 를 그릴 때 유용) |
| `emptyFallback` | `ReactNode` |  | 항목이 하나도 없을 때 렌더할 내용 (기본: 아무것도 렌더하지 않음) |

**Example**

```tsx
<TableOfContents rootSelector=".article__body" exclude=".sr-only" scrollOffset={76} />
```

---

### Tabs

*stable* · *v2.2.0* — `navigation`

수평 탭 전환 컨트롤.

**Import:** `import { Tabs } from "@/ds/composites/Tabs";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `tabs` | `Array<Tab<T>>` | ✓ | 탭 목록. |
| `value` | `T` | ✓ | 현재 선택된 탭의 value. tabs 배열 내 하나의 value와 일치해야 합니다. |
| `onChange` | `(value: T) => void` | ✓ | 탭이 변경될 때 호출되는 콜백. |
| `variant` | `"underline" \| "pills" \| "segment"` |  | 탭 스타일 변형. |
| `size` | `"sm" \| "md"` |  | 탭 크기. |
| `className` | `string` |  | 루트 요소에 추가할 CSS 클래스 |

**Example**

```tsx
<Tabs tabs={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} value={tab} onChange={setTab} />
```

---

### TagInput

*stable* · *v2.2.0* — `form` `input`

태그 입력 컴포넌트

**Import:** `import { TagInput } from "@/ds/composites/TagInput";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `Array<string>` | ✓ | 태그 배열 |
| `onChange` | `(tags: string[]) => void` | ✓ | 태그 변경 콜백 |
| `placeholder` | `string` |  | 플레이스홀더 |
| `maxTags` | `number` |  | 최대 태그 수 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `error` | `boolean` |  | 오류 상태 |
| `size` | `"sm" \| "md" \| "lg"` |  | 입력 크기 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<TagInput value={["React","Next"]} onChange={setTags} placeholder="태그 입력 후 Enter" />
```

---

### TestimonialCard

*stable* · *v2.3.0* — `marketing`

사용자 후기 카드 (랜딩 / 마케팅 페이지).

**Import:** `import { TestimonialCard } from "@/ds/composites/TestimonialCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `TestimonialVariant` |  | 변형 |
| `quote` | `ReactNode` | ✓ | 후기 본문 |
| `rating` | `number` |  | 평점 (1~5) |
| `authorName` | `string` | ✓ | 작성자 이름 |
| `authorRole` | `string` |  | 작성자 직책/회사 |
| `authorAvatar` | `string` |  | 작성자 아바타 URL |
| `companyLogo` | `ReactNode` |  | 작성자 회사 로고 |
| `highlighted` | `boolean` |  | 강조 표시 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<TestimonialCard quote="정말 빠릅니다" rating={5} authorName="홍길동" authorRole="CTO @ Acme" />
```

---

### TextareaAutosize

*stable* · *v2.3.0* — `input`

컨텐츠에 맞춰 자동으로 높이가 늘어나는 textarea (chat composer, comment 입력 등).

**Import:** `import { TextareaAutosize } from "@/ds/composites/TextareaAutosize";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `minRows` | `number` |  | 최소 행 수 |
| `maxRows` | `number` |  | 최대 행 수 (넘으면 스크롤) |
| `showCount` | `boolean` |  | 글자 수 표시 (maxLength와 함께) |

**Example**

```tsx
<TextareaAutosize minRows={2} maxRows={8} placeholder="메시지 입력" />
```

---

### ThinkingIndicator

*stable* · *v2.3.0* — `feedback`

AI/LLM 응답 대기 인디케이터. ChatBubble 안에 넣어 사용.

**Import:** `import { ThinkingIndicator } from "@/ds/composites/ThinkingIndicator";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `ThinkingVariant` |  | 애니메이션 종류 |
| `label` | `ReactNode` |  | 좌측 라벨 (예: "Claude가 생각 중") |
| `color` | `string` |  | 점 색상 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<ThinkingIndicator label="Claude가 생각 중" />
```

---

### Timeline

*stable* · *v2.2.0* — `data-display`

타임라인

**Import:** `import { Timeline } from "@/ds/composites/Timeline";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<TimelineItem>` | ✓ | 타임라인 항목 |
| `lineStyle` | `"solid" \| "dashed"` |  | 연결선 스타일 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Timeline items={[
  { key:"1", title:"생성", time:"10:00", color:"primary" },
  { key:"2", title:"진행 시작", time:"11:30", color:"success" },
]} />
```

---

### TimePicker

*stable* · *v2.2.0* — `form` `input`

시간 선택기

**Import:** `import { TimePicker } from "@/ds/composites/TimePicker";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` |  | "HH:mm" 형식의 시간 값 |
| `onChange` | `(time: string) => void` | ✓ | 값 변경 콜백 |
| `format` | `"12h" \| "24h"` |  | 시간 형식 |
| `minuteStep` | `number` |  | 분 단위 간격 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `placeholder` | `string` |  | 플레이스홀더 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<TimePicker value={time} onChange={setTime} format="24h" minuteStep={15} />
```

---

### Tooltip

*stable* · *v2.2.0* — `overlay`

툴팁

**Import:** `import { Tooltip } from "@/ds/composites/Tooltip";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `content` | `ReactNode` | ✓ | 툴팁 내용 |
| `position` | `TooltipPosition` |  | 표시 위치 |
| `delay` | `number` |  | 표시 지연(ms) |
| `children` | `ReactNode` | ✓ | 트리거 요소 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Tooltip content="저장합니다"><Button>저장</Button></Tooltip>
```

---

### Transfer

*stable* · *v2.2.0* — `form` `input`

트랜스퍼 — 두 목록 간 항목 이동 컴포넌트

**Import:** `import { Transfer } from "@/ds/composites/Transfer";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `source` | `Array<TransferItem>` | ✓ | 출발측 항목 |
| `target` | `Array<TransferItem>` | ✓ | 도착측 항목 |
| `onChange` | `(source: TransferItem[], target: TransferItem[]) => void` | ✓ | 이동 시 콜백 |
| `sourceTitle` | `string` |  | 출발측 제목 |
| `targetTitle` | `string` |  | 도착측 제목 |
| `searchable` | `boolean` |  | 검색 활성화 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Transfer
  source={sourceItems}
  target={targetItems}
  onChange={(s, t) => { setSource(s); setTarget(t); }}
  sourceTitle="선택 가능"
  targetTitle="선택됨"
  searchable
/>
```

---

### TreemapChart

*stable* · *v2.2.0* — `chart`

계층 데이터를 사각형 면적으로 표현하는 트리맵.

**Import:** `import { TreemapChart } from "@/ds/composites/TreemapChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `Array<TreemapItem>` | ✓ | 트리맵 데이터 |
| `width` | `number` |  | 차트 너비(px) |
| `height` | `number` |  | 차트 높이(px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<TreemapChart data={hierarchy} width={600} height={400} />
```

---

### TreeNav

*stable* · *v2.2.0* — `navigation`

트리 네비게이션 컴포넌트

**Import:** `import { TreeNav } from "@/ds/composites/TreeNav";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<TreeNavItem>` | ✓ | 트리 항목 목록 |
| `activeKey` | `string` |  | 현재 활성 항목 키 |
| `onItemClick` | `(key: string, href?: string) => void` |  | 항목 클릭 핸들러 |
| `onItemPrefetch` | `(key: string, href?: string) => void` |  | 항목에 마우스를 올리거나 포커스가 닿았을 때 호출. |
| `defaultExpanded` | `Array<string>` |  | 기본 확장 키 목록 |
| `expandedKeys` | `Array<string>` |  | 확장 상태를 바깥에서 제어할 때 쓴다. |
| `onExpandedChange` | `(keys: string[]) => void` |  | 확장 상태가 바뀔 때 호출 (제어 모드) |
| `autoExpandActive` | `boolean` |  | `activeKey` 로 가는 경로의 부모들을 자동으로 펼칠지 (기본 true). |
| `showCount` | `boolean` |  | `badge` 가 없는 부모 항목에 하위 잎 개수를 자동으로 표시할지 (기본 false). |
| `expandAllControl` | `boolean` |  | 전체 펼치기/접기 버튼을 상단에 보여줄지 (기본 false) |
| `ariaLabel` | `string` |  | nav 의 접근성 라벨 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
```tsx
const items: TreeNavItem[] = [
  {
    key: "docs",
    label: "문서",
    badge: 12,
    children: [
      { key: "getting-started", label: "시작하기", href: "/docs/start" },
      { key: "api", label: "API 레퍼런스", href: "/docs/api" },
    ],
  },
];

<TreeNav
  items={items}
  activeKey="getting-started"
  defaultExpanded={["docs"]}
  onItemClick={(key, href) => router.push(href!)}
/>
```
```

---

### TreeView

*stable* · *v2.2.0* — `data-display`

트리뷰 컴포넌트 — 파일 탐색기 스타일의 트리 구조

**Import:** `import { TreeView } from "@/ds/composites/TreeView";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `nodes` | `Array<TreeNode>` | ✓ | 트리 노드 |
| `selected` | `string` |  | 선택된 노드 ID |
| `onSelect` | `(key: string) => void` |  | 노드 선택 콜백 |
| `defaultExpanded` | `Array<string>` |  | 기본으로 펼쳐진 노드 ID 배열 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<TreeView
  nodes={[{ key:"1", label:"폴더", children:[{ key:"2", label:"파일" }] }]}
  selected={selected}
  onSelect={setSelected}
/>
```

---

### TrustIndicator

*stable* · *v2.2.0* — `data-display`

보안 신뢰 지표 — 보안 항목별 통과/실패 상태 표시

**Import:** `import { TrustIndicator } from "@/ds/composites/TrustIndicator";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<TrustItem>` | ✓ | 신뢰 지표 항목 |
| `title` | `string` |  | 제목 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<TrustIndicator title="보안 점검" items={[
  { key:"ssl", label:"SSL 인증서", status:"pass" },
  { key:"2fa", label:"2단계 인증", status:"fail", description:"설정이 필요합니다" },
]} />
```

---

### Typewriter

*stable* · *v2.2.0* — `data-display`

글자를 한 글자씩 쳐 나가는 타이핑 효과.

**Import:** `import { Typewriter } from "@/ds/composites/Typewriter";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `texts` | `Array<string>` | ✓ | 순환 표시할 문장 배열 |
| `speed` | `number` |  | 타이핑 속도(ms/char) |
| `deleteSpeed` | `number` |  | 삭제 속도(ms/char) |
| `delay` | `number` |  | 다음 문장 시작 전 지연(ms) |
| `loop` | `boolean` |  | 무한 반복 |
| `cursor` | `boolean` |  | 커서 표시 |
| `cursorChar` | `string` |  | 커서 문자 |
| `className` | `string` |  | 추가 클래스 |
| `onComplete` | `() => void` |  | 완료 콜백 |

**Example**

```tsx
<Typewriter texts={["안녕하세요", "Hello"]} speed={80} loop />
```

---

### VideoPlayer

*stable* · *v2.2.0* — `media`

컨트롤이 포함된 비디오 플레이어.

**Import:** `import { VideoPlayer } from "@/ds/composites/VideoPlayer";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `src` | `string` | ✓ | 비디오 소스 URL |
| `poster` | `string` |  | 포스터 이미지 URL |
| `autoPlay` | `boolean` |  | 자동 재생 |
| `muted` | `boolean` |  | 음소거 시작 |
| `loop` | `boolean` |  | 반복 재생 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<VideoPlayer src="/video.mp4" poster="/cover.jpg" autoPlay muted />
```

---

### VirtualScroll

*stable* · *v2.2.0* — `data`

대량 리스트를 가상화로 렌더링하는 스크롤러.

**Import:** `import { VirtualScroll } from "@/ds/composites/VirtualScroll";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<T>` | ✓ | 렌더링할 항목 배열 |
| `itemHeight` | `number` | ✓ | 항목 고정 높이(px) |
| `renderItem` | `(item: T, index: number) => React.ReactNode` | ✓ | 항목 렌더 함수 |
| `overscan` | `number` |  | 뷰포트 외 추가 렌더 개수 |
| `className` | `string` |  | 추가 클래스 |
| `style` | `CSSProperties` |  | 추가 스타일 |

**Example**

```tsx
<VirtualScroll
  items={items}
  itemHeight={48}
  renderItem={(item) => <Row item={item} />}
/>
```

---

### Watermark

*stable* · *v2.2.0* — `layout`

워터마크 오버레이 컴포넌트

**Import:** `import { Watermark } from "@/ds/composites/Watermark";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `text` | `string` | ✓ | 워터마크 텍스트 |
| `children` | `ReactNode` | ✓ | 감쌀 콘텐츠 |
| `fontSize` | `number` |  | 글자 크기(px) |
| `color` | `string` |  | 텍스트 색상 |
| `rotate` | `number` |  | 회전 각도(deg) |
| `gap` | `number` |  | 패턴 간격(px) |
| `className` | `string` |  | 추가 클래스 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<Watermark text="기밀 문서">
  <div>보호할 콘텐츠</div>
</Watermark>
```

---

### Waveform

*stable* · *v2.3.0* — `media` `audio`

사운드클라우드식 막대 파형. 재생 진행분이 강조색으로 차오른다.

**Import:** `import { Waveform } from "@/ds/composites/Waveform";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `seed` | `string` | ✓ | 파형을 만들 시드 문자열 (곡 슬러그·제목 등). |
| `peaks` | `Array<number>` |  | 실제 진폭 배열 (0~1). 주면 `seed` 대신 이 값으로 그린다 |
| `progress` | `number` |  | 재생 진행 비율 (0~1) |
| `bars` | `number` |  | 막대 개수 (기본 56) |
| `playing` | `boolean` |  | 재생 중인지 — 재생 헤드가 맥동한다 |
| `onSeek` | `(fraction: number) => void` |  | 탐색 콜백 (0~1 비율). |
| `ariaLabel` | `string` |  | 슬라이더 접근성 라벨 |
| `height` | `number` |  | 막대 높이 (px, 기본 40) |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<Waveform seed={track.slug} progress={t / duration} playing onSeek={(f) => seek(f * duration)} />
```

---

### YearPicker

*stable* · *v2.3.0* — `input`

연도 선택기 (12년 그리드 + 페이지 네비).

**Import:** `import { YearPicker } from "@/ds/composites/YearPicker";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` |  | 현재 선택값 |
| `defaultValue` | `number` |  | 기본값 |
| `onChange` | `(year: number) => void` |  | 변경 콜백 |
| `min` | `number` |  | 최소 연도 |
| `max` | `number` |  | 최대 연도 |
| `pageSize` | `number` |  | 한 페이지 연도 수 (기본 12) |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<YearPicker defaultValue={2026} onChange={console.log} />
```

## Patterns

### ActionBar

*stable* · *v2.2.0* — `navigation`

플로팅 액션 바 (벌크 액션)

**Import:** `import { ActionBar } from "@/ds/patterns/ActionBar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `count` | `number` | ✓ | 선택된 항목 수 |
| `open` | `boolean` | ✓ | 표시 여부 |
| `actions` | `ReactNode` | ✓ | 액션 버튼들 |
| `onClear` | `() => void` |  | 선택 해제 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ActionBar
  open={selected.size > 0}
  count={selected.size}
  onClear={() => setSelected(new Set())}
  actions={<>
    <Button size="sm" variant="secondary">이동</Button>
    <Button size="sm" variant="danger">삭제</Button>
  </>}
/>
```

---

### AuthLayout

*stable* · *v2.3.0* — `layout`

인증 페이지 표준 레이아웃 (login / signup / reset 공용).

**Import:** `import { AuthLayout } from "@/ds/patterns/AuthLayout";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `AuthVariant` |  | 레이아웃 변형 |
| `brandSide` | `ReactNode` |  | 좌측 브랜드 영역 (split / branded 전용) |
| `logo` | `ReactNode` |  | 상단 로고 |
| `title` | `ReactNode` |  | 카드 제목 |
| `subtitle` | `ReactNode` |  | 카드 부제 |
| `children` | `ReactNode` |  | 폼 컨텐츠 (자식 placement) |
| `footer` | `ReactNode` |  | 카드 하단 푸터 (예: "계정이 없으신가요?") |
| `pageFooter` | `ReactNode` |  | 페이지 푸터 (저작권 등) |

**Example**

```tsx
<AuthLayout variant="split" logo={<Logo/>} title="로그인"><LoginForm/></AuthLayout>
```

---

### BlogPost

*stable* · *v2.3.0* — `layout`

블로그/아티클 페이지 표준 레이아웃 (cover + meta + body + sidebar + footer).

**Import:** `import { BlogPost } from "@/ds/patterns/BlogPost";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `ReactNode` | ✓ | 제목 |
| `excerpt` | `ReactNode` |  | 부제 / 요약 |
| `publishedAt` | `string \| Date` |  | 발행일 |
| `readingMinutes` | `number` |  | 읽기 시간(분) |
| `author` | `BlogAuthor` |  | 작성자 |
| `tags` | `Array<string>` |  | 카테고리/태그 |
| `coverImage` | `string` |  | 커버 이미지 URL |
| `children` | `ReactNode` | ✓ | 본문 (children) |
| `sidebar` | `ReactNode` |  | 우측 사이드바 (TOC 등) |
| `footer` | `ReactNode` |  | 하단 영역 (관련 글, 공유 등) |

**Example**

```tsx
<BlogPost title="제목" author={{name:"홍길동"}} publishedAt="2026-04-30">본문</BlogPost>
```

---

### BookReader

*stable* · *v2.4.0* — `book` `layout`

책 리더 — 좌측 챕터 목차 + 우측 본문 + 상단 진행률 + 하단 페이지 네비.

**Import:** `import { BookReader } from "@/ds/patterns/BookReader";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `string` | ✓ | 책 제목 |
| `author` | `string` |  | 저자 |
| `chapters` | `Array<Chapter>` | ✓ | 챕터 트리 |
| `activeChapterId` | `string` | ✓ | 활성 챕터 id |
| `onChapterChange` | `(id: string) => void` | ✓ | 활성 챕터 변경 콜백 |
| `children` | `ReactNode` | ✓ | 본문 (현재 챕터 콘텐츠) |
| `currentPage` | `number` | ✓ | 현재 페이지 |
| `totalPages` | `number` | ✓ | 총 페이지 |
| `bookmarked` | `boolean` |  | 북마크 상태 |
| `onBookmarkChange` | `(next: boolean) => void` |  | 북마크 토글 |
| `onClose` | `() => void` |  | 닫기 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<BookReader title="모비 딕" chapters={chs} activeChapterId={id} onChapterChange={setId}
  currentPage={86} totalPages={312} bookmarked={b} onBookmarkChange={setB}>
  <article>본문…</article>
</BookReader>
```

---

### Calendar

*stable* · *v2.2.0* — `data-display` `form`

월간/주간 캘린더

**Import:** `import { Calendar } from "@/ds/patterns/Calendar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `events` | `Array<CalendarEvent>` |  | 이벤트 목록 |
| `renderDay` | `(date: Date, events: CalendarEvent[]) => ReactNode` |  | 날짜 셀 렌더 |
| `onDateClick` | `(date: Date) => void` |  | 날짜 클릭 콜백 |
| `className` | `string` |  | 추가 클래스 |
| `selectedDate` | `Date \| null` |  | Selected date (single mode) |
| `onDateSelect` | `(date: Date) => void` |  | 단일 날짜 선택 콜백 |
| `selectionMode` | `"single" \| "range"` |  | Selection mode |
| `selectedRange` | `{ start: Date \| null; end: Date \| null; }` |  | Selected date range (controlled, for range mode) |
| `onRangeSelect` | `(range: { start: Date; end: Date; }) => void` |  | 범위 선택 콜백 |
| `minDate` | `Date` |  | Min selectable date |
| `maxDate` | `Date` |  | Max selectable date |
| `view` | `"month" \| "week"` |  | Calendar view mode |

**Example**

```tsx
<DsCalendar events={events} onDateClick={handleClick} />
<DsCalendar selectionMode="range" onRangeSelect={handleRange} />
```

---

### CalendarMonth

*stable* · *v2.5.0* — `calendar` `layout`

캘린더 — 월 그리드 + 이벤트 도트 + 키보드 화살표 네비.

**Import:** `import { CalendarMonth } from "@/ds/patterns/CalendarMonth";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `month` | `Date` | ✓ | 표시할 월 (Date — 일은 무시) |
| `onMonthChange` | `(next: Date) => void` |  | 월 변경 콜백 (이전/다음 버튼 누름) |
| `selectedDate` | `Date` |  | 선택된 날짜 |
| `onSelectDate` | `(date: Date) => void` |  | 날짜 선택 콜백 |
| `events` | `Array<CalendarEvent>` |  | 이벤트 목록 (시작일 기준 그룹핑) |
| `onEventClick` | `(event: CalendarEvent) => void` |  | 이벤트 클릭 콜백 |
| `weekStartsOn` | `0 \| 1` |  | 주의 시작 요일 (0=일, 1=월) — 기본 0 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<CalendarMonth month={month} onMonthChange={setMonth} selectedDate={sel} onSelectDate={setSel} events={events} />
```

---

### ChartCard

*stable* · *v2.2.0* — `chart`

SVG 차트 카드

**Import:** `import { ChartCard } from "@/ds/patterns/ChartCard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `string` | ✓ | 카드 제목 |
| `type` | `ChartType` | ✓ | 차트 종류 |
| `data` | `Array<ChartDataPoint>` | ✓ | 데이터 배열 |
| `description` | `string` |  | 설명 텍스트 |
| `value` | `ReactNode` |  | 헤더에 크게 표시할 KPI 값 |
| `trend` | `ChartTrend` |  | 추세 정보 |
| `badge` | `ReactNode` |  | 헤더 배지 |
| `actions` | `ReactNode` |  | 헤더 액션 영역 |
| `footer` | `ReactNode` |  | 푸터 영역 |
| `height` | `number` |  | 차트 영역 높이 |
| `max` | `number` |  | progress/radial/horizontal-bar의 기준값 |
| `formatValue` | `(value: number) => string` |  | 숫자 포맷터 |
| `showLegend` | `boolean` |  | 범례 표시 여부 |
| `showGrid` | `boolean` |  | 그리드 표시 여부 |
| `showAxis` | `boolean` |  | 축 표시 여부 |
| `loading` | `boolean` |  | 로딩 상태 |
| `emptyMessage` | `string` |  | 빈 상태 메시지 |
| `tone` | `ChartTone` |  | 색상 톤 |
| `variant` | `"card" \| "plain"` |  | 카드/플레인 변형 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ChartCard title="주간 완료" type="bar" data={[{label:"월",value:12},{label:"화",value:8}]} />
<ChartCard title="전환율" type="radial" value="72%" data={[{label:"전환",value:72}]} max={100} />
```

---

### ChatThread

*stable* · *v2.5.0* — `chat` `content`

채팅 스레드 — 메시지 그룹핑 + 좌/우 정렬 + 읽음/타이핑/실패 상태 + 자동 스크롤.

**Import:** `import { ChatThread } from "@/ds/patterns/ChatThread";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `messages` | `Array<ChatMessage>` | ✓ | 메시지 목록 (시간순 오름차순) |
| `currentUserId` | `string` | ✓ | 현재 사용자 id (메시지 정렬 좌/우 결정) |
| `typingUsers` | `Array<string>` |  | 타이핑 중인 사용자 (이름 또는 id 배열) |
| `onMessageClick` | `(msg: ChatMessage) => void` |  | 메시지 클릭 콜백 |
| `onRetry` | `(msg: ChatMessage) => void` |  | 메시지 재전송 (실패 시 표시) |
| `composer` | `ReactNode` |  | 입력 슬롯 — 보통 `<form>` + `<Input>` + `<Button>` |
| `autoScroll` | `boolean` |  | 새 메시지 추가 시 자동 하단 스크롤 (기본 true) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<ChatThread messages={msgs} currentUserId="me" typingUsers={["지우"]} composer={<MyComposer />} />
```

---

### CommandPalette

*stable* · *v2.2.0* — `overlay` `navigation`

커맨드 팔레트 (⌘K)

**Import:** `import { CommandPalette } from "@/ds/patterns/CommandPalette";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<CommandItem>` | ✓ | 명령어 항목 목록 |
| `placeholder` | `string` |  | 검색 입력 플레이스홀더 |
| `open` | `boolean` |  | 외부 open 제어 |
| `onOpenChange` | `(open: boolean) => void` |  | 열림 상태 변경 콜백 |

**Example**

```tsx
<CommandPalette items={[{id:"1",label:"설정",action:()=>router.push("/settings")}]} />
```

---

### DataTable

*stable* · *v2.2.0* — `data`

고급 데이터 테이블

**Import:** `import { DataTable } from "@/ds/patterns/DataTable";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `columns` | `Array<DataTableColumn<T>>` | ✓ | 컬럼 정의 |
| `data` | `Array<T>` | ✓ | 데이터 배열 |
| `rowKey` | `(row: T) => string` | ✓ | 행 고유 키 추출 함수 |
| `selectable` | `boolean` |  | ── 선택 ── |
| `selectedKeys` | `Set<string>` |  | 선택된 행 키 집합 |
| `onSelectionChange` | `(keys: Set<string>) => void` |  | 선택 변경 콜백 |
| `pageSize` | `number` |  | ── 페이지네이션 ── |
| `pageSizeOptions` | `Array<number>` |  | 페이지 크기 옵션 |
| `expandable` | `boolean` |  | ── 확장 행 ── |
| `expandedRowRender` | `(row: T) => ReactNode` |  | 확장된 행 렌더 함수 |
| `searchable` | `boolean` |  | ── 검색/필터 ── |
| `searchPlaceholder` | `string` |  | 검색 입력 플레이스홀더 |
| `exportable` | `boolean` |  | ── 내보내기 ── |
| `exportFilename` | `string` |  | 내보내기 파일명 |
| `bulkActions` | `Array<{ label: string; icon?: ReactNode; onClick: (keys: Set<string>) => void; variant?: "danger" \| "default"; }>` |  | ── 벌크 액션 ── |
| `density` | `DensityMode` |  | ── 밀도 ── |
| `densityToggle` | `boolean` |  | 밀도 토글 표시 여부 |
| `fullscreenToggle` | `boolean` |  | ── 풀스크린 ── |
| `columnToggle` | `boolean` |  | ── 컬럼 토글 ── |
| `showSummary` | `boolean` |  | ── 행 요약 ── |
| `virtualScroll` | `boolean` |  | ── 가상 스크롤 ── |
| `virtualRowHeight` | `number` |  | 가상 스크롤 행 높이 |
| `showRowNumbers` | `boolean` |  | ── 행 번호 ── |
| `draggableRows` | `boolean` |  | ── 행 드래그 정렬 ── |
| `onRowReorder` | `(fromIndex: number, toIndex: number) => void` |  | 행 순서 변경 콜백 |
| `pinnableRows` | `boolean` |  | ── 행 고정 (상단 pin) ── |
| `pinnedKeys` | `Set<string>` |  | 고정된 행 키 집합 |
| `onPinnedChange` | `(keys: Set<string>) => void` |  | 고정 행 변경 콜백 |
| `contextMenu` | `(row: T) => { label: string; onClick: () => void; danger?: boolean; }[]` |  | ── 행 컨텍스트 메뉴 ── |
| `rowClassName` | `(row: T, index: number) => string \| undefined` |  | ── 조건부 서식 ── |
| `cellClassName` | `(row: T, column: DataTableColumn<T>) => string \| undefined` |  | 셀별 클래스 반환 함수 |
| `serverSide` | `boolean` |  | ── 서버사이드 모드 ── |
| `totalRows` | `number` |  | 서버사이드 전체 행 수 |
| `onPageChange` | `(page: number, pageSize: number) => void` |  | 페이지 변경 콜백 |
| `onSortChange` | `(sorts: SortState[]) => void` |  | 정렬 변경 콜백 |
| `onFilterChange` | `(search: string, columnFilters: Record<string, string>) => void` |  | 필터 변경 콜백 |
| `groupBy` | `string` |  | ── 행 그룹핑 ── |
| `copyable` | `boolean` |  | ── 셀 복사 ── |
| `emptyMessage` | `string` |  | ── 기타 ── |
| `loading` | `boolean` |  | 로딩 상태 |
| `onRowClick` | `(row: T) => void` |  | 행 클릭 콜백 |
| `striped` | `boolean` |  | 줄무늬 행 표시 |
| `stickyHeader` | `boolean` |  | 헤더 고정 |
| `caption` | `string` |  | 표 캡션 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<DataTable columns={columns} data={rows} rowKey="id" selectable pageSize={20} />
```

---

### EmailInbox

*stable* · *v2.5.0* — `email` `layout`

3-pane 메일 인박스 — 폴더 / 리스트 / 본문 패널.

**Import:** `import { EmailInbox } from "@/ds/patterns/EmailInbox";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `folders` | `Array<EmailFolder>` | ✓ | 좌측 폴더 목록 |
| `messages` | `Array<EmailMessage>` | ✓ | 모든 메일 (folderId로 필터링) |
| `activeFolderId` | `string` | ✓ | 활성 폴더 id |
| `onFolderChange` | `(id: string) => void` | ✓ | 폴더 변경 콜백 |
| `activeMessageId` | `string \| null` |  | 활성 메일 id (본문 패널 표시) |
| `onMessageSelect` | `(msg: EmailMessage) => void` | ✓ | 메일 선택 콜백 |
| `onToggleStar` | `(id: string) => void` |  | 별표 토글 |
| `search` | `string` |  | 검색 텍스트 |
| `onSearchChange` | `(q: string) => void` |  | 검색 변경 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<EmailInbox folders={folders} messages={mails} activeFolderId={f}
  onFolderChange={setF} activeMessageId={m} onMessageSelect={(m)=>setM(m.id)} />
```

---

### FAQ

*stable* · *v2.3.0* — `marketing`

FAQ 섹션 (검색 + 카테고리 필터 + 단일/다중 펼침).

**Import:** `import { FAQ } from "@/ds/patterns/FAQ";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `ReactNode` |  | 섹션 제목 |
| `subtitle` | `ReactNode` |  | 부제 |
| `items` | `Array<FAQItem>` | ✓ | FAQ 목록 |
| `multiple` | `boolean` |  | 다중 펼침 허용 |
| `showCategoryFilter` | `boolean` |  | 카테고리 필터 노출 |
| `searchable` | `boolean` |  | 검색 입력 노출 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<FAQ title="자주 묻는 질문" items={[{question:"환불은?", answer:"7일 내 가능"}]} searchable />
```

---

### FeatureGrid

*stable* · *v2.3.0* — `marketing`

마케팅 섹션 — 기능/혜택 그리드 (3가지 레이아웃 지원).

**Import:** `import { FeatureGrid } from "@/ds/patterns/FeatureGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `ReactNode` |  | 섹션 제목 |
| `subtitle` | `ReactNode` |  | 섹션 부제 |
| `features` | `Array<FeatureItem>` | ✓ | 기능 목록 |
| `columns` | `2 \| 3 \| 4` |  | 컬럼 수 (반응형 자동 조정) |
| `layout` | `FeatureGridLayout` |  | 레이아웃 종류 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<FeatureGrid title="왜 JunDS?" features={[{icon:"⚡", title:"빠름", description:"..."}]} />
```

---

### FilterBar

*stable* · *v2.2.0* — `form` `control`

필터 바

**Import:** `import { FilterBar } from "@/ds/patterns/FilterBar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `searchValue` | `string` |  | 검색 입력 |
| `onSearchChange` | `(value: string) => void` |  | 검색어 변경 콜백 |
| `searchPlaceholder` | `string` |  | 검색 입력 플레이스홀더 |
| `filters` | `ReactNode` |  | 필터 요소 (Select, MultiSelect 등) |
| `actions` | `ReactNode` |  | 오른쪽 액션 |
| `onReset` | `() => void` |  | 초기화 버튼 표시 |
| `activeCount` | `number` |  | 활성 필터 수 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FilterBar
  searchValue={q} onSearchChange={setQ}
  filters={<><Select ... /><Select ... /></>}
  actions={<Button>내보내기</Button>}
  onReset={clearFilters}
  activeCount={2}
/>
```

---

### FlowDiagram

*stable* · *v2.2.0* — `data-display`

노드와 연결선으로 구성된 플로우 다이어그램 에디터.

**Import:** `import { FlowDiagram } from "@/ds/patterns/FlowDiagram";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `nodes` | `Array<FlowNode>` | ✓ | 노드 목록 |
| `connections` | `Array<FlowConnection>` | ✓ | 연결선 목록 |
| `onNodeMove` | `(nodeId: string, x: number, y: number) => void` |  | 노드 이동 콜백 |
| `onNodeClick` | `(nodeId: string) => void` |  | 노드 클릭 콜백 |
| `onConnect` | `(from: string, to: string) => void` |  | 연결 생성 콜백 |
| `onDisconnect` | `(connectionId: string) => void` |  | 연결 해제 콜백 |
| `selectedIds` | `Array<string>` |  | 선택된 노드 ID 목록 |
| `onSelectionChange` | `(ids: string[]) => void` |  | 선택 변경 콜백 |
| `onNodeDelete` | `(nodeIds: string[]) => void` |  | 노드 삭제 콜백 |
| `onNodeDoubleClick` | `(nodeId: string) => void` |  | 노드 더블 클릭 콜백 |
| `className` | `string` |  | 추가 클래스 |
| `showGrid` | `boolean` |  | 그리드 표시 여부 |
| `showMinimap` | `boolean` |  | 미니맵 표시 여부 |
| `fitToView` | `boolean` |  | 화면 맞춤 활성화 |
| `readonly` | `boolean` |  | 읽기 전용 |
| `connectionStyle` | `"bezier" \| "straight" \| "step"` |  | 연결선 스타일 |
| `animateConnections` | `boolean` |  | 연결선 애니메이션 |

**Example**

```tsx
<FlowDiagram nodes={nodes} connections={connections} onNodeMove={updateNode} />
```

---

### Form

*stable* · *v2.2.0* — `form`

값/오류/터치 상태를 한곳에서 관리하는 폼 컨테이너.

**Import:** `import { Form } from "@/ds/patterns/Form";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `values` | `Record<string, unknown>` | ✓ | 폼 값 객체 |
| `errors` | `Record<string, string>` |  | 필드 에러 메시지 |
| `touched` | `Record<string, boolean>` |  | 필드 터치 상태 |
| `onChange` | `(name: string, value: unknown) => void` | ✓ | 값 변경 콜백 |
| `onBlur` | `(name: string) => void` |  | 필드 블러 콜백 |
| `onSubmit` | `() => void` |  | 제출 콜백 |
| `children` | `ReactNode` | ✓ | 자식 요소 |
| `className` | `string` |  | 추가 클래스 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<Form values={values} onChange={setValues} errors={errors} onSubmit={handleSubmit}>
  <FormField name="email" label="이메일" />
</Form>
```

---

### FormArray

*stable* · *v2.2.0* — `form`

배열형 폼 필드(추가/삭제 가능한 반복 항목)를 관리합니다.

**Import:** `import { FormArray } from "@/ds/patterns/FormArray";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `Array<T>` | ✓ | 항목 배열 값 |
| `onChange` | `(value: T[]) => void` | ✓ | 값 변경 콜백 |
| `renderItem` | `(item: T, index: number, helpers: { remove: () => void; update: (val: T) => void; }) => ReactNode` | ✓ | 항목 렌더 함수 |
| `defaultItem` | `T` | ✓ | 새 항목 기본값 |
| `maxItems` | `number` |  | 최대 항목 수 |
| `minItems` | `number` |  | 최소 항목 수 |
| `addLabel` | `string` |  | 추가 버튼 라벨 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FormArray
  value={items}
  onChange={setItems}
  defaultItem={{ name: "" }}
  renderItem={(item, idx) => <Input value={item.name} />}
/>
```

---

### FormBuilder

*stable* · *v2.2.0* — `form`

선언적 폼 빌더 — 필드 배열로 폼 자동 생성

**Import:** `import { FormBuilder } from "@/ds/patterns/FormBuilder";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `fields` | `Array<FormField>` | ✓ | 필드 정의 배열 |
| `onSubmit` | `(values: Record<string, string>) => void \| Promise<void>` | ✓ | 제출 콜백 |
| `submitLabel` | `string` |  | 제출 버튼 라벨 |
| `actions` | `ReactNode` |  | 추가 액션 (취소 버튼 등) |
| `loading` | `boolean` |  | 로딩 상태 |
| `columns` | `2 \| 1` |  | 컬럼 수 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FormBuilder
  fields={[
    { name:"title", label:"제목", type:"text", required:true },
    { name:"desc", label:"설명", type:"textarea" },
    { name:"priority", label:"우선순위", type:"select", options:[...] },
  ]}
  onSubmit={handleSubmit}
/>
```

---

### FormWizard

*stable* · *v2.2.0* — `form` `navigation`

단계별 폼 마법사(스텝 폼).

**Import:** `import { FormWizard } from "@/ds/patterns/FormWizard";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `steps` | `Array<FormWizardStep>` | ✓ | 위저드 단계 목록 |
| `onComplete` | `(data: Record<string, unknown>) => void` |  | 완료 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FormWizard steps={steps} onComplete={(values) => submit(values)} />
```

---

### ForumThread

*stable* · *v2.5.0* — `forum` `content`

포럼 스레드 — Stack Overflow 스타일 질문/답변 + 투표 + 채택.

**Import:** `import { ForumThread } from "@/ds/patterns/ForumThread";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `string` | ✓ |  |
| `tags` | `Array<string>` |  |  |
| `opening` | `ForumPost` | ✓ |  |
| `answers` | `Array<ForumPost>` | ✓ |  |
| `onVote` | `(postId: string, dir: 1 \| -1 \| 0) => void` |  |  |
| `onAccept` | `(postId: string) => void` |  |  |
| `replyComposer` | `ReactNode` |  |  |
| `className` | `string` |  |  |

**Example**

```tsx
<ForumThread title="React 19 use() 사용법" opening={op} answers={ans} onVote={vote} onAccept={accept} />
```

---

### GanttChart

*stable* · *v2.3.0* — `chart`

간단한 간트 차트 (프로젝트 일정 시각화).

**Import:** `import { GanttChart } from "@/ds/patterns/GanttChart";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `tasks` | `Array<GanttTask>` | ✓ | 태스크 목록 |
| `dayWidth` | `number` |  | 1일당 px 폭 |
| `rowHeight` | `number` |  | 행 높이 |
| `labelWidth` | `number` |  | 좌측 라벨 폭 |
| `onSelect` | `(task: GanttTask) => void` |  | 태스크 선택 콜백 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<GanttChart tasks={[{id:"a",name:"설계",start:"2026-04-01",end:"2026-04-15",progress:60}]} />
```

---

### HeroSection

*stable* · *v2.3.0* — `marketing`

마케팅 / 랜딩 페이지 hero 섹션 (centered/split/imageBg/minimal).

**Import:** `import { HeroSection } from "@/ds/patterns/HeroSection";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `variant` | `HeroVariant` |  | 변형 |
| `eyebrow` | `ReactNode` |  | 상단 eyebrow 텍스트/배지 |
| `title` | `ReactNode` | ✓ | 메인 제목 |
| `subtitle` | `ReactNode` |  | 부제 |
| `primaryCta` | `{ label: string; href?: string; onClick?: () => void; }` |  | Primary CTA |
| `secondaryCta` | `{ label: string; href?: string; onClick?: () => void; }` |  | Secondary CTA |
| `media` | `ReactNode` |  | 우측 미디어 (split 전용) |
| `bgImage` | `string` |  | 배경 이미지 URL (imageBg 전용) |
| `footer` | `ReactNode` |  | 푸터 영역 (소셜 프루프, 로고 등) |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<HeroSection variant="centered" title="당신의 디자인 시스템" subtitle="단 한 줄로 시작하세요" primaryCta={{label:"시작하기"}} />
```

---

### InfiniteList

*stable* · *v2.2.0* — `data`

무한 스크롤 리스트 (IntersectionObserver)

**Import:** `import { InfiniteList } from "@/ds/patterns/InfiniteList";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<T>` | ✓ | 항목 배열 |
| `renderItem` | `(item: T, index: number) => ReactNode` | ✓ | 항목 렌더 함수 |
| `keyExtractor` | `(item: T) => string` | ✓ | 키 추출 함수 |
| `onLoadMore` | `() => void` | ✓ | 추가 로드 콜백 |
| `hasMore` | `boolean` | ✓ | 더 불러올 항목 존재 여부 |
| `loading` | `boolean` |  | 로딩 상태 |
| `threshold` | `number` |  | 트리거 거리 (px) |
| `emptyMessage` | `string` |  | 빈 상태 메시지 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<InfiniteList items={data} renderItem={(item)=><Card>{item.name}</Card>} keyExtractor={i=>i.id} onLoadMore={fetchMore} hasMore={hasNext} />
```

---

### Kanban

*stable* · *v2.2.0* — `data`

칸반 보드 (가벼운 버전 — 네이티브 드래그)

**Import:** `import { Kanban } from "@/ds/patterns/Kanban";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `columns` | `Array<KanbanColumn<T>>` | ✓ | 컬럼 목록 |
| `renderCard` | `(item: T, columnId: string) => ReactNode` | ✓ | 카드 렌더 |
| `onMove` | `(itemId: string, fromColumn: string, toColumn: string) => void` |  | 드래그 완료 콜백 |
| `renderColumnHeader` | `(column: KanbanColumn<T>) => ReactNode` |  | 컬럼 헤더 커스텀 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Kanban
  columns={[{id:"todo",title:"할 일",items:[...]},{id:"doing",title:"진행 중",items:[...]}]}
  renderCard={(item) => <TaskCard task={item} />}
  onMove={handleMove}
/>
```

---

### LoginForm

*stable* · *v2.2.0* — `form`

보안 로그인/회원가입 폼

**Import:** `import { LoginForm } from "@/ds/patterns/LoginForm";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `onSubmit` | `(data: { email: string; password: string; remember: boolean; }) => void \| Promise<void>` | ✓ | 제출 콜백 |
| `socialButtons` | `ReactNode` |  | 소셜 로그인 버튼 |
| `error` | `string` |  | 에러 메시지 |
| `loading` | `boolean` |  | 로딩 상태 |
| `signupHref` | `string` |  | 회원가입 링크 |
| `forgotHref` | `string` |  | 비밀번호 찾기 링크 |
| `logo` | `ReactNode` |  | 로고 |
| `title` | `string` |  | 폼 제목 |
| `subtitle` | `string` |  | 폼 부제목 |
| `showPasswordStrength` | `boolean` |  | 비밀번호 강도 표시 (회원가입 폼용) |
| `showConfirmPassword` | `boolean` |  | 비밀번호 확인 (회원가입 폼용) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<LoginForm onSubmit={handleLogin} title="로그인" forgotHref="/forgot" />
<LoginForm onSubmit={handleRegister} title="회원가입" showPasswordStrength showConfirmPassword />
```

---

### MasonryGrid

*stable* · *v2.2.0* — `layout`

핀터레스트 스타일의 메이슨리(masonry) 그리드 레이아웃.

**Import:** `import { MasonryGrid } from "@/ds/patterns/MasonryGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `React.ReactNode` | ✓ | 자식 요소 |
| `columns` | `2 \| 3 \| 4` |  | 컬럼 수 |
| `gap` | `number` |  | 아이템 간격 (px) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<MasonryGrid columns={3} gap={16}>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</MasonryGrid>
```

---

### NotificationCenter

*stable* · *v2.2.0* — `feedback`

알림 센터 (벨 아이콘 + 드롭다운)

**Import:** `import { NotificationCenter } from "@/ds/patterns/NotificationCenter";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `notifications` | `Array<NotificationItem>` | ✓ | 알림 목록 |
| `onMarkAllRead` | `() => void` |  | 전체 읽음 처리 콜백 |
| `onClear` | `() => void` |  | 전체 삭제 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<NotificationCenter notifications={[{id:"1",title:"새 업무",time:"방금"}]} />
```

---

### OnboardingTour

*stable* · *v2.5.0* — `onboarding` `overlay`

제품 투어 — 첫 사용자 가이드. 스팟라이트 + 말풍선 + 키보드(Esc/←/→/Enter).

**Import:** `import { OnboardingTour } from "@/ds/patterns/OnboardingTour";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `steps` | `Array<OnboardingStep>` | ✓ |  |
| `open` | `boolean` | ✓ |  |
| `onClose` | `() => void` | ✓ |  |
| `onComplete` | `() => void` |  |  |
| `className` | `string` |  |  |

**Example**

```tsx
<OnboardingTour open={open} onClose={()=>setOpen(false)}
  steps={[{id:"1",target:"#composer",title:"여기서 글을 쓰세요"},…]} />
```

---

### PhotoAlbum

*stable* · *v2.4.0* — `photo` `layout`

사진 앨범 — 태그 필터 + 그리드 + 라이트박스 자동 연결.

**Import:** `import { PhotoAlbum } from "@/ds/patterns/PhotoAlbum";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `photos` | `Array<PhotoAlbumItem>` | ✓ | 사진 목록 |
| `layout` | `PhotoGridLayout` |  | 그리드 레이아웃 |
| `columns` | `5 \| 2 \| 3 \| 4` |  | 컬럼 수 |
| `title` | `string` |  | 앨범 제목 |
| `emptyTitle` | `string` |  | 비었을 때 메시지 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<PhotoAlbum title="2026 여행" photos={photos} layout="masonry" columns={4} />
```

---

### PricingPage

*stable* · *v2.3.0* — `marketing`

마케팅용 요금제 페이지 (헤더 + 토글 + 플랜 테이블 + FAQ).

**Import:** `import { PricingPage } from "@/ds/patterns/PricingPage";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `title` | `ReactNode` |  | 페이지 제목 |
| `description` | `ReactNode` |  | 페이지 설명 |
| `monthlyPlans` | `Array<PricingPlan>` | ✓ | 월간 플랜 |
| `yearlyPlans` | `Array<PricingPlan>` |  | 연간 플랜 (있으면 토글 노출) |
| `toggleLabels` | `{ monthly?: string; yearly?: string; saveLabel?: string; }` |  | 토글 라벨 |
| `faqs` | `Array<PricingFAQ>` |  | FAQ 리스트 |
| `footerCta` | `ReactNode` |  | 하단 CTA 영역 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<PricingPage title="요금제" monthlyPlans={[...]} yearlyPlans={[...]} faqs={[...]} />
```

---

### RichTextEditor

*stable* · *v2.2.0* — `form` `input`

리치 텍스트 에디터 (contentEditable 기반)

**Import:** `import { RichTextEditor } from "@/ds/patterns/RichTextEditor";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `string` |  | HTML 값 |
| `onChange` | `(html: string) => void` |  | 값 변경 콜백 |
| `placeholder` | `string` |  | 플레이스홀더 |
| `minHeight` | `number` |  | 최소 높이 |
| `disabled` | `boolean` |  | 비활성화 여부 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<RichTextEditor value={html} onChange={setHtml} placeholder="내용을 입력하세요..." />
```

---

### SecurityChecklist

*stable* · *v2.2.0* — `data-display`

보안 체크리스트 — 보안 설정 현황을 한눈에 확인 + 조치

**Import:** `import { SecurityChecklist } from "@/ds/patterns/SecurityChecklist";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<SecurityCheckItem>` | ✓ | 체크리스트 항목 |
| `title` | `string` |  | 제목 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SecurityChecklist items={[
  { key:"2fa", title:"2단계 인증", description:"계정 보호를 위해 2FA를 활성화하세요", status:"insecure", action:{ label:"설정", onClick:setup2FA } },
  { key:"pw", title:"비밀번호 강도", description:"마지막 변경: 90일 전", status:"attention" },
]} />
```

---

### SettingsLayout

*stable* · *v2.3.0* — `layout`

설정 페이지 표준 레이아웃: 사이드바 네비 + 컨텐츠.

**Import:** `import { SettingsLayout } from "@/ds/patterns/SettingsLayout";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `sections` | `Array<SettingsSection>` | ✓ | 섹션 목록 |
| `activeId` | `string` |  | 현재 활성 섹션 ID (controlled) |
| `defaultActiveId` | `string` |  | 기본 활성 ID |
| `onChange` | `(id: string) => void` |  | 변경 콜백 |
| `title` | `ReactNode` |  | 페이지 제목 |
| `sidebarWidth` | `number` |  | 사이드바 폭 |
| `asChild` | `boolean` |  | root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) |

**Example**

```tsx
<SettingsLayout title="설정" sections={[{id:"profile",label:"프로필",content:<X/>}]} />
```

---

### Sidebar

compound 표면 — 멤버로도 조립: `DsSidebar.Provider` / `DsSidebar.Link` / `DsSidebar.Section`

**Import:** `import { Sidebar } from "@/ds/patterns/Sidebar";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `header` | `ReactNode` |  | 상단 헤더 영역 |
| `footer` | `ReactNode` |  | 하단 푸터 영역 |
| `children` | `ReactNode` | ✓ | 사이드바 본문 |
| `width` | `number` |  | 펼친 상태 너비(px) |
| `collapsedWidth` | `number` |  | 접힌 상태 너비(px) |
| `className` | `string` |  | 추가 클래스 |

---

### SocialFeed

*stable* · *v2.4.0* — `sns` `layout`

SNS 피드 — 상단 스토리 바 + 무한 스크롤 게시물 리스트.

**Import:** `import { SocialFeed } from "@/ds/patterns/SocialFeed";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `stories` | `Array<SocialFeedStory>` |  | 상단 스토리 바 (선택) |
| `onStoryClick` | `(id: string) => void` |  | 스토리 클릭 콜백 |
| `children` | `ReactNode` | ✓ | 게시물 노드 (대체로 PostCard 리스트) |
| `hasMore` | `boolean` |  | 더 불러올 데이터 있는지 |
| `loading` | `boolean` |  | 로딩 중 표시 |
| `onLoadMore` | `() => void` |  | 무한 스크롤 트리거 (관찰자가 화면에 들어오면 호출) |
| `emptyTitle` | `string` |  | 데이터 비었을 때 표시할 엠티 메시지 |
| `emptyDescription` | `string` |  | 비었을 때 표시할 설명 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SocialFeed stories={stories} onStoryClick={openStory} hasMore={hasMore} onLoadMore={fetchMore}>
  {posts.map((p) => <PostCard key={p.id} {...p} />)}
</SocialFeed>
```

---

### SortableList

*stable* · *v2.2.0* — `data`

드래그 앤 드롭 정렬 리스트 (네이티브 API)

**Import:** `import { SortableList } from "@/ds/patterns/SortableList";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<T>` | ✓ | 정렬 가능한 항목 |
| `renderItem` | `(item: T, index: number) => ReactNode` | ✓ | 항목 렌더 함수 |
| `onReorder` | `(items: T[]) => void` | ✓ | 재정렬 콜백 |
| `showHandle` | `boolean` |  | 드래그 핸들 표시 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SortableList items={tasks} renderItem={(t)=><div>{t.name}</div>} onReorder={setTasks} showHandle />
```

---

### Starfield

*stable* · *v2.2.0* — `misc`

별이 흐르는 우주 배경 애니메이션.

**Import:** `import { Starfield } from "@/ds/patterns/Starfield";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `starCount` | `number` |  | 별 개수 |
| `shootingStarInterval` | `number` |  | 유성 간격 (초) |
| `backgroundColor` | `string` |  | 배경색 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Starfield starCount={200} shootingStarInterval={3000} backgroundColor="#000" />
```

---

### StatsGrid

*stable* · *v2.2.0* — `data-display`

통계 그리드

**Import:** `import { StatsGrid } from "@/ds/patterns/StatsGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `stats` | `Array<StatCardProps>` | ✓ | 통계 항목 배열 |
| `columns` | `5 \| 2 \| 3 \| 4` |  | 그리드 열 수 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<StatsGrid stats={[
  { label:"총 업무", value:142, change:"+12%", trend:"up" },
  { label:"완료", value:98, change:"+5", trend:"up" },
  { label:"진행 중", value:32 },
  { label:"지연", value:12, change:"+3", trend:"down" },
]} />
```

---

### Tour

*stable* · *v2.2.0* — `overlay` `navigation`

가이드 투어 오버레이

**Import:** `import { Tour } from "@/ds/patterns/Tour";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `steps` | `Array<TourStep>` | ✓ | 투어 단계 정의 |
| `open` | `boolean` | ✓ | 투어 표시 여부 |
| `onClose` | `() => void` | ✓ | 투어 종료 콜백 |
| `current` | `number` |  | 현재 단계 인덱스 |
| `onStepChange` | `(step: number) => void` |  | 단계 변경 콜백 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Tour
  open={showTour}
  onClose={() => setShowTour(false)}
  steps={[{ target: "#btn", title: "버튼", description: "여기를 클릭하세요" }]}
/>
```

---

### VirtualList

*stable* · *v2.2.0* — `data`

가상화 리스트 — 10,000+ 행도 부드럽게

**Import:** `import { VirtualList } from "@/ds/patterns/VirtualList";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `items` | `Array<T>` | ✓ | 렌더할 항목 배열 |
| `itemHeight` | `number` | ✓ | 항목 고정 높이(px) |
| `renderItem` | `(item: T, index: number) => ReactNode` | ✓ | 항목 렌더 함수 |
| `keyExtractor` | `(item: T) => string` | ✓ | 키 추출 함수 |
| `height` | `number` | ✓ | 뷰포트 높이 |
| `overscan` | `number` |  | 오버스캔 행 수 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<VirtualList items={bigData} itemHeight={40} height={400} renderItem={(item)=><Row>{item.name}</Row>} keyExtractor={i=>i.id} />
```

---

Auto-generated by `npm run docs:components` from `.ai/props.json` on 2026-08-03. Do not edit by hand.
