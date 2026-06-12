"use client";

import { useEffect, useState } from "react";

const KEY = "buttermoney.accent.v1";
export const DEFAULT_ACCENT = "#14b8a6";

export type AccentPreset = {
  id: string;
  label: string;
  hex: string;
};

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "mint", label: "민트", hex: "#14b8a6" },
  { id: "emerald", label: "에메랄드", hex: "#10b981" },
  { id: "blue", label: "블루", hex: "#3b82f6" },
  { id: "indigo", label: "인디고", hex: "#6366f1" },
  { id: "violet", label: "바이올렛", hex: "#8b5cf6" },
  { id: "pink", label: "핑크", hex: "#ec4899" },
  { id: "rose", label: "로즈", hex: "#f43f5e" },
  { id: "orange", label: "오렌지", hex: "#f97316" },
  { id: "amber", label: "앰버", hex: "#f59e0b" },
  { id: "lime", label: "라임", hex: "#84cc16" },
  { id: "slate", label: "슬레이트", hex: "#475569" },
];

function clamp(v: number, lo = 0, hi = 1): number {
  return Math.min(hi, Math.max(lo, v));
}

function normalizeHex(input: string): string | null {
  if (!input) return null;
  let s = input.trim().toLowerCase();
  if (!s.startsWith("#")) s = `#${s}`;
  if (/^#([0-9a-f]{3})$/.test(s)) {
    s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return /^#[0-9a-f]{6}$/.test(s) ? s : null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = normalizeHex(hex) ?? DEFAULT_ACCENT;
  const v = parseInt(n.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => {
    const x = Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");
    return x;
  };
  return `#${c(r)}${c(g)}${c(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
      case gn: h = ((bn - rn) / d + 2); break;
      case bn: h = ((rn - gn) / d + 4); break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp < 1) { r1 = c; g1 = x; }
  else if (hp < 2) { r1 = x; g1 = c; }
  else if (hp < 3) { g1 = c; b1 = x; }
  else if (hp < 4) { g1 = x; b1 = c; }
  else if (hp < 5) { r1 = x; b1 = c; }
  else { r1 = c; b1 = x; }
  const m = l - c / 2;
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

function adjustL(hex: string, l: number): string {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const next = hslToRgb(hsl.h, hsl.s, clamp(l, 0, 1));
  return rgbToHex(next.r, next.g, next.b);
}

function rgbaString(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

export type AccentTokens = {
  accent: string;
  light: string;
  strong: string;
  soft: string;
  softBgLight: string;
  softBgDark: string;
  gradient: string;
  focusRing: string;
};

export function buildAccentTokens(input: string): AccentTokens {
  const accent = normalizeHex(input) ?? DEFAULT_ACCENT;
  const { r, g, b } = hexToRgb(accent);
  const hsl = rgbToHsl(r, g, b);
  const light = adjustL(accent, clamp(hsl.l + 0.18, 0, 0.92));
  const strong = adjustL(accent, clamp(hsl.l - 0.1, 0.18, 0.6));
  const soft = adjustL(accent, clamp(hsl.l + 0.42, 0.78, 0.96));
  return {
    accent,
    light,
    strong,
    soft,
    softBgLight: rgbaString(accent, 0.1),
    softBgDark: rgbaString(accent, 0.18),
    gradient: `linear-gradient(135deg, ${accent} 0%, ${light} 100%)`,
    focusRing: `0 0 0 3px ${rgbaString(accent, 0.35)}`,
  };
}

export function applyAccent(input: string): AccentTokens {
  const tokens = buildAccentTokens(input);
  if (typeof document === "undefined") return tokens;
  const root = document.documentElement;
  root.style.setProperty("--bm-accent", tokens.accent);
  root.style.setProperty("--bm-accent-light", tokens.light);
  root.style.setProperty("--bm-accent-strong", tokens.strong);
  root.style.setProperty("--bm-accent-soft", tokens.soft);
  const isDark = root.getAttribute("data-theme") === "dark";
  root.style.setProperty(
    "--bm-accent-soft-bg",
    isDark ? tokens.softBgDark : tokens.softBgLight,
  );
  root.style.setProperty("--bm-accent-gradient", tokens.gradient);
  root.style.setProperty("--bm-focus-ring", tokens.focusRing);
  root.style.setProperty("--bm-accent-soft-bg-light", tokens.softBgLight);
  root.style.setProperty("--bm-accent-soft-bg-dark", tokens.softBgDark);
  return tokens;
}

export function readAccent(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  try {
    const v = window.localStorage.getItem(KEY);
    const norm = v ? normalizeHex(v) : null;
    return norm ?? DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

export function isValidHex(input: string): boolean {
  return normalizeHex(input) !== null;
}

export function useAccent() {
  const [color, setColor] = useState<string>(DEFAULT_ACCENT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const c = readAccent();
    setColor(c);
    applyAccent(c);
    setHydrated(true);
    const handler = (e: StorageEvent) => {
      if (e.key === KEY) {
        const next = e.newValue ? normalizeHex(e.newValue) : null;
        const v = next ?? DEFAULT_ACCENT;
        setColor(v);
        applyAccent(v);
      }
    };
    const themeObserver = new MutationObserver(() => {
      applyAccent(readAccent());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
      themeObserver.disconnect();
    };
  }, []);

  function set(input: string) {
    const norm = normalizeHex(input);
    if (!norm) return false;
    setColor(norm);
    applyAccent(norm);
    try {
      window.localStorage.setItem(KEY, norm);
    } catch {
      // ignore
    }
    return true;
  }

  function reset() {
    set(DEFAULT_ACCENT);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }

  return { color, set, reset, hydrated };
}
