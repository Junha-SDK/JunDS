# 02-tokens — JunDS v3 토큰 파이프라인 (G0)

작성일: 2026-07-23 · 전제: 00-inventory.md, DECISIONS.md D5 (tokens/*.json 단일 소스 → CSS 변수 + Swift 상수 동시 생성)
대원칙: **시각 패리티** — 기존 값을 그대로 추출한다. 값의 임의 변경 금지. 이름만 `--jd-*` 규칙으로 재편한다.
(예외 통로: 접근성 게이트 등으로 값 보정이 불가피하면 DECISIONS 항목 + 패리티 테스트의
`SANCTIONED_DEVIATIONS` 등재를 통해서만 이탈한다 — 현행 1건: danger 라이트 #c93636, DEC-027.)

---

## 1. 현행 토큰 체계 감사 (ds/tokens 14파일 + CSS 실측)

### 1.1 값의 실제 소재 — TS가 아니라 CSS다

`ds/tokens/colors.ts`는 값이 아니라 **CSS 변수 참조 문자열**(`"var(--primary)"`)을 export한다. 실제 색 값의 정본은 CSS 두 곳:

- `ds/styles/tokens.css` — 라이브러리 배포본(`@junds/ui/styles.css`). `:root` 라이트 27변수 + `[data-theme="dark"]` 오버라이드 17변수(+`--dm-surface` 3종, `color-scheme: dark`).
- `app/globals.css` — 문서앱용 복제본. 변수 값은 동일하나 다크 유틸 오버라이드(`.shadow-*` 진하게, 배지 배경 투명도 등)가 **여기에만** 존재.

### 1.2 파일별 요약

| 파일 | 내용 | 값 형태 | v3 판정 |
|---|---|---|---|
| colors.ts | 시맨틱 8그룹(primary/accent/success/warning/danger/info/neutral/sidebar) + priorityColors(4단계)·statusColors(5종) | var() 참조 / 하드코딩 hex | color.json으로 — 값은 CSS에서 추출 |
| spacing.ts | 4px 베이스 18스텝 (0, px, 0.5~24) rem | 리터럴 | space.json 그대로 |
| radius.ts | none~2xl,full 7스텝 (4/6/8/12/16px) | 리터럴 | radius.json — 단 §7 쟁점2 |
| typography.ts | fontSize 9(xs 12px~5xl 36px, **md=14px**), fontWeight 4, lineHeight 6, letterSpacing 4 | 리터럴 | type.json 그대로 |
| shadows.ts | none~2xl 7단계 + glow/danger(포커스 링) | 리터럴(라이트 기준) | shadow.json — 다크 값은 §7 쟁점1 |
| animation.ts | duration 5(0~500ms), easing 6, **animationClass 12(Tailwind 클래스명)** | 리터럴 | motion.json — animationClass는 토큰 아님(§4.4) |
| zindex.ts | hide(-1)~tooltip(80), max 9999 | 숫자 | zindex.json 그대로 |
| opacity.ts | 0~100 16스텝 | 리터럴 | opacity.json 그대로 |
| borderWidth.ts | none~heavy 5스텝 | 리터럴 | border.json 그대로 |
| breakpoints.ts | sm 640~2xl 1536 + mediaQueries | 숫자 | breakpoint.json 그대로 |
| gradients.ts | 브랜드 2 + 시맨틱 4 + 장식 8 + shimmer | var() 혼합 리터럴 | gradient.json (참조는 `{color.*}` 별칭으로) |
| themes.ts | 프리셋 18종 — `generateTheme(primary hex)` 파생 알고리즘(darken 0.15/lighten/glow 0.18) + applyTheme/restoreTheme(DOM+localStorage) | 파생 함수 | 프리셋 hex만 theme-presets.json으로, 알고리즘은 런타임 유틸(§4.5) |
| brands.ts | 5브랜드 = theme+radius 4종+density 3종+font 3종 묶음, applyBrand | 파생 함수 | 동일 — 스케일 표만 JSON화 |
| index.ts | 배럴 | — | react 어댑터 호환 표면의 기준 |

### 1.3 드리프트 실측 (v3에서 정본 확정 필요)

| 항목 | 소스 A | 소스 B | **v3 정본 결정** |
|---|---|---|---|
| zIndex | zindex.ts: dropdown 10 … tooltip 80 | scripts/export-tokens.mjs: 1000~1700 | **zindex.ts** — 컴포넌트가 실제 import하는 쪽. export-tokens.mjs는 수기 사본으로 이미 부패(폐기 대상) |
| fontSize md | typography.ts: 0.875rem(14px) | export-tokens.mjs: 16px | **typography.ts** |
| radius sm/md/lg/xl | radius.ts: 4/6/8/12px | tokens.css `--jds-radius-*`: 4/8/12/16px | §7 쟁점2 |
| shadow | shadows.ts(정교한 2중 그림자) | export-tokens.mjs(구식 값) | **shadows.ts** |
| primary-hover | tokens.css `#4a3db0` | export-tokens.mjs `#4a3db5`, themes.ts darken 파생 `#4d41a9` | **tokens.css** — 실제 렌더 값 |
| accent | tokens.css `#7c5ce7` | export-tokens.mjs `#7c6cd9` | **tokens.css** |

결론: `scripts/export-tokens.mjs`는 v3 파이프라인의 반례(수기 이중 관리)다. v3 생성기가 이 스크립트를 **대체**한다(Figma용 DTCG export는 생성기의 부가 타깃으로 흡수 가능, G1 범위 외).

---

## 2. tokens/*.json 스키마

**결정: DTCG(`$value`/`$type`) 미채택, 자체 미니 스키마.** 생성기를 의존성 0으로 자작하므로 표준 포맷의 이점(도구 호환)보다 단순함이 크다. 필요 시 DTCG는 export 변환 한 줄이면 된다.

규칙:

- 파일 = 최상위 카테고리 1개: `color.json`, `space.json`, `radius.json`, `type.json`, `motion.json`, `shadow.json`, `zindex.json`, `opacity.json`, `border.json`, `breakpoint.json`, `gradient.json`, `theme-presets.json`.
- 리프 값은 **스칼라**(모드 무관) 또는 **`{ "light", "dark" }` 객체**(모드 분기). 둘 외의 형태 금지.
- `{color.primary}` 형태의 **별칭 참조** 허용 — 생성기가 CSS에서는 `var(--jd-color-primary)`로, Swift에서는 상수 참조로 푼다. 순환 참조는 생성기가 에러.
- 키는 camelCase. 소수 스텝은 문자열 키 그대로(`"0.5"`) — 이름 변환은 생성기 책임(§5).

```jsonc
// tokens/color.json — 값 전량 ds/styles/tokens.css에서 추출 (임의 변경 0)
{
  "background":   { "light": "#f5f4f8",  "dark": "#0c0a14" },
  "foreground":   { "light": "#1a1726",  "dark": "#e4e2ee" },
  "card":         { "light": "#ffffff",  "dark": "#161329" },
  "cardHover":    { "light": "#f9f8fc",  "dark": "#1c1932" },
  "border":       { "light": "#e2dfe8",  "dark": "#2a2744" },
  "borderLight":  { "light": "#efedf4",  "dark": "#22203a" },
  "primary":      "#5b4cc7",                         // 다크 오버라이드 없음 → 스칼라
  "primaryHover": "#4a3db0",
  "primaryLight": { "light": "#eceafc",  "dark": "rgba(91, 76, 199, 0.15)" },
  "primaryGlow":  "rgba(91, 76, 199, 0.18)",
  "accent":       "#7c5ce7",
  "accentLight":  { "light": "#efebff",  "dark": "rgba(124, 92, 231, 0.12)" },
  "danger":       { "light": "#c93636",  "dark": "#dc3f3f" }, // DEC-027: v2 #dc3f3f는 라이트 AA 미달 → 라이트만 보정
  "dangerHover":  "#b92f2f",
  "dangerLight":  { "light": "#fff1f1",  "dark": "rgba(220, 63, 63, 0.15)" },
  "muted":        { "light": "#6b6880",  "dark": "#a09cb5" },
  "mutedLight":   { "light": "#9895a8",  "dark": "#706d88" },
  "success":      "#2f8f57",
  "successLight": { "light": "#eaf6ee",  "dark": "rgba(47, 143, 87, 0.15)" },
  "warning":      "#b7791f",
  "warningLight": { "light": "#fff7e6",  "dark": "rgba(183, 121, 31, 0.15)" },
  "info":         "#3b82f6",
  "infoLight":    { "light": "#eff6ff",  "dark": "rgba(59, 130, 246, 0.15)" },
  "sidebarBg":    "#1a1726",
  "sidebarHover": "#272338",
  "sidebarText":  "#a09cb0",
  "sidebarActive":"#9580fa",
  "surface":      { "light": "#161329",  "dark": "#161329", "$alias-note": "v2 --dm-surface — 다크 전용이었으나 스키마상 양모드 기록" },
  "status": {                                        // statusColors 승계 (v2와 동일하게 모드 무관)
    "todo":     { "bg": "#f3f4f6", "text": "#6b7280" },
    "progress": { "bg": "#dbeafe", "text": "#2563eb" },
    "review":   { "bg": "#fef3c7", "text": "#d97706" },
    "done":     { "bg": "#d1fae5", "text": "#059669" },
    "hold":     { "bg": "#fee2e2", "text": "#dc2626" }
  },
  "priority": {                                      // priorityColors 승계
    "p0": { "bg": "#fef2f2", "text": "#dc2626", "border": "#fca5a5" },
    "p1": { "bg": "#fff7ed", "text": "#ea580c", "border": "#fdba74" },
    "p2": { "bg": "#fefce8", "text": "#ca8a04", "border": "#fde047" },
    "p3": { "bg": "#eff6ff", "text": "#2563eb", "border": "#93c5fd" }
  }
}
```

```jsonc
// tokens/space.json — spacing.ts 그대로
{ "0": "0", "px": "1px", "0.5": "0.125rem", "1": "0.25rem", "1.5": "0.375rem",
  "2": "0.5rem", "2.5": "0.625rem", "3": "0.75rem", "3.5": "0.875rem", "4": "1rem",
  "5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem", "12": "3rem",
  "16": "4rem", "20": "5rem", "24": "6rem" }
```

```jsonc
// tokens/type.json — typography.ts + 폰트 패밀리(globals.css·brands.ts에서 추출)
{
  "fontFamily": {
    "sans":  "'Pretendard', 'Inter', -apple-system, 'Segoe UI', sans-serif",
    "serif": "'Noto Serif KR', 'Source Serif Pro', Georgia, serif",
    "mono":  "'JetBrains Mono', 'Geist Mono', ui-monospace, monospace"
  },
  "fontSize":  { "xs": "0.75rem", "sm": "0.8125rem", "md": "0.875rem", "lg": "1rem",
                 "xl": "1.125rem", "2xl": "1.25rem", "3xl": "1.5rem",
                 "4xl": "1.875rem", "5xl": "2.25rem" },
  "fontWeight": { "normal": "400", "medium": "500", "semibold": "600", "bold": "700" },
  "lineHeight": { "none": "1", "tight": "1.25", "snug": "1.375", "normal": "1.5",
                  "relaxed": "1.625", "loose": "2" },
  "letterSpacing": { "tighter": "-0.05em", "tight": "-0.025em", "normal": "0em", "wide": "0.025em" }
}
```

```jsonc
// tokens/motion.json — animation.ts의 duration/easing만 (클래스명은 §4.4)
{
  "duration": { "instant": "0ms", "fast": "100ms", "normal": "200ms", "slow": "300ms", "slower": "500ms" },
  "easing": { "default": "cubic-bezier(0.16, 1, 0.3, 1)", "linear": "linear",
              "easeIn": "cubic-bezier(0.4, 0, 1, 1)", "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
              "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)", "spring": "cubic-bezier(0.16, 1, 0.3, 1)" }
}
```

```jsonc
// tokens/shadow.json — shadows.ts 그대로. glow/danger는 color 참조로 정규화
{
  "none": "none",
  "xs": "0 1px 2px rgba(0,0,0,0.04)",
  "sm": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  "md": "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
  "lg": "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
  "xl": "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
  "2xl": "0 25px 50px -12px rgba(0,0,0,0.15)",
  "focusRing": "0 0 0 3px {color.primaryGlow}",      // 구명 glow — 역할 명시로만 개명
  "focusRingDanger": "0 0 0 3px rgba(220,63,63,0.15)" // 구명 danger
}
```

radius/zindex/opacity/border/breakpoint/gradient는 §1.2 판정대로 1:1 이관(지면 생략). `gradient.json`의 `var(--primary)` 등은 `{color.primary}` 참조로 치환하고, 하드코딩 hex 장식 그라디언트(sunset/ocean/…)는 리터럴 유지.

## 3. 이름 규칙 — 기존명 → 신규명 매핑

CSS 변수: `--jd-<카테고리>-<이름>` (kebab-case). Swift: `JdToken.<카테고리>.<이름>` (camelCase).

| 카테고리 | CSS 예 | Swift 예 |
|---|---|---|
| color | `--jd-color-primary`, `--jd-color-card-hover` | `JdToken.Color.primary`, `.cardHover` |
| space | `--jd-space-4`, 소수는 `.`→`-`: `--jd-space-0-5` | `JdToken.Space.s4`, `.s0_5` (CGFloat, rem×16) |
| radius | `--jd-radius-md` | `JdToken.Radius.md` |
| type | `--jd-font-sans`, `--jd-text-md`, `--jd-weight-bold`, `--jd-leading-tight`, `--jd-tracking-wide` | `JdToken.FontSize.md` 등 |
| motion | `--jd-duration-fast`, `--jd-easing-default` | `JdToken.Duration.fast`(TimeInterval), `.Easing.default`(제어점 4튜플) |
| shadow | `--jd-shadow-md` | `JdToken.Shadow.md` (color/offset/blur 구조체 — CSS 다중 그림자는 배열) |
| zindex | `--jd-z-modal` | `JdToken.Z.modal` (웹 전용 성격 — Swift에도 상수는 내보내되 사용은 선택) |
| opacity / border / breakpoint | `--jd-opacity-50`, `--jd-border-thin`, `--jd-breakpoint-md` | `.Opacity.o50`, `.Border.thin`, `.Breakpoint.md` |

v2 → v3 색 변수 대응은 기계적: `--primary → --jd-color-primary`, `--card-hover → --jd-color-card-hover`, `--sidebar-bg → --jd-color-sidebar-bg`, `--dm-surface → --jd-color-surface`(다크 전용이던 것을 정식 토큰화). 예외 개명은 shadow의 `glow→focus-ring`, `danger→focus-ring-danger` 2건뿐이며, 전량 매핑 표는 생성기 소스 `tokens/build/legacy-map.mjs`에 코드로 존재해야 한다(패리티 테스트가 이 표를 사용, §6).

숫자 시작 키(`2xl`)는 CSS에서 그대로(`--jd-radius-2xl` — 커스텀 프로퍼티는 숫자 시작 세그먼트 허용), Swift에서는 식별자 제약으로 `xl2` (`JdToken.Radius.xl2`).

## 4. 생성기 설계 — `tokens/build/generate.mjs`

의존성 0 (node:fs, node:path만). 입력 `tokens/*.json` → 산출물 3종을 **항상 전량 재생성**(증분 없음 — 파일이 작다). 산출물 파일 첫 줄에 `/* AUTO-GENERATED by tokens/build/generate.mjs — DO NOT EDIT */` 배너.

### 4.1 (a) CSS — `packages/web/src/styles/tokens.css`

```css
/* AUTO-GENERATED … */
@layer junds.tokens {
  :root {
    --jd-color-background: #f5f4f8;
    --jd-color-foreground: #1a1726;
    --jd-color-primary: #5b4cc7;
    --jd-color-primary-light: #eceafc;
    /* … */
    --jd-space-0-5: 0.125rem;
    --jd-space-4: 1rem;
    --jd-radius-md: 0.375rem;
    --jd-text-md: 0.875rem;
    --jd-duration-fast: 100ms;
    --jd-easing-default: cubic-bezier(0.16, 1, 0.3, 1);
    --jd-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
    --jd-shadow-focus-ring: 0 0 0 3px var(--jd-color-primary-glow); /* {color.*} 참조 → var() */
    --jd-z-modal: 50;
  }
  /* 전환기: 구 셀렉터 병기 — react 어댑터가 v2 앱(data-theme) 위에서도 동작.
     v3 GA에서 [data-theme="dark"]를 제거한다. */
  [data-jd-theme="dark"],
  [data-theme="dark"] {
    --jd-color-background: #0c0a14;
    --jd-color-foreground: #e4e2ee;
    --jd-color-primary-light: rgba(91, 76, 199, 0.15);
    /* … dark 키가 있는 토큰만 방출 */
    color-scheme: dark;
  }
}
```

- 다크 블록에는 `{light,dark}` 객체 토큰만 나온다 — v2와 동일한 "오버라이드" 모델이라 캐스케이드 결과가 그대로 재현된다.
- `@layer junds.tokens`는 `@layer junds.tokens, junds.base, junds.components;` 선언(base.css 첫 줄)의 최하위 서브레이어 — 소비자 무레이어 CSS가 항상 이긴다(D1의 light DOM 오버라이드 친화 원칙).

### 4.2 (b) Swift — `packages/ios/Sources/JunDSCore/Generated/JdToken.swift`

색은 라이트/다크를 트레이트로 해소하는 다이나믹 타입으로 방출한다:

```swift
// AUTO-GENERATED …
import UIKit
import SwiftUI

/// 라이트·다크 쌍 — UIKit/SwiftUI 양쪽 브리지 제공
public struct JdDynamicColor: Sendable {
    public let light: UInt32   // 0xRRGGBBAA
    public let dark: UInt32

    public var uiColor: UIColor {
        UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(jdHex: self.dark) : UIColor(jdHex: self.light)
        }
    }
    public var color: SwiftUI.Color { SwiftUI.Color(uiColor) }
}

