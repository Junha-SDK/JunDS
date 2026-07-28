"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerColor = "primary" | "white" | "muted";

export interface SpinnerProps {
  /** 스피너 크기 */
  size?: SpinnerSize;
  /** 스피너 색상 */
  color?: SpinnerColor;
  /** 추가 클래스 */
  className?: string;
  /** 접근성 라벨 */
  label?: string;
}

const sizeMap: Record<SpinnerSize, number> = { xs: 14, sm: 16, md: 20, lg: 28 };
const colorMap: Record<SpinnerColor, string> = {
  primary: "text-primary-ink",
  white: "text-white",
  muted: "text-muted",
};

/**
 * 로딩 스피너
 * @example
 * <Spinner size="md" />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { size = "md", color = "primary", className, label = "로딩 중" },
  ref,
) {
  const s = sizeMap[size];
  return (
    <svg
      ref={ref}
      // 회전은 움직임이다 — 감속 요청이면 멈춘 링으로 남되 role=status 는 그대로 알린다
      className={cn("animate-spin motion-reduce:animate-none", colorMap[color], className)}
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        d="M12 2a10 10 0 0 1 9.54 6.97"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
});

Spinner.displayName = "Spinner";
