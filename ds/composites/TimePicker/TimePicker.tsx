"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Portal } from "../../primitives/Portal";

export interface TimePickerProps {
  /** "HH:mm" 형식의 시간 값 */
  value?: string;
  onChange: (time: string) => void;
  /** 시간 형식 */
  format?: "12h" | "24h";
  /** 분 단위 간격 */
  minuteStep?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * 시간 선택기
 * @example
 * <TimePicker value={time} onChange={setTime} format="24h" minuteStep={15} />
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
      const displayHour = format === "12h" ? (parsedHour % 12 || 12) : parsedHour;
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
      const displayHour = format === "12h" ? (parsedHour % 12 || 12) : parsedHour;
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
    return format === "12h" ? (parsedHour % 12 || 12) : parsedHour;
  }, [parsedHour, format]);

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
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className={cn("text-sm", value ? "text-foreground" : "text-muted-light")}>
          {displayValue || placeholder}
        </span>
      </div>

      {open && (
        <Portal>
          <div
            ref={ref}
            className="fixed z-50 bg-white border border-border rounded-lg shadow-lg animate-fade-in-scale flex"
            style={{ top: pos.top, left: pos.left }}
          >
            {/* 시 */}
            <div
              ref={hourListRef}
              className="w-16 h-48 overflow-auto border-r border-border py-1 scrollbar-thin"
            >
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourSelect(h)}
                  className={cn(
                    "w-full h-8 text-sm text-center transition-colors cursor-pointer",
                    "hover:bg-gray-50",
                    displayHourSelected === h && "bg-primary-light text-primary font-medium",
                  )}
                >
                  {String(h).padStart(2, "0")}
                </button>
              ))}
            </div>

            {/* 분 */}
            <div
              ref={minuteListRef}
              className={cn("w-16 h-48 overflow-auto py-1 scrollbar-thin", format === "12h" && "border-r border-border")}
            >
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteSelect(m)}
                  className={cn(
                    "w-full h-8 text-sm text-center transition-colors cursor-pointer",
                    "hover:bg-gray-50",
                    parsedMinute === m && "bg-primary-light text-primary font-medium",
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
                      "hover:bg-gray-50",
                      period === p && "bg-primary-light text-primary font-medium",
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