public enum JdToken {
    public enum Color {
        public static let background   = JdDynamicColor(light: 0xF5F4F8FF, dark: 0x0C0A14FF)
        public static let foreground   = JdDynamicColor(light: 0x1A1726FF, dark: 0xE4E2EEFF)
        public static let primary      = JdDynamicColor(light: 0x5B4CC7FF, dark: 0x5B4CC7FF) // 스칼라 → 양모드 동일
        public static let primaryGlow  = JdDynamicColor(light: 0x5B4CC72E, dark: 0x5B4CC72E) // rgba 0.18 → AA=2E
        // …
    }
    public enum Space {
        public static let s0_5: CGFloat = 2   // 0.125rem × 16
        public static let s4: CGFloat = 16
        // … rem→pt 는 1rem=16pt 고정 환산 (root font-size 개념이 iOS에 없으므로)
    }
    public enum Radius { public static let md: CGFloat = 6; public static let xl2: CGFloat = 16 /* … */ }
    public enum FontSize { public static let md: CGFloat = 14 /* … */ }
    public enum Duration { public static let fast: TimeInterval = 0.1 /* … */ }
    public enum Easing {
        /// CAMediaTimingFunction/SwiftUI Animation.timingCurve 겸용 제어점
        public static let `default`: (Double, Double, Double, Double) = (0.16, 1, 0.3, 1)
    }
    public enum Shadow {
        public struct Layer: Sendable { public let color: UInt32; public let x, y, blur, spread: CGFloat }
        public static let md: [Layer] = [
            .init(color: 0x00000012, x: 0, y: 4, blur: 6, spread: -1),
            .init(color: 0x0000000D, x: 0, y: 2, blur: 4, spread: -2),
        ]
    }
}
```

- 생성기가 `#hex`/`rgba()`를 파싱해 `0xRRGGBBAA`로 정규화한다(rgba 알파는 ×255 반올림). 파싱 불가 값은 생성 실패(에러 종료) — 조용한 누락 금지.
- rem→pt는 `1rem = 16pt` 고정 환산으로 결정. 근거: 웹 쪽도 root 16px 기준으로 주석돼 있고(spacing.ts), iOS 동적 타입 대응은 토큰이 아니라 컴포넌트 계층(UIFontMetrics)의 몫이다.
- `JdDynamicColor`에 원시 `UInt32`를 남겨두는 이유: SwiftUI `Environment(\.colorScheme)` 커스텀 해소, 스냅샷 테스트에서의 값 비교가 UIColor 왕복 없이 가능.

