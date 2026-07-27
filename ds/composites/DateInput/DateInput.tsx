"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** 에러 상태 */
  error?: boolean;
  /** 값 초기화 콜백 */
  onClear?: () => void;
}

/**
 * 날짜 입력
 * @example
 * <DateInput value={date} onChange={e => setDate(e.target.value)} onClear={() => setDate("")} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ error, onClear, value, className, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type="date"
          value={value}
          className={cn(
            "w-full h-9 px-3 text-sm border bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-danger" : "border-border hover:border-gray-300",
            className,
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted hover:bg-gray-100 hover:text-foreground active:bg-gray-200 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

DateInput.displayName = "DateInput";
