# MySelf → JunDS 흡수 (디자인 시스템 통합)

- **Slug:** `myself-migration`
- **Status:** active
- **Owner:** 박준하 (pjh02@hygino.co.kr)
- **Last updated:** 2026-07-27

## Goal

개인 사이트 `MySelf`(junome.info)는 자체 `core/ui`·`core/hooks`·`styles/tokens.css` 로
독립적인 작은 디자인 시스템을 갖고 있다. 앞으로 MySelf 를 포함한 모든 화면을 JunDS 위에
다시 세우는 것이 목표이므로, **MySelf 가 가진 모든 디자인 시스템 자산이 JunDS 안에
존재해야 하고**, 겹치는 것은 JunDS 쪽이 항상 상위 집합(superset)이어야 한다.

"MySelf 를 통째로 JunDS 로 갈아 끼워도 기능·표현이 하나도 후퇴하지 않는 상태"가 완료 기준이다.

## Scope

- **In scope**
  - MySelf 에만 있던 훅·컴포넌트·토큰을 JunDS 로 이식
  - 양쪽에 다 있는 것 중 MySelf 가 더 나은 부분을 JunDS 에 흡수 (JunDS 를 superset 으로)
  - 이식물의 사이트 종속성 제거 (junome 고정값 → prop / provider 로 주입)
- **Out of scope**
  - MySelf 쪽 코드를 실제로 JunDS 로 교체하는 작업 (이후 단계)
  - MySelf 의 콘텐츠 파이프라인 (md2tsx, 레지스트리, 프리렌더 스크립트)
  - 라우트 → 제목 매핑 같은 사이트 고유 로직 (`SeoResolver`, `LeftNav` 의 문서 그룹 규칙)

## User stories / acceptance criteria

- [x] MySelf 에만 있던 훅·컴포넌트·토큰이 모두 JunDS 에 대응물을 갖는다.
- [x] 겹치는 항목은 JunDS 판이 MySelf 판의 기능을 모두 포함한다 (superset).
- [x] 이식물 어디에도 junome 도메인·OG 이미지·문서 레지스트리 같은 사이트 고유 값이 남아 있지 않다.
- [x] superset 화 과정에서 기존 JunDS 사용처의 기본 동작이 바뀌지 않는다 (새 동작은 전부 opt-in).
- [x] 새 컴포넌트마다 쇼케이스 페이지와 테스트가 있다.
- [ ] MySelf 의 각 화면을 실제로 JunDS 컴포넌트로 교체한다. *(다음 단계)*

## 이식 결과

### 새로 추가 (MySelf 에만 있던 것)

| MySelf | JunDS | 비고 |
| --- | --- | --- |
| `core/hooks/useCodeCopy` | `ds/hooks/useCodeCopy` | 코드 블록 셀렉터·라벨·클래스를 옵션화. 버튼 CSS 는 `ds/styles/tokens.css` 에 포함 |
| `features/portfolio/hooks/useJsonLd` | `ds/hooks/useJsonLd` | 같은 key 재주입 시 기존 스크립트 교체 |
| `features/portfolio/hooks/useRevealOnScroll` | `ds/hooks/useRevealOnScroll` | 셀렉터·클래스·`once` 옵션화, 기본 모션 CSS 동봉 |
| `features/portfolio/hooks/useAlbumColors` | `ds/hooks/useDominantColor` | 앨범 한정 이름을 일반화, `crossOrigin` 옵션 추가 |
| `features/portfolio/hooks/useAudioPlayer` | `ds/hooks/useAudioPlayer` | `volume` / `repeat` / `stop` 추가. `formatTime` → `formatAudioTime` |
| `core/seo/SeoHead` | `ds/composites/SeoHead` + `ds/hooks/useSeo` + `ds/providers/SeoProvider` | junome 고정 기본값을 `SeoProvider` 로 분리 |
| `core/heading/{HeadingProvider,H2,H3}` | `ds/providers/TocProvider` + `ds/composites/TableOfContents/TocHeading` | `HeadingsReady` → `TocReady` |
| `music/Waveform` | `ds/composites/Waveform` | 실제 진폭을 넘길 `peaks` 추가 |
| `music/AlbumArt` | `ds/composites/AlbumArt` | `size` / `radius` 추가 |
| `music/NowPlayingBar` | `ds/composites/NowPlayingBar` | `fixed` / `actions` 추가 |
| `docs/DocsPager` | `ds/composites/DocPager` | 레지스트리 의존 제거, `renderLink` 로 라우터 주입 |
| `portfolio/{ProjectCard,CaseStudyCard}` | `ds/composites/ProjectCard` | 두 개를 `variant="row" \| "feature"` 로 통합 |
| `docs/ScreenshotGrid` | `ds/composites/ScreenshotGrid` | `columns` / `onSelect` 추가 |
| `docs/ImageLightbox` (전역 위임형) | `ds/composites/ImageLightbox/GlobalImageLightbox` | 기존 `ImageLightbox`(개별 래핑형)와 공존 |
| `book/Markdown` 의 금칙처리 | `ds/utils/kinsoku` | `applyKinsoku` / `applyKinsokuToHtml` / `remarkKinsoku` |
| `styles/tokens.css` 폰트 스택 | `ds/tokens/fontFamily` + CSS 변수 | sans / serif / display / hand / mono |
| `styles/tokens.css` 카테고리 액센트 | `ds/tokens/categoryColors` + CSS 변수 | `getCategoryColor` / `categoryColorVars` 헬퍼 포함 |

