"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface ReadingStatsProps {
  pagesToday: number;
  pagesGoal?: number;
  streakDays: number;
  booksCompleted: number;
  totalMinutes: number;
  className?: string;
}

/**
 * 독서 통계 — 오늘/스트릭/누적/시간.
 * @example
 * <ReadingStats pagesToday={42} pagesGoal={50} streakDays={12} booksCompleted={37} totalMinutes={2840} />
 * @status stable
 * @since 2.4.0
 * @tags book, data-display
 */
export const ReadingStats = forwardRef<HTMLDivElement, ReadingStatsProps>(
  ({ pagesToday, pagesGoal, streakDays, booksCompleted, totalMinutes, className }, ref) => {
    const goalPct = pagesGoal && pagesGoal > 0 ? Math.min(100, (pagesToday / pagesGoal) * 100) : 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return (
      <div ref={ref} className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">오늘</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
            {pagesToday}<span className="text-sm font-normal text-muted ml-1">p</span>
          </p>
          {pagesGoal !== undefined && (
            <div className="mt-2 h-1 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-[width] duration-300" style={{ width: `${goalPct}%` }} />
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">스트릭</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1">🔥 {streakDays}<span className="text-sm font-normal text-muted ml-1">일</span></p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">완독</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1">{booksCompleted}<span className="text-sm font-normal text-muted ml-1">권</span></p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">누적 시간</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
            {hours}<span className="text-sm font-normal text-muted ml-0.5">h</span> {minutes}<span className="text-sm font-normal text-muted ml-0.5">m</span>
          </p>
        </div>
      </div>
    );
  },
);
ReadingStats.displayName = "ReadingStats";