### 4.3 (c) React 어댑터용 TS — `packages/react/src/tokens.generated.ts`

기존 `ds/tokens` 배럴과 **API 호환**(v2 소비 코드가 import 경로만 바꾸면 되도록). 색은 v2와 동일하게 var() 참조 문자열 — 신규 변수명을 가리킨다:

```ts
// AUTO-GENERATED …
export const colors = {
  primary: {
    DEFAULT: "var(--jd-color-primary)",
    hover: "var(--jd-color-primary-hover)",
    light: "var(--jd-color-primary-light)",
    glow: "var(--jd-color-primary-glow)",
  },
  neutral: { background: "var(--jd-color-background)", /* … */ },
  // …
} as const;
export const spacing = { 0: "0", px: "1px", 0.5: "0.125rem", /* … */ } as const;
export const fontSize = { xs: "0.75rem", /* … */ } as const;
export const zIndex = { hide: -1, base: 0, dropdown: 10, /* … */ } as const;
// duration, easing, radius, shadows, opacity, borderWidth, breakpoints, mediaQueries 동일 요령
```

`themes.ts`/`brands.ts`의 함수류(applyTheme, generateTheme, applyBrand)는 생성 대상이 아니라 **런타임 코드**다 — §4.5.

### 4.4 animationClass의 처분

