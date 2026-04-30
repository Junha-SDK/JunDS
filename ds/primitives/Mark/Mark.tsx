"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type MarkColor = "yellow" | "blue" | "green" | "pink" | "purple" | "orange";

export interface MarkProps extends HTMLAttributes<HTMLElement> {
  /** 형광펜 색상 */
  color?: MarkColor;
  /** 밑줄형 (배경 대신 underline) */
  underline?: boolean;
}

const bgClass: Record<MarkColor, string> = {
  yellow: "bg-yellow-200/70 text-yellow-900 dark:bg-yellow-500/30 dark:text-yellow-100",
  blue: "bg-blue-200/70 text-blue-900 dark:bg-blue-500/30 dark:text-blue-100",
  green: "bg-green-200/70 text-green-900 dark:bg-green-500/30 dark:text-green-100",
  pink: "bg-pink-200/70 text-pink-900 dark:bg-pink-500/30 dark:text-pink-100",
  purple: "bg-purple-200/70 text-purple-900 dark:bg-purple-500/30 dark:text-purple-100",
  orange: "bg-orange-200/70 text-orange-900 dark:bg-orange-500/30 dark:text-orange-100",
};

const underlineClass: Record<MarkColor, string> = {
  yellow: "decoration-yellow-400",
  blue: "decoration-blue-400",
  green: "decoration-green-400",
  pink: "decoration-pink-400",
  purple: "decoration-purple-400",
  orange: "decoration-orange-400",
};

/**
 * 텍스트 하이라이트 프리미티브 (검색결과/강조).
 * @example
 * <p>이건 <Mark>중요</Mark>한 문장</p>
 * @status stable
 * @since 2.3.0
 * @tags data-display
 */
export const Mark = forwardRef<HTMLElement, MarkProps>(function Mark(
  { color = "yellow", underline = false, className, children, ...props },
  ref,
) {
  return (
    <mark
      ref={ref}
      className={cn(
        underline
          ? `bg-transparent underline decoration-2 underline-offset-2 ${underlineClass[color]}`
          : `rounded-sm px-0.5 ${bgClass[color]}`,
        className,
      )}
      {...props}
    >
      {children}
    </mark>
  );
});
