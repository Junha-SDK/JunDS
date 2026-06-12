# Multi-Brand Theming

- **Slug:** `multi-brand-theming`
- **Status:** active
- **Owner:** goodjunha@gmail.com
- **Last updated:** 2026-05-04

## Goal

기존 `ThemeProvider`(라이트/다크 + primary 색상 변경)를 한 단계 위로 묶는다.
한 브랜드는 (color theme + radius scale + density + font family)을 하나의
`BrandPreset`으로 번들링해 "동일 컴포넌트, 다른 정체성"을 한 줄로 전환한다.
프리셋 5종(Default, Ocean, Forest, Sunset, Midnight)을 출고하며, 사용자는
`generateTheme()`로 자체 브랜드를 추가한다.

## Scope

**In scope**
- `ds/tokens/brands.ts` — `BrandPreset` 타입 + 5개 프리셋 + `applyBrand()`/`restoreBrand()`
- `ds/providers/BrandProvider.tsx` — Context + 마운트 시 자동 복원
- `ds/composites/BrandSwitcher` — chips/list/select 3가지 변형 UI
- 4개 토큰 축: color theme, radius (sharp/default/soft/pill), density (compact/cozy/comfortable), font (sans/serif/mono)
- localStorage 영속화 (`junds-brand` 키)
- `data-brand="<id>"` 속성을 `<html>`에 부여 — CSS에서 `[data-brand="ocean"]` 추가 오버라이드 가능

**Out of scope**
- Figma sync — 별도 스프린트 (token-transformer/Style Dictionary)
- 사용자가 동적으로 새 브랜드를 등록하는 GUI — `applyBrand({...})`로 코드에서만
- A/B 테스팅 자동 분기 — 호출자가 결정

## User stories / acceptance criteria

- [x] **As a 개발자** I can `<BrandProvider brand="ocean">`로 자식 트리 전체의
  primary, radius, density, font가 한꺼번에 바뀌는 것을 본다.
- [x] **As a 사용자** I can `<BrandSwitcher variant="chips" />`를 클릭하면
  실시간 전환되고 새로고침 후에도 마지막 선택이 유지된다.
- [x] **As a 디자이너** I can `generateTheme(name, label, "#ff6b35")` 한 줄로
  새 브랜드 색상을 즉시 본다 — 파생색은 자동.
- [x] **As a SSR 사용자** I can SSR 렌더에서 `BrandProvider`가 안전하게 noop
  처리되고 hydration 후 첫 effect에서 적용되는 것을 확인한다.

## Design / behavior notes

- **CSS 변수 직접 조작**: `applyBrand`는 `document.documentElement.style`을 직접
  set한다. 다음 4 카테고리:
  - color: `--primary`, `--primary-hover`, `--primary-light`, `--primary-glow`,
    `--accent`, `--accent-light`, `--sidebar-active`
  - radius: `--jds-radius-sm/md/lg/xl`
  - density: `--jds-density-px/py/text`, `--jds-spacing-mult`
  - font: `--font-sans`
- **fallback**: `BrandProvider` 외부에서 `useBrand()` 호출 시 안전한 noop
  controller 반환 (앱 점진 도입을 막지 않기 위함).
- **localStorage 충돌**: 단일 키(`junds-brand`)만 사용. theme/dark mode와는
  독립적으로 저장됨.
- **`data-brand` 속성**: 추가 오버라이드용 hook. 예: `[data-brand="forest"] .Card { ... }`.

## Touched files (for agents)

- `ds/tokens/brands.ts`
- `ds/providers/BrandProvider.tsx`
- `ds/providers/index.ts`
- `ds/composites/BrandSwitcher/BrandSwitcher.tsx`
- `app/design-system/composites/brand-switcher/page.tsx`
- `app/globals.css` (jds-radius/density 변수)

## Open questions

- **5개 프리셋 외 확장 정책**: 회사별 브랜드는 user-land에서 추가하는 것이
  표준 vs 라이브러리에 더 추가할지 결정 필요.
- **다크 모드와 직교**: 현재 `BrandProvider`는 라이트/다크 토글과 독립.
  ThemeProvider와 동시 사용 시 우선순위 문서화 필요.
- **Figma 토큰 sync**: token-transformer 또는 Style Dictionary 도입은 별도
  스프린트.

## Changelog

- 2026-05-04 — created.
