# 07-rollout — 티어·배치·DoD·세션 프로토콜 (G0)

작성일: 2026-07-23 · 전제: 00-inventory.md, DECISIONS.md(DEC-003 전량 전환, DEC-005 커밋 정책), 05-perf.md.
진행 상태의 단일 소스는 `docs-spec/registry/ledger.json`(468행)이다.

## 1. 티어 — 순서이지 범위가 아니다

최종 목표는 전량(UI 320 + Behavior 62 + finance UI 86)이다. 티어는 착수 순서만 정한다.

| 티어 | 구성                                                    | 행 수 | 성격                                        |
| ---- | ------------------------------------------------------- | ----: | ------------------------------------------- |
| T1   | core 13 · layout 12 · primitives 51 · hooks→Behavior 55 |   131 | 실사용 코어 — 이후 전 배치의 토대           |
| T2   | composites 185 · patterns 43                            |   228 | 조립 계층 — 최대 물량                       |
| T3   | finance UI 86                                           |    86 | 도메인 계층 — @junds/finance-data 분리 선행 |

## 2. 배치 설계

규칙: **8~12개/배치, 같은 카테고리끼리**. 총 **42배치**(인프라 B0 + 컴포넌트 배치 41 = T1 12 · T2 21 · T3 8). 한 배치 = 한 세션 = 한 로컬 커밋.

### B0 — 인프라 배치 (컴포넌트 0개, 최우선)

- 토큰 파이프라인: tokens JSON 단일 소스 → CSS vars + Swift 생성기 (DEC-006 D5, 기존 ds/tokens TS에서 이관).
- CE 베이스클래스(light DOM + `@layer junds` + `jd-` 접두) + Behavior 러너(`createXxx(el, opts): {update?, destroy}`).
- cn() 탈피 기반: v3 웹은 Tailwind 클래스 자체를 쓰지 않는다(§6 R11).
- 벤치 하니스 뼈대(bench/web + XCTest 타깃) + size-gate/bench-gate 스크립트 (05-perf §2·§3).
- CoreProvider 처분 확정: 토큰 시스템 흡수 여부 결정 → ledger notes 기록.

### 첫 10개 배치 — 구체 명단 (B1~B10)

| 배치 | 카테고리                 |   개수 | 명단                                                                                                                                                                                                                  |
| ---- | ------------------------ | -----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1   | core                     | 12(+1) | Box, Center, CoreDivider, Flex, GridLayout, Group, HStack, Heading, Page, Section, Text, VStack (+B0 결정에 따라 CoreProvider 흡수 처리)                                                                              |
| B2   | layout                   |     12 | Stack, Grid, Container, Spacer, AppShell, Wrap, SimpleGrid, Show, Hide, AspectRatioBox, Overlay, LayoutDivider — 단, Divider·Grid·AspectRatio 삼중복은 B1에서 단일 구현 후 별칭 처리(§6 R12)                          |
| B3   | primitives 폼 코어       |     11 | Button, IconButton, Input, Textarea, Label, Checkbox, RadioGroup, Toggle, Switch, Slider, RangeSlider                                                                                                                 |
| B4   | primitives 표시          |     10 | Badge, Tag, Avatar, Spinner, Divider, Kbd, KeyCap, StatusDot, BatteryIndicator, SeverityBadge                                                                                                                         |
| B5   | primitives 특수 입력     |     10 | NumberInput, PasswordInput, PinInput, OTPInput, CurrencyInput, PhoneInput, FileUpload, CopyButton, StarRating, BackTop                                                                                                |
| B6   | primitives 텍스트·미디어 |     10 | Link, Image, Icon, Code, Mark, Highlight, AspectRatio, ScrollArea, NumberFormatter, Motion                                                                                                                            |
| B7   | primitives 인프라·소셜   |     10 | Portal, VisuallyHidden, ErrorBoundary, FocusGuard, AnnouncerProvider, MentionChip, Hashtag, BookmarkButton, LikeButton, FollowButton                                                                                  |
| B8   | Behavior 관찰자          |     12 | useMediaQuery, useBreakpoint, useBreakpointValue, usePrefersColorScheme, useReducedMotion, useElementSize, useResizeObserver, useIntersectionObserver, useWindowSize, useWindowScroll, useScrollSpy, useNetworkStatus |
| B9   | Behavior 입력·타이밍     |     12 | useEventListener, useClickOutside, useKeyboard, useHotkeys, useKeyboardShortcut, useLongPress, useHover, useDebounce, useThrottle, useInterval, useTimeout, useIdle                                                   |
| B10  | Behavior 포커스·저장     |     12 | useFocusTrap, useFocusVisible, useFocusMode, useScrollLock, useLocalStorage, useSessionStorage, useCookie, useClipboard, useCopyToClipboard, useDocumentTitle, useFavicon, useFullscreen                              |

