/**
 * v2 → v3 토큰 이름 전량 매핑 (02-tokens §3).
 * 패리티 테스트(tokens/__tests__)가 이 표를 단일 소스로 사용한다.
 * 여기 없는 v2 변수를 발견하면 테스트가 실패해야 한다 — 표를 늘려서 해결할 것.
 * 승격하지 않기로 한 변수도 `legacyUnmappedV2Vars`에 **명시**해야 통과한다(조용한 누락 금지).
 */

/** ds/styles/tokens.css 라이트 :root 27변수 → v3 CSS 변수명 */
export const legacyLightColorMap = {
  "--background": "--jd-color-background",
  "--foreground": "--jd-color-foreground",
  "--card": "--jd-color-card",
  "--card-hover": "--jd-color-card-hover",
  "--border": "--jd-color-border",
  "--border-light": "--jd-color-border-light",
  "--primary": "--jd-color-primary",
  "--primary-hover": "--jd-color-primary-hover",
  "--primary-light": "--jd-color-primary-light",
  "--primary-glow": "--jd-color-primary-glow",
  "--accent": "--jd-color-accent",
  "--accent-light": "--jd-color-accent-light",
  "--danger": "--jd-color-danger",
  "--danger-hover": "--jd-color-danger-hover",
  "--danger-light": "--jd-color-danger-light",
  "--muted": "--jd-color-muted",
  "--muted-light": "--jd-color-muted-light",
  "--success": "--jd-color-success",
  "--success-light": "--jd-color-success-light",
  "--warning": "--jd-color-warning",
  "--warning-light": "--jd-color-warning-light",
  "--sidebar-bg": "--jd-color-sidebar-bg",
  "--sidebar-hover": "--jd-color-sidebar-hover",
  "--sidebar-text": "--jd-color-sidebar-text",
  "--sidebar-active": "--jd-color-sidebar-active",
  "--info": "--jd-color-info",
  "--info-light": "--jd-color-info-light",
};

/** ds/styles/tokens.css [data-theme="dark"] 오버라이드 17변수(--dm-* 3종 포함) → v3 */
export const legacyDarkColorMap = {
  "--background": "--jd-color-background",
  "--foreground": "--jd-color-foreground",
  "--card": "--jd-color-card",
  "--card-hover": "--jd-color-card-hover",
  "--border": "--jd-color-border",
  "--border-light": "--jd-color-border-light",
  "--muted": "--jd-color-muted",
  "--muted-light": "--jd-color-muted-light",
  "--primary-light": "--jd-color-primary-light",
  "--accent-light": "--jd-color-accent-light",
  "--danger-light": "--jd-color-danger-light",
  "--success-light": "--jd-color-success-light",
  "--warning-light": "--jd-color-warning-light",
  "--info-light": "--jd-color-info-light",
  // 다크 전용이던 --dm-* 3종을 정식 토큰으로 승격 (02-tokens §3)
  "--dm-surface": "--jd-color-surface",
  "--dm-surface-raised": "--jd-color-surface-raised",
  "--dm-surface-overlay": "--jd-color-surface-overlay",
};

/**
 * ds/styles/tokens.css `--font-*` 5종 → v3 type.fontFamily 변수 (02-tokens §3: `--jd-font-sans`).
 *
 * 색과 달리 값까지 v2 그대로다 — 02-tokens §2가 예시로 적어 둔 3종 축약 스택은
 * 라이브러리(ds/tokens/fontFamily.ts)가 아니라 문서앱 globals.css에서 뽑은 것이라
 * 'Pretendard Variable'·'Noto Sans KR'·emoji 폴백이 빠져 있었고, display·hand는 아예
 * 없었다. DEC-051에서 v2 체인 5종을 정본으로 승격했다.
 */
export const legacyFontFamilyMap = {
  "--font-sans": "--jd-font-sans",
  "--font-serif": "--jd-font-serif",
  "--font-display": "--jd-font-display",
  "--font-hand": "--jd-font-hand",
  "--font-mono": "--jd-font-mono",
};

