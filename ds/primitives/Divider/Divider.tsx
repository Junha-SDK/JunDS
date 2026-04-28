"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  /** 구분선 위에 라벨 */
  label?: string;
  className?: string;
}

/**
 * 구분선
 * @example
 * <Divider />
 * <Divider label="또는" />
 * <Divider orientation="vertical" />
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider({ orientation = "horizontal", label, className }, ref) {
  if (orientation === "vertical") {
    return <div ref={ref} className={cn("w-px bg-border self-stretch", className)} role="separator" />;
  }

  if (label) {
    return (
      <div ref={ref} className={cn("flex items-center gap-3", className)} role="separator">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-light font-medium shrink-0">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return <div ref={ref} className={cn("h-px bg-border w-full", className)} role="separator" />;
});

Divider.displayName = "Divider";
