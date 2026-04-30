"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { SVGAttributes, ReactNode } from "react";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "children"> {
  /** 아이콘 크기 (토큰 또는 px 숫자) */
  size?: IconSize;
  /** 색상 (currentColor 기본) */
  color?: string;
  /** aria-label (없으면 aria-hidden=true) */
  label?: string;
  /** SVG 내부 path/group */
  children: ReactNode;
}

const sizeMap: Record<Exclude<IconSize, number>, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

/**
 * SVG 아이콘 표준 wrapper. 외부 아이콘 셋과 통일된 props 표면.
 * @example
 * <Icon size="md" label="검색"><path d="..." /></Icon>
 * @status stable
 * @since 2.3.0
 * @tags data-display
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { size = "md", color, label, className, viewBox = "0 0 24 24", children, ...props },
  ref,
) {
  const px = typeof size === "number" ? size : sizeMap[size];
  const isDecorative = !label;

  return (
    <svg
      ref={ref}
      width={px}
      height={px}
      viewBox={viewBox}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block shrink-0", className)}
      role={isDecorative ? "presentation" : "img"}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={label}
      {...props}
    >
      {children}
    </svg>
  );
});
