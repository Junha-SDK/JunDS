"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface MonthPickerValue {
  year: number;
  month: number; // 1-12
}

export interface MonthPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** 현재 선택값 */
  value?: MonthPickerValue;
  /** 기본값 */
  defaultValue?: MonthPickerValue;
  /** 변경 콜백 */
  onChange?: (v: MonthPickerValue) => void;
  /** 최소 (yyyy-mm) */
  min?: string;
  /** 최대 (yyyy-mm) */
  max?: string;
  /** 월 이름 라벨 */
  monthLabels?: string[];
}

const DEFAULT_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function toYM(s?: string): MonthPickerValue | null {
  if (!s) return null;
  const [y, m] = s.split("-").map(Number);
  if (!y || !m) return null;
  return { year: y, month: m };
}

function isBefore(a: MonthPickerValue, b: MonthPickerValue) {
  return a.year < b.year || (a.year === b.year && a.month < b.month);
}

/**
 * 연-월 선택기 (12개월 그리드 + 연도 네비게이션).
 * @example
 * <MonthPicker defaultValue={{ year: 2026, month: 4 }} onChange={console.log} />
 * @status stable
 * @since 2.3.0
 * @tags input
 */
export const MonthPicker = forwardRef<HTMLDivElement, MonthPickerProps>(function MonthPicker(
  { value, defaultValue, onChange, min, max, monthLabels = DEFAULT_LABELS, className, ...props },
  ref,
) {
  const today = new Date();
  const [internal, setInternal] = useState<MonthPickerValue>(
    defaultValue ?? { year: today.getFullYear(), month: today.getMonth() + 1 },
  );
  const current = value ?? internal;
  const [viewYear, setViewYear] = useState(current.year);

  const minYM = toYM(min);
  const maxYM = toYM(max);

  const setCurrent = (v: MonthPickerValue) => {
    if (!value) setInternal(v);
    onChange?.(v);
  };

  return (
    <div
      ref={ref}
      className={cn("inline-block rounded-lg border border-border bg-surface p-3 select-none", className)}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewYear((y) => y - 1)}
          aria-label="이전 연도"
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-soft cursor-pointer"
        >
          ‹
        </button>
        <div className="text-sm font-semibold">{viewYear}년</div>
        <button
          type="button"
          onClick={() => setViewYear((y) => y + 1)}
          aria-label="다음 연도"
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-soft cursor-pointer"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1 w-[200px]">
        {monthLabels.map((label, i) => {
          const m = i + 1;
          const candidate = { year: viewYear, month: m };
          const isSelected = current.year === viewYear && current.month === m;
          const disabled =
            (minYM && isBefore(candidate, minYM)) ||
            (maxYM && isBefore(maxYM, candidate));

          return (
            <button
              key={m}
              type="button"
              disabled={disabled || undefined}
              onClick={() => setCurrent(candidate)}
              className={cn(
                "px-2 py-2 text-sm rounded-md transition-colors cursor-pointer",
                isSelected
                  ? "bg-primary text-white"
                  : "hover:bg-surface-soft text-foreground",
                disabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
