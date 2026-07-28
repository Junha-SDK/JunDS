"use client";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../../primitives/Button";
import { IconButton } from "../../primitives/IconButton";
import type { ReactNode, KeyboardEvent } from "react";

/* ─────────────────────────── Types ─────────────────────────── */

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  color?: string;
  /** 시작 시간 */
  time?: string;
  /** 종일 이벤트 */
  allDay?: boolean;
}

export interface CalendarProps {
  /** 이벤트 목록 */
  events?: CalendarEvent[];
  /** 날짜 셀 렌더 */
  renderDay?: (date: Date, events: CalendarEvent[]) => ReactNode;
  /** 날짜 클릭 콜백 */
  onDateClick?: (date: Date) => void;
  /** 추가 클래스 */
  className?: string;

  /** Selected date (single mode) */
  selectedDate?: Date | null;
  /** 단일 날짜 선택 콜백 */
  onDateSelect?: (date: Date) => void;

  /** Selection mode */
  selectionMode?: "single" | "range";
  /** Selected date range (controlled, for range mode) */
  selectedRange?: { start: Date | null; end: Date | null };
  /** 범위 선택 콜백 */
  onRangeSelect?: (range: { start: Date; end: Date }) => void;

  /** Min selectable date */
  minDate?: Date;
  /** Max selectable date */
  maxDate?: Date;

  /** Calendar view mode */
  view?: "month" | "week";
}

/* ─────────────────────────── Helpers ─────────────────────────── */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function toKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function isSameDay(a: Date, b: Date) {
  return toKey(a) === toKey(b);
}
function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  const d = stripTime(date).getTime();
  if (minDate && d < stripTime(minDate).getTime()) return true;
  if (maxDate && d > stripTime(maxDate).getTime()) return true;
  return false;
}
function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const d = stripTime(date).getTime();
  const s = stripTime(start).getTime();
  const e = stripTime(end).getTime();
  const lo = Math.min(s, e);
  const hi = Math.max(s, e);
  return d > lo && d < hi;
}

/* ─────────────────────────── SVG Icons ─────────────────────────── */

const ChevronLeftIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M8.5 3l-4 4 4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ChevronRightIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M5.5 3l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ChevronDownIcon = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    className="inline-block ml-1 transition-transform duration-200 group-data-[open=true]:rotate-180"
  >
    <path
      d="M3 4.5l3 3 3-3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─────────────────────────── MonthPicker ─────────────────────────── */

interface MonthPickerProps {
  year: number;
  month: number;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}

