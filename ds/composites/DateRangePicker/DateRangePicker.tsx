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
  /** 선택된 날짜 범위 */
  value: DateRange;
  /** 범위 변경 콜백 */
  onChange: (range: DateRange) => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 선택 가능한 최소 날짜 */
  minDate?: Date;
  /** 선택 가능한 최대 날짜 */
  maxDate?: Date;
  /** 추가 클래스 */
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
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
 * @status stable
 * @since 2.2.0
 * @tags form, input
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
    value.start
      ? new Date(value.start.getFullYear(), value.start.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1),
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
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()))
      return true;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()))
      return true;
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
            <div key={w} className="h-7 flex items-center justify-center">
              {w}
            </div>
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
                  "h-8 text-sm tabular-nums transition-colors cursor-pointer relative",
                  "hover:bg-muted/10 active:bg-muted/20",
                  // 날짜 칸은 서로 붙어 있어 offset ring 이 이웃을 덮는다 — inset 으로 건다
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/55 focus-visible:z-10",
                  isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
                  inRange && "bg-primary/10",
                  (isStart || isEnd) &&
                    "bg-primary text-white hover:bg-primary-hover rounded-lg font-medium shadow-[0_1px_3px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.2)]",
                  isToday && !isStart && !isEnd && "font-bold text-primary-ink",
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
        // 트리거는 div 라 기본 포커스를 못 받는다 — 키보드로도 열 수 있어야
        // focus-visible 링이 의미를 갖는다
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        className={cn(
          "flex items-center gap-2 h-9 px-3 border bg-card rounded-xl cursor-pointer",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 ease-out",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          disabled && "opacity-50 cursor-not-allowed",
          open
            ? "border-primary shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]"
            : "border-border hover:border-muted-light",
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted shrink-0">
          <rect
            x="1.5"
            y="2.5"
            width="11"
            height="9.5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M1.5 5.5h11" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M4.5 1v2M9.5 1v2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className={cn("text-sm", displayValue ? "text-foreground" : "text-muted-light")}>
          {displayValue || placeholder}
        </span>
      </div>

      {open && (
        <Portal>
          <div
            ref={ref}
            className={cn(
              "fixed z-50 bg-card border border-border rounded-2xl p-4",
              // 떠 있는 패널 — 한 겹 그림자는 유령이라 다층 + 얇은 링으로 세운다
              "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.04]",
              "animate-fade-in-scale motion-reduce:animate-none",
            )}
            style={{ top: pos.top, left: pos.left }}
            onMouseLeave={() => setHoverDate(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="이전 달"
                className="p-1 rounded-lg text-muted hover:bg-muted/10 hover:text-foreground active:bg-muted/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 4L6 8l4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="다음 달"
                className="p-1 rounded-lg text-muted hover:bg-muted/10 hover:text-foreground active:bg-muted/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* 달력 2개는 528px — 좁은 화면에서 뷰포트를 넘기지 않게 세로로 접는다 */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-[calc(100vw-2rem)] overflow-x-auto overscroll-x-contain">
              {renderCalendar(leftMonth)}
              {renderCalendar(rightMonth)}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