Behavior 배치의 중복 통합(00-inventory §4: useClipboard=useCopyToClipboard, useHotkeys=useKeyboardShortcut, useElementSize=useResizeObserver)은 **한 구현 + 별칭**으로 처리하고 ledger에는 각 행을 유지, notes에 `alias-of:` 기록. N/A 판정 훅(useMounted 등 9종)은 구현 없이 "내부화" 문서만 작성하고 `web:done(내부화)` 처리.

### 이후 배치 — 카테고리 단위 (B11~B41)

| 배치    | 카테고리                        | 개수 | 내용·순서 원칙                                                                                                                                                                                                                                                                                                                     |
| ------- | ------------------------------- | ---: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B11~B12 | Behavior 잔여                   | 10+9 | 폼·상태(useForm, useDisclosure, useSteps, useToggle, usePrevious, useMounted, useAsync, useIsomorphicLayoutEffect, useUpdateEffect, useOptimisticState) → 모션·데이터(useCountUp, useAnimationFrame, usePanelResize, useGeolocation, useInfiniteFeed, useReadingProgress, useImagePreload, useResource, useMutation) — **T1 종료** |
| B13~B15 | composites 오버레이·피드백      |  ~33 | Modal 축(Modal→Drawer→BottomSheet→AlertDialog→ConfirmDialog→ActionSheet→Sheet) 먼저 — 이후 전 배치가 의존. 토스트 축(Notification·Snackbar·DsToastProvider→싱글턴), Alert·Banner·Callout류                                                                                                                                         |
| B16~B18 | composites 폼·선택              |  ~33 | Select·Combobox·AutoComplete·MultiSelect·TagInput·날짜/시간 픽커(공용 날짜 유틸 선행, §6 R8)·FormField류                                                                                                                                                                                                                           |
| B19~B21 | composites 내비·표시            |  ~33 | Tabs·Accordion·Breadcrumb·Pagination·Card·Skeleton·EmptyState·Timeline 등 표시·내비류                                                                                                                                                                                                                                              |
| B22~B24 | composites 데이터·차트          |  ~33 | 공용 드로잉 코어 1배치 선행 → Line/Bar/Pie/Area/Radar/Scatter/Sankey/Treemap/Funnel/Gauge/Heatmap/MiniChart. Table·DataGrid·VirtualScroll은 통합 재설계(§6 R2)                                                                                                                                                                     |
| B25~B29 | composites 미디어·도메인 시리즈 |  ~53 | AudioPlayer·VideoPlayer·이미지류 → Book* 8종 → Photo* 10종 → 소셜 7종 → 커머스·마케팅류 — **갤러리/USAGE 부재 62종이 여기 집중, 문서 신규 작성 부하 반영**                                                                                                                                                                         |
| B30~B33 | patterns                        |   43 | 폼 패턴(Form·FormWizard·FormArray·FormBuilder) → 사이드바·레이아웃 템플릿 → 데이터(DataTable·CommandPalette·리스트류) → 고난도 마감(Kanban·SortableList·RichTextEditor·DsCalendar·GanttChart·EmailInbox·BookReader) — **T2 종료**                                                                                                  |
| B34~B41 | finance                         |   86 | 소형 배지·유틸 → 앱 셸·내비 → 도메인 패널 → 차트(캔들·히트맵) → **Live\* 실시간 15종 최후**(B34 전 @junds/finance-data 분리 + 틱 스토어 인터페이스 확정 필수, §6 R4) — **T3 종료**                                                                                                                                                 |

