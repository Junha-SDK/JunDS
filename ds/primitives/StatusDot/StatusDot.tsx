"use client";
import { cn } from "../../utils/cn";

export type StatusDotStatus = "success" | "warning" | "danger" | "info" | "neutral" | "pulse";

export interface StatusDotProps {
  status?: StatusDotStatus;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusColors: Record<StatusDotStatus, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-primary",
  neutral: "bg-gray-400",
  pulse: "bg-success animate-pulse",
};

const sizeMap = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

/**
 * 상태 표시 점
 * @example
 * <StatusDot status="success" label="온라인" />
 * <StatusDot status="danger" label="오프라인" />
 */
export function StatusDot({ status = "neutral", label, size = "md", className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("rounded-full shrink-0", statusColors[status], sizeMap[size])} />
      {label && <span className="text-xs text-foreground">{label}</span>}
    </span>
  );
}
