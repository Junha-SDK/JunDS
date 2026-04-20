"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { themePresets, applyTheme, restoreTheme, generateTheme, type ThemePreset } from "../tokens/themes";

type ColorMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: string;              // current theme name
  colorMode: ColorMode;
  isDark: boolean;
  setTheme: (name: string) => void;
  setColorMode: (mode: ColorMode) => void;
  setCustomTheme: (primary: string) => void;
  themePreset: ThemePreset | null;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  defaultColorMode?: ColorMode;
}

export function ThemeProvider({ children, defaultTheme = "purple", defaultColorMode = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [colorMode, setColorModeState] = useState<ColorMode>(defaultColorMode);
  const [isDark, setIsDark] = useState(false);

  // Detect OS color scheme
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (colorMode === "system") {
        setIsDark(mq.matches);
        document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
      }
    };
    handleChange();
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [colorMode]);

  // Apply color mode
  useEffect(() => {
    if (colorMode === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else if (colorMode === "light") {
      setIsDark(false);
      document.documentElement.setAttribute("data-theme", "light");
    }
    try { localStorage.setItem("junds-color-mode", colorMode); } catch {}
  }, [colorMode]);

  // Restore on mount
  useEffect(() => {
    restoreTheme();
    try {
      const saved = localStorage.getItem("junds-color-mode");
      if (saved === "light" || saved === "dark" || saved === "system") {
        setColorModeState(saved);
      }
    } catch {}
  }, []);

  const setTheme = useCallback((name: string) => {
    applyTheme(name);
    setThemeState(name);
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const setCustomTheme = useCallback((primary: string) => {
    applyTheme({ name: "custom", primary });
    setThemeState("custom");
  }, []);

  const themePreset = themePresets.find(t => t.name === theme) || null;

  return (
    <ThemeContext.Provider value={{ theme, colorMode, isDark, setTheme, setColorMode, setCustomTheme, themePreset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
