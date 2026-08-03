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
        aria-expanded={open}
        className={cn(
          "w-full flex items-center justify-between cursor-pointer group rounded-lg",
          // 포커스 링은 실제로 포커스를 받는 button 에만 건다 — 어두운 레일 위이므로
          // offset 도 레일 색으로 맞춰야 링이 흰 테두리처럼 떠 보이지 않는다
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/70",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg",
        )}
      >
        {/* white/30 은 레일 위에서 3:1 을 못 넘겨 섹션 이름을 읽을 수 없었다 */}
        <span className="text-[10px] font-semibold text-white/55 uppercase tracking-wider group-hover:text-white/80 transition-colors">
          Theme
        </span>
        <svg
          className={cn(
            "w-3 h-3 text-white/55 transition-transform duration-200 group-hover:text-white/80",
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
          // 접힘 애니메이션이 실제로 건드리는 속성만 지목한다 — all 이면 자식이 상속하는
          // 색·그림자까지 전이 대상이 되어 매 프레임 재계산이 붙는다
          "transition-[max-height,opacity,margin] duration-200 ease-in-out overflow-visible",
          open ? "max-h-[200px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0 pointer-events-none",
        )}
      >
        <ThemeSwitcher />
      </div>
    </div>
  );
}
