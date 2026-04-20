"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export type Severity = "ok" | "warn" | "danger" | "info" | "neutral";

export interface SeverityBadgeProps {
  severity: Severity;
  children: ReactNode;
  /** 작은 점만 표시 */
  dot?: boolean;
  /** 크기 */
  size?: "sm" | "md";
  className?: string;
}

const severityStyles: Record<Severity, string> = {
  ok: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  neutral: "bg-gray-100 text-gray-600",
};

const dotColors: Record<Severity, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-gray-400",
};

const sizeStyles: Record<"sm" | "md", string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

/**
 * 심각도 뱃지
 * @description ok/warn/danger/info/neutral 심각도 수준을 시각적으로 표현하는 뱃지 컴포넌트
 * @example
 * <SeverityBadge severity="ok">정상</SeverityBadge>
 * <SeverityBadge severity="danger" dot>오류</SeverityBadge>
 */
export function SeverityBadge({
  severity,
  children,
  dot,
  size = "md",
  className,
}: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        severityStyles[severity],
        sizeStyles[size],
        className,
      )}
    >
      {dot && <span className={cn("w-2 h-2 rounded-full shrink-0", dotColors[severity])} />}
      {children}
    </span>
  );
}
