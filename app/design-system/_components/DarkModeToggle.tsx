"use client";
import { useState, useEffect } from "react";
import { cn } from "@/ds/utils/cn";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("junds-dark");
    if (saved === "true") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("junds-dark", String(next));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
        "hover:bg-white/10",
        // 어두운 레일 위 토글 — offset 을 레일 색으로 맞춰야 링이 뜨지 않는다
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/70",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg",
        dark ? "text-amber-400" : "text-white/60",
      )}
      // title 만으로는 스크린리더가 이름을 읽어 준다는 보장이 없다
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      aria-pressed={dark}
      title={dark ? "라이트 모드" : "다크 모드"}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M14 9.5A6.5 6.5 0 016.5 2 5.5 5.5 0 1014 9.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
