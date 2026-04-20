"use client";

import { cn } from "@/ds/utils/cn";

interface DsSearchProps {
  value: string;
  onChange: (value: string) => void;
  onCmdK?: () => void;
}

export function DsSearch({ value, onChange, onCmdK }: DsSearchProps) {
  return (
    <div className="px-3 py-2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-2.5 py-1.5",
          "bg-white/5 border border-white/10",
          "focus-within:border-white/20 focus-within:bg-white/[0.07]",
          "transition-all duration-150",
        )}
      >
        {/* Magnifying glass icon */}
        <svg
          className="w-3.5 h-3.5 text-white/30 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="컴포넌트 검색..."
          className={cn(
            "flex-1 bg-transparent text-[13px] text-white/80",
            "placeholder:text-white/25 outline-none",
            "min-w-0",
          )}
        />

        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-white/30 hover:text-white/60 transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={onCmdK}
            className={cn(
              "flex items-center gap-0.5 shrink-0",
              "text-[10px] text-white/20 font-medium",
              "bg-white/5 rounded px-1.5 py-0.5",
              "hover:bg-white/10 hover:text-white/30 transition-colors",
            )}
          >
            <span>&#8984;K</span>
          </button>
        )}
      </div>
    </div>
  );
}
