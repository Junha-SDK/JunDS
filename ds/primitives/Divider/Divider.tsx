"use client";
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
export function Divider({ orientation = "horizontal", label, className }: DividerProps) {
  if (orientation === "vertical") {
    return <div className={cn("w-px bg-border self-stretch", className)} role="separator" />;
  }

  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)} role="separator">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-light font-medium shrink-0">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return <div className={cn("h-px bg-border w-full", className)} role="separator" />;
}
