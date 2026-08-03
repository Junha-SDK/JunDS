# 레이아웃 자유도 — 컨테이너 기준 접힘 + 폭 가변 관찰

- **Slug:** `layout-freedom`
- **Status:** shipped
- **Owner:** 박준하 (pjh02@hygino.co.kr)
- **Last updated:** 2026-08-03

## Goal

레이아웃을 "보는" 자유도와 "쓰는" 자유도를 함께 올린다.

1. **쓰는 자유도** — React ds 의 반응형 prop 은 뷰포트 미디어쿼리 기반이라
   (`ds/core/styleProps.ts` 의 `generateResponsiveCSS`), 사이드바·카드 안에
   중첩된 레이아웃은 자기 자리의 폭에 반응할 수 없었다. layout-map 의
   "좁으면 세로로 접기" 의도(웹 CE `jd-switcher` / iOS `JdSwitcher`)에
   React 대응물이 없던 구멍을 `Switcher` 로 메운다.
2. **보는 자유도** — 쇼케이스 데모는 고정 폭이라 접힘을 보려면 브라우저
   창 자체를 줄여야 했다. `ResizableFrame` 과 Layout Lab 페이지로,
   프레임 폭을 드래그·프리셋으로 바꿔가며 레이아웃의 반응을 그 자리에서
   관찰할 수 있게 한다.

## Scope

- **In scope**
  - `ds/layout/Switcher` — flex-basis 계산만으로 컨테이너 폭 기준 가로↔세로
    접힘 (`threshold`: 브레이크포인트 토큰 또는 px, `limit`: 줄당 최대 아이템 수)
  - `app/design-system/_components/ResizableFrame` — 드래그 핸들(키보드 ←/→
    지원) + 브레이크포인트 프리셋 + 현재 px/브레이크포인트 표시
  - `app/design-system/framework/layout-lab` — 의도별(접기·줄바꿈·격자·양끝
    밀기·방향 가변) 데모를 ResizableFrame/Playground 로 묶은 실험실 페이지
  - 검색 사전 등록 (Framework 섹션 `Layout Lab`)
- **Out of scope**
  - `Responsive<>` prop 의 컨테이너 쿼리 전환 (뷰포트 미디어쿼리 유지 —
    전환 시 기존 사용처 전부에 영향)
  - iframe 기반 뷰포트 시뮬레이터 (미디어쿼리 기반 prop 을 프레임 안에서
    흉내내는 것은 이번 범위가 아니다)

## User stories / acceptance criteria

- [x] `Switcher` 는 컨테이너가 `threshold` 보다 좁아지면 세로로 접힌다 —
      미디어쿼리·JS 측정 없이 CSS 계산만으로.
- [x] `threshold` 는 브레이크포인트 토큰(`"sm" | "md" | …`)과 px 숫자를 모두
      받는다. 기본값은 `"md"`.
- [x] `limit` 을 넘는 아이템 수면 폭과 무관하게 전부 세로로 쌓인다.
- [x] `ResizableFrame` 은 드래그·프리셋·키보드(←/→ 20px)로 폭을 바꿀 수
      있고, 현재 px 와 브레이크포인트를 표시한다.
- [x] Layout Lab 에서 Switcher / Wrap / SimpleGrid(minChildWidth) /
      HStack+Spacer / Stack 을 폭을 바꿔가며 관찰할 수 있다.
- [x] `Switcher` 는 `ds/layout` barrel 과 루트 barrel 로 export 되고 테스트가 있다.

## Touched files

- `ds/layout/Switcher.tsx`
- `ds/layout/index.ts`
- `ds/__tests__/layout/Switcher.test.tsx`
- `app/design-system/_components/ResizableFrame.tsx`
- `app/design-system/framework/layout-lab/page.tsx`
- `app/design-system/_data/search-dictionary.ts`

## Design / behavior notes

- **Switcher 의 접힘 공식.** 각 아이템의 `flex-basis: calc((threshold - 100%) * 999)`.
  컨테이너가 threshold 보다 좁으면 값이 양수로 폭을 넘어 한 줄에 하나씩,
  넓으면 음수가 되어 `flex-grow: 1` 로 균등 분배된다 (Every Layout 의 기법).
  뷰포트가 아니라 **자기가 놓인 자리**의 폭을 보므로 중첩에 안전하다 —
  layout-map 의 "좁으면 세로로 접기" 노트와 같은 계약이다.
- **ResizableFrame 의 한계.** `Responsive<>` prop (`p={{ base: 4, md: 6 }}`)은
  뷰포트 미디어쿼리로 동작하므로 프레임을 줄여도 반응하지 않는다. Layout Lab
  은 컨테이너 폭 기준으로 동작하는 레이아웃만 프레임 데모로 싣는다.

## Open questions

- `Responsive<>` prop 을 컨테이너 쿼리(`@container`)로 옮길지 — 옮기면
  ResizableFrame 안에서도 반응하지만 기존 사용처 전체의 동작이 바뀐다.
- iframe 기반 뷰포트 시뮬레이터를 Layout Lab 에 추가할지 (미디어쿼리 prop 도
  프레임 안에서 관찰 가능해진다).

## Changelog

- 2026-08-03 — 최초 작성. `Switcher` + `ResizableFrame` + Layout Lab 출고.
