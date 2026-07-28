# 사진 도메인 — Photo Display & Edit Components

- **Slug:** `photo-domain`
- **Status:** active
- **Owner:** goodjunha@gmail.com
- **Last updated:** 2026-05-04

## Goal

이미지 갤러리/포트폴리오/SNS 미디어 첨부에 필요한 표시·인터랙션·편집 단위를
모은다. 외부 lightbox 라이브러리(swiper/lightgallery 등) 의존 없이 JunDS
하나로 "업로드 → 그리드 → 라이트박스 → 비교/줌 → EXIF" 전체 흐름을 조립한다.

## Scope

**In scope**

- 카드/그리드: `PhotoCard`, `PhotoGrid` (uniform/masonry/mosaic)
- 풀스크린 뷰: `PhotoLightbox` (키보드 화살표/Esc), `PhotoCarousel`
- 비교: `ImageCompare` (before/after 슬라이더)
- 확대: `ImageZoom` (휠/더블클릭/드래그)
- 메타: `ExifPanel`
- 효과: `PhotoFilters` (7종 CSS filter 프리셋)
- 업로드: `PhotoUploader` (드래그앤드롭 + 미리보기)
- 안전 표시: `ImageWithFallback` (스켈레톤 + 에러 폴백)
- 화면 패턴: `PhotoAlbum` (필터 + 그리드 + 라이트박스 자동 연결)
- 훅: `useImagePreload` (다음 사진 사전 로드)

**Out of scope**

- 서버 사이드 이미지 처리/리사이즈 — `next/image` 또는 사용자 CDN 위임.
- 영상 재생 — 별도 도메인 (이후 `VideoCard` 컴포넌트로 분리).
- 색 보정/크롭 등 실 편집 — `PhotoFilters`는 프리뷰 전용, 실 편집은 호출자
  측에서 Canvas 또는 서버 처리.
- AI 자동 태깅 — 호출자 측 모델/API 책임.

## User stories / acceptance criteria

- [x] **As a 사용자** I can 그리드 사진을 클릭하면 풀스크린 라이트박스로 열려
      좌우 화살표/Esc로 탐색할 수 있다 (`PhotoAlbum` → `PhotoLightbox`).
- [x] **As a 작가** I can `ImageCompare`의 분할 슬라이더를 키보드 좌우/Home/End
      로 조작할 수 있다 (10단계 점프).
- [x] **As a 사용자** I can `PhotoUploader`에 5장 이상 드롭하면 `maxCount`까지만
      수용하고 초과 메시지를 본다.
- [x] **As a 작가** I can `ImageZoom`을 휠로 줌 인/아웃, 드래그로 패닝, 더블클릭
      으로 즉시 1x 복귀할 수 있다.
- [x] **As a 사용자** I can `ImageWithFallback`이 로딩 중에는 스켈레톤을 보여
      주고 실패 시 fallback 이미지 또는 "🖼 이미지 없음" 텍스트로 깨끗하게 폴백한다.
- [x] **As a 사용자** I can `useImagePreload`로 라이트박스 다음 사진을 즉시 보여
      주고 깜빡임 없이 전환한다.

## Design / behavior notes

- **`PhotoUploader` 메모리 누수 방지**: `URL.createObjectURL`로 만든 URL은
  컴포넌트 언마운트 시 `URL.revokeObjectURL`로 해제 (`useEffect` cleanup).
- **`PhotoLightbox`는 닫혀있을 때 `null` 반환** — Portal/Modal과 충돌 없음.
- **`PhotoCarousel.index` 클램프**: `photos`가 줄어 인덱스가 범위 밖이면
  `useEffect`로 0으로 리셋 (이번 라운드에서 추가).
- **`PhotoGrid layout="mosaic"`**: 첫 항목이 2x2를 차지. 나머지는 자동
  배치. 항목 수 < 5면 빈 공간 발생 — 호출자가 채워야 함.
- **`PhotoFilters`는 정적 프리셋**: 사용자 정의 필터를 추가하려면
  `defaultPhotoFilters` 배열을 확장해 prop으로 전달.
- **a11y**:
  - `PhotoLightbox`: `role="dialog" aria-modal="true"`, Esc/화살표 키 핸들러
    `useEffect`로 등록 (SSR 안전)
  - `PhotoCarousel`: `aria-roledescription="carousel"`, 인디케이터 버튼에
    `aria-current`
  - `ImageCompare` 슬라이더: `role="slider"`, 분할% `aria-valuenow`
  - `ImageZoom`: `<figure>` 사용, 인터랙티브 컨트롤 중첩 회피 (이번 라운드 수정)
  - `PhotoUploader`: dropzone은 진짜 `<button>`, 숨김 input은 `aria-label="파일
선택"` + `tabIndex={-1}` (이번 라운드 수정)
- **z-index**: `PhotoLightbox` `z-50` (Modal과 동일). 동시 표시 가정 안 함 —
  Modal 안에 lightbox를 띄우면 위 z 가 wins.

## Touched files (for agents)

- `ds/composites/PhotoCard/PhotoCard.tsx`
- `ds/composites/PhotoGrid/PhotoGrid.tsx`
- `ds/composites/PhotoLightbox/PhotoLightbox.tsx`
- `ds/composites/PhotoCarousel/PhotoCarousel.tsx`
- `ds/composites/ImageCompare/ImageCompare.tsx`
- `ds/composites/ImageZoom/ImageZoom.tsx`
- `ds/composites/ExifPanel/ExifPanel.tsx`
- `ds/composites/PhotoFilters/PhotoFilters.tsx`
- `ds/composites/PhotoUploader/PhotoUploader.tsx`
- `ds/composites/ImageWithFallback/ImageWithFallback.tsx`
- `ds/patterns/PhotoAlbum/PhotoAlbum.tsx`
- `ds/hooks/useImagePreload.ts`
- `.ai/recipes/photo-album-page.md`

## Open questions

- **swipe 제스처**: `PhotoCarousel`/`PhotoLightbox`는 키보드/마우스만 지원.
  모바일 swipe는 별도 hook(`useSwipe`)으로 추출할지 인라인할지 결정 필요.
- **HEIC/AVIF 미리보기**: `PhotoUploader`는 브라우저가 지원하는 포맷만
  미리보기. HEIC 변환은 별도 라이브러리 필요 — 라이브러리 책임 밖으로 둘지
  recipe로 가이드할지.
- **이미지 lazy-load**: 현재 `PhotoCard`는 `loading="lazy"` 한 줄.
  IntersectionObserver 기반 사용자 정의 lazy-load는 미구현 — `next/image` 권장.

## Changelog

- 2026-05-04 — created.