`animationClass`(`"animate-fade-in"` 등 Tailwind 클래스명 12종)는 값 토큰이 아니라 클래스 계약이므로 tokens/에서 제외한다. v3 웹은 `@layer junds.components`에 `jd-anim-fade-in` 등 자체 키프레임+클래스를 정의하고, react 어댑터의 `animationClass` export는 신규 클래스명을 반환한다(시각 결과 동일 — 키프레임 정의 자체를 v2 CSS에서 이관).

### 4.5 themes/brands의 처분

- 18종 테마 프리셋의 **primary hex만** `tokens/theme-presets.json`으로 승계. 파생(darken 0.15, lighten 0.85, glow 0.18, sidebarActive lighten 0.25)은 값이 아니라 알고리즘이므로, `themes.ts`의 함수를 웹 `internal/theme.ts`(및 Swift 등가 함수)로 이식하고 **파생 계수를 본 문서의 계약으로 고정**한다 — 계수가 곧 시각 패리티다.
- 브랜드 4축 중 radius/density 스케일 표는 `tokens/` 산하가 아닌 브랜드 스펙(후속 G2 문서)으로 보낸다. 현행 `--jds-radius-*`/`--jds-density-*` 런타임 노브는 §7 쟁점2와 묶여 있다.

## 5. 생성기 동작 계약

