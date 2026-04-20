"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
  onClear?: () => void;
}

/**
 * 날짜 입력
 * @example
 * <DateInput value={date} onChange={e => setDate(e.target.value)} onClear={() => setDate("")} />
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
            "w-full h-9 px-3 text-sm border bg-white rounded-lg transition-all duration-150",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-danger" : "border-border",
            className,
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
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
