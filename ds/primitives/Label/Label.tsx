"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** 필수 입력 표시(*) */
  required?: boolean;
}

/**
 * 폼 라벨
 * @example
 * <Label htmlFor="name" required>이름</Label>
 * @status stable
 * @since 2.2.0
 * @tags form
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ required, className, children, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    >
      {children}
      {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
    </label>
  );
});

Label.displayName = "Label";
