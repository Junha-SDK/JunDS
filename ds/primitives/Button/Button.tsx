"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ButtonProps } from "./Button.types";

const variantStyles: Record<string, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-sm active:shadow-none hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]",
  secondary:
    "bg-white text-foreground border border-border hover:bg-card-hover hover:shadow-sm active:bg-gray-100",
  danger:
    "bg-danger text-white hover:bg-danger-hover shadow-sm active:shadow-none hover:shadow-md hover:shadow-danger/20",
  ghost:
    "text-foreground hover:bg-gray-100 active:bg-gray-200",
  outline:
    "border border-border text-foreground hover:bg-card-hover active:bg-gray-100",
  link:
    "text-primary hover:underline underline-offset-2 p-0 h-auto",
};

const sizeStyles: Record<string, string> = {
  xs: "h-7 px-2 text-xs gap-1 rounded-md",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-6 text-base gap-2 rounded-xl",
};

/**
 * 범용 버튼 컴포넌트
 * @example
 * <Button variant="primary" size="md">저장</Button>
 * <Button variant="danger" loading>삭제 중...</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:pointer-events-none",
          "cursor-pointer select-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin shrink-0"
            width={size === "xs" ? 12 : size === "sm" ? 14 : 16}
            height={size === "xs" ? 12 : size === "sm" ? 14 : 16}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
