"use client";
import { forwardRef, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface GanttTask {
  /** 태스크 ID */
  id: string;
  /** 태스크 이름 */
  name: string;
  /** 시작일 (Date 또는 ISO) */
  start: Date | string;
  /** 종료일 */
  end: Date | string;
  /** 진행률 0~100 */
  progress?: number;
  /** 색상 */
  color?: string;
  /** 의존성 태스크 ID */
  dependsOn?: string[];
}

export interface GanttChartProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** 태스크 목록 */
  tasks: GanttTask[];
  /** 1일당 px 폭 */
  dayWidth?: number;
  /** 행 높이 */
  rowHeight?: number;
  /** 좌측 라벨 폭 */
  labelWidth?: number;
  /** 태스크 선택 콜백 */
  onSelect?: (task: GanttTask) => void;
}

const DAY_MS = 86400000;

function parseDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function dayDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

/**
 * 간단한 간트 차트 (프로젝트 일정 시각화).
 * @example
 * <GanttChart tasks={[{id:"a",name:"설계",start:"2026-04-01",end:"2026-04-15",progress:60}]} />
 * @status stable
 * @since 2.3.0
 * @tags chart
 */
export const GanttChart = forwardRef<HTMLDivElement, GanttChartProps>(function GanttChart(
  { tasks, dayWidth = 24, rowHeight = 32, labelWidth = 160, onSelect, className, ...props },
  ref,
) {
  const { minDate, totalDays, weeks } = useMemo(() => {
    if (tasks.length === 0) return { minDate: new Date(), totalDays: 0, weeks: [] as Date[] };
    const starts = tasks.map((t) => parseDate(t.start).getTime());
    const ends = tasks.map((t) => parseDate(t.end).getTime());
    const min = new Date(Math.min(...starts));
    min.setHours(0, 0, 0, 0);
    const max = new Date(Math.max(...ends));
    const total = dayDiff(min, max) + 1;
    const weekStarts: Date[] = [];
    for (let i = 0; i < total; i++) {
      const d = new Date(min.getTime() + i * DAY_MS);
      if (d.getDay() === 1 || i === 0) weekStarts.push(d);
    }
    return { minDate: min, totalDays: total, weeks: weekStarts };
  }, [tasks]);

  const totalWidth = totalDays * dayWidth;

  if (tasks.length === 0) {
    return (
      <div ref={ref} className={cn("p-6 text-sm text-muted text-center", className)} {...props}>
        표시할 태스크가 없습니다.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("border border-border rounded-lg overflow-auto bg-surface", className)}
      {...props}
    >
      <div className="flex" style={{ minWidth: labelWidth + totalWidth }}>
        {/* Sticky left labels */}
        <div className="sticky left-0 z-10 bg-surface border-r border-border" style={{ width: labelWidth, minWidth: labelWidth }}>
          <div className="h-8 border-b border-border px-3 flex items-center text-xs font-semibold uppercase text-muted">
            태스크
          </div>
          {tasks.map((t) => (
            <div
              key={t.id}
              className="px-3 flex items-center text-sm truncate border-b border-border/50"
              style={{ height: rowHeight }}
              title={t.name}
            >
              {t.name}
            </div>
          ))}
        </div>
        {/* Timeline */}
        <div style={{ width: totalWidth }}>
          <div className="h-8 border-b border-border relative text-[10px] text-muted">
            {weeks.map((w, i) => {
              const offset = dayDiff(minDate, w) * dayWidth;
              return (
                <div key={i} className="absolute top-0 h-full border-l border-border/50 px-1 flex items-center" style={{ left: offset }}>
                  {w.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                </div>
              );
            })}
          </div>
          {tasks.map((t) => {
            const start = parseDate(t.start);
            const end = parseDate(t.end);
            const offset = dayDiff(minDate, start) * dayWidth;
            const width = Math.max(dayWidth, (dayDiff(start, end) + 1) * dayWidth);
            const progress = Math.max(0, Math.min(100, t.progress ?? 0));
            const bg = t.color ?? "var(--primary)";
            return (
              <div
                key={t.id}
                className="relative border-b border-border/50"
                style={{ height: rowHeight }}
              >
                <button
                  type="button"
                  onClick={() => onSelect?.(t)}
                  className="absolute top-1 bottom-1 rounded-md overflow-hidden text-white text-[11px] font-medium px-2 flex items-center cursor-pointer hover:brightness-110 transition"
                  style={{ left: offset, width, background: bg }}
                  title={`${t.name} (${start.toLocaleDateString()} ~ ${end.toLocaleDateString()})`}
                >
                  <span className="absolute inset-y-0 left-0 bg-black/20" style={{ width: `${progress}%` }} />
                  <span className="relative truncate">{t.name} {progress > 0 && `· ${progress}%`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
