"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface GradientBorderProps {
  children: ReactNode;
  gradient?: string;
  borderWidth?: number;
  rounded?: string;
  animated?: boolean;
  className?: string;
}

export function GradientBorder({
  children,
  gradient = "from-primary via-accent to-primary",
  borderWidth = 2,
  rounded = "rounded-xl",
  animated = false,
  className,
}: GradientBorderProps) {
  return (
    <div
      className={cn(
        "relative p-[var(--bw)]",
        rounded,
        className,
      )}
      style={{ "--bw": `${borderWidth}px` } as React.CSSProperties}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          gradient,
          rounded,
          animated && "animate-[gradient-shift_3s_ease_infinite]",
        )}
        style={animated ? { backgroundSize: "200% 200%" } : undefined}
        aria-hidden="true"
      />
      <div className={cn("relative bg-white", rounded)}>
        {children}
      </div>
      {animated && (
        <style>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      )}
    </div>
  );
}
