"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "ghost" | "outline" | "filled";
export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** 접근성 라벨 */
  label: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  ghost: "hover:bg-gray-100 active:bg-gray-200 text-muted hover:text-foreground",
  outline: "border border-border hover:bg-card-hover text-muted hover:text-foreground",
  filled: "bg-primary text-white hover:bg-primary-hover shadow-sm",
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
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = "ghost", size = "md", label, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "disabled:opacity-50 disabled:pointer-events-none",
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
