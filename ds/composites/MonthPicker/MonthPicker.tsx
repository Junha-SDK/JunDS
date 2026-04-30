"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface MonthPickerProps extends HTMLAttributes<HTMLDivElement> {}

export const MonthPicker = forwardRef<HTMLDivElement, MonthPickerProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
MonthPicker.displayName = "MonthPicker";
