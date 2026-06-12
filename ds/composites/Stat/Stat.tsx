"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type StatTrend = "up" | "down" | "flat";

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  /** 라벨 */
  label: ReactNode;
  /** 값 */
  value: ReactNode;
  /** 보조 단위/접미사 */
  unit?: string;
  /** 변화율 (%) */
  change?: number;
  /** 트렌드 (자동 계산되지만 override 가능) */
  trend?: StatTrend;
  /** 부가 설명 */
  hint?: ReactNode;
  /** 레이아웃 정렬 */
  align?: "left" | "center";
}

const trendStyles: Record<StatTrend, { color: string; arrow: string }> = {
  up: { color: "text-success", arrow: "↑" },
  down: { color: "text-danger", arrow: "↓" },
  flat: { color: "text-muted", arrow: "—" },
};

/**
 * 단일 메트릭 표시 (StatCard보다 가벼움, 인라인 사용 가능).
 * @example
 * <Stat label="MAU" value="12,800" change={5.2} />
 * @status stable
 * @since 2.3.0
 * @tags data-display
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, unit, change, trend, hint, align = "left", className, ...props },
  ref,
) {
  const finalTrend: StatTrend = trend ?? (change === undefined ? "flat" : change > 0 ? "up" : change < 0 ? "down" : "flat");
  const t = trendStyles[finalTrend];
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1", align === "center" && "items-center text-center", className)}
      {...props}
    >
      <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
        {change !== undefined && (
          <span className={cn("text-xs font-medium tabular-nums", t.color)}>
            {t.arrow} {Math.abs(change)}%
          </span>
        )}
      </div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
});
