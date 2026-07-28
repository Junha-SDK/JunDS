"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "size"> {
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
  (
    {
      value,
      onChange,
      min,
      max,
      step = 1,
      error,
      size = "md",
      hideControls,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
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
      "flex items-center justify-center w-8 border-l border-border text-muted",
      // 회색 팔레트는 다크에서 무너진다 — muted 틴트는 두 모드 모두에서 같은 세기로 읽힌다.
      // 누를 때 줄어드는 것은 움직임이므로 감속 요청을 받는다.
      "hover:bg-muted/10 hover:text-foreground active:bg-muted/20 active:scale-95",
      "transition-[background-color,color,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:active:scale-100 cursor-pointer",
      "disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100",
      "first:border-l-0 first:border-r first:rounded-l-xl last:rounded-r-xl",
    );

    return (
      <div
        className={cn(
          // 변하는 것은 테두리색과 글로우 둘뿐 — transition-all 은 높이까지 물어 리플로우를 부른다
          "inline-flex border rounded-xl bg-card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 ease-out",
          error ? "border-danger" : "border-border",
          "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          disabled && "opacity-50",
          className,
        )}
      >
        {!hideControls && (
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
            className={cn(btnClass, "border-l-0 border-r rounded-l-xl")}
            tabIndex={-1}
            aria-label="감소"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
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
          <button
            type="button"
            onClick={increment}
            disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
            className={cn(btnClass, "rounded-r-xl")}
            tabIndex={-1}
            aria-label="증가"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M6 2.5v7M2.5 6h7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
