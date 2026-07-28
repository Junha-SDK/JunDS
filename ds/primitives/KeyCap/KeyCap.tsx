"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface KeyCapProps extends HTMLAttributes<HTMLElement> {
  /** 키 라벨 (예: "K", "↵", "⌘", "?") */
  children: ReactNode;
  /** 크기 */
  size?: "sm" | "md" | "lg";
  /** 시각 변형 */
  variant?: "default" | "primary" | "muted";
  /** 활성 상태 (눌린 모양) */
  pressed?: boolean;
}

const sizeClass = {
  sm: "h-5 min-w-[20px] px-1 text-[10px]",
  md: "h-6 min-w-[24px] px-1.5 text-xs",
  lg: "h-8 min-w-[32px] px-2 text-sm",
} as const;

const variantClass = {
  default:
    "bg-surface text-foreground border-border shadow-[0_1px_0_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(0,0,0,0.04)]",
  primary: "bg-primary text-white border-primary",
  muted: "bg-surface-soft text-muted border-border-light",
} as const;

/**
 * 키보드 키 모양 칩 — 단축키 안내, ⌘K 같은 명령 표기.
 * `Kbd` primitive와 다르게 작은 키 한 개 모양 + variant 옵션.
 *
 * @example
 *   <span>검색 <KeyCap>⌘</KeyCap><KeyCap>K</KeyCap></span>
 *   <KeyCap variant="primary" size="lg">↵</KeyCap>
 *
 * @status stable
 * @since 2.5.0
 * @tags content
 */
export const KeyCap = forwardRef<HTMLElement, KeyCapProps>(
  ({ children, size = "md", variant = "default", pressed, className, ...props }, ref) => (
    <kbd
      ref={ref as never}
      className={cn(
        // pressed 가 키를 1px 눌러 내리는 움직임이므로 감속 요청을 받는다.
        "inline-flex items-center justify-center font-mono font-medium rounded-md border align-middle whitespace-nowrap",
        "transition-transform duration-100 ease-out motion-reduce:transition-none",
        sizeClass[size],
        variantClass[variant],
        pressed && "translate-y-px shadow-none",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  ),
);
KeyCap.displayName = "KeyCap";