## 3. 배치별 DoD (전 항목 충족 시에만 ledger 갱신)

1. **웹**: 바닐라 Custom Element(jd- 접두, light DOM, @layer junds) + ARIA 역할·키보드 내비 + 다크모드 + **단독 데모 HTML**(의존성 0, 파일 하나로 열림).
2. **iOS**: SwiftUI + UIKit 양쪽 **빌드 통과**(iOS 16 타깃, 서드파티 0).
3. **토큰만 사용**: 하드코딩 색·치수 금지 — 토큰 파이프라인 산출물만 참조.
4. **문서**: MySelf /docs/junds 규약(D7)의 상세 페이지 + 코드탭 3종(웹 바닐라 / SwiftUI / UIKit).
5. **테스트**: vitest(웹 동작·ARIA) + XCTest(iOS) 통과. SSG 헤드리스 제약 준수 — render 단계 브라우저 API·랜덤 금지.
6. **벤치**: ledger `bench:"todo"` 행 포함 배치는 05-perf 해당 시나리오 통과 수치 확보.
7. **ledger 갱신**: 해당 행 상태 갱신 + notes 기록.
8. **시각 패리티**(§5) 확인 후 **로컬 커밋 1건**(DEC-005·DEC-007: docs-spec/기존 미커밋 변경과 스테이징 분리).

## 4. 세션 프로토콜

```
1. 읽기   docs-spec/registry/ledger.json + DECISIONS.md 최신 항목 → 다음 미완 배치 확정(§2 순서표)
2. 배치   구현 (웹 → iOS → 문서 → 테스트 순)
3. 검증   vitest + Swift 빌드/XCTest + size-gate + (해당 시) 벤치 — 05-perf 게이트 전부
4. 갱신   ledger 행 상태 갱신 (todo → done / pass(수치) / n/a+notes)
          ※ ds/ 배럴이 바뀐 경우에만 gen-ledger.mjs 재실행 — 진행 상태는 보존 병합됨
5. 요약   커밋 메시지에 배치 번호·행 수·게이트 결과 요약. 새 결정은 DECISIONS.md에 append
```

원장 생성기 사용법: 레포 루트에서 `~/.nvm/versions/node/v22.5.1/bin/node docs-spec/tools/gen-ledger.mjs` (기본 셸 Node v16 금지). ds/ 7개 배럴의 value export를 00-inventory 분류 규칙으로 파싱해 `docs-spec/registry/ledger.json`을 재생성하며, 카테고리별 기대치(13/12/51/62/201/43/86, 총 468) 불일치 시 exit 1. 기존 원장의 진행 상태(web/ios/docs/tests/bench/notes)는 id 기준 보존 병합된다. **ledger 직접 편집은 상태 필드만 허용** — 행 추가·삭제는 배럴 수정 후 재생성으로만.

## 5. 시각 패리티 정책

v3는 v2와 **동일 외관**이 기본값이다(개선은 별도 결정 사항).

- B0 토큰 추출: v2 컴포넌트의 실효 스타일(Tailwind 클래스 → computed style)을 스냅샷해 토큰 값의 원천으로 사용. 즉 패리티는 눈대중이 아니라 **토큰 값 일치**로 보장한다.
- 배치 검증: v2 데모(기존 갤러리)와 v3 단독 데모를 같은 상태(기본/hover/focus/disabled/다크)로 스크린샷 대조 — 헤드리스 Chrome(puppeteer/Playwright)로 자동화, 픽셀 diff 임계 1% 미만.
- iOS는 웹과의 픽셀 일치가 아니라 **토큰 일치**(색·radius·spacing·타이포 스케일)로 패리티를 정의한다 — 플랫폼 관용 표현(시트·컨텍스트 메뉴 등)은 네이티브 우선.

