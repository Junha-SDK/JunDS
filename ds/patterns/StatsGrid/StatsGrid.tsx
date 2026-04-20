"use client";
import { cn } from "../../utils/cn";
import { StatCard } from "../../composites/StatCard";
import type { StatCardProps } from "../../composites/StatCard";

export interface StatsGridProps {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

const colsMap = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 lg:grid-cols-5",
};

/**
 * 통계 그리드
 * @example
 * <StatsGrid stats={[
 *   { label:"총 업무", value:142, change:"+12%", trend:"up" },
 *   { label:"완료", value:98, change:"+5", trend:"up" },
 *   { label:"진행 중", value:32 },
 *   { label:"지연", value:12, change:"+3", trend:"down" },
 * ]} />
 */
export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  return (
    <div className={cn("grid gap-4", colsMap[columns], className)}>
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}
