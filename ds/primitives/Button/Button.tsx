"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";
import type { ButtonProps } from "./Button.types";

const variantStyles: Record<string, string> = {
  primary:
    "bg-primary text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_12px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.1)] hover:brightness-110 active:brightness-95 active:shadow-[0_1px_1px_rgba(0,0,0,0.1)] active:scale-[0.98]",
  secondary:
    "bg-white text-foreground border border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-gray-50 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:bg-gray-100 active:shadow-none active:scale-[0.98]",
  danger:
    "bg-danger text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_12px_rgba(220,63,63,0.25),0_1px_2px_rgba(0,0,0,0.1)] hover:brightness-110 active:brightness-95 active:scale-[0.98]",
  ghost:
    "text-foreground hover:bg-gray-100/80 active:bg-gray-200/80 active:scale-[0.98]",
  outline:
    "border border-border text-foreground hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 active:scale-[0.98]",
  link:
    "text-primary hover:underline underline-offset-2 decoration-primary/40 hover:decoration-primary p-0 h-auto",
};

const sizeStyles: Record<string, string> = {
  xs: "h-7 px-2.5 text-xs gap-1 rounded-lg",
  sm: "h-8 px-3.5 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-xl",
  lg: "h-11 px-6 text-base gap-2.5 rounded-xl",
};

/**
 * 범용 버튼 컴포넌트
 * @example
 * <Button variant="primary" size="md">저장</Button>
 * <Button variant="danger" loading>삭제 중...</Button>
 * @status stable
 * @since 2.2.0
 * @tags form, control
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
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const Comp = asChild ? Slot : "button";
    const buttonOnlyProps = asChild
      ? {}
      : { disabled: isDisabled, "aria-busy": loading || undefined };

    return (
      <Comp
        ref={ref as never}
        {...buttonOnlyProps}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none",
          "cursor-pointer select-none whitespace-nowrap",
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
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        <Slottable>{children}</Slottable>
        {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
      </Comp>
    );
  },
);

Button.displayName = "Button";
