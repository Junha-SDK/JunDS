# 08. 훅 · 토큰 · 유틸 레퍼런스

[← 목차](../USAGE-MYSELF.md) · [← 07 포트폴리오·음악](07-portfolio-music.md)

## 1. MySelf 에서 옮겨 온 훅 7종

| 훅 | MySelf 원본 | 바뀐 점 |
|---|---|---|
| `useCodeCopy(root, deps, opts?)` | `core/hooks/useCodeCopy` | 셀렉터·라벨·클래스·지연시간 옵션화 |
| `useJsonLd(key, data)` | `portfolio/hooks/useJsonLd` | 같은 key 재주입 시 교체 |
| `useRevealOnScroll(opts?)` | `portfolio/hooks/useRevealOnScroll` | 셀렉터·클래스·`once` 옵션화 |
| `useDominantColor(src?, seed?, opts?)` | `useAlbumColors` | 앨범 한정 이름 일반화 · `crossOrigin` |
| `useAudioPlayer(tracks, opts?)` | 동명 | `volume`·`repeat`·`stop` 추가 · `formatTime`→`formatAudioTime` |
| `useSeo(props)` | `core/seo/SeoHead` | 사이트 기본값이 `SeoProvider` 로 분리 |
| `useUrlFilters(defaults, opts?)` | `useDailyFilters` | react-router 의존 제거 (History API) |

## 2. superset 화된 훅

### `useFocusMode(options?)`

```tsx
const {
  enabled, focusMode,          // 같은 값 (별칭)
  peekLeft, peekRight,
  toggle, toggleFocusMode,     // 같은 함수 (별칭)
  enable, disable, setFocusMode,
} = useFocusMode({
  peek: true,          // 기본 false — MySelf 는 켠다
  disableBelow: 900,   // 기본 0(끄지 않음) — 읽기 레이아웃은 900 권장
  leftEdge: 16, leftZone: 280,
  rightEdge: 16, rightZone: 240,
  persist: true,       // 기본 true — localStorage "ds-focus-mode"
  storageKey: "ds-focus-mode",
  shortcut: true,      // 기본 true — Cmd/Ctrl + .
});
```

> **두 기본값이 MySelf 와 다르다.** `peek` 와 `disableBelow` 는 기존 JunDS 사용처를 깨지 않기
> 위해 꺼져 있다. MySelf 의 블로그·독스에서는 반드시 켠다.

### `useScrollSpy(selectors, options?)`

```tsx
const activeId = useScrollSpy(["intro", "#install", ".usage"], {
  offset: 76,
  threshold: 0,   // > 0 이면 IntersectionObserver 를 보조로 함께 쓴다
});
```

`scrollspy:manual` 이벤트를 들으면 700ms 관찰을 멈춘다 — `TableOfContents` 가 클릭 시
이 이벤트를 쏘므로 둘을 같이 쓰면 활성 항목이 깜빡이지 않는다. 직접 스크롤을 옮길 때도
같은 이벤트를 쏘면 된다.

```tsx
window.dispatchEvent(new Event("scrollspy:manual"));
el.scrollIntoView({ behavior: "smooth" });
```

## 3. MySelf 에 유용한 나머지 훅

전체 62종은 [`COMPONENTS.md`](../COMPONENTS.md) 참조. 여기서는 MySelf 화면에 직접 쓸 것만.

| 훅 | 쓸 자리 |
|---|---|
| `useReadingProgress({ target })` | 글 상단 진행 바 |
| `useLocalStorage` / `useSessionStorage` | 북마크·읽음 표시·트리 확장 상태 |
| `useHotkeys({ "mod+k": … })` | 검색 팔레트·단축키 |
| `useMediaQuery` / `useBreakpoint` | 반응형 분기 |
| `useDebounce` / `useThrottle` | 검색 입력·스크롤 |
| `useClickOutside` | 드롭다운 닫기 |
| `useDisclosure` | 모달·시트 열림 상태 |
| `useCopyToClipboard` / `useClipboard` | 링크 복사 |
| `useImagePreload` | 다음 커버 미리 받기 |
| `useIntersectionObserver` | 요소 하나 관찰 (여럿이면 `useRevealOnScroll`) |
| `useInfiniteFeed` | 데일리·블로그 무한 스크롤 |
| `useReducedMotion` | 모션 분기 |
| `usePrefersColorScheme` | OS 다크모드 감지 (보통은 `useTheme` 로 충분) |
| `useWindowSize` / `useElementSize` | 캔버스 크기 계산 |
| `useFullscreen` | 아트 모드 전체화면 |
| `useDocumentTitle` / `useFavicon` | `useSeo` 가 이미 한다 — 단독 제어가 필요할 때만 |

