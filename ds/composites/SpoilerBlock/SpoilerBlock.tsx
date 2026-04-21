"use client";

import React, { useState } from "react";
import { cn } from "../../utils";

/**
 * 스포일러 블록 컴포넌트
 *
 * - 블러 오버레이로 콘텐츠 숨김
 * - "스포일러 보기" / "내용 보기" 버튼으로 공개
 * - 부드러운 블러 해제 애니메이션
 * - 숨김 상태에서 aria-hidden 적용
 */
export interface SpoilerBlockProps {
  type?: "spoiler" | "caution";
  label?: string;
  children: React.ReactNode;
  className?: string;
}

const TYPE_CONFIG: Record<
  NonNullable<SpoilerBlockProps["type"]>,
  { defaultLabel: string; bg: string; border: string; badge: string }
> = {
  spoiler: {
    defaultLabel: "스포일러 보기",
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-300 dark:border-slate-600",
    badge: "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-400",
  },
  caution: {
    defaultLabel: "내용 보기",
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-300 dark:border-amber-700",
    badge: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400",
  },
};

export function SpoilerBlock({
  type = "spoiler",
  label,
  children,
  className,
}: SpoilerBlockProps) {
  const [revealed, setRevealed] = useState(false);
  const config = TYPE_CONFIG[type];
  const buttonLabel = label ?? config.defaultLabel;

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 overflow-hidden transition-all duration-300",
        config.bg,
        config.border,
        className,
      )}
    >
      {/* 콘텐츠 */}
      <div
        className={cn(
          "transition-[filter] duration-500 ease-out",
          revealed ? "blur-0" : "blur-md select-none pointer-events-none",
        )}
        aria-hidden={!revealed}
      >
        {children}
      </div>

      {/* 오버레이 버튼 */}
      {!revealed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg transition-colors",
              config.badge,
            )}
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  );
}
