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
    const sizeClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

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
              "rounded border-border border transition-all duration-150 cursor-pointer",
              "checked:bg-primary checked:border-primary",
              "indeterminate:bg-primary indeterminate:border-primary",
              "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1",
              "accent-primary",
            )}
            {...props}
          />
        </div>
        {label && <span className={cn("text-foreground", size === "sm" ? "text-xs" : "text-sm")}>{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
