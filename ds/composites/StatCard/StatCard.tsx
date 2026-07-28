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
        // bg-white 는 다크에서 라이트 면으로 남는다. 면이 있는 카드라 얕은 그림자 +
        // 상단 인셋 하이라이트로 세운다. 리프트 전이는 .card-hover 가 이미 갖고 있으므로
        // transition-all 로 겹쳐 걸면 padding·height 까지 대상이 되어 리플로우만 늘어난다.
        "bg-card border border-border rounded-xl p-4 transition-colors duration-200",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.12)]",
        onClick && [
          "cursor-pointer card-hover",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ],
        className,
      )}
      onClick={onClick}
      // onClick 만 달린 div 는 키보드로 닿지 않는다 — 닿지 않으면 focus-visible 도 뜨지 않는다.
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="min-w-0 truncate text-xs font-medium text-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="shrink-0 text-muted-light">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="min-w-0 truncate text-2xl font-bold text-foreground tabular-nums">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-lg mb-0.5 whitespace-nowrap tabular-nums",
              trend === "up" && "text-success bg-success-light",
              trend === "down" && "text-danger bg-danger-light",
              // gray-100 은 라이트 전용 — muted 를 옅게 깔면 두 모드에서 같은 무게로 읽힌다.
              trend === "neutral" && "text-muted bg-muted/10",
              !trend && "text-muted",
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {change}
          </span>
        )}
      </div>
      {description && <p className="text-xs text-muted mt-1">{description}</p>}
    </div>
  );
}
