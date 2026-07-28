# 책 도메인 — Reading & Annotation Components

- **Slug:** `book-domain`
- **Status:** active
- **Owner:** goodjunha@gmail.com
- **Last updated:** 2026-05-04

## Goal

전자책/오디오북/긴 글 읽기 환경에 필요한 시각·인터랙션 단위를 한 묶음으로
제공한다. 사용자가 "표지 → 목차 → 본문 → 진행률 → 메모 → 통계"의 흐름을
한 라이브러리 안에서 조립할 수 있어야 한다. 별도 책 도메인 라이브러리(예:
react-reader)를 가져오지 않고도 BookReader 패턴 한 줄로 표준 리더 화면을 띄운다.

## Scope

**In scope**

- 표지 시각: `BookCover` (이미지/그라디언트 폴백, tilt/spine 효과)
- 책장: `BookShelf` (균등 그리드 + wood/minimal/card 변형)
- 평점: `BookRating` (별 + 분포 막대)
- 진행률: `ReadingProgress` (페이지/챕터/남은시간), `ReadingGoal` (원형)
- 누적 통계: `ReadingStats` (오늘/스트릭/완독/시간)
- 목차: `ChapterList` (트리 + 잠금 + 활성/완독 상태)
- 인용 메모: `AnnotationNote` (5색 하이라이트)
- 북마크: `BookmarkButton` (primitive)
- 화면 패턴: `BookReader` (목차 + 본문 + 진행률 + 북마크 통합)
- 훅: `useReadingProgress` (스크롤 % + 활성 헤딩 추적)

**Out of scope**

- 실제 EPUB/PDF 파서 — 사용자 측에서 본문을 ReactNode로 주입한다.
- 음성 합성/오디오북 재생 — 별도 도메인.
- 결제/구독 처리 — `pricing-page` 레시피 사용.
- 본문 편집 — 읽기 전용. 메모는 외부 저장에 위임.

## User stories / acceptance criteria

- [x] **As a 독자** I can 책 목차에서 챕터를 클릭해 본문이 바뀌는 동안 진행률
      바가 자동으로 갱신된다.
- [x] **As a 독자** I can 본문을 스크롤할 때 활성 챕터(또는 헤딩)가 사이드바에
      자동 강조된다 (`useReadingProgress.activeHeadingId`).
- [x] **As a 독자** I can 메모를 색상별로 분류해 한 카드씩 검토하고 삭제할 수
      있다.
- [x] **As a 작가/스튜디오** I can 책 표지를 이미지 없이 그라디언트 + 제목만
      으로도 보여줄 수 있다 (`BookCover hue="from-X to-Y"`).
- [x] **As a 사용자** I can 잠금된 챕터(구독/유료)에 대해 클릭이 비활성화되고
      자물쇠 아이콘이 보인다.
- [x] **As a 독자** I can 북마크 버튼을 키보드로 토글할 수 있고 스크린리더가
      현재 상태(`aria-pressed`)를 읽어준다.

## Design / behavior notes

- **진행률 0% / 100% 경계**: `totalPages=0` 입력 시 0% 표시, NaN 방지.
- **빈 챕터**: `ChapterList chapters={[]}` 또는 `BookReader chapters={[]}`
  → BookReader는 `null` 반환 + dev 경고. 빈 목차로 트리만 보여주는 경우는
  `ChapterList`만 단독 사용.
- **`BookCover effect="tilt"`**: hover 시 -2deg 회전 + -1px translate. 모션
  감속 사용자(`motion-reduce`) 대응은 후속 작업(현재는 한 번만 트리거되는
  hover라 영향 미미).
- **`AnnotationNote color`**: 5색 모두 라이트/다크에서 `bg-X-50` + 다크
  fallback (CSS 변수 `--color-X-50` 미사용, 의도적). 신규 색을 추가하려면
  `colorMap`을 확장해야 하며 임의 색은 받지 않는다 — 라이브러리 톤 일관성을
  위해.
- **i18n**: 노출 문자열("닫기", "북마크 추가", "목차" 등)은 `useT()`/
  `aria*` props로 일부 변환됨, 본문은 호출자가 ReactNode로 주입하므로 라이브
  러리 책임 외.
- **a11y**:
  - `ReadingGoal`/`ReadingProgress` 모두 `role="progressbar"` + valuemin/max/now
  - `ChapterList` `<nav aria-label="목차">` + `aria-current="true"` 활성 챕터
  - `BookmarkButton` `aria-pressed` 토글, label은 상태별 자동
- **z-index**: `BookReader` 헤더 `z-30` (Modal `z-50`보다 낮아 모달이 헤더를
  덮음). `ScrollProgress` `z-50` (헤더 위에 떠야 함).

## Touched files (for agents)

- `ds/composites/BookCover/BookCover.tsx`
- `ds/composites/BookShelf/BookShelf.tsx`
- `ds/composites/BookRating/BookRating.tsx`
- `ds/composites/ReadingProgress/ReadingProgress.tsx`
- `ds/composites/ReadingGoal/ReadingGoal.tsx`
- `ds/composites/ReadingStats/ReadingStats.tsx`
- `ds/composites/ChapterList/ChapterList.tsx`
- `ds/composites/AnnotationNote/AnnotationNote.tsx`
- `ds/primitives/BookmarkButton/BookmarkButton.tsx`
- `ds/patterns/BookReader/BookReader.tsx`
- `ds/hooks/useReadingProgress.ts`
- `.ai/recipes/book-reader-page.md`

## Open questions

- **본문 페이지 분할**: 현재 `currentPage`/`totalPages`는 호출자가 직접 계산해
  넘겨준다. 라이브러리가 본문을 받아 자동 페이징 하는 변형(BookReader.Auto)을
  제공할지 검토 필요 — DOM 측정 비용 vs 사용자 코드 단순화 트레이드오프.
- **챕터 깊이 한도**: `ChapterList`는 무제한 재귀. 깊이 4단 이상 시 들여쓰기
  64px+로 모바일에서 깨짐. 한도 prop을 추가할지 결정 필요.
- **메모 동기화**: `AnnotationNote`는 표시 전용. 외부 저장(서버/IndexedDB)
  연동 표준 패턴을 recipe로 추가할지 검토.
- **읽기 통계 시각화**: `ReadingStats`는 4종 카드 단순 표시. 주간/월간 추세
  차트(`AreaChart` 활용)는 별도 패턴(`ReadingDashboard`)으로 분리할지 결정.

## Changelog

- 2026-05-04 — created.
