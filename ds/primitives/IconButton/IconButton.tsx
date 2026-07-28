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

// 회색 팔레트(gray-50/100/200/300, white)는 다크에서 무너진다 — muted 틴트와 card 토큰은
// 두 모드 모두에서 같은 세기의 hover/press 를 만든다.
const variantStyles: Record<IconButtonVariant, string> = {
  ghost: "text-muted hover:text-foreground hover:bg-muted/10 active:bg-muted/20 active:scale-95",
  outline:
    "border border-border text-muted hover:text-foreground bg-card/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-card-hover hover:border-muted-light hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:bg-muted/15 active:shadow-none active:scale-95",
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
          // transition-all 은 w/h 까지 물어 크기 전환마다 리플로우를 만든다 — 실제로 변하는 것만 지목한다
          "inline-flex items-center justify-center cursor-pointer",
          "transition-[color,background-color,border-color,box-shadow,transform,filter] duration-200 ease-out motion-reduce:transition-none motion-reduce:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