/**
 * v2에 있으나 v3 토큰으로 **승격하지 않기로 한** 변수 (DEC-051).
 *
 * `--cat-*` 32종(8카테고리 × accent/soft/border/text)은 영화·일상·만화·회고·책·뮤지컬·
 * 애니·중립이라는 **한 제품의 콘텐츠 분류**다. 디자인 시스템의 기초 어휘가 아니라 그
 * 위에 앉는 앱의 정보 구조이고(DEC-045 §2가 "사이트 종속성은 이식하지 않는다"로 이미
 * 같은 선을 그었다), v2 값 자체가 어두운 배경 기준 단일 모드로 튜닝돼 있어
 * ({light, dark} 쌍이 없다) v3 색 스키마에 그대로 넣을 수도 없다. 색으로 정보를 구분하는
 * 표면은 DEC-044의 hue 앵커(--jd-color-hue-*) + 톤 레시피가 담당한다.
 *
 * 여기 적힌 것은 "봤고, 안 옮기기로 했다"는 기록이다 — 목록에 없는 v2 변수를 만나면
 * 패리티 테스트는 여전히 실패해야 한다.
 */
export const legacyUnmappedV2Vars = [
  "--cat-movie",
  "--cat-movie-soft",
  "--cat-movie-border",
  "--cat-movie-text",
  "--cat-daily",
  "--cat-daily-soft",
  "--cat-daily-border",
  "--cat-daily-text",
  "--cat-comic",
  "--cat-comic-soft",
  "--cat-comic-border",
  "--cat-comic-text",
  "--cat-retrospect",
  "--cat-retrospect-soft",
  "--cat-retrospect-border",
  "--cat-retrospect-text",
  "--cat-book",
  "--cat-book-soft",
  "--cat-book-border",
  "--cat-book-text",
  "--cat-musical",
  "--cat-musical-soft",
  "--cat-musical-border",
  "--cat-musical-text",
  "--cat-anime",
  "--cat-anime-soft",
  "--cat-anime-border",
  "--cat-anime-text",
  "--cat-neutral",
  "--cat-neutral-soft",
  "--cat-neutral-border",
  "--cat-neutral-text",
];

/** shadows.ts 구명 → shadow.json 신명 — 예외 개명 2건 (02-tokens §3) */
export const legacyShadowKeyMap = {
  none: "none",
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
  "2xl": "2xl",
  glow: "focusRing",
  danger: "focusRingDanger",
};

/**
 * ds/tokens/colors.ts의 API 그룹 형태 → color.json 키.
 * tokens.generated.ts(react 어댑터 호환 표면)의 colors export가 이 형태를 따른다.
 */
export const reactColorsShape = {
  primary: {
    DEFAULT: "primary",
    hover: "primaryHover",
    light: "primaryLight",
    glow: "primaryGlow",
  },
  accent: { DEFAULT: "accent", light: "accentLight" },
  success: { DEFAULT: "success", light: "successLight" },
  warning: { DEFAULT: "warning", light: "warningLight" },
  danger: { DEFAULT: "danger", hover: "dangerHover", light: "dangerLight" },
  info: { DEFAULT: "info", light: "infoLight" },
  neutral: {
    background: "background",
    foreground: "foreground",
    card: "card",
    cardHover: "cardHover",
    border: "border",
    borderLight: "borderLight",
    muted: "muted",
    mutedLight: "mutedLight",
  },
  sidebar: { bg: "sidebarBg", hover: "sidebarHover", text: "sidebarText", active: "sidebarActive" },
};

/**
 * v2 priorityColors의 label — 시각 토큰이 아니라 API 호환 표면의 문자열.
 * tokens.generated.ts 방출 시 color.json priority.p0~p3와 합성한다.
 */
export const priorityLabels = { 0: "긴급", 1: "높음", 2: "보통", 3: "낮음" };
