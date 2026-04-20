/** junDS 시맨틱 컬러 토큰 — CSS 변수와 1:1 매핑 */
export const colors = {
  primary: {
    DEFAULT: "var(--primary)",
    hover: "var(--primary-hover)",
    light: "var(--primary-light)",
    glow: "var(--primary-glow)",
  },
  accent: {
    DEFAULT: "var(--accent)",
    light: "var(--accent-light)",
  },
  success: {
    DEFAULT: "var(--success)",
    light: "var(--success-light)",
  },
  warning: {
    DEFAULT: "var(--warning)",
    light: "var(--warning-light)",
  },
  danger: {
    DEFAULT: "var(--danger)",
    hover: "var(--danger-hover)",
    light: "var(--danger-light)",
  },
  neutral: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    card: "var(--card)",
    cardHover: "var(--card-hover)",
    border: "var(--border)",
    borderLight: "var(--border-light)",
    muted: "var(--muted)",
    mutedLight: "var(--muted-light)",
  },
  sidebar: {
    bg: "var(--sidebar-bg)",
    hover: "var(--sidebar-hover)",
    text: "var(--sidebar-text)",
    active: "var(--sidebar-active)",
  },
} as const;

/** 우선순위 컬러 맵 */
export const priorityColors = {
  0: { label: "긴급", bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" },
  1: { label: "높음", bg: "#fff7ed", text: "#ea580c", border: "#fdba74" },
  2: { label: "보통", bg: "#fefce8", text: "#ca8a04", border: "#fde047" },
  3: { label: "낮음", bg: "#eff6ff", text: "#2563eb", border: "#93c5fd" },
} as const;

/** 상태 컬러 맵 */
export const statusColors = {
  todo: { bg: "#f3f4f6", text: "#6b7280" },
  progress: { bg: "#dbeafe", text: "#2563eb" },
  review: { bg: "#fef3c7", text: "#d97706" },
  done: { bg: "#d1fae5", text: "#059669" },
  hold: { bg: "#fee2e2", text: "#dc2626" },
} as const;
