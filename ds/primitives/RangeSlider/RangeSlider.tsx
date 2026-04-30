"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";

export interface RangeSliderProps {
  /** 허용 최소값 */
  min?: number;
  /** 허용 최대값 */
  max?: number;
  /** 증감 단위 */
  step?: number;
  /** 현재 값 [최솟값, 최댓값] */
  value: [number, number];
  /** 값 변경 콜백 */
  onChange: (value: [number, number]) => void;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 양 끝 숫자 라벨 표시 */
  showValues?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 두 핸들로 최소/최대 범위를 지정하는 슬라이더.
 * @example
 * <RangeSlider value={[20, 80]} onChange={setRange} min={0} max={100} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function RangeSlider({
  min = 0, max = 100, step = 1,
  value, onChange, disabled, showValues, className,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const valueFromX = useCallback((clientX: number) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    return Math.round(raw / step) * step;
  }, [min, max, step]);

  const handlePointerDown = (handle: "min" | "max") => (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    setDragging(handle);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const v = valueFromX(e.clientX);
    if (dragging === "min") onChange([Math.min(v, value[1] - step), value[1]]);
    else onChange([value[0], Math.max(v, value[0] + step)]);
  }, [dragging, valueFromX, onChange, value, step]);

  const handlePointerUp = useCallback(() => setDragging(null), []);

  return (
    <div className={cn("w-full", disabled && "opacity-50", className)}>
      {showValues && (
        <div className="flex justify-between text-xs text-muted mb-1 tabular-nums">
          <span>{value[0]}</span><span>{value[1]}</span>
        </div>
      )}
      <div
        ref={trackRef}
        className="relative h-5 flex items-center cursor-pointer"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="group"
        aria-label="범위 슬라이더"
      >
        <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-primary rounded-full"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        {(["min", "max"] as const).map((handle, i) => (
          <div
            key={handle}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuenow={value[i]}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={handle === "min" ? "최솟값" : "최댓값"}
            onPointerDown={handlePointerDown(handle)}
            onKeyDown={(e) => {
              if (disabled) return;
              const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -step : 0;
              if (!d) return;
              e.preventDefault();
              const nv = value[i] + d;
              if (handle === "min") onChange([Math.min(nv, value[1] - step), value[1]]);
              else onChange([value[0], Math.max(nv, value[0] + step)]);
            }}
            className={cn(
              "absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-sm -translate-x-1/2 cursor-grab",
              "focus:outline-none focus:ring-2 focus:ring-primary/40",
              "hover:scale-110 transition-transform",
              dragging === handle && "cursor-grabbing scale-110",
            )}
            style={{ left: `${pct(value[i])}%` }}
          />
        ))}
      </div>
    </div>
  );
}
