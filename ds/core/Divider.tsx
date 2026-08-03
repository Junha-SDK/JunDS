"use client";
import { cn } from "../utils/cn";
import type { SpacingToken, ColorToken } from "./styleProps";
import { resolveStyleProps } from "./styleProps";

export interface CoreDividerProps {
  orientation?: "horizontal" | "vertical";
  my?: SpacingToken;
  mx?: SpacingToken;
  color?: ColorToken;
  label?: string;
  className?: string;
}

export function CoreDivider({
  orientation = "horizontal",
  my = 4,
  mx,
  color = "border",
  label,
  className,
}: CoreDividerProps) {
  const margin = resolveStyleProps(orientation === "horizontal" ? { my } : { mx });

  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)} style={margin} role="separator">
        <div className="flex-1 h-px" style={{ backgroundColor: `var(--${color})` }} />
        <span className="text-xs text-muted font-medium shrink-0">{label}</span>
        <div className="flex-1 h-px" style={{ backgroundColor: `var(--${color})` }} />
      </div>
    );
  }

  return orientation === "horizontal" ? (
    <hr
      className={cn("border-0 h-px", className)}
      style={{ ...margin, backgroundColor: `var(--${color})` }}
    />
  ) : (
    <div
      className={cn("w-px self-stretch", className)}
      style={{ ...margin, backgroundColor: `var(--${color})` }}
    />
  );
}
