"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Portal } from "../../primitives/Portal";

export interface TimePickerProps {
  /** "HH:mm" 형식의 시간 값 */
  value?: string;
  /** 값 변경 콜백 */
  onChange: (time: string) => void;
  /** 시간 형식 */
  format?: "12h" | "24h";
  /** 분 단위 간격 */
  minuteStep?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 시간 선택기
 * @example
 * <TimePicker value={time} onChange={setTime} format="24h" minuteStep={15} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function TimePicker({
  value,
  onChange,
  format = "24h",
  minuteStep = 1,
  disabled,
  placeholder = "시간 선택",
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useClickOutside(ref, () => setOpen(false), open);

  const parsedHour = value ? parseInt(value.split(":")[0], 10) : null;
  const parsedMinute = value ? parseInt(value.split(":")[1], 10) : null;

  const hours = useMemo(() => {
    const max = format === "12h" ? 12 : 24;
    const start = format === "12h" ? 1 : 0;
    return Array.from({ length: max }, (_, i) => i + start);
  }, [format]);

  const minutes = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i < 60; i += minuteStep) result.push(i);
    return result;
  }, [minuteStep]);

  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (format === "12h" && parsedHour !== null) {
      setPeriod(parsedHour >= 12 ? "PM" : "AM");
    }
  }, [format, parsedHour]);

  const handleOpen = () => {
    if (disabled) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (open && hourListRef.current && parsedHour !== null) {
      const displayHour = format === "12h" ? parsedHour % 12 || 12 : parsedHour;
      const idx = hours.indexOf(displayHour);
      if (idx >= 0) hourListRef.current.scrollTop = idx * 32;
    }
    if (open && minuteListRef.current && parsedMinute !== null) {
      const idx = minutes.indexOf(parsedMinute);
      if (idx >= 0) minuteListRef.current.scrollTop = idx * 32;
    }
  }, [open, parsedHour, parsedMinute, hours, minutes, format]);

  const buildTime = (h: number, m: number) => {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleHourSelect = (h: number) => {
    let hour24 = h;
    if (format === "12h") {
      if (period === "AM") hour24 = h === 12 ? 0 : h;
      else hour24 = h === 12 ? 12 : h + 12;
    }
    const m = parsedMinute ?? 0;
    onChange(buildTime(hour24, m));
  };

  const handleMinuteSelect = (m: number) => {
    const h = parsedHour ?? 0;
    onChange(buildTime(h, m));
  };

  const handlePeriodChange = (p: "AM" | "PM") => {
    setPeriod(p);
    if (parsedHour !== null) {
      let hour24: number;
      const displayHour = format === "12h" ? parsedHour % 12 || 12 : parsedHour;
      if (p === "AM") hour24 = displayHour === 12 ? 0 : displayHour;
      else hour24 = displayHour === 12 ? 12 : displayHour + 12;
      const m = parsedMinute ?? 0;
      onChange(buildTime(hour24, m));
    }
  };

  const displayValue = useMemo(() => {
    if (!value) return "";
    if (format === "24h") return value;
    if (parsedHour === null) return value;
    const h12 = parsedHour % 12 || 12;
    const mm = String(parsedMinute ?? 0).padStart(2, "0");
    const p = parsedHour >= 12 ? "PM" : "AM";
    return `${h12}:${mm} ${p}`;
  }, [value, format, parsedHour, parsedMinute]);

  const displayHourSelected = useMemo(() => {
    if (parsedHour === null) return null;
    return format === "12h" ? parsedHour % 12 || 12 : parsedHour;
  }, [parsedHour, format]);

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        // 트리거는 div 이지만 실제로는 버튼이다. 포커스를 받지 못하면 focus-within 스타일도
        // 키보드 사용자에게 절대 보이지 않으므로 role/tabIndex/키 입력을 함께 붙인다.
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={cn(
          "flex items-center gap-2 h-9 px-3 border bg-card rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] cursor-pointer",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          disabled && "opacity-50 cursor-not-allowed",
          open
            ? "border-primary shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]"
            : "border-border hover:border-muted-light/60",
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted shrink-0">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M7 4v3.5l2.5 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className={cn("text-sm", value ? "text-foreground" : "text-muted-light")}>
          {displayValue || placeholder}
        </span>
      </div>

      {open && (
        <Portal>
          <div
            ref={ref}
            className="fixed z-50 bg-card border border-border rounded-xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35),0_4px_12px_-6px_rgba(0,0,0,0.2)] ring-1 ring-border/50 animate-fade-in-scale motion-reduce:animate-none flex overflow-hidden"
            style={{ top: pos.top, left: pos.left }}
          >
            {/* 시 */}
            <div
              ref={hourListRef}
              className="w-16 h-48 overflow-auto overscroll-contain border-r border-border py-1 scrollbar-thin"
            >
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourSelect(h)}
                  className={cn(
                    "w-full h-8 text-sm text-center transition-colors cursor-pointer",
                    "hover:bg-muted/10 active:bg-muted/15",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/55",
                    displayHourSelected === h && "bg-primary-light text-primary-ink font-medium",
                  )}
                >
                  {String(h).padStart(2, "0")}
                </button>
              ))}
            </div>

            {/* 분 */}
            <div
              ref={minuteListRef}
              className={cn(
                "w-16 h-48 overflow-auto overscroll-contain py-1 scrollbar-thin",
                format === "12h" && "border-r border-border",
              )}
            >
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteSelect(m)}
                  className={cn(
                    "w-full h-8 text-sm text-center transition-colors cursor-pointer",
                    "hover:bg-muted/10 active:bg-muted/15",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/55",
                    parsedMinute === m && "bg-primary-light text-primary-ink font-medium",
                  )}
                >
                  {String(m).padStart(2, "0")}
                </button>
              ))}
            </div>

            {/* AM/PM */}
            {format === "12h" && (
              <div className="w-16 h-48 py-1 flex flex-col">
                {(["AM", "PM"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePeriodChange(p)}
                    className={cn(
                      "flex-1 text-sm text-center transition-colors cursor-pointer",
                      "hover:bg-muted/10 active:bg-muted/15",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/55",
                      period === p && "bg-primary-light text-primary-ink font-medium",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
}
