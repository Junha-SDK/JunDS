"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface ProgressRingProps {
  /** 진행 값 */
  value: number;
  /** 최댓값 */
  max?: number;
  /** 링 크기(px) */
  size?: number;
  /** 선 두께(px) */
  strokeWidth?: number;
  /** 진행 색상 */
  color?: string;
  /** 트랙 배경 색상 */
  trackColor?: string;
  /** 중앙에 표시할 콘텐츠 */
  children?: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 원형 진행률 표시기.
 * @example
 * <ProgressRing value={75} max={100} size={64} strokeWidth={6} />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function ProgressRing({
  value, max = 100, size = 80, strokeWidth = 6,
  color = "var(--primary)", trackColor = "var(--border)",
  children, className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - progress);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {children !== undefined ? (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
          {Math.round(progress * 100)}%
        </div>
      )}
    </div>
  );
}
