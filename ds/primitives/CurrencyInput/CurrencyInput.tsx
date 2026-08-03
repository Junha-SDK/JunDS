"use client";
import { forwardRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value" | "size"> {
  /** 숫자 값 */
  value?: number;
  /** 값 변경 콜백 */
  onChange?: (value: number) => void;
  /** ISO 4217 통화 코드 */
  currency?: string;
  /** BCP 47 로케일 */
  locale?: string;
  /** 입력 필드 크기 */
  size?: "sm" | "md" | "lg";
  /** 에러 상태 표시 */
  error?: boolean;
}

// radius 계단: 작은 입력은 lg, 보통·큰 입력은 xl (Input 프리미티브와 같은 눈금).
const sizeStyles = {
  sm: "h-8 text-xs px-2.5 rounded-lg",
  md: "h-9 text-sm px-3 rounded-xl",
  lg: "h-11 text-base px-4 rounded-xl",
};

/**
 * 통화 단위 + 숫자 자동 포맷이 적용된 금액 입력 필드.
 * @example
 * <CurrencyInput value={amount} onChange={setAmount} currency="KRW" />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      currency = "KRW",
      locale = "ko-KR",
      size = "md",
      error,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);

    const formatCurrency = useCallback(
      (val: number) => {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: currency === "KRW" ? 0 : 2,
          maximumFractionDigits: currency === "KRW" ? 0 : 2,
        }).format(val);
      },
      [locale, currency],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d.-]/g, "");
      const num = parseFloat(raw);
      if (!isNaN(num)) onChange?.(num);
      else if (raw === "" || raw === "-") onChange?.(0);
    };

    return (
      <div className={cn("relative", className)}>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={focused ? value ?? "" : value !== undefined ? formatCurrency(value) : ""}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={cn(
            // bg-white 는 라이트 전용 값 — 다크에서 입력칸만 하얗게 남는다.
            "w-full border bg-card text-foreground tabular-nums",
            // 금액이라 자릿수가 바뀌면 폭이 흔들린다. transition-all 이면 그 폭까지 전이 대상이
            // 되므로, 포커스가 실제로 바꾸는 테두리·그림자만 지목한다.
            "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none",
            "placeholder:text-muted",
            "hover:border-muted-light",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-danger" : "border-border",
            sizeStyles[size],
          )}
          {...props}
        />
      </div>
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
