"use client";
import { forwardRef, useState, useMemo, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface CalendarEvent {
  id: string;
  title: string;
  /** 시작일 (YYYY-MM-DD or ISO) */
  start: string;
  /** 종료일 (포함) — 생략 시 단일 일자 */
  end?: string;
  /** 색상 토큰: primary | success | warning | danger | info | accent */
  color?: "primary" | "success" | "warning" | "danger" | "info" | "accent";
}

export interface CalendarMonthProps {
  /** 표시할 월 (Date — 일은 무시) */
  month: Date;
  /** 월 변경 콜백 (이전/다음 버튼 누름) */
  onMonthChange?: (next: Date) => void;
  /** 선택된 날짜 */
  selectedDate?: Date;
  /** 날짜 선택 콜백 */
  onSelectDate?: (date: Date) => void;
  /** 이벤트 목록 (시작일 기준 그룹핑) */
  events?: CalendarEvent[];
  /** 이벤트 클릭 콜백 */
  onEventClick?: (event: CalendarEvent) => void;
  /** 주의 시작 요일 (0=일, 1=월) — 기본 0 */
  weekStartsOn?: 0 | 1;
  /** 추가 클래스 */
  className?: string;
}

const colorMap: Record<NonNullable<CalendarEvent["color"]>, string> = {
  primary: "bg-primary/15 text-primary-ink",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  accent: "bg-accent/15 text-accent",
};

const dayNamesKo = ["일", "월", "화", "수", "목", "금", "토"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function parseDate(s: string): Date {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * 캘린더 — 월 그리드 + 이벤트 도트 + 키보드 화살표 네비.
 * @example
 * <CalendarMonth month={month} onMonthChange={setMonth} selectedDate={sel} onSelectDate={setSel} events={events} />
 * @status stable
 * @since 2.5.0
 * @tags calendar, layout
 */
export const CalendarMonth = forwardRef<HTMLElement, CalendarMonthProps>(function CalendarMonth(
  {
    month,
    onMonthChange,
    selectedDate,
    onSelectDate,
    events = [],
    onEventClick,
    weekStartsOn = 0,
    className,
  },
  ref,
) {
  const today = useMemo(() => new Date(), []);
  const [focusDate, setFocusDate] = useState<Date>(selectedDate ?? today);

  const cells = useMemo(() => {
    const first = startOfMonth(month);
    const firstWeekday = first.getDay();
    const offset = (firstWeekday - weekStartsOn + 7) % 7;
    const days: Date[] = [];
    // 앞 채움 (이전 달)
    for (let i = offset; i > 0; i--)
      days.push(new Date(month.getFullYear(), month.getMonth(), 1 - i));
    // 이번 달
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    for (let d = 1; d <= last.getDate(); d++)
      days.push(new Date(month.getFullYear(), month.getMonth(), d));
    // 뒤 채움 (6주 = 42칸 채우기)
    while (days.length < 42) {
      const tail = days[days.length - 1];
      days.push(new Date(tail.getFullYear(), tail.getMonth(), tail.getDate() + 1));
    }
    return days;
  }, [month, weekStartsOn]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const start = parseDate(e.start);
      const end = e.end ? parseDate(e.end) : start;
      const cur = new Date(start);
      while (cur <= end) {
        const key = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [events]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      let next = new Date(focusDate);
      if (e.key === "ArrowLeft") next.setDate(next.getDate() - 1);
      else if (e.key === "ArrowRight") next.setDate(next.getDate() + 1);
      else if (e.key === "ArrowUp") next.setDate(next.getDate() - 7);
      else if (e.key === "ArrowDown") next.setDate(next.getDate() + 7);
      else if (e.key === "Home") next = new Date(next.getFullYear(), next.getMonth(), 1);
      else if (e.key === "End") next = new Date(next.getFullYear(), next.getMonth() + 1, 0);
      else if (e.key === "PageUp") next.setMonth(next.getMonth() - 1);
      else if (e.key === "PageDown") next.setMonth(next.getMonth() + 1);
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectDate?.(focusDate);
        return;
      } else return;
      e.preventDefault();
      setFocusDate(next);
      if (next.getMonth() !== month.getMonth() || next.getFullYear() !== month.getFullYear()) {
        onMonthChange?.(new Date(next.getFullYear(), next.getMonth(), 1));
      }
    },
    [focusDate, month, onMonthChange, onSelectDate],
  );

  const headers = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => dayNamesKo[(i + weekStartsOn) % 7]);
  }, [weekStartsOn]);

  return (
    <section
      ref={ref}
      className={cn("rounded-xl border border-border bg-surface p-4", className)}
      aria-label="달력"
    >
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground tabular-nums">
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange?.(addMonths(month, -1))}
            aria-label="이전 달"
            className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-surface-soft cursor-pointer"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onMonthChange?.(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-3 h-8 inline-flex items-center rounded-md text-xs font-medium hover:bg-surface-soft cursor-pointer"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => onMonthChange?.(addMonths(month, 1))}
            aria-label="다음 달"
            className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-surface-soft cursor-pointer"
          >
            ›
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1 text-[11px] text-muted text-center" aria-hidden="true">
        {headers.map((h) => (
          <div key={h} className="py-1">
            {h}
          </div>
        ))}
      </div>

      <div
        role="grid"
        aria-label={`${month.getFullYear()}년 ${month.getMonth() + 1}월 달력`}
        tabIndex={0}
        onKeyDown={handleKey}
        className="grid grid-cols-7 gap-1 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
      >
        {cells.map((d, i) => {
          const isCur = d.getMonth() === month.getMonth();
          const isToday = isSameDay(d, today);
          const isSelected = selectedDate && isSameDay(d, selectedDate);
          const isFocus = isSameDay(d, focusDate);
          const dayEvents =
            eventsByDay.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? [];
          return (
            <div
              key={i}
              role="gridcell"
              aria-selected={isSelected || undefined}
              className={cn(
                "min-h-[64px] rounded-md border border-transparent p-1 text-left flex flex-col gap-0.5 cursor-pointer",
                "hover:border-border-light",
                !isCur && "opacity-40",
                isSelected && "bg-primary/10 border-primary/30",
                isFocus && !isSelected && "border-primary/50",
              )}
              onClick={() => {
                setFocusDate(d);
                onSelectDate?.(d);
              }}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs tabular-nums",
                  isToday && "bg-primary text-white font-bold",
                  !isToday && "text-foreground",
                )}
              >
                {d.getDate()}
              </span>
              <ul className="flex-1 space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEventClick?.(e);
                      }}
                      className={cn(
                        "block w-full truncate text-left px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer hover:opacity-80",
                        colorMap[e.color ?? "primary"],
                      )}
                    >
                      {e.title}
                    </button>
                  </li>
                ))}
                {dayEvents.length > 3 && (
                  <li className="text-[10px] text-muted px-1.5">+{dayEvents.length - 3}</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
});
CalendarMonth.displayName = "CalendarMonth";
