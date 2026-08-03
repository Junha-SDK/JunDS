"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface ReadingGoalProps {
  current: number;
  target: number;
  unit?: string;
  label?: string;
  size?: number;
  thickness?: number;
  className?: string;
}

/**
 * 독서 목표 — 원형 진행률.
 * @example
 * <ReadingGoal current={23} target={50} unit="권" label="2026 목표" size={140} />
 * @status stable
 * @since 2.4.0
 * @tags book, feedback
 */
export const ReadingGoal = forwardRef<HTMLDivElement, ReadingGoalProps>(
  (
    { current, target, unit = "권", label = "연간 목표", size = 140, thickness = 10, className },
    ref,
  ) => {
    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - pct / 100);
    const pctRounded = Math.round(pct);
    return (
      <div ref={ref} className={cn("inline-flex flex-col items-center", className)}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            role="progressbar"
            aria-valuenow={pctRounded}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} ${pctRounded}%`}
            className="-rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={thickness}
              // gray-200/gray-800 두 벌 대신 border 토큰 하나로 두 모드를 다 따라간다
              className="stroke-border"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              // 링이 자라는 것은 움직임이다 — 감속 요청이면 최종 각도로 바로 간다
              className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground tabular-nums whitespace-nowrap">
              {current}
              <span className="text-sm font-normal text-muted">/{target}</span>
            </span>
            <span className="text-[11px] text-muted whitespace-nowrap">{unit}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">{label}</p>
      </div>
    );
  },
);
ReadingGoal.displayName = "ReadingGoal";