## 6. 리스크 / 완화표 (배치 흐름 반영)

| #   | 리스크 (00-inventory §6)                         | 완화 — 배치 흐름 반영                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | RichTextEditor — 최고 난도 상태머신              | **B33 최후 배치**. contentEditable 코어를 별도 스파이크로 선행 검증, 실패 시 스코프 축소(마크 3종+리스트)를 DECISIONS로                                                                                                                                   |
| R2  | DataGrid/DataTable/Table 3중 구현                | B22 진입 전 **단일 가상화 테이블 코어로 통합 재설계** 결정 — 3개 외관은 코어 위 변형으로. 벤치 S1 게이트                                                                                                                                                  |
| R3  | 차트 20+종                                       | B22에서 **공용 드로잉 코어(스케일·경로·리샘플) 1배치 선행** 후 개별 차트는 얇은 조립으로. iOS는 Swift Charts 우선, Sankey/Treemap/캔들만 커스텀                                                                                                           |
| R4  | finance Live\* 틱 스토어 강결합                  | **B34 전 @junds/finance-data 분리 + 구독 인터페이스(subscribe/currentTick) 확정**. Live\* UI는 인터페이스만 의존, T3 최후 배치                                                                                                                            |
| R5  | CodeEditor/MarkdownViewer/DiffViewer 토크나이저  | 공용 토크나이저·하이라이터 유틸을 해당 배치 첫 항목으로. 언어 스코프를 명시적으로 제한(전 언어 지원 아님)                                                                                                                                                 |
| R6  | Kanban/SortableList/Transfer DnD                 | 공용 DnD 상태머신(키보드 DnD 포함)을 B30 폼 패턴 후 1회 구현 — 3컴포넌트가 공유                                                                                                                                                                           |
| R7  | CommandPalette 결합체                            | B10 useFocusTrap Behavior 완료가 선행 조건 — B32에 배치                                                                                                                                                                                                   |
| R8  | 날짜 연산 자체 구현                              | B16 픽커 전 **공용 날짜 코어 유틸**(월 그리드·로케일·비교) 1회 구현 — DsCalendar·CalendarMonth·DateRangePicker·MonthPicker·YearPicker 공유                                                                                                                |
| R9  | Form/FormBuilder + runtime valibot               | B11 useForm(Behavior)에서 자체 검증 코어 확정 → valibot 제거. runtime PageDoc Renderer는 **본 롤아웃 범위 외 별도 트랙**(ledger 대상 아님)                                                                                                                |
| R10 | ImageCropper/SignaturePad/ColorPicker 지오메트리 | 공용 포인터 유틸(coalescing+RAF 배칭) 선행. iOS는 PencilKit·네이티브 픽커 대체 우선                                                                                                                                                                       |
| R11 | **cn() 273파일 = Tailwind 체계 탈피**            | 이식이 아니라 **재작성**: v3 웹은 cn/Tailwind를 애초에 쓰지 않고 토큰 CSS vars + 컴포넌트별 정적 CSS(@layer junds)로 작성. v2 클래스는 B0 토큰 추출의 입력으로만 소비. packages/react(v2 어댑터)에만 cn 존속 허용, v3 신규 코드의 cn import는 린트로 금지 |
| R12 | Divider·Grid·AspectRatio 등 삼중복 명명          | B1~B2에서 **단일 구현 + 별칭 export** 확정(ledger 3행 유지, notes에 alias-of). 통합 명명은 DECISIONS로                                                                                                                                                    |
| R13 | SSG 헤드리스 렌더 제약                           | 전 컴포넌트 DoD 5항에 상시 포함 — connectedCallback 이전 브라우저 API 접근 금지, 랜덤·시간은 주입 가능하게                                                                                                                                                |
