"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type CodeVariant = "default" | "primary" | "success" | "warning" | "danger";
export type CodeSize = "sm" | "md" | "lg";

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  /** 색상 변형 */
  variant?: CodeVariant;
  /** 크기 */
  size?: CodeSize;
}

const variantClass: Record<CodeVariant, string> = {
  default: "bg-surface-soft text-foreground border-border",
  primary: "bg-primary-soft text-primary border-primary/30",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
};

const sizeClass: Record<CodeSize, string> = {
  sm: "text-[11px] px-1 py-0",
  md: "text-[12px] px-1.5 py-0.5",
  lg: "text-[13px] px-2 py-1",
};

/**
 * 인라인 코드 프리미티브 (Kbd 보조).
 * @example
 * <Code>npm install</Code>
 * <Code variant="danger">deprecated</Code>
 * @status stable
 * @since 2.3.0
 * @tags data-display
 */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { variant = "default", size = "md", className, children, ...props },
  ref,
) {
  return (
    <code
      ref={ref}
      className={cn(
        "inline-flex items-center font-mono rounded border align-middle",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
});
