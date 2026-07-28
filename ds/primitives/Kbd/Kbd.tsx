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
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { keys, className, children, ...props },
  ref,
) {
  return (
    <kbd
      ref={ref}
      className={cn(
        // bg-gray-50 은 라이트 전용 값이라 다크에서 흰 조각으로 남는다 — surface-soft 가 같은 자리다
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface-soft",
        "px-1.5 py-0.5 text-[11px] font-mono font-medium text-muted whitespace-nowrap",
        // 키캡처럼 보이도록 아래 모서리 + 상단 인셋 하이라이트
        "shadow-[0_1px_0_1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
      {...props}
    >
      {keys ? keys.join("") : children}
    </kbd>
  );
});

Kbd.displayName = "Kbd";
