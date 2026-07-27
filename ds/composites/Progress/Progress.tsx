"use client";
import { cn } from "../../utils/cn";

export type ProgressVariant = "default" | "success" | "warning" | "danger";

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export interface ProgressStepsProps {
  current: number;
  total: number;
  labels?: string[];
  className?: string;
}

const barColors: Record<ProgressVariant, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const barSizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

/**
 * 진행 바
 * @example
 * <ProgressBar value={75} showLabel />
 * <ProgressBar value={30} variant="danger" size="lg" />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel,
  label,
  animated,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-xs font-medium text-foreground">{label}</span>}
          {showLabel && <span className="text-xs text-muted tabular-nums">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-gray-100 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]",
          barSizes[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            "bg-gradient-to-b from-white/25 to-white/0 shadow-[0_0_6px_rgba(0,0,0,0.06)]",
            barColors[variant],
            animated && "animate-progress",
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

/**
 * 스텝 진행 표시
 * @example
 * <ProgressSteps current={2} total={4} labels={["접수","진행","검토","완료"]} />
 */
export function ProgressSteps({ current, total, labels, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex items-center gap-0", className)}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isDone = step <= current;
        const isCurrent = step === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  isDone
                    ? "bg-primary text-white shadow-[0_1px_3px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    : "bg-gray-100 text-muted border border-border",
                  isCurrent && "ring-2 ring-primary/30 ring-offset-1",
                )}
              >
                {isDone && step < current ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {labels?.[i] && (
                <span className={cn("text-[10px] mt-1 whitespace-nowrap", isDone ? "text-primary font-medium" : "text-muted")}>
                  {labels[i]}
                </span>
              )}
            </div>
            {i < total - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1 rounded-full transition-colors duration-300",
                  step < current ? "bg-primary" : "bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
