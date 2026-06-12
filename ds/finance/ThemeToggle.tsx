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
      className="size-9 rounded-full grid place-items-center transition-colors"
      style={{
        color: "var(--bm-muted)",
        background: "transparent",
      }}
    >
      <AppIcon name={isDark ? "sun" : "moon"} size={18} strokeWidth={1.8} />
    </button>
  );
}