1. `node tokens/build/generate.mjs` — 인자 없음, 항상 3산출물 전량 덮어쓰기.
2. 검증 내장: 별칭 해소 실패·색 파싱 실패·`{light,dark}` 이외 객체 형태·중복 키 → exit 1.
3. 산출물은 **커밋한다** (생성물 gitignore 금지). 근거: SPM 소비자는 npm 스크립트를 돌리지 않는다 — `JdToken.swift`가 레포에 있어야 `.package(url:)`만으로 동작한다. 신선도는 CI `tokens-fresh` 게이트(재생성 후 `git diff --quiet`)가 보증한다.
4. 소수 키 변환(`0.5`→CSS `0-5`/Swift `s0_5`), camelCase→kebab 변환은 생성기 단일 구현 — 산출물 간 이름 불일치가 구조적으로 불가능하게 한다.

## 6. 검증 — 스냅샷 + v2 패리티

`tokens/__tests__/` (node --test, 의존성 0):

1. **스냅샷 테스트**: 산출물 3종의 전문(full text)을 `__snapshots__/`의 기대 파일과 문자열 비교. 갱신은 `UPDATE_SNAPSHOTS=1 node --test …`로만 — 리뷰에서 토큰 diff가 그대로 보인다.
2. **v2 패리티 테스트 (핵심)**: `ds/styles/tokens.css`(동결본)를 정규식으로 파싱해 `--변수: 값` 맵을 만들고, `legacy-map.mjs`의 구명→신명 매핑을 통해 생성된 v3 CSS의 값과 **전 항목 일치**를 단언한다. 라이트·다크 각각. TS 리터럴 토큰(spacing 등)은 `ds/tokens/*.ts`를 동적 import해 동일 비교. 이 테스트가 "임의 변경 금지" 원칙의 기계적 집행자다. 승인된 이탈은 테스트 내 `SANCTIONED_DEVIATIONS` 표(v2 기대값 + 승인값 + DEC 번호)로만 허용 — v2 값도 승인값도 아닌 제3의 값은 여전히 실패하고, 동결본이 바뀌어도 실패해 재심의를 강제한다.
3. **Swift 값 검증**: 생성기 내 hex 파서를 패리티 테스트에서 재사용해 `JdToken.swift` 안의 `0xRRGGBBAA` 리터럴을 재파싱→원본 JSON과 대조(정규식 추출). 컴파일 가능성은 CI `ios-build`가, 다이나믹 컬러 해소는 `JunDSCoreTests`의 XCTest(라이트/다크 trait로 `uiColor` 해소값 비교) 가 커버.
4. CI 연결: `tokens-test` + `tokens-fresh` 게이트 (01-repo-structure §9).

