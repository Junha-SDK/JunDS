"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** 레이블 */
  label?: string;
  /** 부분 선택 상태 */
  indeterminate?: boolean;
  /** 크기 */
  size?: "sm" | "md";
}

/**
 * 체크박스
 * @example
 * <Checkbox label="동의합니다" checked={ok} onChange={...} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate, size = "md", className, ...props }, ref) => {
    const sizeClass = size === "sm" ? "w-3.5 h-3.5 rounded-[4px]" : "w-4 h-4 rounded-[5px]";

    return (
      <label className={cn("inline-flex items-center gap-2 cursor-pointer select-none", props.disabled && "opacity-50 cursor-not-allowed", className)}>
        <div className="relative flex items-center justify-center">
          <input
            ref={(el) => {
              if (el) el.indeterminate = !!indeterminate;
              if (typeof ref === "function") ref(el);
              else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = el;
            }}
            type="checkbox"
            aria-checked={indeterminate ? "mixed" : !!props.checked}
            className={cn(
              sizeClass,
              "peer appearance-none shrink-0 border bg-white cursor-pointer transition-all duration-200 ease-out",
              "border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-gray-300",
              "checked:bg-primary checked:border-primary checked:shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]",
              "indeterminate:bg-primary indeterminate:border-primary indeterminate:shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
              "active:scale-90 disabled:cursor-not-allowed",
            )}
            {...props}
          />
          <svg
            className={cn(
              "pointer-events-none absolute text-white opacity-0 scale-50 transition-all duration-200 ease-out",
              "peer-checked:opacity-100 peer-checked:scale-100 peer-indeterminate:opacity-0",
              size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3",
            )}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            className={cn(
              "pointer-events-none absolute rounded-full bg-white opacity-0 transition-all duration-200 ease-out peer-indeterminate:opacity-100",
              size === "sm" ? "h-[1.5px] w-[7px]" : "h-[2px] w-[8px]",
            )}
            aria-hidden="true"
          />
        </div>
        {label && <span className={cn("text-foreground", size === "sm" ? "text-xs" : "text-sm")}>{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
