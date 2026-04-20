"use client";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** 점 표시 (텍스트 없이 컬러 점만) */
  dot?: boolean;
  /** 숫자 카운트 모드 */
  count?: number;
  /** 최대 카운트 (초과시 99+) */
  maxCount?: number;
  /** 아이콘 */
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-primary-light text-primary",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-blue-50 text-blue-700",
  outline: "bg-transparent border border-border text-foreground",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-gray-400",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-blue-500",
  outline: "bg-foreground",
};

/**
 * 뱃지 컴포넌트
 * @example
 * <Badge variant="success">완료</Badge>
 * <Badge variant="danger" dot>긴급</Badge>
 * <Badge count={5} variant="danger" />
 */
export function Badge({
  variant = "default",
  size = "md",
  dot,
  count,
  maxCount = 99,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  if (count !== undefined) {
    const display = count > maxCount ? `${maxCount}+` : count;
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold tabular-nums",
          "min-w-[18px] h-[18px] px-1 text-[10px]",
          "bg-danger text-white",
          className,
        )}
        {...props}
      >
        {display}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
