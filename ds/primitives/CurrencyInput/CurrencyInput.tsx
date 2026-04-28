"use client";
import { forwardRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value" | "size"> {
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
  locale?: string;
  size?: "sm" | "md" | "lg";
  error?: boolean;
}

const sizeStyles = {
  sm: "h-8 text-xs px-2.5 rounded-md",
  md: "h-9 text-sm px-3 rounded-lg",
  lg: "h-11 text-base px-4 rounded-xl",
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, currency = "KRW", locale = "ko-KR", size = "md", error, className, disabled, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    const formatCurrency = useCallback((val: number) => {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "KRW" ? 0 : 2,
        maximumFractionDigits: currency === "KRW" ? 0 : 2,
      }).format(val);
    }, [locale, currency]);

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
          value={focused ? (value ?? "") : value !== undefined ? formatCurrency(value) : ""}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={cn(
            "w-full border bg-white transition-all duration-150",
            "placeholder:text-muted",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
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
