"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
  className?: string;
}

export function ProgressRing({
  value, max = 100, size = 80, strokeWidth = 6,
  color = "var(--primary)", trackColor = "var(--border)",
  children, className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - progress);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {children !== undefined ? (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
          {Math.round(progress * 100)}%
        </div>
      )}
    </div>
  );
}
