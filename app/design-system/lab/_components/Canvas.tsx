"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import { labComponentMap } from "../_lib/component-registry";
import { viewportSizes } from "../_lib/types";
import { CanvasNodeView } from "./CanvasNode";

export function Canvas() {
  const { state, dispatch } = useLab();
  const canvasRef = useRef<HTMLDivElement>(null);

  const vp = viewportSizes[state.viewport];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const componentId = e.dataTransfer.getData("text/plain");
      if (!componentId || !labComponentMap.get(componentId)) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / state.zoom;
      const y = (e.clientY - rect.top) / state.zoom;

      dispatch({
        type: "ADD_NODE",
        componentId,
        x: Math.max(0, x - 40),
        y: Math.max(0, y - 20),
      });
    },
    [dispatch, state.zoom],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || e.target === (canvasRef.current?.firstChild as HTMLElement)) {
        dispatch({ type: "CLEAR_SELECTION" });
      }
    },
    [dispatch],
  );

  const sortedNodes = Object.values(state.nodes).sort(
    (a, b) => a.zIndex - b.zIndex,
  );

  return (
    <div
      className="flex-1 overflow-auto bg-gray-100 relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {/* Centered viewport frame */}
      <div className="min-h-full flex items-start justify-center p-8">
        <div
          ref={canvasRef}
          className="relative bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden"
          style={{
            width: vp.width * state.zoom,
            height: vp.height * state.zoom,
            transformOrigin: "top left",
          }}
        >
          {/* Scaled inner container */}
          <div
            className="relative"
            style={{
              width: vp.width,
              height: vp.height,
              transform: `scale(${state.zoom})`,
              transformOrigin: "top left",
            }}
          >
            {/* Grid overlay */}
            {state.gridEnabled && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #ddd 1px, transparent 1px)`,
                  backgroundSize: `${state.gridSize}px ${state.gridSize}px`,
                }}
              />
            )}

            {/* Nodes */}
            {sortedNodes.map((node) => (
              <CanvasNodeView
                key={node.id}
                node={node}
                isSelected={state.selectedIds.includes(node.id)}
                zoom={state.zoom}
              />
            ))}

            {/* Empty state */}
            {sortedNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <svg
                    className="mx-auto w-12 h-12 mb-3 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-sm font-medium">
                    좌측에서 컴포넌트를 드래그하세요
                  </p>
                  <p className="text-xs mt-1">
                    또는 더블클릭하여 추가
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Viewport label */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/90 border border-gray-200 rounded-full text-[10px] text-gray-500 shadow-sm">
        {vp.label} {vp.width} x {vp.height} &middot; {Math.round(state.zoom * 100)}%
      </div>
    </div>
  );
}
