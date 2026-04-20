"use client";
import { useState, useRef, useMemo } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Portal } from "../../primitives/Portal";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 선택 가능한 최소 날짜 */
  minDate?: Date;
  /** 선택 가능한 최대 날짜 */
  maxDate?: Date;
  className?: string;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${dd}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * 날짜 범위 선택기
 * @example
 * <DateRangePicker value={range} onChange={setRange} />
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "날짜 범위 선택",
  disabled,
  minDate,
  maxDate,
  className,
}: DateRangePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [leftMonth, setLeftMonth] = useState(
    value.start ? new Date(value.start.getFullYear(), value.start.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useClickOutside(ref, () => setOpen(false), open);

  const rightMonth = useMemo(
    () => new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1),
    [leftMonth],
  );

  const handleOpen = () => {
    if (disabled) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(!open);
    setSelecting("start");
  };

  const handlePrevMonth = () => {
    setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1));
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (selecting === "start") {
      onChange({ start: date, end: null });
      setSelecting("end");
    } else {
      if (value.start && date < value.start) {
        onChange({ start: date, end: null });
        setSelecting("end");
      } else {
        onChange({ start: value.start, end: date });
        setSelecting("start");
        setOpen(false);
      }
    }
  };

  const isInRange = (date: Date): boolean => {
    const start = value.start;
    const end = selecting === "end" && hoverDate ? hoverDate : value.end;
    if (!start || !end) return false;
    const from = start < end ? start : end;
    const to = start < end ? end : start;
    return date > from && date < to;
  };

  const isRangeStart = (date: Date): boolean => {
    return !!value.start && isSameDay(date, value.start);
  };

  const isRangeEnd = (date: Date): boolean => {
    if (value.end) return isSameDay(date, value.end);
    if (selecting === "end" && hoverDate) return isSameDay(date, hoverDate);
    return false;
  };

  const displayValue = useMemo(() => {
    if (!value.start) return "";
    const startStr = formatDate(value.start);
    if (!value.end) return startStr;
    return `${startStr} ~ ${formatDate(value.end)}`;
  }, [value]);

  const renderCalendar = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    return (
      <div className="w-64">
        <div className="text-sm font-medium text-center mb-2 text-foreground">
          {year}년 {month + 1}월
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-muted mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="h-7 flex items-center justify-center">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="h-8" />;
            const isDisabled = isDateDisabled(date);
            const isStart = isRangeStart(date);
            const isEnd = isRangeEnd(date);
            const inRange = isInRange(date);
            const isToday = isSameDay(date, today);

            return (
              <button
                key={date.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => selecting === "end" && setHoverDate(date)}
                className={cn(
                  "h-8 text-sm transition-colors cursor-pointer relative",
                  "hover:bg-gray-100",
                  isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
                  inRange && "bg-primary/10",
                  (isStart || isEnd) && "bg-primary text-white hover:bg-primary/90 rounded-md font-medium",
                  isToday && !isStart && !isEnd && "font-bold text-primary",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className={cn(
          "flex items-center gap-2 h-9 px-3 border bg-white rounded-lg transition-all duration-150 cursor-pointer",
          "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow)]",
          disabled && "opacity-50 cursor-not-allowed",
          open ? "border-primary shadow-[0_0_0_3px_var(--primary-glow)]" : "border-border",
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted shrink-0">
          <rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1.5 5.5h11" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className={cn("text-sm", displayValue ? "text-foreground" : "text-muted-light")}>
          {displayValue || placeholder}
        </span>
      </div>

      {open && (
        <Portal>
          <div
            ref={ref}
            className="fixed z-50 bg-white border border-border rounded-lg shadow-lg p-4 animate-fade-in-scale"
            style={{ top: pos.top, left: pos.left }}
            onMouseLeave={() => setHoverDate(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="flex gap-4">
              {renderCalendar(leftMonth)}
              {renderCalendar(rightMonth)}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
