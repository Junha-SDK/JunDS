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
        <div className="rounded-xl border border-border bg-surface p-4 min-w-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
          <p className="text-[11px] uppercase tracking-wider text-muted">오늘</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1 whitespace-nowrap">
            {pagesToday}
            <span className="text-sm font-normal text-muted ml-1">p</span>
          </p>
          {pagesGoal !== undefined && (
            // gray-200/gray-800 대신 border 토큰 — 한 값으로 두 모드를 다 따라간다
            <div
              className="mt-2 h-1 rounded-full bg-border overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(goalPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                // 폭이 자라는 것은 움직임이다 — 감속 요청이면 최종 폭으로 바로 간다
                className="h-full bg-primary rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 min-w-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
          <p className="text-[11px] uppercase tracking-wider text-muted">스트릭</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1 whitespace-nowrap">
            🔥 {streakDays}
            <span className="text-sm font-normal text-muted ml-1">일</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 min-w-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
          <p className="text-[11px] uppercase tracking-wider text-muted">완독</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1 whitespace-nowrap">
            {booksCompleted}
            <span className="text-sm font-normal text-muted ml-1">권</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 min-w-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
          <p className="text-[11px] uppercase tracking-wider text-muted">누적 시간</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1 whitespace-nowrap">
            {hours}
            <span className="text-sm font-normal text-muted ml-0.5">h</span> {minutes}
            <span className="text-sm font-normal text-muted ml-0.5">m</span>
          </p>
        </div>
      </div>
    );
  },
);
ReadingStats.displayName = "ReadingStats";