function MonthPicker({ year, month, onSelect, onClose }: MonthPickerProps) {
  const [pickerYear, setPickerYear] = useState(year);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 mt-1 z-50",
        // 떠 있는 패널 — 한 겹 shadow-lg 로는 서지 않는다. 다층 그림자 + 얇은 링
        "bg-card border border-border rounded-2xl p-3 w-[260px]",
        "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-white/10",
        // animate-in / fade-in-0 / zoom-in-95 는 tailwindcss-animate 클래스인데 이
        // 저장소엔 그 플러그인이 없다 — 셋 다 정의가 없어 아무 효과도 없었다.
        // globals.css 에 실재하는 것으로 바꾼다.
        "animate-fade-in-scale motion-reduce:animate-none",
      )}
    >
      {/* Year row */}
      <div className="flex items-center justify-between mb-3">
        <IconButton
          icon={ChevronLeftIcon}
          label="이전 년도"
          size="xs"
          onClick={() => setPickerYear((y) => y - 1)}
        />
        <span className="text-sm font-semibold text-foreground">{pickerYear}년</span>
        <IconButton
          icon={ChevronRightIcon}
          label="다음 년도"
          size="xs"
          onClick={() => setPickerYear((y) => y + 1)}
        />
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-4 gap-1">
        {MONTHS.map((label, i) => {
          const isCurrent = pickerYear === year && i === month;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(pickerYear, i);
                onClose();
              }}
              className={cn(
                "text-xs py-1.5 rounded-lg cursor-pointer transition-colors duration-200",
                // focus: 는 마우스 클릭에도 링을 남긴다 — 키보드 초점에만 반응하는 focus-visible 로
                "hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                isCurrent ? "bg-primary text-white hover:bg-primary" : "text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── CalendarHeader ─────────────────────────── */

interface CalendarHeaderProps {
  year: number;
  month: number;
  view: "month" | "week";
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onMonthSelect: (year: number, month: number) => void;
  onViewChange: (v: "month" | "week") => void;
}

function CalendarHeader({
  year,
  month,
  view,
  onPrev,
  onNext,
  onToday,
  onMonthSelect,
  onViewChange,
}: CalendarHeaderProps) {
  const [showPicker, setShowPicker] = useState(false);
  const monthLabel = `${year}년 ${month + 1}월`;

  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2 relative">
        <button
          type="button"
          data-open={showPicker}
          onClick={() => setShowPicker((v) => !v)}
          className={cn(
            "group text-lg font-semibold text-foreground",
            "hover:text-primary-ink transition-colors duration-200",
            "cursor-pointer flex items-center",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 rounded-lg px-1 -ml-1",
          )}
        >
          {monthLabel}
          {ChevronDownIcon}
        </button>
        <Button variant="ghost" size="xs" onClick={onToday}>
          오늘
        </Button>
        {showPicker && (
          <MonthPicker
            year={year}
            month={month}
            onSelect={onMonthSelect}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* View toggle */}
        <div className="flex items-center bg-border-light rounded-xl p-0.5 mr-2">
          {(["month", "week"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              className={cn(
                // transition-all 은 padding·font-size 까지 전이 대상으로 잡는다
                "text-xs px-2 py-1 rounded-lg cursor-pointer transition-[background-color,color,box-shadow] duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                view === v
                  ? "bg-card text-foreground font-medium ring-1 ring-border shadow-[0_1px_3px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.18)]"
                  : "text-muted hover:text-foreground",
              )}
            >
              {v === "month" ? "월" : "주"}
            </button>
          ))}
        </div>

        <IconButton
          icon={ChevronLeftIcon}
          label={view === "month" ? "이전 달" : "이전 주"}
          size="sm"
          onClick={onPrev}
        />
        <IconButton
          icon={ChevronRightIcon}
          label={view === "month" ? "다음 달" : "다음 주"}
          size="sm"
          onClick={onNext}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── DayCell ─────────────────────────── */

interface DayCellProps {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isSelected: boolean;
  isRangeEndpoint: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  isCompact: boolean;
  renderDay?: (date: Date, events: CalendarEvent[]) => ReactNode;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

function DayCell({
  date,
  events,
  isToday,
  isSelected,
  isRangeEndpoint,
  isInRange: inRange,
  isDisabled,
  isFocused,
  isCompact,
  renderDay,
  onClick,
  onKeyDown,
}: DayCellProps) {
  const isSun = date.getDay() === 0;
  const isSat = date.getDay() === 6;
  const highlighted = isSelected || isRangeEndpoint;

  return (
    <div
      role="gridcell"
      aria-selected={highlighted}
      aria-disabled={isDisabled}
      tabIndex={isFocused ? 0 : -1}
      data-date={toKey(date)}
      onClick={() => {
        if (!isDisabled) onClick();
      }}
      onKeyDown={onKeyDown}
      className={cn(
        "relative min-h-[80px] p-1.5 rounded-lg",
        // 칸이 바꾸는 것은 배경과 그림자뿐이다 — all 은 min-height·padding 까지 끌고 간다
        "transition-[background-color,box-shadow] duration-200",
        // tabIndex 가 붙어 실제로 초점을 받는다. 격자 안이라 안쪽 링을 쓴다
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
        // Hover
        !isDisabled &&
          "cursor-pointer hover:z-10 hover:bg-card hover:shadow-[0_6px_18px_-6px_rgba(0,0,0,0.25),0_2px_6px_-2px_rgba(0,0,0,0.15)]",
        // Range band
        inRange && "bg-[var(--primary-light)]",
        // Disabled
        isDisabled && "opacity-40 cursor-not-allowed hover:shadow-none hover:bg-transparent",
      )}
    >
      {/* Number + today dot */}
      <div className="flex flex-col items-start mb-0.5">
        <span
          className={cn(
            "text-xs font-medium tabular-nums w-6 h-6 flex items-center justify-center rounded-full",
            "transition-[background-color,color,box-shadow] duration-200",
            highlighted &&
              "bg-primary text-white shadow-[0_1px_3px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.2)]",
            !highlighted && isToday && "text-primary-ink font-bold",
            !highlighted && !isToday && isSun && "text-danger",
            // --info 가 정확히 blue-500 이다 — 리터럴 대신 모드를 따라가는 토큰으로
            !highlighted && !isToday && isSat && "text-info",
            !highlighted && !isToday && !isSun && !isSat && "text-foreground",
          )}
        >
          {date.getDate()}
        </span>
        {isToday && !highlighted && (
          <span className="w-1 h-1 rounded-full bg-primary mx-auto -mt-0.5" />
        )}
      </div>

      {/* Events */}
      {renderDay ? (
        renderDay(date, events)
      ) : isCompact ? (
        // Compact / dots mode
        events.length > 0 && (
          <div className="flex items-center gap-0.5 mt-0.5 flex-wrap">
            {events.slice(0, 4).map((ev) => (
              <span
                key={ev.id}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: ev.color || "var(--primary)" }}
              />
            ))}
            {events.length > 4 && (
              <span className="text-[8px] text-muted-light ml-0.5">+{events.length - 4}</span>
            )}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-0.5">
          {events.slice(0, 2).map((ev) => (
            <div
              key={ev.id}
              className={cn(
                "text-[10px] truncate rounded-md px-1 py-0.5 font-medium",
                ev.allDay && "w-full",
              )}
              style={{
                backgroundColor: ev.color ? `${ev.color}20` : "var(--primary-light)",
                color: ev.color || "var(--primary)",
              }}
            >
              {ev.time && !ev.allDay && <span className="opacity-70 mr-0.5">{ev.time}</span>}
              {ev.allDay && <span className="opacity-70 mr-0.5">종일</span>}
              {ev.label}
            </div>
          ))}
          {events.length > 2 && (
            <div className="flex items-center gap-0.5">
              {events.slice(2, 5).map((ev) => (
                <span
                  key={ev.id}
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ev.color || "var(--primary)" }}
                />
              ))}
              <span className="text-[10px] text-muted-light">+{events.length - 2}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── DsCalendar ─────────────────────────── */

/**
 * 월간/주간 캘린더
 * @example
 * <DsCalendar events={events} onDateClick={handleClick} />
 * <DsCalendar selectionMode="range" onRangeSelect={handleRange} />
 * @status stable
 * @since 2.2.0
 * @tags data-display, form
 */
export function DsCalendar({
  events = [],
  renderDay,
  onDateClick,
  className,
  selectedDate: selectedDateProp,
  onDateSelect,
  selectionMode = "single",
  selectedRange: selectedRangeProp,
  onRangeSelect,
  minDate,
  maxDate,
  view: viewProp,
}: CalendarProps) {
  /* ── State ── */
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [view, setView] = useState<"month" | "week">(viewProp ?? "month");

  // Week view anchor: the Sunday that starts the displayed week
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return stripTime(d);
  });

  // Internal single-selection state (uncontrolled fallback)
  const [internalSelected, setInternalSelected] = useState<Date | null>(null);

  // Internal range state (uncontrolled fallback)
  const [internalRange, setInternalRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [rangeStep, setRangeStep] = useState<"start" | "end">("start");

  // Focused cell for keyboard nav
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  // Fade transition flag
  const [fading, setFading] = useState(false);

  // Container ref for ResizeObserver
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  /* ── Derived values ── */
  const effectiveSelected = selectedDateProp !== undefined ? selectedDateProp : internalSelected;
  const effectiveRange = selectedRangeProp !== undefined ? selectedRangeProp : internalRange;

  const today = useMemo(() => new Date(), []);

  // Sync controlled view prop
  useEffect(() => {
    if (viewProp !== undefined) setView(viewProp);
  }, [viewProp]);

  // Responsive observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsCompact(entry.contentRect.width < 300);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Event map ── */
  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    });
    return map;
  }, [events]);

  /* ── Day cells computation ── */
  const monthDays = useMemo(() => {
    const first = new Date(current.year, current.month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(current.year, current.month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [current]);

  const weekDays = useMemo(() => {
    const cells: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAnchor);
      d.setDate(d.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [weekAnchor]);

  const days: (Date | null)[] = view === "month" ? monthDays : weekDays;

  /* ── Navigation helpers ── */
  const withFade = useCallback((fn: () => void) => {
    setFading(true);
    setTimeout(() => {
      fn();
      setFading(false);
    }, 150);
  }, []);

  const prevMonth = useCallback(() => {
    withFade(() => {
      setCurrent((c) =>
        c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 },
      );
    });
  }, [withFade]);

  const nextMonth = useCallback(() => {
    withFade(() => {
      setCurrent((c) =>
        c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 },
      );
    });
  }, [withFade]);

  const prevWeek = useCallback(() => {
    withFade(() => {
      setWeekAnchor((wa) => {
        const d = new Date(wa);
        d.setDate(d.getDate() - 7);
        return d;
      });
    });
  }, [withFade]);

  const nextWeek = useCallback(() => {
    withFade(() => {
      setWeekAnchor((wa) => {
        const d = new Date(wa);
        d.setDate(d.getDate() + 7);
        return d;
      });
    });
  }, [withFade]);

  const handlePrev = view === "month" ? prevMonth : prevWeek;
  const handleNext = view === "month" ? nextMonth : nextWeek;

  const goToday = useCallback(() => {
    const t = new Date();
    setCurrent({ year: t.getFullYear(), month: t.getMonth() });
    const ws = new Date(t);
    ws.setDate(ws.getDate() - ws.getDay());
    setWeekAnchor(stripTime(ws));
  }, []);

  const handleMonthSelect = useCallback((year: number, month: number) => {
    setCurrent({ year, month });
  }, []);

  const handleViewChange = useCallback((v: "month" | "week") => {
    setView(v);
  }, []);

  /* ── Date click ── */
  const handleDateClick = useCallback(
    (date: Date) => {
      if (isDateDisabled(date, minDate, maxDate)) return;

      // Legacy callback always fires
      onDateClick?.(date);

      if (selectionMode === "range") {
        if (rangeStep === "start") {
          // Uncontrolled: update internal state
          setInternalRange({ start: date, end: null });
          setRangeStep("end");
        } else {
          const start = effectiveRange.start!;
          const actualStart = stripTime(start) <= stripTime(date) ? start : date;
          const actualEnd = stripTime(start) <= stripTime(date) ? date : start;
          setInternalRange({ start: actualStart, end: actualEnd });
          setRangeStep("start");
          onRangeSelect?.({ start: actualStart, end: actualEnd });
        }
      } else {
        setInternalSelected(date);
        onDateSelect?.(date);
      }
    },
    [
      selectionMode,
      rangeStep,
      effectiveRange.start,
      minDate,
      maxDate,
      onDateClick,
      onDateSelect,
      onRangeSelect,
    ],
  );

  /* ── Keyboard navigation ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent, date: Date) => {
      let next: Date | null = null;

      switch (e.key) {
        case "ArrowLeft":
          next = new Date(date);
          next.setDate(next.getDate() - 1);
          break;
        case "ArrowRight":
          next = new Date(date);
          next.setDate(next.getDate() + 1);
          break;
        case "ArrowUp":
          next = new Date(date);
          next.setDate(next.getDate() - 7);
          break;
        case "ArrowDown":
          next = new Date(date);
          next.setDate(next.getDate() + 7);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleDateClick(date);
          return;
        default:
          return;
      }

      e.preventDefault();

      if (next) {
        setFocusedDate(next);

        // Auto-navigate if the target leaves the current view
        if (view === "month") {
          if (next.getMonth() !== current.month || next.getFullYear() !== current.year) {
            setCurrent({ year: next.getFullYear(), month: next.getMonth() });
          }
        } else {
          const anchorTime = weekAnchor.getTime();
          const endTime = anchorTime + 7 * 24 * 60 * 60 * 1000;
          const t = stripTime(next).getTime();
          if (t < anchorTime || t >= endTime) {
            const ws = new Date(next);
            ws.setDate(ws.getDate() - ws.getDay());
            setWeekAnchor(stripTime(ws));
          }
        }

        // Focus the DOM element after React re-renders
        requestAnimationFrame(() => {
          const key = toKey(next!);
          const el = containerRef.current?.querySelector(
            `[data-date="${key}"]`,
          ) as HTMLElement | null;
          el?.focus();
        });
      }
    },
    [handleDateClick, current, view, weekAnchor],
  );

  /* ── Header display values ── */
  const headerYear = view === "month" ? current.year : weekDays[0]?.getFullYear() ?? current.year;
  const headerMonth = view === "month" ? current.month : weekDays[0]?.getMonth() ?? current.month;

  /* ── Render ── */
  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full rounded-2xl border border-border bg-card p-4",
        "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.12)]",
        "transition-shadow duration-200",
        className,
      )}
    >
      {/* Header */}
      <CalendarHeader
        year={headerYear}
        month={headerMonth}
        view={view}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={goToday}
        onMonthSelect={handleMonthSelect}
        onViewChange={handleViewChange}
      />

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1 border-b border-border/50 pb-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-xs font-semibold py-1.5 tracking-wide",
              i === 0 ? "text-danger" : i === 6 ? "text-info" : "text-muted",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        role="grid"
        className={cn(
          "grid grid-cols-7 gap-px",
          "transition-opacity duration-300",
          fading ? "opacity-0" : "opacity-100",
        )}
      >
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="min-h-[80px] rounded-lg bg-muted/5" />;
          }

          const key = toKey(date);
          const dayEvents = eventMap.get(key) || [];
          const dateIsToday = isSameDay(date, today);
          const disabled = isDateDisabled(date, minDate, maxDate);

          let selected = false;
          let rangeEndpoint = false;
          let inRangeCell = false;

          if (selectionMode === "range") {
            const isStart = effectiveRange.start ? isSameDay(date, effectiveRange.start) : false;
            const isEnd = effectiveRange.end ? isSameDay(date, effectiveRange.end) : false;
            rangeEndpoint = isStart || isEnd;
            inRangeCell = isInRange(date, effectiveRange.start, effectiveRange.end);
          } else {
            selected = effectiveSelected ? isSameDay(date, effectiveSelected) : false;
          }

          const focused = focusedDate ? isSameDay(date, focusedDate) : false;

          return (
            <DayCell
              key={key}
              date={date}
              events={dayEvents}
              isToday={dateIsToday}
              isSelected={selected}
              isRangeEndpoint={rangeEndpoint}
              isInRange={inRangeCell}
              isDisabled={disabled}
              isFocused={focused}
              isCompact={isCompact}
              renderDay={renderDay}
              onClick={() => handleDateClick(date)}
              onKeyDown={(e) => handleKeyDown(e, date)}
            />
          );
        })}
      </div>
    </div>
  );
}
