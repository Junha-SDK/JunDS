"use client";
import { forwardRef, useState, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";

export interface SliderProps {
  /** 현재 값 */
  value?: number;
  /** 값 변경 콜백 */
  onChange?: (value: number) => void;
  /** 허용 최소값 */
  min?: number;
  /** 허용 최대값 */
  max?: number;
  /** 증감 단위 */
  step?: number;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 값 표시 */
  showValue?: boolean;
  /** 포맷 함수 */
  formatValue?: (value: number) => string;
  /** 마크 표시 */
  marks?: { value: number; label?: string }[];
  /** 색상 */
  color?: "primary" | "success" | "warning" | "danger";
  /** 슬라이더 크기 */
  size?: "sm" | "md";
  /** 추가 클래스 */
  className?: string;
  /** 스크린리더용 라벨 (기본 "슬라이더") */
  "aria-label"?: string;
  /** 라벨 엘리먼트의 id 참조 */
  "aria-labelledby"?: string;
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

const glowRingMap = {
  primary: "ring-primary/15",
  success: "ring-success/15",
  warning: "ring-warning/15",
  danger: "ring-danger/15",
};

/**
 * 슬라이더/레인지
 * @example
 * <Slider value={50} onChange={setValue} min={0} max={100} showValue />
 * <Slider marks={[{value:0,label:"0%"},{value:50,label:"50%"},{value:100,label:"100%"}]} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
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
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    },
    ref,
  ) => {
    const t = useT();
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    const pct = ((value - min) / (max - min)) * 100;

    const updateValue = useCallback(
      (clientX: number) => {
        if (!trackRef.current || disabled) return;
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        let newVal = min + ratio * (max - min);
        newVal = Math.round(newVal / step) * step;
        newVal = Math.max(min, Math.min(max, newVal));
        onChange?.(newVal);
      },
      [min, max, step, disabled, onChange],
    );

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
          className={cn(
            // 포커스를 실제로 받는 건 tabIndex 가 붙은 이 트랙이다 — 링도 여기에 걸어야 뜬다.
            // bg-gray-200 은 라이트 전용이라 다크에서 트랙이 배경에 묻는다.
            "group relative w-full rounded-full bg-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] cursor-pointer select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            trackH,
          )}
          onMouseDown={handleMouseDown}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={ariaLabelledBy ? undefined : ariaLabel ?? t("ariaSlider")}
          aria-labelledby={ariaLabelledBy}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
        >
          {/* Fill */}
          <div
            className={cn(
              // 실제로 움직이는 건 width 하나다.
              "absolute inset-y-0 left-0 rounded-full bg-gradient-to-b from-white/25 to-white/0",
              "transition-[width] motion-reduce:transition-none",
              colorMap[color],
              !dragging && "duration-150",
            )}
            style={{ width: `${pct}%` }}
          />
          {/* Thumb */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-card border-2",
              "shadow-[0_1px_3px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.08)]",
              // 손잡이가 바꾸는 건 위치·크기·링뿐이다.
              "transition-[left,transform,box-shadow] duration-150 motion-reduce:transition-none",
              thumbSize,
              thumbColorMap[color],
              glowRingMap[color],
              dragging ? "scale-110 ring-4" : "hover:ring-4",
              // 포커스는 트랙이 받으므로 손잡이는 group 을 통해 반응한다.
              "group-focus-visible:ring-4",
            )}
            style={{ left: `${pct}%` }}
          />
          {/* Marks */}
          {marks?.map((mark) => {
            const markPct = ((mark.value - min) / (max - min)) * 100;
            return (
              <div key={mark.value} className="absolute top-full" style={{ left: `${markPct}%` }}>
                {/* gray-300 은 다크에서 밝은 점으로 튄다 — muted 계열이 모드를 따라간다. */}
                <div className="w-0.5 h-1.5 bg-muted-light rounded-full mx-auto mt-1" />
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
