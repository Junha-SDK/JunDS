/**
 * junDS 테마 프리셋
 *
 * 각 테마는 primary HSL 값을 기준으로 파생색을 자동 생성합니다.
 * CSS 변수에 직접 매핑되며, globals.css의 :root 변수를 JS에서 오버라이드합니다.
 *
 * 사용법:
 * applyTheme("blue") — 전체 앱 테마 변경
 * applyTheme({ name:"custom", primary:"#e11d48" }) — 커스텀 색상
 */

export interface ThemePreset {
  name: string;
  label: string;
  primary: string; // hex
  primaryHover: string;
  primaryLight: string;
  primaryGlow: string;
  accent: string;
  accentLight: string;
  sidebarBg: string;
  sidebarHover: string;
  sidebarText: string;
  sidebarActive: string;
}

// ─── hex → rgb 변환 ────────────────────
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const f = 1 - amount;
  return `#${Math.round(r * f)
    .toString(16)
    .padStart(2, "0")}${Math.round(g * f)
    .toString(16)
    .padStart(2, "0")}${Math.round(b * f)
    .toString(16)
    .padStart(2, "0")}`;
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `#${Math.min(255, Math.round(r + (255 - r) * amount))
    .toString(16)
    .padStart(2, "0")}${Math.min(255, Math.round(g + (255 - g) * amount))
    .toString(16)
    .padStart(2, "0")}${Math.min(255, Math.round(b + (255 - b) * amount))
    .toString(16)
    .padStart(2, "0")}`;
}

function toGlow(hex: string, opacity = 0.18): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/** primary hex 하나로 전체 테마 색상 자동 생성 */
export function generateTheme(name: string, label: string, primary: string): ThemePreset {
  return {
    name,
    label,
    primary,
    primaryHover: darken(primary, 0.15),
    primaryLight: lighten(primary, 0.85),
    primaryGlow: toGlow(primary, 0.18),
    accent: lighten(primary, 0.2),
    accentLight: lighten(primary, 0.9),
    sidebarBg: "#1a1726",
    sidebarHover: "#272338",
    sidebarText: "#a09cb0",
    sidebarActive: lighten(primary, 0.25),
  };
}

// ─── 프리셋 테마 ────────────────────────
export const themePresets: ThemePreset[] = [
  // Row 1: 차가운 계열
  generateTheme("purple", "퍼플", "#5b4cc7"),
  generateTheme("indigo", "인디고", "#4f46e5"),
  generateTheme("blue", "블루", "#2563eb"),
  generateTheme("sky", "스카이", "#0284c7"),
  generateTheme("cyan", "시안", "#0891b2"),
  generateTheme("teal", "틸", "#0d9488"),
  // Row 2: 따뜻한 계열
  generateTheme("emerald", "에메랄드", "#059669"),
  generateTheme("green", "그린", "#16a34a"),
  generateTheme("lime", "라임", "#65a30d"),
  generateTheme("amber", "앰버", "#d97706"),
  generateTheme("orange", "오렌지", "#ea580c"),
  generateTheme("red", "레드", "#dc2626"),
  // Row 3: 특수 계열
  generateTheme("rose", "로즈", "#e11d48"),
  generateTheme("pink", "핑크", "#db2777"),
  generateTheme("fuchsia", "푸시아", "#c026d3"),
  generateTheme("violet", "바이올렛", "#7c3aed"),
  generateTheme("slate", "슬레이트", "#475569"),
  generateTheme("zinc", "징크", "#71717a"),
];

// ─── 테마 적용 함수 ────────────────────
export function applyTheme(themeOrName: string | { name: string; primary: string }) {
  let theme: ThemePreset;

  if (typeof themeOrName === "string") {
    const found = themePresets.find((t) => t.name === themeOrName);
    if (!found) return;
    theme = found;
  } else {
    theme = generateTheme(themeOrName.name, themeOrName.name, themeOrName.primary);
  }

  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-hover", theme.primaryHover);
  root.style.setProperty("--primary-light", theme.primaryLight);
  root.style.setProperty("--primary-glow", theme.primaryGlow);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-light", theme.accentLight);
  root.style.setProperty("--sidebar-active", theme.sidebarActive);

  // localStorage에 저장
  try {
    localStorage.setItem(
      "junds-theme",
      JSON.stringify({ name: theme.name, primary: theme.primary }),
    );
  } catch {}
}

/** 저장된 테마 복원 */
export function restoreTheme() {
  try {
    const saved = localStorage.getItem("junds-theme");
    if (saved) {
      const { name, primary } = JSON.parse(saved);
      const preset = themePresets.find((t) => t.name === name);
      if (preset) applyTheme(name);
      else applyTheme({ name, primary });
    }
  } catch {}
}

/** 현재 테마 이름 가져오기 */
export function getCurrentThemeName(): string {
  try {
    const saved = localStorage.getItem("junds-theme");
    if (saved) return JSON.parse(saved).name;
  } catch {}
  return "purple";
}
