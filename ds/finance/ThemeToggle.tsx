"use client";

import { useEffect } from "react";
import { useCoreConfig } from "@junds/ui";
import { useThemeMode } from "./lib/themeMode";
import { AppIcon } from "./AppIcon";

export function ThemeToggle() {
  const { mode, toggle, hydrated } = useThemeMode();
  const core = useCoreConfig();

  useEffect(() => {
    if (!hydrated) return;
    if (core.colorMode !== mode) core.setColorMode(mode);
  }, [mode, hydrated, core]);

  if (!hydrated) {
    return <span className="size-9 inline-block" aria-hidden />;
  }

  const isDark = mode === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      // AppHeader 의 아이콘 버튼과 같은 형태 — 누를 수 있는 것에는 hover·active·focus-visible 이 전부 있어야 한다
      className="size-9 shrink-0 rounded-full grid place-items-center cursor-pointer transition-[background-color,color,opacity] hover:bg-[color:var(--bm-soft-100)] hover:text-[color:var(--bm-text)] active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bm-accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bm-bg)]"
      style={{
        color: "var(--bm-muted)",
        background: "transparent",
      }}
    >
      <AppIcon name={isDark ? "sun" : "moon"} size={18} strokeWidth={1.8} />
    </button>
  );
}
