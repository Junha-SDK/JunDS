"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export type StatusDotStatus = "success" | "warning" | "danger" | "info" | "neutral" | "pulse";

export interface StatusDotProps {
  /** 상태 종류 */
  status?: StatusDotStatus;
  /** 점 옆에 표시할 라벨 */
  label?: string;
  /** 점 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 클래스 */
  className?: string;
}

const statusColors: Record<StatusDotStatus, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-primary",
  // gray-400 은 다크에서 무너진다 — muted-light 가 두 모드 모두에서 "상태 없음"으로 읽힌다
  neutral: "bg-muted-light",
  // 깜빡임은 움직임이다 — 감속 요청을 받으면 색만 남긴다
  pulse: "bg-success animate-pulse motion-reduce:animate-none",
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
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  { status = "neutral", label, size = "md", className },
  ref,
) {
  return (
    <span ref={ref} className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("rounded-full shrink-0", statusColors[status], sizeMap[size])} />
      {label && <span className="text-xs text-foreground">{label}</span>}
    </span>
  );
});

StatusDot.displayName = "StatusDot";
