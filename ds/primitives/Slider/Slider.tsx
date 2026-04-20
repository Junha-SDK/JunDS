"use client";
import { forwardRef, useState, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** 값 표시 */
  showValue?: boolean;
  /** 포맷 함수 */
  formatValue?: (value: number) => string;
  /** 마크 표시 */
  marks?: { value: number; label?: string }[];
  /** 색상 */
  color?: "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  className?: string;
}

const colorMap = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const thumbColorMap = {
  primary: "border-primary",
  success: "border-success",
  warning: "border-warning",
  danger: "border-danger",
};

/**
 * 슬라이더/레인지
 * @example
 * <Slider value={50} onChange={setValue} min={0} max={100} showValue />
 * <Slider marks={[{value:0,label:"0%"},{value:50,label:"50%"},{value:100,label:"100%"}]} />
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({
    value = 0,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled,
    showValue,
    formatValue,
    marks,
    color = "primary",
    size = "md",
    className,
  }, ref) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    const pct = ((value - min) / (max - min)) * 100;

    const updateValue = useCallback((clientX: number) => {
      if (!trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      let newVal = min + ratio * (max - min);
      newVal = Math.round(newVal / step) * step;
      newVal = Math.max(min, Math.min(max, newVal));
      onChange?.(newVal);
    }, [min, max, step, disabled, onChange]);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return;
      setDragging(true);
      updateValue(e.clientX);
      const handleMouseMove = (e: MouseEvent) => updateValue(e.clientX);
      const handleMouseUp = () => {
        setDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      let newVal = value;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") newVal = Math.min(max, value + step);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") newVal = Math.max(min, value - step);
      else if (e.key === "Home") newVal = min;
      else if (e.key === "End") newVal = max;
      else return;
      e.preventDefault();
      onChange?.(newVal);
    };

    const display = formatValue ? formatValue(value) : value;
    const trackH = size === "sm" ? "h-1" : "h-1.5";
    const thumbSize = size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";

    return (
      <div ref={ref} className={cn("w-full", disabled && "opacity-50", className)}>
        {showValue && (
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-muted">{min}</span>
            <span className="text-xs font-semibold text-foreground">{display}</span>
            <span className="text-xs text-muted">{max}</span>
          </div>
        )}
        <div
          ref={trackRef}
          className={cn("relative w-full rounded-full bg-gray-200 cursor-pointer select-none", trackH)}
          onMouseDown={handleMouseDown}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
        >
          {/* Fill */}
          <div
            className={cn("absolute inset-y-0 left-0 rounded-full transition-all", colorMap[color], !dragging && "duration-150")}
            style={{ width: `${pct}%` }}
          />
          {/* Thumb */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-2 shadow-sm",
              "transition-shadow",
              thumbSize,
              thumbColorMap[color],
              dragging ? "shadow-md scale-110" : "hover:shadow-md",
              "focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
            style={{ left: `${pct}%` }}
          />
          {/* Marks */}
          {marks?.map((mark) => {
            const markPct = ((mark.value - min) / (max - min)) * 100;
            return (
              <div key={mark.value} className="absolute top-full" style={{ left: `${markPct}%` }}>
                <div className="w-0.5 h-1.5 bg-gray-300 mx-auto mt-1" />
                {mark.label && (
                  <span className="text-[10px] text-muted -translate-x-1/2 block text-center mt-0.5 whitespace-nowrap">
                    {mark.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

Slider.displayName = "Slider";
