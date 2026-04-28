"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface SwipeActionProps {
  children: ReactNode;
  leftActions?: { label: string; color: string; onClick: () => void }[];
  rightActions?: { label: string; color: string; onClick: () => void }[];
  threshold?: number;
  className?: string;
}

export function SwipeAction({ children, leftActions = [], rightActions = [], threshold = 80, className }: SwipeActionProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging.current) return;
    const delta = e.touches[0].clientX - startX.current;
    const maxLeft = leftActions.length > 0 ? threshold : 0;
    const maxRight = rightActions.length > 0 ? -threshold : 0;
    setOffset(Math.max(maxRight, Math.min(maxLeft, delta)));
  }, [leftActions.length, rightActions.length, threshold]);

  const handleTouchEnd = () => {
    dragging.current = false;
    if (Math.abs(offset) < threshold / 2) setOffset(0);
    else setOffset(offset > 0 ? threshold : -threshold);
  };

  const reset = () => setOffset(0);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex items-stretch">
          {leftActions.map((action, i) => (
            <button key={i} type="button" onClick={() => { action.onClick(); reset(); }}
              className="flex items-center px-4 text-white text-xs font-medium cursor-pointer" style={{ backgroundColor: action.color, width: threshold / leftActions.length }}>
              {action.label}
            </button>
          ))}
        </div>
      )}
      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex items-stretch">
          {rightActions.map((action, i) => (
            <button key={i} type="button" onClick={() => { action.onClick(); reset(); }}
              className="flex items-center px-4 text-white text-xs font-medium cursor-pointer" style={{ backgroundColor: action.color, width: threshold / rightActions.length }}>
              {action.label}
            </button>
          ))}
        </div>
      )}
      {/* Content */}
      <div
        className="relative bg-white transition-transform"
        style={{ transform: `translateX(${offset}px)`, transitionDuration: dragging.current ? "0ms" : "300ms" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