### JunDS 를 superset 으로 끌어올린 것

| 컴포넌트 | 흡수한 MySelf 의 강점 |
| --- | --- |
| `useFocusMode` | 좌우 엣지 peek(`peek`), 좁은 화면 자동 비활성(`disableBelow`), `focusMode`/`toggleFocusMode` 별칭. 기존 동작을 깨지 않도록 두 기능 모두 기본 off |
| `TableOfContents` | MutationObserver 기반 지연 콘텐츠 재수집(`observe`), 제외 셀렉터(`exclude`), 중복 제목 id 충돌 방지, 클릭 시 `scrollspy:manual` 발신, `scrollOffset`, `emptyFallback` |
| `ImageWithFallback` | 지수 백오프 재시도(`retry`), 폴백 후 백그라운드 소생(`revive`) — online/visibilitychange 즉시 재시도 포함. 커스텀 폴백 노드(`fallback`) |
| `Callout` | `success` variant, `warn` → `warning` 별칭 |
| `SpoilerBlock` | 안내 문구(`notice`), `onReveal` 콜백, `youth` → `caution` 별칭 |
| `TreeNav` | 호버 프리페치(`onItemPrefetch`), 확장 상태 제어(`expandedKeys`/`onExpandedChange`), 활성 항목 조상 자동 펼침(`autoExpandActive`), 하위 개수 자동 표시(`showCount`), 전체 펼치기/접기 |
| `Toast` | `top-left`/`bottom-left`, `title`, `onClose`, `show()`/`close(id)`/`clear()`, 전체화면 대응 포털 루트 |
| `MarkdownViewer` | 금칙처리(`kinsoku`), 행갈이 보존(`breaks`) |

### 이미 JunDS 가 우위라 조치하지 않은 것

`Button` / `Card` / `Tabs` / `IconButton` / `Skeleton` / `ErrorBoundary` / `Grid` /
`Calendar` / `Hero` / `Starfield` / `Globe` / `ChapterList` / `BookCard` / `Select`
(vs `SelectDropdown`) / `CommandPalette` (vs `SearchDialog`) / `useScrollSpy` —
MySelf 쪽이 더 얇거나 JunDS 판이 기능적으로 포함한다.

## Design / behavior notes

- **사이트 종속성 제거가 원칙.** junome 도메인·OG 이미지·문서 레지스트리처럼 MySelf 고유의
  값은 이식 대상에서 빼고, prop 이나 provider 로 주입받게 바꿨다. 그래서 `SeoResolver`
  (라우트→제목 매핑)와 `LeftNav` 의 문서 그룹 정렬 규칙은 MySelf 에 남는다.
- **라우터 비종속.** `DocPager` / `ProjectCard` 는 `renderLink` 로 Next.js `<Link>` 나
  react-router `<Link>` 를 끼울 수 있다. 기본값은 평범한 `<a>`.
- **하위 호환 우선.** superset 화하면서 추가한 동작(엣지 peek, 좁은 화면 비활성, 재시도,
  소생)은 모두 기본 off 다. 기존 JunDS 사용처의 동작이 조용히 바뀌지 않게 하기 위함이다.
- **`MarkdownViewer` 의 HTML 이스케이프는 기본 동작이 바뀐 유일한 항목이다.**
  이전에는 원문의 raw HTML 이 그대로 `dangerouslySetInnerHTML` 로 흘러들어가 스크립트가
  실행될 수 있었다. 이제 기본적으로 이스케이프하며, 예전 동작이 필요하면 `allowHtml` 를
  명시해야 한다.
