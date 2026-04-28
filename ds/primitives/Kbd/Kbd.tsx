"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** 키 조합 (배열이면 + 로 연결) */
  keys?: string[];
}

/**
 * 키보드 단축키 표시
 * @example
 * <Kbd keys={["⌘", "K"]} />
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ keys, className, children, ...props }, ref) {
  return (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex items-center gap-0.5 rounded border border-border bg-gray-50",
        "px-1.5 py-0.5 text-[11px] font-mono font-medium text-muted",
        "shadow-[0_1px_0_1px_rgba(0,0,0,0.04)]",
        className,
      )}
      {...props}
    >
      {keys ? keys.join("") : children}
    </kbd>
  );
});

Kbd.displayName = "Kbd";
