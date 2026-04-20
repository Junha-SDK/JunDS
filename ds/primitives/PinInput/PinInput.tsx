"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface PinInputProps {
  /** 자릿수 */
  length?: number;
  /** 완료 콜백 */
  onComplete?: (value: string) => void;
  onChange?: (value: string) => void;
  /** 마스킹 (●) */
  masked?: boolean;
  error?: boolean;
  disabled?: boolean;
  /** 숫자만 */
  numeric?: boolean;
  className?: string;
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
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-10 h-12 text-center text-lg font-bold border rounded-lg bg-white",
            "transition-all duration-150 outline-none",
            "focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-danger shake" : values[i] ? "border-primary/40" : "border-border",
          )}
        />
      ))}
    </div>
  );
}