## 7. 열린 쟁점 (사람 확인 필요 — 권장안 + 대안)

### 쟁점 1 — 다크 모드 그림자 토큰의 승격 여부

실태: 다크에서 그림자를 진하게 만드는 값(`.shadow-md { 0 4px 6px rgba(0,0,0,0.35) }` 등 6단계)이 **app/globals.css에만** 있고 라이브러리 배포 CSS에는 없다. 즉 문서앱에서 본 다크 그림자와 v2 라이브러리 소비자가 보는 다크 그림자가 이미 달랐다.

- **권장안**: `shadow.json`을 `{light, dark}`로 만들고 다크 값은 globals.css의 진한 세트를 채택. 근거 — 문서앱 렌더가 사실상의 시각 기준이었고, 다크에서 라이트용 옅은 그림자는 시인성이 없다. "라이브러리 관점에서는" 값이 바뀌는 것이므로 사람 확인을 받는다.
- **대안**: 패리티 엄격 해석 — 라이브러리 CSS 기준으로 라이트 값 단일 유지, 다크 강화는 G2 시각 개선 트랙으로 미룸.

### 쟁점 2 — radius 정본: 정적 스케일 vs 런타임 노브 (값 불일치)

실태: `radius.ts`(sm 4/md 6/lg 8/xl 12px)와 런타임 노브 `--jds-radius-*`(sm 4/md 8/lg 12/xl 16px)가 md 이상에서 서로 다르고, 브랜드 시스템(`brands.ts`)은 후자를 덮어쓴다. 컴포넌트 다수는 둘 다 아닌 Tailwind `rounded-*`를 직접 쓴다.

- **권장안**: `radius.json` = `radius.ts` 스케일(4/6/8/12/16px)을 유일 정본으로 방출하고, v3 컴포넌트 CSS는 전부 `--jd-radius-*`만 참조. 브랜드 가변은 동일 변수를 `[data-jd-brand]`에서 재정의하는 방식으로 통합(별도 `--jds-*` 노브 폐기). 근거 — 이중 축을 v3까지 끌고 가면 273개 파일의 Tailwind 탈피 작업에서 참조 대상이 갈라진다.
- **대안**: 런타임 노브 값(4/8/12/16px)을 정본으로 채택 — 브랜드 시스템이 실제로 조작해 온 값이므로 "브랜드 적용 화면"의 패리티는 이쪽이 정확하다. 기본(무브랜드) 화면의 패리티는 권장안이 정확하다. 어느 화면을 기준으로 삼을지의 선택 문제.