## 4. 토큰

```tsx
import {
  colors, categoryColors, getCategoryColor, categoryColorVars,
  fontFamily, fontSize, fontWeight, lineHeight, letterSpacing,
  spacing, radius, shadows, breakpoints, mediaQueries,
  zIndex, opacity, borderWidth, gradients, duration, easing,
  themePresets, applyTheme, generateTheme,
} from "@junds/ui/tokens";
```

### MySelf 에서 새로 생긴 것

**`fontFamily`** — MySelf 의 `--font-*` 스택 5종.

```tsx
fontFamily.sans     // Pretendard Variable → Pretendard → Inter → Noto Sans KR → 시스템
fontFamily.serif    // Noto Serif KR → 나눔명조 → Georgia
fontFamily.display  // Playfair Display → Georgia
fontFamily.hand     // Caveat → Bradley Hand
fontFamily.mono     // ui-monospace → SF Mono → JetBrains Mono
```

CSS 변수로도 나와 있다: `var(--font-sans)` … `var(--font-mono)`.
웹폰트는 **호스트 앱이 로드한다** — MySelf 의 `index.html` 이 지금처럼 계속 담당한다.
로드되지 않아도 같은 계열의 시스템 폰트로 떨어진다.

**`categoryColors`** — [05 §1](05-daily.md) 참조.

**`fontSize["2xs"]`**(11px) 와 **`letterSpacing.wider`**(0.08em) — 메타 라벨·eyebrow 용으로
추가됐다. Tailwind 유틸리티 `text-2xs` 도 등록돼 있다.

### 타이포 스케일 대응

MySelf 의 px 기반 스케일과 JunDS 의 rem 기반 스케일 대응.

| MySelf | JunDS | px |
|---|---|---|
| `--text-2xs` | `fontSize["2xs"]` | 11 |
| `--text-xs` | `fontSize.xs` | 12 |
| `--text-sm` | `fontSize.sm` | 13 |
| `--text-base` | `fontSize.md` | 14 |
| `--text-md` (15px) | — | 없음. `md`(14) 또는 `lg`(16) 로 |
| `--text-lg` | `fontSize.lg` | 16 |
| `--text-xl` | `fontSize.xl` | 18 |
| `--text-2xl` | `fontSize["2xl"]` | 20 |
| `--text-3xl` | `fontSize["3xl"]` | 24 |
| `--text-4xl` (32px) | `fontSize["4xl"]`(30) / `["5xl"]`(36) | 없음 |

15px·32px 두 단은 JunDS 스케일에 없다. 인접한 단으로 흡수하거나, 그 자리만 리터럴을 쓴다 —
스케일을 늘리는 건 다른 사용처에도 영향이 가므로 마지막 수단이다.

### 테마 프리셋

```tsx
import { applyTheme, themePresets, generateTheme } from "@junds/ui/tokens";

applyTheme("purple");                      // 내장 프리셋
applyTheme(generateTheme("#6366f1"));      // 임의 primary 에서 파생
```

`ThemeProvider` 의 `setTheme`/`setCustomTheme` 이 이걸 감싸고 있으니 보통은 그쪽을 쓴다.

## 5. 유틸

```tsx
import {
  cn,
  applyKinsoku, applyKinsokuToHtml, stripKinsoku, remarkKinsoku, WORD_JOINER,
  Slot, Slottable, createCompound,
} from "@junds/ui/utils";
```

**`cn(...)`** — 클래스 병합. MySelf 의 `[a, b].filter(Boolean).join(" ")` 패턴을 대체한다.

