"use client";
import { useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../../primitives/Button";
import { IconButton } from "../../primitives/IconButton";
import type { ReactNode } from "react";

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  color?: string;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  /** 날짜 셀 렌더 */
  renderDay?: (date: Date, events: CalendarEvent[]) => ReactNode;
  onDateClick?: (date: Date) => void;
  className?: string;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) { return n.toString().padStart(2, "0"); }
function toKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function isSameDay(a: Date, b: Date) { return toKey(a) === toKey(b); }

/**
 * 월간 캘린더
 * @example
 * <DsCalendar events={events} onDateClick={handleClick} />
 */
export function DsCalendar({ events = [], renderDay, onDateClick, className }: CalendarProps) {
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const today = new Date();

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    });
    return map;
  }, [events]);

  const days = useMemo(() => {
    const first = new Date(current.year, current.month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(current.year, current.month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [current]);

  const prevMonth = () => {
    setCurrent((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
  };
  const nextMonth = () => {
    setCurrent((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });
  };
  const goToday = () => {
    setCurrent({ year: today.getFullYear(), month: today.getMonth() });
  };

  const monthLabel = `${current.year}년 ${current.month + 1}월`;

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{monthLabel}</h3>
          <Button variant="ghost" size="xs" onClick={goToday}>오늘</Button>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            label="이전 달"
            size="sm"
            onClick={prevMonth}
          />
          <IconButton
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            label="다음 달"
            size="sm"
            onClick={nextMonth}
          />
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={cn("text-center text-xs font-medium py-1.5", i === 0 ? "text-danger" : i === 6 ? "text-blue-500" : "text-muted")}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 border-t border-l border-border">
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="border-r border-b border-border bg-gray-50/50 min-h-[80px]" />;
          }
          const key = toKey(date);
          const dayEvents = eventMap.get(key) || [];
          const isToday = isSameDay(date, today);
          const isSun = date.getDay() === 0;
          const isSat = date.getDay() === 6;

          return (
            <div
              key={key}
              onClick={() => onDateClick?.(date)}
              className={cn(
                "border-r border-b border-border min-h-[80px] p-1 cursor-pointer hover:bg-gray-50 transition-colors",
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday && "bg-primary text-white",
                    !isToday && isSun && "text-danger",
                    !isToday && isSat && "text-blue-500",
                    !isToday && !isSun && !isSat && "text-foreground",
                  )}
                >
                  {date.getDate()}
                </span>
              </div>
              {renderDay ? (
                renderDay(date, dayEvents)
              ) : (
                <div className="flex flex-col gap-0.5">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[10px] truncate rounded px-1 py-0.5 font-medium"
                      style={{
                        backgroundColor: ev.color ? `${ev.color}20` : "var(--primary-light)",
                        color: ev.color || "var(--primary)",
                      }}
                    >
                      {ev.label}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] text-muted-light">+{dayEvents.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
