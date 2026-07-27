"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface PinInputProps {
  /** 자릿수 */
  length?: number;
  /** 완료 콜백 */
  onComplete?: (value: string) => void;
  /** 값 변경 콜백 */
  onChange?: (value: string) => void;
  /** 마스킹 (●) */
  masked?: boolean;
  /** 에러 상태 표시 */
  error?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 숫자만 */
  numeric?: boolean;
  /** 추가 클래스 */
  className?: string;
  /** 각 입력 칸의 접근성 라벨 (기본: "N번째 자리") */
  inputAriaLabel?: (index: number, length: number) => string;
}

/**
 * PIN / OTP 입력
 *
 * 보안 기능:
 * - 자동 포커스 이동
 * - 마스킹 (●) 지원
 * - 붙여넣기 지원
 * - 숫자 전용 모드
 *
 * @example
 * <PinInput length={6} masked onComplete={verifyOTP} />
 * <PinInput length={4} numeric onComplete={verifyPin} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function PinInput({
  length = 6,
  onComplete,
  onChange,
  masked,
  error,
  disabled,
  numeric = true,
  className,
  inputAriaLabel,
}: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = (idx: number) => {
    if (idx >= 0 && idx < length) inputRefs.current[idx]?.focus();
  };

  const updateValues = useCallback((newValues: string[]) => {
    setValues(newValues);
    const joined = newValues.join("");
    onChange?.(joined);
    if (newValues.every((v) => v !== "")) {
      onComplete?.(joined);
    }
  }, [onChange, onComplete]);

  const handleChange = (idx: number, char: string) => {
    if (disabled) return;
    if (numeric && !/^\d?$/.test(char)) return;
    if (!numeric && char.length > 1) return;

    const next = [...values];
    next[idx] = char;
    updateValues(next);

    if (char && idx < length - 1) focusInput(idx + 1);
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (values[idx]) {
        const next = [...values];
        next[idx] = "";
        updateValues(next);
      } else if (idx > 0) {
        focusInput(idx - 1);
        const next = [...values];
        next[idx - 1] = "";
        updateValues(next);
      }
    } else if (e.key === "ArrowLeft") {
      focusInput(idx - 1);
    } else if (e.key === "ArrowRight") {
      focusInput(idx + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length);
    if (numeric && !/^\d+$/.test(pasted)) return;

    const next = [...values];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    updateValues(next);
    focusInput(Math.min(pasted.length, length - 1));
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type={masked ? "password" : "text"}
          inputMode={numeric ? "numeric" : "text"}
          maxLength={1}
          value={values[i]}
          disabled={disabled}
          autoComplete="one-time-code"
          aria-label={inputAriaLabel ? inputAriaLabel(i, length) : `${i + 1}번째 자리`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-10 h-12 text-center text-lg font-bold border rounded-xl bg-white",
            "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out outline-none",
            "focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)] focus:scale-105 focus:-translate-y-0.5",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-danger shake"
              : values[i]
                ? "border-primary/50 bg-primary-light/20 shadow-[0_1px_3px_var(--primary-glow)]"
                : "border-border hover:border-gray-300",
          )}
        />
      ))}
    </div>
  );
}
