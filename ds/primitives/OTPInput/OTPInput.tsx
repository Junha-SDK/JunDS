"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface OTPInputProps {
  /** OTP 자릿수 */
  length?: number;
  /** 모든 자릿수 입력 완료 시 호출 */
  onComplete?: (code: string) => void;
  /** 값 변경 콜백 */
  onChange?: (code: string) => void;
  /** 에러 상태 표시 */
  error?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 6자리 일회용 비밀번호(OTP) 입력기.
 * @example
 * <OTPInput length={6} onComplete={(code) => verify(code)} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function OTPInput({
  length = 6,
  onComplete,
  onChange,
  error,
  disabled,
  className,
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (i: number) => { if (i >= 0 && i < length) refs.current[i]?.focus(); };

  const update = useCallback((next: string[]) => {
    setValues(next);
    const code = next.join("");
    onChange?.(code);
    if (next.every((v) => v !== "")) onComplete?.(code);
  }, [onChange, onComplete]);

  const handleInput = (i: number, v: string) => {
    if (disabled) return;
    if (!/^\d?$/.test(v)) return;
    const next = [...values];
    next[i] = v;
    update(next);
    if (v && i < length - 1) focus(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (values[i]) {
        const next = [...values]; next[i] = ""; update(next);
      } else if (i > 0) {
        focus(i - 1);
        const next = [...values]; next[i - 1] = ""; update(next);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = [...values];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    update(next);
    focus(Math.min(pasted.length, length - 1));
  };

  const half = Math.floor(length / 2);

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)} role="group" aria-label="인증 코드 입력">
      {Array.from({ length }, (_, i) => (
        <span key={i} className="contents">
          {i === half && (
            <span className="w-3 h-0.5 bg-border rounded-full mx-1" aria-hidden="true" />
          )}
          <input
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[i]}
            disabled={disabled}
            autoComplete="one-time-code"
            aria-label={`${i + 1}번째 자리`}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              "w-11 h-13 text-center text-xl font-bold border-2 rounded-xl bg-white",
              "transition-all duration-150 outline-none",
              "focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "border-danger animate-[shake_0.3s_ease-in-out]" : values[i] ? "border-primary/40" : "border-border",
            )}
          />
        </span>
      ))}
    </div>
  );
}
