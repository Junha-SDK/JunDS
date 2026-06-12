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

/* 테마 플립 시 색이 스냅 대신 ~200ms 크로스페이드 되도록 html 에 잠깐
 * .bm-theme-x 를 붙인다. 실제 트랜지션 규칙은 앱 globals.css 가
 * prefers-reduced-motion: no-preference 안에서 정의 — 모션 감소 사용자는
 * 클래스가 붙어도 아무 효과 없음. */
let crossfadeTimer: ReturnType<typeof setTimeout> | null = null;
function crossfade(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("bm-theme-x");
  if (crossfadeTimer != null) clearTimeout(crossfadeTimer);
  crossfadeTimer = setTimeout(() => {
    root.classList.remove("bm-theme-x");
    crossfadeTimer = null;
  }, 250);
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
    crossfade();
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
