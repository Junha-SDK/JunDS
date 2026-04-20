"use client";

import { useState } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import type { ViewportPreset } from "../_lib/types";
import { CodeExporter } from "./CodeExporter";

const viewportOptions: { value: ViewportPreset; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

export function LabToolbar() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useLab();
  const [showExporter, setShowExporter] = useState(false);

  return (
    <>
      <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
        {/* Left: Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="실행 취소"
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer",
              canUndo
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed",
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6.69 3L3 13" />
            </svg>
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="다시 실행"
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer",
              canRedo
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed",
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 019-9 9 9 0 016.69 3L21 13" />
            </svg>
          </button>
        </div>

        {/* Center: Mode, Grid, Viewport */}
        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_MODE", mode: "freeform" })}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer",
                state.mode === "freeform"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              자유배치
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_MODE", mode: "flow" })}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer",
                state.mode === "flow"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              흐름배치
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Grid toggle */}
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_GRID" })}
            title={state.gridEnabled ? "그리드 끄기" : "그리드 켜기"}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer",
              state.gridEnabled
                ? "text-blue-500 bg-blue-50"
                : "text-gray-400 hover:bg-gray-100",
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>

          {/* Grid size */}
          {state.gridEnabled && (
            <select
              value={state.gridSize}
              onChange={(e) =>
                dispatch({ type: "SET_GRID_SIZE", size: Number(e.target.value) })
              }
              className="h-7 px-1.5 text-[11px] border border-gray-200 rounded-md bg-white cursor-pointer focus:border-blue-500 focus:outline-none"
            >
              <option value={4}>4px</option>
              <option value={8}>8px</option>
              <option value={16}>16px</option>
              <option value={24}>24px</option>
              <option value={32}>32px</option>
            </select>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Viewport selector */}
          <select
            value={state.viewport}
            onChange={(e) =>
              dispatch({
                type: "SET_VIEWPORT",
                viewport: e.target.value as ViewportPreset,
              })
            }
            className="h-7 px-2 text-[11px] border border-gray-200 rounded-md bg-white cursor-pointer focus:border-blue-500 focus:outline-none"
          >
            {viewportOptions.map((vp) => (
              <option key={vp.value} value={vp.value}>
                {vp.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Zoom + Export */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "SET_ZOOM",
                  zoom: Math.max(0.25, state.zoom - 0.25),
                })
              }
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
            >
              -
            </button>
            <span className="w-10 text-center text-[11px] text-gray-600 tabular-nums">
              {Math.round(state.zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "SET_ZOOM",
                  zoom: Math.min(3, state.zoom + 0.25),
                })
              }
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
            >
              +
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Export button */}
          <button
            type="button"
            onClick={() => setShowExporter(true)}
            className="h-7 px-3 text-[11px] font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
              <polyline points="13 2 13 9 20 9" />
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
