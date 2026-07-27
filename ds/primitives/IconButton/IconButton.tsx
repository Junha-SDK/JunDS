"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "ghost" | "outline" | "filled";
export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 표시할 아이콘 */
  icon: ReactNode;
  /** 버튼 변형 */
  variant?: IconButtonVariant;
  /** 버튼 크기 */
  size?: IconButtonSize;
  /** 접근성 라벨 */
  label: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  ghost: "text-muted hover:text-foreground hover:bg-gray-100/80 active:bg-gray-200/80 active:scale-95",
  outline:
    "border border-border text-muted hover:text-foreground bg-white/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-gray-50 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:bg-gray-100 active:shadow-none active:scale-95",
  filled:
    "bg-primary text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_12px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.1)] hover:brightness-110 active:brightness-95 active:shadow-[0_1px_1px_rgba(0,0,0,0.1)] active:scale-95",
};

const sizeStyles: Record<IconButtonSize, string> = {
  xs: "w-6 h-6 rounded-md",
  sm: "w-7 h-7 rounded-lg",
  md: "w-8 h-8 rounded-lg",
  lg: "w-10 h-10 rounded-xl",
};

/**
 * 아이콘 전용 버튼
 * @example
 * <IconButton icon={<CloseIcon />} label="닫기" variant="ghost" />
 * @status stable
 * @since 2.2.0
 * @tags form, control
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = "ghost", size = "md", label, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200 ease-out cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
