"use client";
import { cn } from "../../utils/cn";
import { Label } from "../../primitives/Label";
import type { ReactNode } from "react";

export interface FormFieldProps {
  /** 필드 라벨 */
  label?: string;
  /** 필수 여부 */
  required?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 힌트 텍스트 */
  hint?: string;
  /** htmlFor */
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

/**
 * 폼 필드 래퍼 (Label + Input + Error + Hint)
 * @example
 * <FormField label="이름" required error={errors.name}>
 *   <Input id="name" error={!!errors.name} />
 * </FormField>
 */
export function FormField({ label, required, error, hint, htmlFor, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
            <path d="M6 3.5v3M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-light">{hint}</p>
      )}
    </div>
  );
}