- **금칙처리는 HTML 이 된 뒤에** 태그·`<code>` 바깥 텍스트에만 적용한다. 원문에 먼저 걸면
  삽입한 word joiner 가 `](` 사이에 끼어 링크 문법이 깨진다.
- MySelf 의 SSG 가드레일(프리렌더 결정성)을 고려해 `Waveform` / `AlbumArt` 의 생성 로직은
  `Math.random()` 없이 시드 해시 기반으로 결정적이다.

## Touched files (for agents)

토큰 / 유틸:

- `ds/tokens/fontFamily.ts`
- `ds/tokens/categoryColors.ts`
- `ds/styles/tokens.css`
- `ds/utils/kinsoku.ts`

훅 / 프로바이더:

- `ds/hooks/useCodeCopy.ts`
- `ds/hooks/useJsonLd.ts`
- `ds/hooks/useRevealOnScroll.ts`
- `ds/hooks/useDominantColor.ts`
- `ds/hooks/useAudioPlayer.ts`
- `ds/hooks/useSeo.ts`
- `ds/hooks/useFocusMode.ts`
- `ds/providers/SeoProvider.tsx`
- `ds/providers/TocProvider.tsx`

신규 컴포짓:

- `ds/composites/Waveform/Waveform.tsx`
- `ds/composites/AlbumArt/AlbumArt.tsx`
- `ds/composites/NowPlayingBar/NowPlayingBar.tsx`
- `ds/composites/DocPager/DocPager.tsx`
- `ds/composites/ProjectCard/ProjectCard.tsx`
- `ds/composites/ScreenshotGrid/ScreenshotGrid.tsx`
- `ds/composites/SeoHead/SeoHead.tsx`
- `ds/composites/ImageLightbox/GlobalImageLightbox.tsx`
- `ds/composites/TableOfContents/TocHeading.tsx`

superset 화한 기존 컴포짓:

- `ds/composites/TableOfContents/TableOfContents.tsx`
- `ds/composites/ImageWithFallback/ImageWithFallback.tsx`
- `ds/composites/Callout/Callout.tsx`
- `ds/composites/SpoilerBlock/SpoilerBlock.tsx`
- `ds/composites/TreeNav/TreeNav.tsx`
- `ds/composites/Toast/Toast.tsx`
- `ds/composites/MarkdownViewer/MarkdownViewer.tsx`

쇼케이스:

- `app/design-system/composites/waveform/page.tsx`
- `app/design-system/composites/album-art/page.tsx`
- `app/design-system/composites/now-playing-bar/page.tsx`
- `app/design-system/composites/doc-pager/page.tsx`
- `app/design-system/composites/project-card/page.tsx`
- `app/design-system/composites/screenshot-grid/page.tsx`
- `app/design-system/composites/seo-head/page.tsx`

테스트:

- `ds/__tests__/composites/Waveform.test.tsx`
- `ds/__tests__/composites/AlbumArt.test.tsx`
- `ds/__tests__/composites/DocPager.test.tsx`
- `ds/__tests__/composites/ProjectCard.test.tsx`
- `ds/__tests__/composites/ScreenshotGrid.test.tsx`
- `ds/__tests__/hooks/useJsonLd.test.ts`
- `ds/__tests__/hooks/useFocusMode.test.ts`
- `ds/__tests__/providers/TocProvider.test.tsx`
- `ds/__tests__/utils/kinsoku.test.ts`

## Open questions

- MySelf 의 `parseSpoilerSegments`(`<스포일러>…</스포일러>` 마크다운 토큰 파서)는 콘텐츠
  저작 규약이라 판단해 이식하지 않았다. JunDS 가 콘텐츠 문법까지 규정할지 결정 필요.
- `MarkdownViewer` 는 의존성 없는 정규식 렌더러다. MySelf 본문은 react-markdown +
  remark-gfm 을 쓰므로, 실제 교체 시에는 `remarkKinsoku` 만 빌려 쓰고 렌더러는 MySelf 쪽을
  유지할지, JunDS 렌더러를 본격 파서로 키울지 정해야 한다.
- MySelf 의 `DailyArchive` / `DocsArtIndex` / `BentoGrid` / `BookDetail` 등 500줄 이상의
  화면 단위 컴포넌트는 데이터 모델 종속이 커서 이번 범위에서 제외했다. 패턴으로 일반화할지
  화면으로 남길지 판단 필요.

## Changelog

- 2026-07-27 — 1차 이식 완료 (신규 13종 + 기존 8종 superset 화 + 토큰 2종).
