"use client";
import { useState, useEffect } from "react";
import { SettingsPanel } from "./SettingsPanel";
import type { ReactNode } from "react";

// Import the theme applier
type DensityMode = "compact" | "normal" | "comfortable";
type RadiusPreset = "none" | "sm" | "md" | "lg" | "full";
type SpacingPreset = "tight" | "default" | "relaxed";
type FontScalePreset = "xs" | "sm" | "default" | "lg" | "xl";

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

const SPACING_MULT: Record<SpacingPreset, string> = {
  tight: "0.75",
  default: "1",
  relaxed: "1.25",
};

const FONT_SCALE: Record<FontScalePreset, Record<string, string>> = {
  xs: { "--jds-font-scale": "0.85", "--jds-font-base": "13px" },
  sm: { "--jds-font-scale": "0.92", "--jds-font-base": "14px" },
  default: { "--jds-font-scale": "1", "--jds-font-base": "15px" },
  lg: { "--jds-font-scale": "1.08", "--jds-font-base": "16px" },
  xl: { "--jds-font-scale": "1.15", "--jds-font-base": "17px" },
};

const STORAGE_KEY = "junds-settings";

function loadSettings() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSettings(settings: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* noop */
  }
}

export function FrameworkWrapper({ children }: { children: ReactNode }) {
  const saved = loadSettings();
  const [theme, _setTheme] = useState(saved?.theme ?? "purple");
  const [colorMode, _setColorMode] = useState<"light" | "dark" | "system">(
    saved?.colorMode ?? "system",
  );
  const [density, _setDensity] = useState<DensityMode>(saved?.density ?? "normal");
  const [radius, _setRadius] = useState<RadiusPreset>(saved?.radius ?? "md");
  const [spacing, _setSpacing] = useState<SpacingPreset>(saved?.spacing ?? "default");
  const [fontSize, _setFontSize] = useState<FontScalePreset>(saved?.fontSize ?? "default");

  // Persist to localStorage
  useEffect(() => {
    saveSettings({ theme, colorMode, density, radius, spacing, fontSize });
  }, [theme, colorMode, density, radius, spacing, fontSize]);

  const setTheme = (v: string) => _setTheme(v);
  const setColorMode = (v: "light" | "dark" | "system") => _setColorMode(v);
  const setDensity = (v: DensityMode) => _setDensity(v);
  const setRadius = (v: RadiusPreset) => _setRadius(v);
  const setSpacing = (v: SpacingPreset) => _setSpacing(v);
  const setFontSize = (v: FontScalePreset) => _setFontSize(v);

  // Apply settings to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-density", density);
    root.setAttribute("data-radius", radius);

    const vars: Record<string, string> = {
      ...RADIUS_SCALE[radius],
      ...DENSITY_VARS[density],
      ...FONT_SCALE[fontSize],
      "--jds-spacing-mult": SPACING_MULT[spacing],
    };

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }

    // Apply font base to main content area
    const main = document.querySelector("[data-jds-content]");
    if (main) (main as HTMLElement).style.fontSize = `var(--jds-font-base)`;

    return () => {
      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key);
      }
    };
  }, [density, radius, spacing, fontSize]);

  // Apply theme
  useEffect(() => {
    import("@/ds/tokens/themes").then(({ applyTheme }) => {
      applyTheme(theme);
    });
  }, [theme]);

  // Apply color mode
  useEffect(() => {
    if (colorMode === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      return;
    }
    if (colorMode === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      return;
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [colorMode]);

  return (
    <>
      {children}
      <SettingsPanel
        theme={theme}
        density={density}
        radius={radius}
        spacing={spacing}
        fontSize={fontSize}
        colorMode={colorMode}
        onThemeChange={setTheme}
        onDensityChange={setDensity}
        onRadiusChange={setRadius}
        onSpacingChange={setSpacing}
        onFontSizeChange={setFontSize}
        onColorModeChange={setColorMode}
      />
    </>
  );
}
