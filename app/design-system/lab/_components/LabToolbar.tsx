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
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-white px-4">
        {/* Left: Layout selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-medium">
            레이아웃 선택
          </label>
          <select
            value={state.templateId}
            onChange={handleTemplateChange}
            className="h-8 rounded border border-border bg-background px-2 text-xs font-medium"
          >
            {layoutTemplates.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.label}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Viewport toggle */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground font-medium mr-2">
            뷰포트
          </span>
          <div className="flex rounded-md border border-border overflow-hidden">
            {viewportOptions.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleViewportChange(id)}
                title={label}
                className={cn(
                  "flex items-center justify-center h-8 w-9 transition-colors border-r border-border last:border-r-0",
                  state.viewport === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted/60",
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
            title="실행 취소"
            className={cn(
              "flex items-center justify-center h-8 px-2.5 rounded text-xs font-medium transition-colors",
              canUndo
                ? "bg-background border border-border text-foreground hover:bg-muted/60"
                : "bg-muted text-muted-foreground/50 cursor-not-allowed",
            )}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7h8M3 7l3-3M3 7l3 3" />
            </svg>
            <span className="ml-1">실행 취소</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: "REDO" })}
            disabled={!canRedo}
            title="다시 실행"
            className={cn(
              "flex items-center justify-center h-8 px-2.5 rounded text-xs font-medium transition-colors",
              canRedo
                ? "bg-background border border-border text-foreground hover:bg-muted/60"
                : "bg-muted text-muted-foreground/50 cursor-not-allowed",
            )}
          >
            <span className="mr-1">다시 실행</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 7H3M11 7l-3-3M11 7l-3 3" />
            </svg>
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            type="button"
            onClick={() => setShowExporter(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 2v7M4 6l3 3 3-3M2 10v2h10v-2" />
            </svg>
            <span>코드 내보내기</span>
          </button>
        </div>
      </div>

      {showExporter && (
        <CodeExporter onClose={() => setShowExporter(false)} />
      )}
    </>
  );
}
