/**
 * Brand Presets — 색상만 바꾸는 `themePresets`보다 한 단계 위.
 * 한 브랜드는 (color theme + radius scale + density + font family)을 묶어
 * "동일 컴포넌트, 다른 정체성"을 즉시 구현한다.
 *
 * 사용:
 *   <BrandProvider brand="ocean">
 *     <App />
 *   </BrandProvider>
 */

import type { ThemePreset } from "./themes";
import { generateTheme } from "./themes";

export type BrandRadius = "sharp" | "default" | "soft" | "pill";
export type BrandDensity = "compact" | "cozy" | "comfortable";
export type BrandFont = "sans" | "serif" | "mono";

export interface BrandPreset {
  /** kebab-case id */
  id: string;
  /** 사용자 노출 이름 */
  label: string;
  /** 한 줄 설명 */
  tagline?: string;
  /** 색상 테마 */
  theme: ThemePreset;
  /** 코너 반경 스케일 */
  radius: BrandRadius;
  /** 밀도 */
  density: BrandDensity;
  /** 본문 폰트 — `--font-sans` 가족을 결정 */
  font: BrandFont;
}

const radiusScale: Record<BrandRadius, { sm: string; md: string; lg: string; xl: string }> = {
  sharp: { sm: "2px", md: "3px", lg: "4px", xl: "6px" },
  default: { sm: "6px", md: "10px", lg: "14px", xl: "20px" },
  soft: { sm: "10px", md: "16px", lg: "22px", xl: "28px" },
  pill: { sm: "999px", md: "999px", lg: "999px", xl: "999px" },
};

const densityScale: Record<
  BrandDensity,
  { px: string; py: string; text: string; spacing: string }
> = {
  compact: { px: "0.5rem", py: "0.25rem", text: "13px", spacing: "0.85" },
  cozy: { px: "0.75rem", py: "0.5rem", text: "14px", spacing: "1" },
  comfortable: { px: "1rem", py: "0.75rem", text: "15px", spacing: "1.15" },
};

const fontFamilyScale: Record<BrandFont, string> = {
  sans: "'Pretendard', 'Inter', -apple-system, 'Segoe UI', sans-serif",
  serif: "'Noto Serif KR', 'Source Serif Pro', Georgia, serif",
  mono: "'JetBrains Mono', 'Geist Mono', ui-monospace, monospace",
};

export const brandPresets: BrandPreset[] = [
  {
    id: "default",
    label: "Default",
    tagline: "JunDS 기본 — 보라 primary, 보통 라운드, cozy 밀도.",
    theme: generateTheme("purple", "퍼플", "#5b4cc7"),
    radius: "default",
    density: "cozy",
    font: "sans",
  },
  {
    id: "ocean",
    label: "Ocean",
    tagline: "차가운 청록 — 핀테크/대시보드용, soft 라운드.",
    theme: generateTheme("ocean", "오션", "#0284c7"),
    radius: "soft",
    density: "cozy",
    font: "sans",
  },
  {
    id: "forest",
    label: "Forest",
    tagline: "따뜻한 녹색 — 컨텐츠/블로그용, sharp 라운드 + serif.",
    theme: generateTheme("forest", "포레스트", "#15803d"),
    radius: "sharp",
    density: "comfortable",
    font: "serif",
  },
  {
    id: "sunset",
    label: "Sunset",
    tagline: "선명한 오렌지 — SNS/커뮤니티용, pill 라운드.",
    theme: generateTheme("sunset", "선셋", "#ea580c"),
    radius: "pill",
    density: "compact",
    font: "sans",
  },
  {
    id: "midnight",
    label: "Midnight",
    tagline: "딥 인디고 — 어두운 테마 우선, mono 폰트.",
    theme: generateTheme("midnight", "미드나잇", "#4f46e5"),
    radius: "default",
    density: "cozy",
    font: "mono",
  },
];

/**
 * 브랜드 프리셋을 DOM에 적용한다. CSS 변수 갱신 + localStorage에 저장.
 * SSR 환경에서는 no-op.
 */
export function applyBrand(brandIdOrPreset: string | BrandPreset): BrandPreset | null {
  if (typeof document === "undefined") return null;
  const preset =
    typeof brandIdOrPreset === "string"
      ? brandPresets.find((b) => b.id === brandIdOrPreset)
      : brandIdOrPreset;
  if (!preset) return null;

  const root = document.documentElement;
  // Theme colors
  root.style.setProperty("--primary", preset.theme.primary);
  root.style.setProperty("--primary-hover", preset.theme.primaryHover);
  root.style.setProperty("--primary-light", preset.theme.primaryLight);
  root.style.setProperty("--primary-glow", preset.theme.primaryGlow);
  root.style.setProperty("--accent", preset.theme.accent);
  root.style.setProperty("--accent-light", preset.theme.accentLight);
  root.style.setProperty("--sidebar-active", preset.theme.sidebarActive);

  // Radius scale (jds-radius-* 변수가 globals.css에 정의됨)
  const r = radiusScale[preset.radius];
  root.style.setProperty("--jds-radius-sm", r.sm);
  root.style.setProperty("--jds-radius-md", r.md);
  root.style.setProperty("--jds-radius-lg", r.lg);
  root.style.setProperty("--jds-radius-xl", r.xl);

  // Density (jds-density-*, jds-spacing-mult)
  const d = densityScale[preset.density];
  root.style.setProperty("--jds-density-px", d.px);
  root.style.setProperty("--jds-density-py", d.py);
  root.style.setProperty("--jds-density-text", d.text);
  root.style.setProperty("--jds-spacing-mult", d.spacing);

  // Font
  root.style.setProperty("--font-sans", fontFamilyScale[preset.font]);

  root.setAttribute("data-brand", preset.id);

  try {
    localStorage.setItem("junds-brand", preset.id);
  } catch {}

  return preset;
}

/** SSR-safe restore — 마운트 후 첫 effect에서 호출하기에 적합. */
export function restoreBrand(): BrandPreset | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("junds-brand");
    if (!saved) return null;
    return applyBrand(saved);
  } catch {
    return null;
  }
}
