# Theming (tokens + ThemeProvider + CSS bridge)

- **Slug:** `theming`
- **Status:** shipped
- **Owner:** Junha (goodjunha@gmail.com)
- **Last updated:** 2026-04-29

## Goal

JunDS 의 모든 컴포넌트가 같은 색·간격·타이포·반경·모션 어휘를 공유하도록
토큰 계층을 두고, 호스트 앱이 한 줄 (`<ThemeProvider>`) 로 라이트/다크/프리셋
테마를 갈아끼울 수 있어야 한다. CSS 변수 (`--jds-*`, `data-theme="dark"`) 를
브리지로 사용해 SSR 환경에서도 hydration mismatch 없이 동작한다.

## Scope

- In scope:
  - 디자인 토큰 (`ds/tokens/*`): colors, typography, spacing, shadows, radius,
    animation, zindex, breakpoints, opacity, borderWidth.
  - 테마 프리셋 (`themePresets`) 과 동적 적용 (`applyTheme`, `restoreTheme`).
  - `ThemeProvider` (color mode + theme name + custom primary).
  - 색상 모드: `light` / `dark` / `system` (OS prefers-color-scheme 추적).
  - `app/globals.css` 의 `--jds-*` CSS 변수 정의와 `[data-theme="dark"]`
    셀렉터.
  - localStorage 영속화 (`junds-color-mode`, 테마 이름).
  - 다크모드 토글 / 테마 셀렉터 UI (쇼케이스 전용).
- Out of scope:
  - i18n / locale (별도 `i18n.md`).
  - 라이선스/인증 (별도 `license-and-auth.md`).
  - 컴포넌트별 variant API (각 컴포넌트의 spec / `COMPONENTS.md`).

## User stories / acceptance criteria

- [x] As a 호스트 앱 개발자, I can `<ThemeProvider defaultTheme="purple"
defaultColorMode="system">` 한 줄로 모든 JunDS 컴포넌트가 같은 팔레트를
      공유한다.
- [x] As a 사용자, OS 가 다크모드면 첫 페인트부터 다크가 적용된다 (system
      모드).
- [x] As a 사용자, 테마/모드 선택이 `localStorage` 에 저장돼 새로고침 후에도
      복원된다.
- [x] As a 호스트 앱 개발자, I can `setCustomTheme("#ff5500")` 로 임의
      primary 색을 즉시 적용한다.
- [x] As a 라이브러리 메인테이너, I can `ds/tokens/colors.ts` 에 색을 추가하면
      `ds/tokens/index.ts` 한 줄 갱신으로 전체에 노출된다.
- [x] As a 사용자, 컴포넌트 내부에서 하드코딩된 색이 아니라 토큰을 사용하므로
      테마 전환이 100% 일관된다.
- [x] As a 디자이너, `app/design-system/tokens/*/page.tsx` 에서 모든 토큰을
      시각적으로 검수할 수 있다.

## Design / behavior notes

- **토큰 모듈.** `colors`, `priorityColors`, `statusColors`, `fontSize`,
  `fontWeight`, `lineHeight`, `letterSpacing`, `spacing`, `shadows`, `radius`,
  `duration`, `easing`, `animationClass`, `zIndex`, `breakpoints`,
  `mediaQueries`, `opacity`, `borderWidth` 가 모두 `ds/tokens/index.ts` 를
  통해 export.
- **프리셋.** `themePresets: ThemePreset[]` 에 정의된 프리셋 (`purple`,
  `blue`, …) 을 `applyTheme(name | { name, primary })` 로 적용하면 documentRoot
  의 CSS 변수와 `data-theme` 속성이 갱신.
- **복원.** 첫 마운트 시 `restoreTheme()` 이 localStorage 의 마지막 테마를
  다시 적용. `getCurrentThemeName()` 으로 조회 가능.
- **컬러 모드.** `colorMode = "system"` 이면 `matchMedia("(prefers-color-scheme:
dark)")` 를 구독, "dark"/"light" 면 강제 적용. localStorage 키는
  `junds-color-mode`.
- **CSS 브리지.** `app/globals.css` 가 `--jds-font-scale`, `--jds-font-base`,
  `--jds-density-*`, `--jds-radius-*`, `--jds-spacing-mult` 등을 정의하고
  `[data-density="..."]`, `[data-radius="..."]`, `[data-theme="dark"]` 셀렉터로
  컴포넌트 스타일을 토글한다.
- **컴포넌트 사용 규약.** 컴포넌트 코드는 `ds/tokens/*` 만 import 하고
  하드코딩된 hex/px 를 쓰지 않는다 (AGENTS.md "Tokens, not literals").
- **SSR 안전.** 첫 렌더는 default 값으로, `useEffect` 에서 OS/저장값을 반영
  하므로 hydration mismatch 가 나지 않는다.

## Touched files (for agents)

- `ds/providers/ThemeProvider.tsx` — provider, `useTheme`, color mode
  관리.
- `ds/providers/index.ts` — barrel.
- `ds/tokens/colors.ts`, `ds/tokens/typography.ts`, `ds/tokens/spacing.ts`,
  `ds/tokens/shadows.ts`, `ds/tokens/radius.ts`, `ds/tokens/animation.ts`,
  `ds/tokens/zindex.ts`, `ds/tokens/breakpoints.ts`, `ds/tokens/opacity.ts`,
  `ds/tokens/borderWidth.ts` — 토큰 정의.
- `ds/tokens/themes.ts` — 프리셋 + `applyTheme` / `restoreTheme` /
  `generateTheme` / `getCurrentThemeName`.
- `ds/tokens/index.ts` — 토큰 barrel.
- `ds/utils/contrast.ts` — 자동 대비색 계산 (테마 보조).
- `app/globals.css` — `--jds-*` CSS 변수, `[data-theme]` 셀렉터.
- `app/design-system/tokens/colors/page.tsx`,
  `app/design-system/tokens/typography/page.tsx`,
  `app/design-system/tokens/spacing/page.tsx`,
  `app/design-system/tokens/shadows/page.tsx`,
  `app/design-system/tokens/animations/page.tsx` — 토큰 시연.
- `app/design-system/_components/ThemeSwitcher.tsx`,
  `app/design-system/_components/CollapsibleTheme.tsx`,
  `app/design-system/_components/DarkModeToggle.tsx`,
  `app/design-system/_components/ThemeRestorer.tsx` — 쇼케이스 UI.
- `scripts/export-tokens.mjs` — 토큰을 외부 포맷으로 내보내는 스크립트.

## Open questions

- 호스트 앱이 자체 `globals.css` 를 갖고 있을 때 `--jds-*` 변수가 충돌하지
  않도록 prefix 정책을 문서화할지.

## Changelog

- 2026-04-29 — created.
