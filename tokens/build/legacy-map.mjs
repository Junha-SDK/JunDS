/**
 * v2 → v3 토큰 이름 전량 매핑 (02-tokens §3).
 * 패리티 테스트(tokens/__tests__)가 이 표를 단일 소스로 사용한다.
 * 여기 없는 v2 변수를 발견하면 테스트가 실패해야 한다 — 표를 늘려서 해결할 것.
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
  primary: { DEFAULT: "primary", hover: "primaryHover", light: "primaryLight", glow: "primaryGlow" },
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
