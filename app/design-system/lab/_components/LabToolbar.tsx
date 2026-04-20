"use client";

import { useState, useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import { layoutTemplates } from "../_lib/layout-templates";
import type { ViewportPreset } from "../_lib/types";
import { CodeExporter } from "./CodeExporter";

/* ------------------------------------------------------------------ */
/*  Viewport icons (simple SVG)                                        */
/* ------------------------------------------------------------------ */

function DesktopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="2" width="14" height="9" rx="1" />
      <path d="M5 14h6M8 11v3" />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="1" width="10" height="14" rx="1.5" />
      <circle cx="8" cy="13" r="0.5" fill="currentColor" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="1" width="8" height="14" rx="1.5" />
      <circle cx="8" cy="13" r="0.5" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  LabToolbar                                                         */
/* ------------------------------------------------------------------ */

const viewportOptions: { id: ViewportPreset; label: string; Icon: () => React.JSX.Element }[] = [
  { id: "desktop", label: "Desktop", Icon: DesktopIcon },
  { id: "tablet", label: "Tablet", Icon: TabletIcon },
  { id: "mobile", label: "Mobile", Icon: MobileIcon },
];

export function LabToolbar() {
  const { state, dispatch, canUndo, canRedo } = useLab();
  const [showExporter, setShowExporter] = useState(false);

  const handleTemplateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch({ type: "LOAD_TEMPLATE", templateId: e.target.value });
    },
    [dispatch],
  );

  const handleViewportChange = useCallback(
    (viewport: ViewportPreset) => {
      dispatch({ type: "SET_VIEWPORT", viewport });
    },
    [dispatch],
  );

  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        {/* Left: Layout selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <select
              value={state.templateId}
              onChange={handleTemplateChange}
              className="h-8 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none pr-7 transition-all"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b6880' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
            >
              {layoutTemplates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] text-muted hidden sm:block">
            {layoutTemplates.find(t => t.id === state.templateId)?.description}
          </span>
        </div>

        {/* Center: Viewport toggle */}
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-xl bg-gray-100 p-0.5 gap-0.5">
            {viewportOptions.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleViewportChange(id)}
                title={label}
                className={cn(
                  "flex items-center justify-center h-7 w-8 rounded-lg transition-all duration-150 cursor-pointer",
                  state.viewport === id
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-foreground",
                )}
              >
                <Icon />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Undo/Redo + Export */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={!canUndo}
            title="실행 취소 (⌘Z)"
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-lg transition-all cursor-pointer",
              canUndo ? "text-foreground hover:bg-gray-100" : "text-muted/30 cursor-not-allowed",
            )}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" /><path d="M3 13a9 9 0 019-9 9 9 0 016.4 2.6L21 9" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: "REDO" })}
            disabled={!canRedo}
            title="다시 실행 (⌘⇧Z)"
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-lg transition-all cursor-pointer",
              canRedo ? "text-foreground hover:bg-gray-100" : "text-muted/30 cursor-not-allowed",
            )}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" /><path d="M21 13a9 9 0 00-9-9 9 9 0 00-6.4 2.6L3 9" />
            </svg>
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          <button
            type="button"
            onClick={() => setShowExporter(true)}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            코드 내보내기
          </button>
        </div>
      </div>

      {showExporter && (
        <CodeExporter onClose={() => setShowExporter(false)} />
      )}
    </>
  );
}
