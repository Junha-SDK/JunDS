"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface StatCardProps {
  /** 지표 라벨 */
  label: string;
  /** 표시할 값 */
  value: string | number;
  /** 변화량 (+12%, -5 등) */
  change?: string;
  /** 변화 방향 */
  trend?: "up" | "down" | "neutral";
  /** 우측 아이콘 */
  icon?: ReactNode;
  /** 부가 설명 */
  description?: string;
  /** 클릭 가능 */
  onClick?: () => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 통계 카드
 * @example
 * <StatCard label="총 업무" value={142} change="+12%" trend="up" />
 * <StatCard label="완료율" value="78%" change="-3%" trend="down" />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  description,
  onClick,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-border rounded-xl p-4 transition-all",
        onClick && "cursor-pointer card-hover",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">{label}</span>
        {icon && <span className="text-muted-light">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
        {change && (
          <span
            className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded-md mb-0.5",
              trend === "up" && "text-success bg-success-light",
              trend === "down" && "text-danger bg-danger-light",
              trend === "neutral" && "text-muted bg-gray-100",
              !trend && "text-muted",
            )}
          >
            {trend === "up" && "↑"}{trend === "down" && "↓"}{change}
          </span>
        )}
      </div>
      {description && <p className="text-xs text-muted mt-1">{description}</p>}
    </div>
  );
}
