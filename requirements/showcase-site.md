# Showcase Site (`app/design-system`)

- **Slug:** `showcase-site`
- **Status:** shipped
- **Owner:** Junha (goodjunha@gmail.com)
- **Last updated:** 2026-04-29

## Goal

`app/design-system/*` 는 JunDS 라이브러리를 검색·탐색·시연하는 Next.js
쇼케이스이다. 디자이너·엔지니어·LLM 에이전트 모두에게 "지금 라이브러리에 어떤
컴포넌트가 있고, 각 컴포넌트가 어떤 props 와 시각적 결과를 갖는지" 한 화면에서
보여주는 것이 목표다. 라이브러리가 커져도 (현재 41 + 119 + 26 = 186개 컴포넌트)
사이드바·검색 팔레트·라이브 데모로 빠르게 도달할 수 있어야 한다.

## Scope

- In scope:
  - 카테고리별 인덱스 페이지 (`primitives/`, `composites/`, `patterns/`,
    `tokens/`, `layout/`, `framework/`, `lab/`, `advanced/`, `security/`,
    `showcase/`).
  - 컴포넌트별 상세 페이지 (`<kind>/<slug>/page.tsx`).
  - 좌측 사이드바 + 테마 선택기 + 다크모드 토글 + 브레이크포인트 인디케이터.
  - 커맨드 팔레트 (Cmd/Ctrl-K) 검색.
  - PropsTable / Playground / Preview 등 공용 시연 컴포넌트.
  - 라이브 데모와 검색 사전 데이터.
- Out of scope:
  - 라이브러리 자체의 컴포넌트 동작 (각 컴포넌트의 requirement 또는
    `design-system-library.md`).
  - 외부에 배포할 마케팅 사이트.
  - 인증/결제 화면.

## User stories / acceptance criteria

- [x] As a 신규 사용자, I can 사이드바에서 카테고리를 펼쳐 컴포넌트 한 개를
      클릭, so that 즉시 미리보기·props 표·코드 스니펫을 볼 수 있다.
- [x] As a 사용자, I can Cmd/Ctrl-K 로 명령 팔레트를 열어 부분 일치 검색,
      so that 한 컴포넌트로 즉시 점프할 수 있다.
- [x] As a 사용자, I can 사이드바 상단의 테마 셀렉터로 프리셋을 바꾸고,
      다크모드 토글로 라이트/다크/시스템을 전환, so that 모든 페이지가 같은
      테마 컨텍스트에서 렌더된다.
- [x] As a 라이브러리 메인테이너, I can 새 컴포넌트 `Foo` 를 추가할 때
      `app/design-system/<kind>/foo/page.tsx` 한 파일과 `_data/search-dictionary.ts`
      한 줄 추가만으로 사이트에 노출된다.
- [x] As a 사용자, I can 라이브 데모에서 props 를 조작, so that 컨트롤 변경이
      그 자리 미리보기에 반영된다.
- [x] As a 사용자, 페이지 전환 시 테마 선택이 `localStorage` 로 유지된다.

## Design / behavior notes

- **레이아웃.** `app/design-system/layout.tsx` 가 좌측 사이드바 (`w-60`,
  `bg-[#1a1726]`) + 우측 메인 영역으로 구성되며, `FrameworkWrapper` 로 전체를
  감싸 라이선스/테마/I18n 컨텍스트를 주입한다.
- **사이드바.** `DsSidebar` 가 `_data/search-dictionary.ts` 를 읽어 카테고리별로
  렌더한다. 활성 라우트는 `usePathname()` 기준으로 강조.
- **검색.** `DsSearch` 는 사이드바 인라인 검색, `DsCommandPalette` 는 키보드
  단축키 (Cmd/Ctrl-K) 로 토글되는 모달. 둘 다 같은 사전을 사용.
- **테마.** `CollapsibleTheme`, `ThemeSwitcher`, `DarkModeToggle`,
  `ThemeRestorer` 가 `ThemeProvider` 와 연동되며 `data-theme` 속성을
  `documentElement` 에 박아 CSS 변수를 토글.
- **공용 시연 컴포넌트.** `ComponentPage`, `Preview`, `PropsTable`,
  `PropsPlayground`, `Playground`, `CodeBlock`, `SettingsPanel` 이 각 상세
  페이지에서 일관된 레이아웃을 만든다.
- **데이터.** `_data/search-dictionary.ts` (검색·네비), `_data/component-demos.tsx`
  (정적 데모), `_data/live-demos.tsx` (인터랙티브 데모), `_data/component-previews.ts`
  (썸네일 메타).

## Touched files (for agents)

- `app/design-system/layout.tsx` — 사이드바 + 메인 골격.
- `app/design-system/page.tsx` — 랜딩.
- `app/design-system/_components/DsSidebar.tsx`,
  `app/design-system/_components/DsNav.tsx`,
  `app/design-system/_components/DsSearch.tsx`,
  `app/design-system/_components/DsCommandPalette.tsx` — 네비/검색.
- `app/design-system/_components/ThemeSwitcher.tsx`,
  `app/design-system/_components/CollapsibleTheme.tsx`,
  `app/design-system/_components/DarkModeToggle.tsx`,
  `app/design-system/_components/ThemeRestorer.tsx` — 테마 UI.
- `app/design-system/_components/ComponentPage.tsx`,
  `app/design-system/_components/Preview.tsx`,
  `app/design-system/_components/PropsTable.tsx`,
  `app/design-system/_components/PropsPlayground.tsx`,
  `app/design-system/_components/Playground.tsx`,
  `app/design-system/_components/CodeBlock.tsx`,
  `app/design-system/_components/SettingsPanel.tsx` — 시연 스캐폴딩.
- `app/design-system/_components/FrameworkWrapper.tsx`,
  `app/design-system/_components/LabMainWrapper.tsx`,
  `app/design-system/_components/BreakpointIndicator.tsx` — 컨텍스트/디버그.
- `app/design-system/_data/search-dictionary.ts`,
  `app/design-system/_data/component-demos.tsx`,
  `app/design-system/_data/live-demos.tsx`,
  `app/design-system/_data/component-previews.ts` — 데이터.
- `app/design-system/primitives/<slug>/page.tsx`,
  `app/design-system/composites/<slug>/page.tsx`,
  `app/design-system/patterns/<slug>/page.tsx`,
  `app/design-system/tokens/<slug>/page.tsx` — 카테고리별 상세 페이지.

## Open questions

- 빌드 결과를 정적 사이트로 배포할지 (현재는 dev/start 만).

## Changelog

- 2026-04-29 — created.
