"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

const COUNTRIES = [
  { code: "KR", dial: "+82", flag: "\u{1F1F0}\u{1F1F7}", format: "000-0000-0000" },
  { code: "US", dial: "+1", flag: "\u{1F1FA}\u{1F1F8}", format: "(000) 000-0000" },
  { code: "JP", dial: "+81", flag: "\u{1F1EF}\u{1F1F5}", format: "000-0000-0000" },
  { code: "CN", dial: "+86", flag: "\u{1F1E8}\u{1F1F3}", format: "000-0000-0000" },
  { code: "GB", dial: "+44", flag: "\u{1F1EC}\u{1F1E7}", format: "0000 000 0000" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value" | "size"> {
  /** 숫자만 포함된 현재 값 */
  value?: string;
  /** 값 변경 콜백 (digits, 국가코드 포함 전체 번호) */
  onChange?: (value: string, fullNumber: string) => void;
  /** 초기 선택 국가 */
  defaultCountry?: CountryCode;
  /** 입력 필드 크기 */
  size?: "sm" | "md" | "lg";
  /** 에러 상태 표시 */
  error?: boolean;
}

const sizeStyles = {
  sm: "h-8 text-xs",
  md: "h-9 text-sm",
  lg: "h-11 text-base",
};

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/**
 * 국가 코드 선택이 포함된 전화번호 입력기.
 * @example
 * <PhoneInput value={phone} onChange={setPhone} defaultCountry="KR" />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value = "",
      onChange,
      defaultCountry = "KR",
      size = "md",
      error,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [country, setCountry] = useState(
      () => COUNTRIES.find((c) => c.code === defaultCountry) ?? COUNTRIES[0],
    );
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
      onChange?.(digits, `${country.dial}${digits}`);
    };

    return (
      <div
        className={cn(
          // overflow-hidden 은 국가 드롭다운(absolute top-full)까지 잘라내므로 쓸 수 없다.
          // 모서리는 자식에 rounded-l/r 을 직접 줘서 맞춘다.
          "relative inline-flex border rounded-xl bg-card",
          error ? "border-danger" : "border-border",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow)]",
          disabled && "opacity-50",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => !disabled && setShowDropdown(!showDropdown)}
          className={cn(
            "flex items-center gap-1.5 px-3 rounded-l-xl border-r border-border shrink-0 cursor-pointer",
            "transition-colors hover:bg-card-hover active:bg-border-light",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
            sizeStyles[size],
          )}
          aria-label="국가 선택"
          disabled={disabled}
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-muted text-xs">{country.dial}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M2.5 4L5 6.5L7.5 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <input
          ref={ref}
          type="tel"
          value={formatPhone(value)}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "flex-1 px-3 rounded-r-xl outline-none bg-transparent min-w-0 tabular-nums",
            sizeStyles[size],
          )}
          {...props}
        />
        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35),0_4px_12px_-4px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] z-50 p-1 animate-fade-in-scale motion-reduce:animate-none">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCountry(c);
                  setShowDropdown(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer",
                  "transition-colors hover:bg-primary/10 active:bg-primary/15",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                  country.code === c.code && "bg-primary-light text-primary-ink",
                )}
              >
                <span>{c.flag}</span>
                <span className="font-medium">{c.code}</span>
                <span className="text-muted">{c.dial}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";
