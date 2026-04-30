"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "size"> {
  /** 현재 숫자 값 */
  value?: number;
  /** 값 변경 콜백 */
  onChange?: (value: number) => void;
  /** 허용 최소값 */
  min?: number;
  /** 허용 최대값 */
  max?: number;
  /** 증감 단위 */
  step?: number;
  /** 에러 상태 표시 */
  error?: boolean;
  /** 입력 필드 크기 */
  size?: "sm" | "md" | "lg";
  /** +/- 버튼 숨김 */
  hideControls?: boolean;
}

const sizeStyles = {
  sm: "h-8 text-xs",
  md: "h-9 text-sm",
  lg: "h-11 text-base",
};

/**
 * 숫자 입력 (증감 버튼 포함)
 * @example
 * <NumberInput value={count} onChange={setCount} min={0} max={100} step={5} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, min, max, step = 1, error, size = "md", hideControls, className, disabled, ...props }, ref) => {
    const clamp = (v: number) => {
      if (min !== undefined) v = Math.max(min, v);
      if (max !== undefined) v = Math.min(max, v);
      return v;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v)) onChange?.(clamp(v));
    };

    const increment = () => onChange?.(clamp((value ?? 0) + step));
    const decrement = () => onChange?.(clamp((value ?? 0) - step));

    const btnClass = cn(
      "flex items-center justify-center w-7 border-l border-border text-muted",
      "hover:bg-gray-50 hover:text-foreground transition-colors cursor-pointer",
      "disabled:opacity-30 disabled:cursor-not-allowed",
      "first:border-l-0 first:border-r first:rounded-l-lg last:rounded-r-lg",
    );

    return (
      <div className={cn("inline-flex border rounded-lg bg-white overflow-hidden", error ? "border-danger" : "border-border", "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow)]", disabled && "opacity-50", className)}>
        {!hideControls && (
          <button type="button" onClick={decrement} disabled={disabled || (min !== undefined && (value ?? 0) <= min)} className={cn(btnClass, "border-l-0 border-r rounded-l-lg")} tabIndex={-1} aria-label="감소">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        )}
        <input
          ref={ref}
          type="number"
          value={value ?? ""}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            "w-16 text-center border-0 outline-none bg-transparent tabular-nums",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            sizeStyles[size],
          )}
          {...props}
        />
        {!hideControls && (
          <button type="button" onClick={increment} disabled={disabled || (max !== undefined && (value ?? 0) >= max)} className={cn(btnClass, "rounded-r-lg")} tabIndex={-1} aria-label="증가">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 2.5v7M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
