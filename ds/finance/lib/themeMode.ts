"use client";

import { useEffect, useState } from "react";

const KEY = "buttermoney.theme.v1";
export type ThemeMode = "light" | "dark";

function read(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    // ignore
  }
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function apply(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const m = read();
    setMode(m);
    apply(m);
    setHydrated(true);
    const handler = (e: StorageEvent) => {
      if (e.key === KEY && (e.newValue === "dark" || e.newValue === "light")) {
        setMode(e.newValue);
        apply(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  function toggle() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    apply(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // ignore
    }
  }

  return { mode, toggle, hydrated };
}
