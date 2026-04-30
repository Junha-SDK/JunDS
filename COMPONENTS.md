# junDS — 디자인 시스템 컴포넌트 레퍼런스

> 이 문서는 `.ai/props.json`과 컴포넌트 소스의 JSDoc을 토대로 자동 생성됩니다.
> **수정하지 마세요.** 컴포넌트 props를 변경하면 `npm run extract-props && npm run docs:components`를 실행하세요.

총 **174개** 컴포넌트 — Primitives 35 · Composites 115 · Patterns 24.

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
  - [Button](#button)
  - [Checkbox](#checkbox)
  - [CopyButton](#copybutton)
  - [CurrencyInput](#currencyinput)
  - [Divider](#divider)
  - [ErrorBoundary](#errorboundary)
  - [FileUpload](#fileupload)
  - [FocusGuard](#focusguard)
  - [IconButton](#iconbutton)
  - [Input](#input)
  - [Kbd](#kbd)
  - [Label](#label)
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
  - [Alert](#alert)
  - [AlertDialog](#alertdialog)
  - [AnimatedCounter](#animatedcounter)
  - [AudioPlayer](#audioplayer)
  - [AutoComplete](#autocomplete)
  - [AutoHideHeader](#autohideheader)
  - [AutoPlayDemo](#autoplaydemo)
  - [AvatarStack](#avatarstack)
  - [Banner](#banner)
  - [BentoGrid](#bentogrid)
  - [BookCard](#bookcard)
  - [BottomSheet](#bottomsheet)
  - [Breadcrumb](#breadcrumb)
  - [ButtonGroup](#buttongroup)
  - [Callout](#callout)
  - [Card](#card)
  - [Carousel](#carousel)
  - [ChatBubble](#chatbubble)
  - [CodeEditor](#codeeditor)
  - [Collapsible](#collapsible)
  - [CollectionView](#collectionview)
  - [ColorPicker](#colorpicker)
  - [ColorSwatch](#colorswatch)
  - [Combobox](#combobox)
  - [CompareSlider](#compareslider)
  - [ComparisonGrid](#comparisongrid)
  - [ComponentShowcase](#componentshowcase)
  - [Confetti](#confetti)
  - [ConfirmDialog](#confirmdialog)
  - [ContextMenu](#contextmenu)
  - [CopyBlock](#copyblock)
  - [CronExpression](#cronexpression)
  - [DataGrid](#datagrid)
  - [DateInput](#dateinput)
  - [DateRangeFilter](#daterangefilter)
  - [DateRangePicker](#daterangepicker)
  - [Descriptions](#descriptions)
  - [DetailPanel](#detailpanel)
  - [DiffViewer](#diffviewer)
  - [Dock](#dock)
  - [Drawer](#drawer)
  - [Dropdown](#dropdown)
  - [EmojiPicker](#emojipicker)
  - [EmptyState](#emptystate)
  - [FilterButtonGroup](#filterbuttongroup)
  - [FloatingActionButton](#floatingactionbutton)
  - [FormField](#formfield)
  - [FunnelChart](#funnelchart)
  - [GaugeChart](#gaugechart)
  - [Globe](#globe)
  - [GradientBorder](#gradientborder)
  - [Heatmap](#heatmap)
  - [HoverCard](#hovercard)
  - [ImageCropper](#imagecropper)
  - [ImageLightbox](#imagelightbox)
  - [InlineEdit](#inlineedit)
  - [JSONViewer](#jsonviewer)
  - [KeyValueGrid](#keyvaluegrid)
  - [LoadingOverlay](#loadingoverlay)
  - [MarkdownViewer](#markdownviewer)
  - [Marquee](#marquee)
  - [Mention](#mention)
  - [Menubar](#menubar)
  - [MetricCard](#metriccard)
  - [MiniChart](#minichart)
  - [Modal](#modal)
  - [MultiSelect](#multiselect)
  - [NavigationMenu](#navigationmenu)
  - [Notification](#notification)
  - [Onboarding](#onboarding)
  - [Pagination](#pagination)
  - [Popover](#popover)
  - [ProgressRing](#progressring)
  - [PullToRefresh](#pulltorefresh)
  - [QRCode](#qrcode)
  - [Rating](#rating)
  - [ReadingTime](#readingtime)
  - [Resizable](#resizable)
  - [Result](#result)
  - [ScrollSpy](#scrollspy)
  - [SearchInput](#searchinput)
  - [SecurityBadge](#securitybadge)
  - [SegmentedControl](#segmentedcontrol)
  - [Select](#select)
  - [Sheet](#sheet)
  - [SignaturePad](#signaturepad)
  - [Skeleton](#skeleton)
  - [SkeletonPreset](#skeletonpreset)
  - [SplitPane](#splitpane)
  - [SpoilerBlock](#spoilerblock)
  - [Spotlight](#spotlight)
  - [SpotlightCard](#spotlightcard)
  - [StatCard](#statcard)
  - [Stepper](#stepper)
  - [Sticky](#sticky)
  - [SwipeAction](#swipeaction)
  - [Table](#table)
  - [Tabs](#tabs)
  - [TagInput](#taginput)
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
- [Patterns](#patterns)
  - [ActionBar](#actionbar)
  - [Calendar](#calendar)
  - [ChartCard](#chartcard)
  - [CommandPalette](#commandpalette)
  - [DataTable](#datatable)
  - [FilterBar](#filterbar)
  - [FlowDiagram](#flowdiagram)
  - [Form](#form)
  - [FormArray](#formarray)
  - [FormBuilder](#formbuilder)
  - [FormWizard](#formwizard)
  - [InfiniteList](#infinitelist)
  - [Kanban](#kanban)
  - [LoginForm](#loginform)
  - [MasonryGrid](#masonrygrid)
  - [NotificationCenter](#notificationcenter)
  - [RichTextEditor](#richtexteditor)
  - [SecurityChecklist](#securitychecklist)
  - [Sidebar](#sidebar)
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
| `useBreakpoint` | 현재 브레이크포인트 감지 훅 |
| `useBreakpointValue` |  |
| `useClickOutside` | ref 외부 클릭 감지 |
| `useClipboard` | 클립보드 읽기/쓰기 훅 |
| `useCopyToClipboard` | 클립보드 복사 훅 |
| `useCountUp` | 숫자 카운트업 애니메이션 훅 |
| `useDebounce` | 디바운스 훅 — 값 변경을 지연시킵니다 |
| `useDisclosure` | open/close 상태 관리 (모달, 드로어 등) |
| `useElementSize` |  |
| `useEventListener` |  |
| `useFocusMode` | 포커스 모드 상태 관리 훅 |
| `useForm` |  |
| `useIdle` |  |
| `useIntersectionObserver` |  |
| `useInterval` |  |
| `useKeyboard` | 키보드 단축키 바인딩 |
| `useLocalStorage` | localStorage 동기화 상태 훅 |
| `useLongPress` |  |
| `useMediaQuery` | 미디어 쿼리 매칭 상태 반환 |
| `useMounted` |  |
| `useNetworkStatus` |  |
| `usePanelResize` | 패널 리사이즈 훅 |
| `usePrefersColorScheme` |  |
| `usePrevious` |  |
| `useReducedMotion` | prefers-reduced-motion 감지 |
| `useScrollSpy` | 스크롤 위치 기반 활성 섹션 감지 훅 |
| `useSteps` |  |
| `useThrottle` |  |
| `useToggle` | 불린 토글 훅 |
| `useWindowScroll` |  |

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
| `variant` | `"icon" \| "button"` |  | 버튼 표시 형태 |
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
| `error` | `boolean` |  | 에러 상태 표시 |
| `autoResize` | `boolean` |  | 내용에 맞춰 높이 자동 조절 |
| `showCount` | `boolean` |  | maxLength 기준 글자수 카운터 표시 |

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

**Example**

```tsx
<Affix position="top" zIndex={50}>
  <Toolbar />
</Affix>
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
| `transition` | `"fade" \| "slide-up" \| "slide-left" \| "scale" \| "crossfade" \| "none"` |  | 전환 애니메이션 |
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

### BentoGrid

*stable* · *v2.2.0* — `layout`

크기가 다른 카드를 비대칭 그리드로 배치하는 벤토 레이아웃.

**Import:** `import { BentoGrid } from "@/ds/composites/BentoGrid";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 자식 요소 |
| `cols` | `number` |  | 그리드 열 수 |
| `gap` | `number` |  | 셀 간격(rem 단위 4배수) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<BentoGrid cols={3} gap="md">
  <BentoItem span={2}>큰 카드</BentoItem>
  <BentoItem>작은 카드</BentoItem>
</BentoGrid>
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
| `height` | `"auto" \| "half" \| "full"` |  | 시트 높이 모드 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<BottomSheet open={open} onClose={() => setOpen(false)} title="옵션">
  <Menu />
</BottomSheet>
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
| `variant` | `"warning" \| "danger" \| "info" \| "note" \| "tip"` |  | 콜아웃 유형 |
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
| `view` | `"grid" \| "list"` |  | 뷰 모드 |
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

### Dock

*stable* · *v2.2.0* — `navigation`

macOS 스타일의 마우스 오버 시 확대되는 독.

**Import:** `import { Dock } from "@/ds/composites/Dock";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `children` | `ReactNode` | ✓ | 도크 아이템 (DockItem) |
| `magnification` | `number` |  | 호버 시 확대 배율 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<Dock magnification={1.4}>
  <DockItem icon={<HomeIcon />} />
  <DockItem icon={<SearchIcon />} />
</Dock>
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
| `position` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` |  | 위치 |
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
| `htmlFor` | `string` |  | htmlFor |
| `children` | `ReactNode` | ✓ | 입력 요소 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<FormField label="이름" required error={errors.name}>
  <Input id="name" error={!!errors.name} />
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
<Globe size={400} dotColor="#3b82f6" speed={0.5} />
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
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<LoadingOverlay active={loading} label="불러오는 중...">
  <Content />
</LoadingOverlay>
```

---

### MarkdownViewer

*stable* · *v2.2.0* — `data-display`

마크다운 텍스트를 HTML로 렌더링합니다.

**Import:** `import { MarkdownViewer } from "@/ds/composites/MarkdownViewer";`

**Props**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `content` | `string` | ✓ | 마크다운 원문 텍스트 |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<MarkdownViewer content="# 제목\n\n본문 내용" />
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
<MiniChart data={[5, 8, 12, 9, 14]} type="line" color="#3b82f6" />
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
| `variant` | `"list" \| "card" \| "table" \| "profile" \| "article"` | ✓ | 프리셋 종류 |
| `rows` | `number` |  | 행 수 (table/list 변형) |
| `className` | `string` |  | 추가 클래스 |

**Example**

```tsx
<SkeletonPreset variant="card" rows={3} />
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
| `type` | `"spoiler" \| "caution"` |  | 스포일러 종류 |
| `label` | `string` |  | 공개 버튼 라벨 |
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
| `defaultExpanded` | `Array<string>` |  | 기본 확장 키 목록 |
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

**Example**

```tsx
<Watermark text="기밀 문서">
  <div>보호할 콘텐츠</div>
</Watermark>
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

### Sidebar

*stable* · *v2.2.0* — `navigation`

사이드바

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

**Example**

```tsx
<DsSidebarProvider>
  <DsSidebar header={<Logo />}>
    <SidebarLink href="/" label="홈" icon={<HomeIcon />} />
  </DsSidebar>
</DsSidebarProvider>
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

Auto-generated by `npm run docs:components` from `.ai/props.json` on 2026-04-29. Do not edit by hand.
