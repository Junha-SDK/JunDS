"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

/**
 * 폼 라벨
 * @example
 * <Label htmlFor="name" required>이름</Label>
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ required, className, children, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    >
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
});

Label.displayName = "Label";