**금칙처리 4종** — [06 §5](06-book.md#5-본문-렌더--금칙처리가-핵심) 참조.

| 함수 | 언제 |
|---|---|
| `applyKinsoku(text)` | 평문 문자열 |
| `applyKinsokuToHtml(html)` | 이미 HTML 인 문자열 (태그·`<code>` 제외) |
| `remarkKinsoku` | react-markdown 등 unified 파이프라인 — **가장 정확하다** |
| `stripKinsoku(text)` | 되돌리기 — 클립보드·검색 인덱스 |

## 6. 프로바이더

```tsx
import {
  ThemeProvider, useTheme,
  SeoProvider, useSeoDefaults,
  TocProvider, useToc, useRegisterHeading, TocReady,
  BrandProvider, useBrand,
  I18nProvider, useI18n, useT, defaultLocale,
} from "@junds/ui/providers";
```

**`I18nProvider`** — 컴포넌트 내장 문자열을 부분 override 한다. 기본이 한국어라 MySelf 는
대부분 그대로 쓰면 되지만, 문구를 바꾸고 싶을 때.

```tsx
<I18nProvider locale={{ ...defaultLocale, retry: "한 번 더", noResults: "찾는 게 없어요" }}>
  <App />
</I18nProvider>
```

**`BrandProvider`** — color+radius+density+font 를 묶음으로 바꾼다. MySelf 는 브랜드가
하나라 쓸 일이 없다.

## 7. MySelf 화면 ↔ JunDS 대응 요약

| MySelf | JunDS |
|---|---|
| `core/ui/Button` `IconButton` `RoundButton` | `Button` `IconButton` (`shape="circle"`) |
| `core/ui/Card` `InfoCard` | `Card` + `Card.Header/Body/Footer` |
| `core/ui/Tab` `Tabs` | `Tabs` |
| `core/ui/{Line,Bars,Post}Skeleton` | `Skeleton` (`variant`·`lines`) |
| `core/ui/Calendar` | `Calendar` (patterns) |
| `core/ui/Hero` | `HeroSection` (patterns) / `DocHero` |
| `core/ui/ErrorBoundary` | `ErrorBoundary` (primitives) |
| `core/ui/FocusModeButton` | `IconButton` + `useFocusMode` |
| `core/hooks/useFocusMode` | `useFocusMode({ peek: true, disableBelow: 900 })` |
| `core/hooks/useScrollSpy` | `useScrollSpy` |
| `core/hooks/useCodeCopy` | `useCodeCopy` |
| `core/heading/{HeadingProvider,H2,H3}` | `TocProvider` + `TocHeading` + `TocReady` |
| `core/heading/AutoTocRegistrar` | `TableOfContents observe` |
| `core/layout/Callout` · `docs/Callout` | `Callout` |
| `core/search/SearchDialog` | `CommandPalette` |
| `core/seo/SeoHead` | `SeoProvider` + `SeoHead` / `useSeo` |
| `core/seo/SeoResolver` | **MySelf 에 남는다** |
| `app/providers/ToastProvider` | `DsToastProvider` + `useDsToast` |
| `blog/BlogToc` | `TableOfContents` |
| `blog/BlogMeta` | `ReadingTime` + `Tag` 조립 |
| `blog/BlogRelated` | `RelatedPosts` |
| `blog/SelectDropdown` | `Select` |
| `docs/LeftNav` | `TreeNav` (+ 그룹 규칙은 MySelf) |
| `docs/DocHeader` | `DocHero` |
| `docs/DocLinks` | `DocLinks` |
| `docs/DocsMeta` | `Breadcrumb` |
| `docs/DocsPager` | `DocPager` |
| `docs/ScreenshotGrid` | `ScreenshotGrid` |
| `docs/Toc` | `TableOfContents` |
| `docs/ImageLightbox` | `GlobalImageLightbox` |
| `daily/CoverImage` | `ImageWithFallback retry revive` |
| `daily/GlobeWireframe` | `GlobeWireframe` |
| `daily/Starfield` | `Starfield` (patterns) |
| `daily/DailyStats` | `StatsGrid` + `BarList` |
| `daily/SpoilerBlock` | `SpoilerBlock` |
| `daily/useDailyFilters` | `useUrlFilters` (+ 집계는 MySelf) |
| `book/BookCard` | `BookCard` / `BookShelf` |
| `book/ChapterList` | `ChapterList` |
| `book/Reader` | `BookReader` (patterns) |
| `book/Markdown` | `MarkdownViewer kinsoku` 또는 `remarkKinsoku` |
| `portfolio/ProjectCard` | `ProjectCard variant="row"` |
| `portfolio/CaseStudyCard` | `ProjectCard variant="feature"` |
| `portfolio/BentoGrid` | `BentoGrid` (격자만) |
| `music/AlbumArt` | `AlbumArt` |
| `music/Waveform` | `Waveform` |
| `music/NowPlayingBar` | `NowPlayingBar` |
| `music/NowPlayingFull` | `NowPlayingFull` |
| `music/Lyric` | `Lyrics` |
| `music/DetailSheet` | `Modal` |
| `music/OriginalsGate` | **MySelf 에 남는다** (껍데기만 `Card`+`FormField`) |
| `hooks/useAudioPlayer` | `useAudioPlayer` |
| `hooks/useAlbumColors` | `useDominantColor` |
| `hooks/useRevealOnScroll` | `useRevealOnScroll` |
| `hooks/useJsonLd` | `useJsonLd` |
| `styles/tokens.css` 폰트 | `fontFamily` + `--font-*` |
| `styles/tokens.css` 카테고리 | `categoryColors` + `--cat-*` |

---

[← 07 포트폴리오·음악](07-portfolio-music.md) · [목차로 →](../USAGE-MYSELF.md)
