# Changelog

> 모든 변경 사항은 [Keep a Changelog](https://keepachangelog.com/) 형식을 따른다.
> 버전 번호는 [SemVer](https://semver.org/)를 따른다.

## [Unreleased]

## [2.5.0] — 2026-05-06

프레임워크 수준의 폭과 깊이로 확장. 4개 축(테마/데이터/모션/폼) + 6개 신규 패턴
+ 9개 신규 훅 + 9개 신규 primitive/composite + 4개 로케일 + CLI 도구.

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

| 검사 | 이전 (2.4.0) | 현재 (2.5.0) |
|------|------|------|
| 컴포넌트 수 | 233 | **279+** |
| props 수 | 1371 | **1608+** |
| 테스트 | 628 | **673+** |
| a11y critical | 20 | **0** |
| a11y serious | 2 | **0** |
| 요구사항 문서 | 9 | **16** |
| 레시피 | 9 | **26** |
| 로케일 | 2 (ko/en) | **4 (ko/en/ja/zh)** |
| 브랜드 프리셋 | 1 | **5** |
| CLI 명령 | 0 | **4** |

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
