"use client";

import { useState } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/store";
import { CodeExporter } from "./CodeExporter";

export function LabToolbar() {
  const { state, dispatch } = useLab();
  const [showExporter, setShowExporter] = useState(false);

  const nodeCount = Object.keys(state.nodes).length;

  function handleClear() {
    if (nodeCount === 0) return;
    const ok = window.confirm("모든 컴포넌트를 초기화하시겠습니까?");
    if (ok) {
      dispatch({ type: "CLEAR_ALL" });
    }
  }

  return (
    <>
      <header
        className={cn(
          "h-11 shrink-0 flex items-center justify-between px-4",
          "bg-card border-b border-border",
        )}
      >
        {/* Left: title */}
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[var(--primary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2 2 0 01-2 2H7a2 2 0 01-2-2v-2.5"
            />
          </svg>
          <span className="text-sm font-semibold text-foreground">실험실</span>
        </div>

        {/* Center: node count */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <span
            className={cn(
              "text-[11px] font-medium text-[var(--muted)] px-2.5 py-1 rounded-full",
              "bg-[var(--background)] border border-border",
            )}
          >
            컴포넌트 {nodeCount}개
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={nodeCount === 0}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-lg",
              "text-[var(--muted)] hover:text-foreground hover:bg-[var(--background)]",
              "transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            초기화
          </button>
          <button
            type="button"
            onClick={() => setShowExporter(true)}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-lg",
              "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
              "transition-colors",
            )}
          >
            코드 내보내기
          </button>
        </div>
      </header>

      {showExporter && (
        <CodeExporter onClose={() => setShowExporter(false)} />
      )}
    </>
  );
}
