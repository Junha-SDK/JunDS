"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface YearPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** 현재 선택값 */
  value?: number;
  /** 기본값 */
  defaultValue?: number;
  /** 변경 콜백 */
  onChange?: (year: number) => void;
  /** 최소 연도 */
  min?: number;
  /** 최대 연도 */
  max?: number;
  /** 한 페이지 연도 수 (기본 12) */
  pageSize?: number;
}

/** 페이지 앞뒤 이동 버튼 — 상태 3종을 한 곳에서 잡는다 */
const navBtn = cn(
  "w-8 h-8 flex items-center justify-center rounded-lg text-muted cursor-pointer",
  "transition-colors duration-150 hover:bg-muted/10 hover:text-foreground active:bg-muted/20",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
);

/**
 * 연도 선택기 (12년 그리드 + 페이지 네비).
 * @example
 * <YearPicker defaultValue={2026} onChange={console.log} />
 * @status stable
 * @since 2.3.0
 * @tags input
 */
export const YearPicker = forwardRef<HTMLDivElement, YearPickerProps>(function YearPicker(
  { value, defaultValue, onChange, min, max, pageSize = 12, className, ...props },
  ref,
) {
  const today = new Date();
  const [internal, setInternal] = useState<number>(defaultValue ?? today.getFullYear());
  const current = value ?? internal;
  const [page, setPage] = useState(Math.floor(current / pageSize) * pageSize);

  const setCurrent = (y: number) => {
    if (!value) setInternal(y);
    onChange?.(y);
  };

  const years = Array.from({ length: pageSize }, (_, i) => page + i);

  return (
    <div
      ref={ref}
      className={cn(
        "inline-block rounded-2xl border border-border bg-surface p-3 select-none",
        "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setPage((p) => p - pageSize)}
          aria-label="이전 페이지"
          className={navBtn}
        >
          ‹
        </button>
        <div className="text-sm font-semibold tabular-nums whitespace-nowrap">
          {years[0]} – {years[years.length - 1]}
        </div>
        <button
          type="button"
          onClick={() => setPage((p) => p + pageSize)}
          aria-label="다음 페이지"
          className={navBtn}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1 w-[200px]">
        {years.map((y) => {
          const isSelected = current === y;
          const disabled = (min !== undefined && y < min) || (max !== undefined && y > max);
          return (
            <button
              key={y}
              type="button"
              disabled={disabled || undefined}
              onClick={() => setCurrent(y)}
              className={cn(
                "px-2 py-2 text-sm tabular-nums rounded-lg transition-colors duration-150 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                isSelected
                  ? "bg-primary text-white shadow-[0_1px_3px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-primary-hover"
                  : "text-foreground hover:bg-muted/10 active:bg-muted/20",
                disabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
              )}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
});
