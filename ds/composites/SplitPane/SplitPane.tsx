"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  direction?: "horizontal" | "vertical";
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export function SplitPane({
  left, right, direction = "horizontal", defaultSize = 50, minSize = 20, maxSize = 80, className,
}: SplitPaneProps) {
  const [size, setSize] = useState(defaultSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const isHoriz = direction === "horizontal";

  const handleMouseDown = () => { dragging.current = true; };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = isHoriz
      ? ((e.clientX - rect.left) / rect.width) * 100
      : ((e.clientY - rect.top) / rect.height) * 100;
    setSize(Math.max(minSize, Math.min(maxSize, pos)));
  }, [isHoriz, minSize, maxSize]);

  const handleMouseUp = () => { dragging.current = false; };

  return (
    <div
      ref={containerRef}
      className={cn("flex overflow-hidden", isHoriz ? "flex-row" : "flex-col", className)}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ height: "100%" }}
    >
      <div className="overflow-auto" style={isHoriz ? { width: `${size}%` } : { height: `${size}%` }}>
        {left}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "shrink-0 bg-border hover:bg-primary/30 transition-colors",
          isHoriz ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
        )}
      />
      <div className="flex-1 overflow-auto">{right}</div>
    </div>
  );
}
