"use client";
import { useState } from "react";
import { cn } from "@/ds/utils/cn";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function CollapsibleTheme() {
  const [open, setOpen] = useState(true);

  return (
    <div className="px-3 py-3 border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between cursor-pointer group"
      >
        <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider group-hover:text-white/50 transition-colors">
          Theme
        </span>
        <svg
          className={cn(
            "w-3 h-3 text-white/30 transition-transform duration-200 group-hover:text-white/50",
            open && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={cn(
          "transition-all duration-200 ease-in-out overflow-visible",
          open ? "max-h-[200px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0 pointer-events-none",
        )}
      >
        <ThemeSwitcher />
      </div>
    </div>
  );
}
