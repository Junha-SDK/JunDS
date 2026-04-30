# Design System Library (`@junds/ui`)

- **Slug:** `design-system-library`
- **Status:** shipped
- **Owner:** Junha (goodjunha@gmail.com)
- **Last updated:** 2026-04-29

## Goal

`@junds/ui` 는 JunDS 라이브러리의 본체이다. 한 개의 npm 패키지로 41개
프리미티브, 119개 컴포지트, 26개 패턴, 레이아웃 프리미티브, 공용 훅, 디자인
토큰, Provider 군을 한꺼번에 제공한다. 같은 props 규약과 토큰을 공유하기 때문에
호스트 앱은 색·간격·타이포 합의를 다시 만들 필요 없이 곧장 화면을 조립할 수
있다. 이 문서는 **라이브러리의 아키텍처와 공개 API 표면**을 정의한다.

## Scope

- In scope:
  - `ds/` 디렉터리에서 출발하는 모든 공개 export.
  - 컴포넌트 분류 체계 (primitive / composite / pattern / layout / core).
  - barrel export 규칙과 `ds/index.ts` 루트 표면.
  - polymorphic `as` prop, `cn` 유틸 등 공유 인프라.
  - rollup 기반 dist 빌드 (ESM + CJS + d.ts + styles.css).
  - `peerDependencies` (react / react-dom) 와 외부 의존성 (`clsx`,
    `tailwind-merge`).
- Out of scope:
  - 쇼케이스 사이트 (별도 `showcase-site.md`).
  - 라이선스/도메인 잠금 (별도 `license-and-auth.md`).
  - 테마 토큰의 의미 정의 (별도 `theming.md`).
  - i18n 메시지 (별도 `i18n.md`).

## User stories / acceptance criteria

- [x] As a 호스트 앱 개발자, I can `import { Button, Modal } from "@junds/ui"`,
      so that 어떤 컴포넌트도 단일 import 경로로 가져올 수 있다.
- [x] As a 라이브러리 메인테이너, I can primitive를 추가하면
      `ds/primitives/index.ts` 와 `ds/index.ts` 두 barrel만 갱신하면 충분하다.
- [x] As a 호스트 앱 개발자, I can `<Button as="a" href="/x">` 처럼 polymorphic
      `as` prop으로 태그를 바꿔도 타입이 정확히 유지된다.
- [x] As a 호스트 앱 개발자, I can `import "@junds/ui/styles.css"` 한 줄로 모든
      CSS 변수와 유틸 클래스를 받는다.
- [x] As a 라이브러리 메인테이너, I can `npm run build:lib` 으로 ESM/CJS/타입
      세 출력물을 한 번에 만든다.
- [x] As a 사용자, 트리쉐이킹이 동작하므로 단일 컴포넌트만 사용해도 번들이
      비대해지지 않는다 (`sideEffects: false`).

## Design / behavior notes

- **계층.** primitive (단일 책임) → composite (합성) → pattern (앱 수준) →
  layout (배치만). 컴포넌트가 다른 컴포넌트를 의존하면 한 단계 위 계층에 속한다.
- **Naming.** PascalCase 폴더 + 같은 이름의 `.tsx`. 훅은 `useX` camelCase.
- **Barrels.** 각 카테고리 디렉터리는 `index.ts` 를 통해서만 export. 루트
  `ds/index.ts` 는 카테고리 barrel 을 그대로 re-export 하므로 손으로 컴포넌트
  목록을 관리하지 않는다.
- **공유 인프라.**
  - `ds/utils/cn.ts` — `clsx + tailwind-merge` 결합 유틸.
  - `ds/utils/polymorphic.ts` — `PolymorphicProps`, `PolymorphicRef` 타입.
  - `ds/utils/raceGuard.ts` — async race-condition 가드.
  - `ds/core/styleProps.ts` — Box/Flex 류의 sx-style props 컨버터.
- **Provider 묶음.** `JunDSProvider` 는 라이선스 + Theme + I18n 을 한 번에
  걸어주는 옵셔널 wrapper. 사용자는 `ThemeProvider`, `I18nProvider` 를 단독으로도
  쓸 수 있다.
- **빌드 출력.** `dist/index.mjs`, `dist/index.cjs`, `dist/index.d.ts`,
  `dist/styles.css`. ESM 출력 상단에 `"use client";` 배너가 들어간다.
- **외부 의존성.** `clsx`, `tailwind-merge` 만 dependency. `react`, `react-dom`
  은 peer.
- **버전.** 현재 `2.2.0` (package.json).

## Touched files (for agents)

- `ds/index.ts` — 루트 barrel.
- `ds/primitives/index.ts`, `ds/composites/index.ts`, `ds/patterns/index.ts`,
  `ds/layout/index.ts`, `ds/core/index.ts`, `ds/hooks/index.ts`,
  `ds/tokens/index.ts`, `ds/providers/index.ts` — 카테고리 barrel.
- `ds/utils/cn.ts`, `ds/utils/polymorphic.ts`, `ds/utils/raceGuard.ts`,
  `ds/utils/contrast.ts`, `ds/utils/zodAdapter.ts` — 공유 유틸.
- `ds/core/styleProps.ts` — Box/Flex props.
- `rollup.config.mjs` — ESM/CJS/d.ts/styles.css 다중 빌드 설정.
- `tsconfig.build.json` — 빌드용 tsconfig (declaration 출력).
- `package.json` — `exports`, `peerDependencies`, `sideEffects`, scripts
  (`build:lib`, `prepublishOnly`).
- `COMPONENTS.md` — 공개 컴포넌트 API 레퍼런스 (사람/에이전트 공용).

## Open questions

- 별도 sub-path export (`@junds/ui/primitives` 등) 를 열어야 하는가? 현재는
  루트 단일 진입점만 노출된다.

## Changelog

- 2026-04-29 — created.
