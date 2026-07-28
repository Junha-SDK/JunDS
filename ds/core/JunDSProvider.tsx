"use client";
import { createContext, useContext, useMemo, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type DensityMode = "compact" | "normal" | "comfortable";
export type RadiusPreset = "none" | "sm" | "md" | "lg" | "full";
export type SpacingPreset = "tight" | "default" | "relaxed";
export type FontScalePreset = "xs" | "sm" | "default" | "lg" | "xl";

export interface JunDSConfig {
  /** 테마 이름 또는 primary 색상 hex */
  theme: string;
  /** 색상 모드 */
  colorMode: "light" | "dark" | "system";
  /** 전역 밀도 */
  density: DensityMode;
  /** 전역 border-radius 프리셋 */
  radius: RadiusPreset;
  /** 전역 간격 배율 */
  spacing: SpacingPreset;
  /** 전역 폰트 크기 프리셋 */
  fontSize: FontScalePreset;
  /** 언어 */
  locale: string;
  /** 다크모드 여부 (계산됨) */
  isDark: boolean;
}

interface JunDSContextValue extends JunDSConfig {
  setTheme: (theme: string) => void;
  setColorMode: (mode: "light" | "dark" | "system") => void;
  setDensity: (density: DensityMode) => void;
  setRadius: (radius: RadiusPreset) => void;
  setSpacing: (spacing: SpacingPreset) => void;
  setFontSize: (size: FontScalePreset) => void;
}

const JunDSContext = createContext<JunDSContextValue | null>(null);

/**
 * JunDS Framework 설정을 읽는 훅.
 * JunDSProvider 외부에서 호출 시 경고와 함께 기본값 반환.
 */
export function useJunDS(): JunDSContextValue {
  const ctx = useContext(JunDSContext);
  if (!ctx) {
    if (typeof window !== "undefined") {
      console.warn(
        "[JunDS] JunDSProvider가 감지되지 않았습니다. " +
          "앱의 루트를 <JunDSProvider>로 감싸주세요.\n" +
          '예: <JunDSProvider theme="purple"><App /></JunDSProvider>',
      );
    }
    // Return safe defaults so components still render
    return {
      theme: "purple",
      colorMode: "system",
      density: "normal",
      radius: "md",
      spacing: "default",
      fontSize: "default",
      locale: "ko",
      isDark: false,
      setTheme: () => {},
      setColorMode: () => {},
      setDensity: () => {},
      setRadius: () => {},
      setSpacing: () => {},
      setFontSize: () => {},
    };
  }
  return ctx;
}

/* ── Radius CSS variable mapping ── */
const RADIUS_SCALE: Record<RadiusPreset, Record<string, string>> = {
  none: {
    "--jds-radius-sm": "0px",
    "--jds-radius-md": "0px",
    "--jds-radius-lg": "0px",
    "--jds-radius-xl": "0px",
  },
  sm: {
    "--jds-radius-sm": "2px",
    "--jds-radius-md": "4px",
    "--jds-radius-lg": "6px",
    "--jds-radius-xl": "8px",
  },
  md: {
    "--jds-radius-sm": "4px",
    "--jds-radius-md": "8px",
    "--jds-radius-lg": "12px",
    "--jds-radius-xl": "16px",
  },
  lg: {
    "--jds-radius-sm": "6px",
    "--jds-radius-md": "12px",
    "--jds-radius-lg": "16px",
    "--jds-radius-xl": "24px",
  },
  full: {
    "--jds-radius-sm": "9999px",
    "--jds-radius-md": "9999px",
    "--jds-radius-lg": "9999px",
    "--jds-radius-xl": "9999px",
  },
};

/* ── Spacing multiplier ── */
const SPACING_MULT: Record<SpacingPreset, number> = {
  tight: 0.75,
  default: 1,
  relaxed: 1.25,
};

/* ── Font scale CSS variable mapping ── */
const FONT_SCALE: Record<FontScalePreset, Record<string, string>> = {
  xs: { "--jds-font-scale": "0.85", "--jds-font-base": "13px" },
  sm: { "--jds-font-scale": "0.92", "--jds-font-base": "14px" },
  default: { "--jds-font-scale": "1", "--jds-font-base": "15px" },
  lg: { "--jds-font-scale": "1.08", "--jds-font-base": "16px" },
  xl: { "--jds-font-scale": "1.15", "--jds-font-base": "17px" },
};

/* ── Density font/padding ── */
const DENSITY_VARS: Record<DensityMode, Record<string, string>> = {
  compact: {
    "--jds-density-px": "8px",
    "--jds-density-py": "4px",
    "--jds-density-text": "0.75rem",
  },
  normal: {
    "--jds-density-px": "16px",
    "--jds-density-py": "8px",
    "--jds-density-text": "0.875rem",
  },
  comfortable: {
    "--jds-density-px": "20px",
    "--jds-density-py": "12px",
    "--jds-density-text": "0.875rem",
  },
};

export interface JunDSProviderProps {
  theme?: string;
  colorMode?: "light" | "dark" | "system";
  density?: DensityMode;
  radius?: RadiusPreset;
  spacing?: SpacingPreset;
  fontSize?: FontScalePreset;
  locale?: string;
  children: ReactNode;
}

export function JunDSProvider({
  theme: initialTheme = "purple",
  colorMode: initialColorMode = "system",
  density: initialDensity = "normal",
  radius: initialRadius = "md",
  spacing: initialSpacing = "default",
  fontSize: initialFontSize = "default",
  locale = "ko",
  children,
}: JunDSProviderProps) {
  const [theme, _setTheme] = useState(initialTheme);
  const [colorMode, _setColorMode] = useState(initialColorMode);
  const [density, _setDensity] = useState(initialDensity);
  const [radius, _setRadius] = useState(initialRadius);
  const [spacing, _setSpacing] = useState(initialSpacing);
  const [fontSize, _setFontSize] = useState(initialFontSize);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    if (colorMode === "light") {
      setIsDark(false);
      return;
    }
    if (colorMode === "dark") {
      setIsDark(true);
      return;
    }
    // system
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [colorMode]);

  // Apply to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    root.setAttribute("data-density", density);
    root.setAttribute("data-radius", radius);

    // Apply CSS variables
    const vars = { ...RADIUS_SCALE[radius], ...DENSITY_VARS[density], ...FONT_SCALE[fontSize] };
    vars["--jds-spacing-mult"] = String(SPACING_MULT[spacing]);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }

    return () => {
      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key);
      }
    };
  }, [isDark, density, radius, spacing, fontSize]);

  // Apply theme
  useEffect(() => {
    // Dynamic import to avoid circular deps
    import("../tokens/themes").then(({ applyTheme }) => {
      applyTheme(theme);
    });
  }, [theme]);

  const value = useMemo<JunDSContextValue>(
    () => ({
      theme,
      colorMode,
      density,
      radius,
      spacing,
      fontSize,
      locale,
      isDark,
      setTheme: _setTheme,
      setColorMode: _setColorMode,
      setDensity: _setDensity,
      setRadius: _setRadius,
      setSpacing: _setSpacing,
      setFontSize: _setFontSize,
    }),
    [theme, colorMode, density, radius, spacing, fontSize, locale, isDark],
  );

  return <JunDSContext.Provider value={value}>{children}</JunDSContext.Provider>;
}
